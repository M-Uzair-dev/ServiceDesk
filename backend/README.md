# Assessment Backend

A field service management API. Admins create and schedule jobs, technicians execute them, clients request and track them.

Built with Node.js, Express, TypeScript, Prisma (PostgreSQL), Redis, BullMQ, and Nodemailer.

---

## Setup

### Prerequisites

- Node.js 18+

Run:

```bash
docker run -d --name pg -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=assessment_db -p 5432:5432 postgres:16
docker run -d --name redis -p 6379:6379 redis:7
```

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your actual values (see Environment Variables section below)

# 3. Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate

# 4. Seed the default admin account
npm run db:seed
# Creates: admin@example.com / admin123

# 5. Start the dev server
npm run dev
```

Server runs at `http://localhost:3000`.  
Health check: `GET http://localhost:3000/health`

### Production build

```bash
npm run build
npm start
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

| Variable                 | Description                           | Example                                                   |
| ------------------------ | ------------------------------------- | --------------------------------------------------------- |
| `DATABASE_URL`           | PostgreSQL connection string          | `postgresql://user:password@localhost:5432/assessment_db` |
| `JWT_ACCESS_SECRET`      | Secret for signing access tokens      | any long random string                                    |
| `JWT_REFRESH_SECRET`     | Secret for signing refresh tokens     | a different long random string                            |
| `JWT_ACCESS_EXPIRES_IN`  | Access token lifetime                 | `15m`                                                     |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime                | `7d`                                                      |
| `REDIS_HOST`             | Redis host                            | `localhost`                                               |
| `REDIS_PORT`             | Redis port                            | `6379`                                                    |
| `REDIS_PASSWORD`         | Redis password (leave blank if none)  |                                                           |
| `SMTP_HOST`              | SMTP server host                      | `smtp.gmail.com`                                          |
| `SMTP_PORT`              | SMTP port                             | `587`                                                     |
| `SMTP_USER`              | SMTP login email                      | `your@gmail.com`                                          |
| `SMTP_PASS`              | SMTP password or app password         |                                                           |
| `EMAIL_FROM`             | Display name + address in sent emails | `Assessment App <your@gmail.com>`                         |
| `PORT`                   | Port the server listens on            | `3000`                                                    |
| `NODE_ENV`               | Environment                           | `development`                                             |

> For Gmail SMTP, you need to generate an [App Password](https://support.google.com/accounts/answer/185833) — regular passwords won't work with 2FA enabled.

---

Assumptions, what's missing, and tradeoffs are added in docs/Thought_process.md and ARCHITECTURE.md
