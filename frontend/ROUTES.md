# Backend API Routes

Base URL: `http://localhost:3000/api`

All protected routes require:
```
Authorization: Bearer <accessToken>
```

All responses follow this shape:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "message" }
```

Pagination query params: `?page=1&limit=20`

---

## Auth

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/auth/admin/login` | No | `{ email, password }` | Admin login |
| POST | `/auth/client/login` | No | `{ email, password }` | Client login |
| POST | `/auth/technician/login` | No | `{ email, password }` | Technician login |
| POST | `/auth/refresh` | No | `{ refreshToken }` | Get new access + refresh token |
| POST | `/auth/logout` | Yes (any) | — | Revoke refresh token |

**Login response:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": "...", "name": "...", "email": "...", "role": "ADMIN|CLIENT|TECHNICIAN" }
}
```

**Refresh response:**
```json
{ "accessToken": "eyJ...", "refreshToken": "eyJ..." }
```

---

## Admin Routes
> All require `Authorization: Bearer <token>` where the token belongs to an ADMIN

### Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/dashboard` | Analytics overview (totals, revenue, recent jobs, top technicians) |

**Dashboard response shape:**
```json
{
  "totalClients": 0,
  "totalTechnicians": 0,
  "totalJobs": 0,
  "totalRevenue": 0.0,
  "jobsByStatus": { "REQUESTED": 0, "SCHEDULED": 0, "COMPLETED": 0 },
  "recentJobs": [...],
  "topTechnicians": [...]
}
```

### Technicians

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/admin/technicians` | — | List all technicians (paginated) |
| POST | `/admin/technicians` | `{ name, email, password, phoneNumber?, skills?, experienceYears? }` | Create technician |
| GET | `/admin/technicians/:id` | — | Get technician + their reviews |
| PUT | `/admin/technicians/:id` | any fields above + `status?, verified?` | Update technician |
| DELETE | `/admin/technicians/:id` | — | Delete technician |

### Clients

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/admin/clients` | — | List all clients (paginated) |
| POST | `/admin/clients` | `{ name, email, password, phoneNumber? }` | Create client |
| GET | `/admin/clients/:id` | — | Get client + recent jobs |
| PUT | `/admin/clients/:id` | any fields above | Update client |
| DELETE | `/admin/clients/:id` | — | Delete client |

### Jobs

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/admin/jobs` | — | List all jobs. Filter: `?status=REQUESTED` | 
| GET | `/admin/jobs/:id` | — | Get job with full details (notes, review, technician, client) |
| PUT | `/admin/jobs/:id/schedule` | `{ technicianId, scheduledAt, cost }` | Schedule a REQUESTED job → assigns technician, sets cost. Sends email to technician. |
| PUT | `/admin/jobs/:id/cancel` | — | Cancel a job (any status except COMPLETED). Sends email to client + technician. |
| DELETE | `/admin/jobs/:id` | — | Hard delete a job |
| POST | `/admin/jobs/:id/notes` | `{ note }` | Add a note to a job |

**Schedule job body:**
```json
{
  "technicianId": "clx...",
  "scheduledAt": "2025-06-01T09:00:00.000Z",
  "cost": 150.00
}
```

**Job status enum values:** `REQUESTED | SCHEDULED | ENROUTE | IN_PROGRESS | COMPLETED | CANCELLED`

---

## Client Routes
> All require `Authorization: Bearer <token>` where the token belongs to a CLIENT

### Profile

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/client/me` | — | Get own profile |
| PUT | `/client/me` | `{ name?, phoneNumber?, notificationsEnabled?, password? }` | Update profile |

### Jobs

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/client/jobs` | — | Get my jobs (paginated) |
| POST | `/client/jobs` | `{ title, description }` | Create a new job request |
| GET | `/client/jobs/:id` | — | Get job details + technician info + notes |
| PUT | `/client/jobs/:id/cancel` | — | Cancel job (only before ENROUTE) |
| POST | `/client/jobs/:id/review` | `{ stars, feedback }` | Submit review (only after COMPLETED) |

**Create job body:**
```json
{ "title": "Fix leaking pipe", "description": "Kitchen sink has a slow leak under the cabinet" }
```

**Review body:**
```json
{ "stars": 5, "feedback": "Great work, very professional" }
```

---

## Technician Routes
> All require `Authorization: Bearer <token>` where the token belongs to a TECHNICIAN

### Profile

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/technician/me` | — | Get own profile (includes computed `isWorking`) |
| PUT | `/technician/me` | `{ name?, phoneNumber?, skills?, password? }` | Update profile |
| GET | `/technician/stats` | — | Get work statistics |
| GET | `/technician/reviews` | — | Get all reviews received |

**Stats response:**
```json
{
  "totalJobs": 12,
  "completedJobs": 10,
  "cancelledJobs": 1,
  "completionRate": 83,
  "hoursWorked": 48.5,
  "totalReviews": 9,
  "avgRating": 4.6
}
```

### Jobs

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/technician/jobs` | — | Get assigned jobs (paginated, ordered by scheduledAt) |
| GET | `/technician/jobs/:id` | — | Get job details + client info + notes |
| PUT | `/technician/jobs/:id/advance` | — | Advance job status: SCHEDULED→ENROUTE→IN_PROGRESS→COMPLETED |
| PUT | `/technician/jobs/:id/cancel` | — | Cancel a job |
| POST | `/technician/jobs/:id/notes` | `{ note }` | Add a note to a job |

**Job advance transitions:**
```
SCHEDULED → ENROUTE      (triggers email to client)
ENROUTE → IN_PROGRESS
IN_PROGRESS → COMPLETED  (triggers email to client)
```

---

## Health Check

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` (no /api prefix) | Returns `{ "status": "ok" }` |

---

## Error Responses

**400 Validation error:**
```json
{ "success": false, "error": "Validation failed", "details": { "email": ["Invalid email"] } }
```

**401 Unauthorized:**
```json
{ "success": false, "error": "No token provided" }
```

**403 Forbidden:**
```json
{ "success": false, "error": "Forbidden" }
```

**404 Not Found:**
```json
{ "success": false, "error": "Job not found" }
```

**429 Rate Limited:**
```json
{ "success": false, "error": "Too many requests, slow down." }
```

---

## Notes for Frontend

- Store `accessToken` + `refreshToken` in memory or secure storage (not localStorage for access token ideally).
- When a request returns 401, call `POST /auth/refresh` with the stored `refreshToken` to silently get a new access token, then retry the original request.
- `isWorking` on a technician is a computed boolean — not editable, just display it.
- `notificationsEnabled` on client controls whether they receive emails. Expose this as a toggle in their settings page.
- Job status is always server-driven. The frontend should never mutate status directly — use the specific action endpoints (`/advance`, `/cancel`, `/schedule`).
