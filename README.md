# ServiceDesk

A full-stack field service management platform with role-based portals for Admins, Clients, and Technicians. Admins dispatch jobs, clients request and track service, and technicians manage their workload — all with real-time status progression and email notifications.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Queue | BullMQ + Redis |
| Email | Nodemailer |
| Auth | JWT (access + refresh tokens) |

---

## Project Structure

```
ServiceDesk/
├── frontend/     # Next.js app (App Router)
└── backend/      # Express REST API
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL and Redis)

### Start Dependencies

Spin up PostgreSQL and Redis with Docker:

```bash
docker run -d --name pg \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=assessment_db \
  -p 5432:5432 \
  postgres:16

docker run -d --name redis -p 6379:6379 redis:7
```

### Backend

```bash
cd backend
npm install

# Copy and fill in environment variables
cp .env.example .env

# Run database migrations and seed
npm run db:migrate
npm run db:seed

# Start dev server (runs on port 3000)
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# Copy and fill in environment variables
cp .env.example .env.local

# Start dev server
npm run dev
```

---

## Environment Variables

### Backend `.env`

```env
DATABASE_URL=postgresql://user:password@localhost:5432/assessment_db
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=ServiceDesk <your@gmail.com>
PORT=3000
NODE_ENV=development
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Roles

| Role | Access |
|------|--------|
| **Admin** | Full platform control — manage clients, technicians, schedule/cancel jobs, view analytics |
| **Client** | Submit job requests, track status, cancel before technician is enroute, leave reviews |
| **Technician** | View assigned jobs, advance job status, add notes, view personal stats and reviews |

---

## API Overview

Base URL: `http://localhost:3000/api`

All protected routes require:
```
Authorization: Bearer <accessToken>
```

All responses follow:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "message" }
```

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/admin/login` | Admin login |
| POST | `/auth/client/login` | Client login |
| POST | `/auth/technician/login` | Technician login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Revoke refresh token |

### Admin

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/dashboard` | Analytics overview |
| GET/POST | `/admin/technicians` | List / create technicians |
| GET/PUT/DELETE | `/admin/technicians/:id` | Get / update / delete technician |
| GET/POST | `/admin/clients` | List / create clients |
| GET/PUT/DELETE | `/admin/clients/:id` | Get / update / delete client |
| GET | `/admin/jobs` | List all jobs (filterable by status) |
| GET | `/admin/jobs/:id` | Job details with notes, review, technician, client |
| PUT | `/admin/jobs/:id/schedule` | Assign technician, set cost and time |
| PUT | `/admin/jobs/:id/cancel` | Cancel any non-completed job |
| DELETE | `/admin/jobs/:id` | Hard delete a job |
| POST | `/admin/jobs/:id/notes` | Add a note to a job |

### Client

| Method | Path | Description |
|--------|------|-------------|
| GET/PUT | `/client/me` | Get / update own profile |
| GET | `/client/jobs` | List own jobs |
| POST | `/client/jobs` | Create a new job request |
| GET | `/client/jobs/:id` | Job details + technician info |
| PUT | `/client/jobs/:id/cancel` | Cancel job (before ENROUTE only) |
| POST | `/client/jobs/:id/review` | Submit review after completion |

### Technician

| Method | Path | Description |
|--------|------|-------------|
| GET/PUT | `/technician/me` | Get / update own profile |
| GET | `/technician/stats` | Personal work statistics |
| GET | `/technician/reviews` | All reviews received |
| GET | `/technician/jobs` | Assigned jobs |
| GET | `/technician/jobs/:id` | Job details + client info |
| PUT | `/technician/jobs/:id/advance` | Advance job status |
| PUT | `/technician/jobs/:id/cancel` | Cancel a job |
| POST | `/technician/jobs/:id/notes` | Add a note to a job |

### Job Status Flow

```
REQUESTED -> SCHEDULED -> ENROUTE -> IN_PROGRESS -> COMPLETED
                                  \-> CANCELLED (any stage except COMPLETED)
```

Email notifications are triggered when:
- A job is scheduled (to technician)
- Technician goes ENROUTE (to client)
- Job is COMPLETED (to client)
- Job is CANCELLED (to client + technician)

---

## Health Check

```
GET /health   ->   { "status": "ok" }
```
