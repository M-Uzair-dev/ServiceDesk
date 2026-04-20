# Thought Process

> I wrote this roughly because this is my thinking process. I asked Claude Code to add proper formatting for better readability.

---

## Models

### Admin

| Field                  | Type                         |
| ---------------------- | ---------------------------- |
| Name                   | String                       |
| Email                  | String                       |
| Password               | String (for login access)    |
| PhoneNumber            | String                       |
| Address                | String                       |
| PreferredContactMethod | Enum: `CALL`, `EMAIL`, `SMS` |
| TotalBookings          | Number (default 0)           |
| CreatedAt              | DateTime                     |
| UpdatedAt              | DateTime                     |

### Client

| Field                | Type                      |
| -------------------- | ------------------------- |
| Name                 | String                    |
| Email                | String                    |
| Password             | String (for login access) |
| PhoneNumber          | String                    |
| NotificationsEnabled | Boolean (default true)    |
| LastLoginAt          | DateTime                  |
| CreatedAt            | DateTime                  |
| UpdatedAt            | DateTime                  |

### Technician

| Field           | Type                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Name            | String                                                                                           |
| Email           | String                                                                                           |
| Password        | String (for login access)                                                                        |
| PhoneNumber     | String                                                                                           |
| Skills          | Array of strings (e.g. `["plumbing", "electrical"]`)                                             |
| ExperienceYears | Number                                                                                           |
| IsWorking       | **Computed** — not stored in DB, derived from active jobs with status `ENROUTE` or `IN_PROGRESS` |
| Status          | Enum: `ACTIVE`, `OFFLINE`, `SUSPENDED`                                                           |
| Verified        | Boolean                                                                                          |
| CreatedAt       | DateTime                                                                                         |
| UpdatedAt       | DateTime                                                                                         |

### Job

| Field        | Type                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Title        | String                                                                                                                         |
| Description  | String                                                                                                                         |
| Status       | Enum (see below)                                                                                                               |
| ScheduledAt  | DateTime                                                                                                                       |
| StartedAt    | DateTime                                                                                                                       |
| CompletedAt  | DateTime                                                                                                                       |
| AdminId      | FK → Admin — **nullable**, set null on admin delete. Assigned when an admin schedules the job, null while in `REQUESTED` state |
| TechnicianId | FK → Technician (set by admin when scheduling)                                                                                 |
| ClientId     | FK → Client                                                                                                                    |
| Cost         | Number — set by admin when scheduling, final billed amount in USD                                                              |
| Notes        | One-to-many (creatable by admin or technician only)                                                                            |
| Review       | One-to-one                                                                                                                     |

**Job Status Enum:**

| Status        | Meaning                                  |
| ------------- | ---------------------------------------- |
| `REQUESTED`   | Job created by client, not yet confirmed |
| `SCHEDULED`   | Date/time assigned, waiting to start     |
| `ENROUTE`     | Technician is on the way                 |
| `IN_PROGRESS` | Work has started on site                 |
| `COMPLETED`   | Job successfully finished                |
| `CANCELLED`   | Cancelled before or during work          |

### Note

| Field      | Type                                |
| ---------- | ----------------------------------- |
| Note       | Free text                           |
| JobId      | FK → Job                            |
| AuthorId   | ID of admin or technician           |
| AuthorRole | String: `"ADMIN"` or `"TECHNICIAN"` |
| CreatedAt  | DateTime                            |

### Review

| Field     | Type         |
| --------- | ------------ |
| Stars     | Number (0–5) |
| Feedback  | Plain text   |
| CreatedAt | DateTime     |

> Only creatable by a client after the job is `COMPLETED`. Not available for cancelled jobs.

---

## IsWorking — Computed Field

A technician's `isWorking` is dynamically computed. If a technician has any job currently in status `ENROUTE` or `IN_PROGRESS`, they are considered `isWorking: true`. This is not stored in the database.

---

## Notifications

Using **BullMQ** + **Nodemailer** for email notifications. Whether message queues are actually needed depends on scale. but adding them here to demonstrate I know how to use them when they're actually needed. Services like Resend handle this more simply, but this shows the real pipeline.

| Event       | Recipients                                           |
| ----------- | ---------------------------------------------------- |
| `REQUESTED` | All Admins — so they know a new job needs scheduling |
| `SCHEDULED` | Assigned Technician                                  |
| `ENROUTE`   | Client                                               |
| `CANCELLED` | Client + Assigned Technician                         |
| `COMPLETED` | Client only                                          |

> **Removed:** `COMPLETED → All Admins` — admins can check the analytics dashboard instead. Notifying all admins on every job completion is noise, not signal. Not appropriate even at assessment scale.

---

## Role Capabilities

### Technician

- See their scheduled jobs
- Mark jobs as enroute → started → completed
- View statistics: hours worked, job completion rate, etc.
- View ratings from all previous jobs

### Admin

- Manage all technicians (CRUD)
- Manage all jobs (CRUD)
- Manage all clients (CRUD)
- View complete analytics: total technicians, total clients, earnings, etc.

### Client

- View scheduled jobs and assigned technicians
- Change contact details and disable notifications
- Create a new job
- Cancel a job _(not cancellable after `ENROUTE` — after that, only technician or admin can cancel)_
- Leave a review after job is completed

---

## Areas for Improvement / Intentional Omissions

**Soft deletes** — no `DeletedAt` on any model. Intentionally skipped for simplicity. In prod you'd want this so deleting a technician with job history doesn't destroy records. For this assessment, cascade delete is fine.

**TotalBookings on Admin** — feels wrong as a stored field, probably should be computed from jobs. Keeping it as a denormalized counter since it's a small project and recalculating on every dashboard request is overkill here.
