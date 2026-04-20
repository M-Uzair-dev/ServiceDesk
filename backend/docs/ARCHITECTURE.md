# Architecture Document

This is my thinking doc for the backend. It's not polshed. it's meant to explain my decisions honestly.

---

**Important**: I specifically added the functionality so that the client can also login and create a job, so th eflow is client logs in > created the job > admin assignes it to a technician and sets a price > technician then marks it as enroute, started and then as completed > client logs and and gives a review.

## System Design

There are mainly three user types: **Admin**, **Client**, **Technician**. Each has its own auth flow (separate login endpoints) and its own set of routes. They share the same database and the same JWT infrastructure, just different roles.

The request flow looks like this:

```
Client/Admin/Technician
        ↓
  Express HTTP API
        ↓
  Rate Limiter (Redis sliding window)
        ↓
  Auth Middleware (JWT verify)
        ↓
  Role Guard (authorize middleware)
        ↓
  Controller → Service → Prisma → PostgreSQL
        ↓
  (Side effects) → BullMQ Queue → Worker → Nodemailer → SMTP
```

---

## Tech Stack Choices

I used express because its simple and flexible and also because i am currently very confortable with express. I am also learning NestJS so i'll also start using it in near future.

Typescript doesnt need any explaination tbh.

I used postgres because it's a strong relational DB and way better than MOngoDb. And I used prisma because of it's beautiful integration with typescript.

I added redis to do mainly two things, first to store refresh tomens for logout and revocation and also to use it to create rate limiter. Also BullMQ also uses Redis internally so it's a very important part of our archetechture. But, I made it soecifically in a way that if ever redis goes down, our system keeps working because I added fail open strategy in rate limiter, but email delivery will stop and refresh tokens will stop working, so app will be usable, but redis is necessary.

BullMQ is the right queue library for Node.js + Redis. It handles retries, backoff, and concurrency out of the box.

I used nodemailer to keep it simple, although something like resend woud've made our lives much easier, a small scale internal application like this should use nodemailer to reduce external services dependencies as much as possible. If it was a large scale commercial application, the choice would've been different here.

**Note on email templates:** I didn't spend time on the HTML templates. They're plain functional HTML — tables, no CSS framework, no responsive design. In a real product I'd use MJML or React Email. For this assessment it's not the focus.

I used ZOD for validation at the controller layer. Zod errors are caught by the global error handler and returned as structured 400 responses.

---

## Database Design

### Key decisions

**Why separate Admin/Client/Technician tables instead of one User table?**
I was thinking aout creating a unified table for all entities, but when i started designing it in excalidraw, it became very clear that it's gonna become very messy if i kept it in one table, so i distributed it into three seperate tables to keep it cleaner.

**Why `skills: String[]` on Technician?**
Yes, i know. I was also thinking of creating a seperate skill column for complex skill based filtering, i went for the simpler option here to reduce development time and complexity by a little. but this is definitely something that can and should be added later.

**Why `isWorking` is not in the DB:**
It's a derived value. A technician is "working" if they have any job in status ENROUTE or IN_PROGRESS. Storing it as a boolean would mean we have to update it every time a job status changes. Computed on read is correct here. The query cost is one indexed lookup.

**`startedAt` / `completedAt` on Job:**
Needed to compute technician hours worked. These are set by the server when the technician advances job status to IN_PROGRESS and COMPLETED respectively. Not set by the client.

**`totalBookings` on Admin:**
This is a denormalized counter — I increment it when an admin schedules a job. Slightly wrong in theory (you could count it from jobs), but it's fast to read for the dashboard and fine at this scale.

### Indexes

I indexed:

- `email` on Admin, Client, Technician (used on every login)
- `status` on Job, Technician (filtering by status is the most common query pattern)
- `clientId`, `technicianId`, `adminId` on Job
- `jobId` on Note
- `technicianId` on Review (technician stats page)

I did not add a composite index on (technicianId, status) on Job even though the `computeIsWorking` query uses both. At this scale it's fine. In prod that would be the first index to add.

---

## Auth Strategy

**JWT with access + refresh tokens.**

- Access token: 15 minute TTL, signed with `JWT_ACCESS_SECRET`, stateless.
- Refresh token: 7 day TTL, signed with `JWT_REFRESH_SECRET`, stored in Redis.

Although at this scale a simple 7 day HTTP only cookie might've been fine,
i just added dual token auth because... why not.

---

## Rate Limiting

I added a classic redis sliding window rate limiter.

Two limiters:

- `defaultLimiter`: 60 requests/minute applied globally
- `authLimiter`: 10 requests/minute on all login endpoints to limit brute force attempts

If Redis is unavailable, the limiter fails open (lets the request through). This is intentional. App should rather keep serving than block everything because Redis is down.

---

## What I Deliberately Chose NOT to Build

**Soft deletes.** No `DeletedAt` or `isDeleted` on any model. In production this would be a mistake — you'd lose job history if a client or technician is deleted. I skipped it because implementing it requires filtering every query with `{ deletedAt: null }` and the risk of someone forgetting to add that filter. For an assessment project with a known scope, cascade delete is fine and keeps the code clean. but again, i would do the extra work in production. this is just for this assesment project which is obviously not gonna be used in prod.

**WebSockets / real-time technician location** The requirements didn't ask for it, and adding Socket.io would roughly double the complexity. Email notifications cover the key events. A real product would add real-time status updates so the client can see their technician moving on a map — but that's a separate feature layer, not something to add speculatively.

**Role-based field masking.** Currently, admin endpoints return client/technician objects without passwords (via Prisma's `omit`), but they return all other fields. In production you'd have a proper DTO/serialization layer per role. I skipped it because it's repetitive boilerplate and not the interesting part of this system.

**HTTP ONLY COOKIES** handling role based protected routes with http only cookies is a bit more time consuming than bearer tokens, so i skipped it.
