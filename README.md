# ZimSchool Platform

A multi-tenant school management system for Zimbabwean secondary and primary schools.  
White-labelled — each school gets its own subdomain (`stgeorges.yourplatform.co.zw`), branding, and fully isolated data via Supabase Row Level Security.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20 + TypeScript |
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| File Storage | Supabase Storage |
| SMS | Africa's Talking API |
| Email | Resend |
| Validation | Zod |
| ORM | Supabase JS client (typed) |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local
cp .env.local .env.local.example  # fill in values

# 3. Run the SQL migration in Supabase SQL Editor
#    supabase/migrations/001_initial_schema.sql

# 4. Seed demo data (see note on auth users below)
#    supabase/migrations/002_seed.sql

# 5. Generate Supabase types
npx supabase gen types typescript --project-id <your-project-id> > types/database.ts

# 6. Start development server
npm run dev
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=          # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=         # Service role key (server-side only)
AFRICASTALKING_API_KEY=            # Africa's Talking API key
AFRICASTALKING_USERNAME=           # Africa's Talking username (sandbox or prod)
RESEND_API_KEY=                    # Resend API key
NEXT_PUBLIC_APP_DOMAIN=            # e.g. yourplatform.co.zw
```

---

## Multi-Tenant Architecture

### Subdomain routing

Each school is identified by a unique `slug` stored in the `schools` table.  
Subdomains map to slugs: `stgeorges.yourplatform.co.zw` → slug `stgeorges`.

`middleware.ts` reads the `Host` header, extracts the subdomain, and:
1. Resolves `school_id` from the slug
2. Attaches `x-school-id`, `x-user-id`, `x-user-role` headers to downstream requests
3. Blocks unauthenticated access to `/api/*` and `/dashboard/*`
4. Enforces role-based route guards

### Data isolation

Every table has a `school_id` column and Supabase RLS policies that filter by `get_user_school_id()`.  
The service-role client (used in API routes) bypasses RLS intentionally — role checks are enforced in application code via `requireRole()`.

### Adding a new school tenant

1. Insert a row into `schools` with a unique `slug`
2. Create the admin user via Supabase Auth Admin API
3. Insert a `user_profiles` row with `role = 'admin'` pointing to the new `school_id`
4. Set up DNS: `<slug>.yourplatform.co.zw` → your deployment
5. Optionally insert grades, subjects, academic years, and fee structures via the API

---

## API Reference

All responses follow the envelope:
```json
{ "data": ..., "error": null | "message", "meta": { ... } }
```

Authentication: Supabase session cookie (set automatically by `@supabase/ssr`).  
School context: resolved from subdomain header by middleware.

### Students

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/students` | admin/teacher/parent | List students (scoped by role) |
| POST | `/api/students` | admin | Create student |
| GET | `/api/students/:id` | admin/teacher/parent | Get student profile |
| PUT | `/api/students/:id` | admin | Update student |
| DELETE | `/api/students/:id` | admin | Soft-delete student |

Query params: `class_id`, `page`, `page_size`

### Marks

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/marks` | all | Get marks (scoped by role) |
| POST | `/api/marks` | admin/teacher | Bulk upsert marks for an assessment |

Query params: `student_id`, `class_id`, `assessment_id`, `academic_year_id`

POST body:
```json
{
  "assessment_id": "uuid",
  "marks": [
    { "student_id": "uuid", "raw_score": 85, "teacher_comment": "Well done" }
  ]
}
```

### Assessments

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/assessments` | all | List assessments |
| POST | `/api/assessments` | admin/teacher | Create assessment |

### Homework

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/homework` | all | List homework (filtered by role) |
| POST | `/api/homework` | admin/teacher | Create homework |

Query params: `class_id`, `subject_id`, `academic_year_id`

### Attendance

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/attendance` | admin/teacher/parent/student | Get attendance records |
| POST | `/api/attendance` | admin/teacher | Bulk upsert attendance register |

POST body:
```json
{
  "class_id": "uuid",
  "academic_year_id": "uuid",
  "date": "2026-03-01",
  "records": [
    { "student_id": "uuid", "status": "present" },
    { "student_id": "uuid", "status": "absent", "reason": "Sick" }
  ]
}
```

Absent students trigger automatic SMS alerts to opted-in parents.

### Fees

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/fees` | admin/teacher/parent | Fee ledger for a student |
| POST | `/api/fees` | admin | Create ledger entry |
| POST | `/api/fees/payment` | admin | Record a payment |
| GET | `/api/fees/payment` | admin | Payment history |
| GET | `/api/fees/summary` | admin | Class/school fee collection summary |

GET `/api/fees` params: `student_id` (required), `academic_year_id`  
GET `/api/fees/summary` params: `class_id`, `academic_year_id` (required)

### Announcements

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/announcements` | all | List published announcements (filtered by audience) |
| POST | `/api/announcements` | admin/teacher | Create announcement |

Audience values: `all`, `parents`, `students`, `teachers`, `class`, `grade`

### Reports

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/reports/student/:id` | admin/teacher/parent | Full student report (marks + attendance + fees) |
| GET | `/api/reports/class/:id` | admin/teacher | Class performance summary |
| POST | `/api/reports/generate/:id` | admin | Generate and store PDF report card |

### Notifications (SMS)

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/notifications/sms` | admin | Send SMS notification |

POST body (discriminated union):
```json
// Custom SMS
{ "type": "custom", "to": ["+263771234567"], "message": "Hello" }

// Fee reminder to parent
{ "type": "fee_reminder", "student_id": "uuid" }

// Absence alert
{ "type": "absence_alert", "student_id": "uuid", "date": "2026-03-01" }

// Bulk announcement SMS
{ "type": "announcement", "announcement_id": "uuid" }
```

### Schools (admin only)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/schools` | List all schools |
| POST | `/api/schools` | Create school |

### Classes / Subjects / Teachers

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/classes` | List/create classes |
| GET/POST | `/api/subjects` | List/create subjects |
| GET | `/api/teachers` | List teachers with assignments |

---

## RLS Model

### Helper functions (SECURITY DEFINER)

```sql
get_user_school_id() → UUID   -- school_id from user_profiles for current user
get_user_role()      → TEXT   -- role from user_profiles for current user
```

### Policy matrix

| Table | admin | teacher | parent | student |
|-------|-------|---------|--------|---------|
| schools | CRUD (own school) | SELECT | SELECT | SELECT |
| students | CRUD | SELECT (assigned classes) | SELECT (own children) | SELECT (own) |
| marks | CRUD | INSERT/UPDATE (assigned) | SELECT (own children) | SELECT (own) |
| homework | CRUD | CRUD (assigned) | SELECT | SELECT |
| attendance | CRUD | CRUD (assigned) | SELECT (own children) | SELECT (own) |
| fee_ledger | CRUD | SELECT | SELECT (own children) | — |
| payments | CRUD | — | — | — |
| announcements | CRUD | CRUD | SELECT (audience) | SELECT (audience) |
| report_cards | CRUD | SELECT | SELECT (own children) | SELECT (own) |

---

## ZIMSEC Grading Scale

Implemented in `lib/utils/grades.ts`:

| Grade | Percentage | Label |
|-------|-----------|-------|
| A | ≥ 80% | Distinction |
| B | ≥ 65% | Merit |
| C | ≥ 50% | Credit |
| D | ≥ 40% | Pass |
| E | ≥ 25% | Partial Pass |
| U | < 25% | Ungraded |

---

## Demo School Seed

The seed (`supabase/migrations/002_seed.sql`) creates:

- **School**: St. George's College, Harare (slug: `stgeorges`)
- **Academic Year**: 2026 Term 1
- **Grades**: Form 3 & Form 4
- **Subjects**: Mathematics, English Language, Science
- **Classes**: Form 3A & Form 3B (15 students each = 30 total)
- **Users**: 1 admin, 5 teachers, 10 parents (with student links)
- **Assessments**: 3 assessments with full mark sheets for Form 3A
- **Homework**: 3 homework entries
- **Attendance**: Sample records
- **Fee Ledger**: 11 ledger entries with mixed payment states
- **Announcements**: 3 published announcements

> **Important**: The seed SQL inserts `user_profiles` rows with placeholder UUIDs.  
> Before running the seed, create the corresponding `auth.users` rows via the Supabase Auth Admin API:
> ```bash
> curl -X POST https://<project>.supabase.co/auth/v1/admin/users \
>   -H "Authorization: Bearer <service_role_key>" \
>   -H "Content-Type: application/json" \
>   -d '{"email":"admin@stgeorges.ac.zw","password":"changeme","id":"u0000000-0000-0000-0000-000000000001"}'
> ```
> Repeat for each UUID in the seed file, or replace UUIDs with those returned by Supabase.

---

## Project Structure

```
├── app/api/              # API route handlers
│   ├── students/
│   ├── marks/
│   ├── assessments/
│   ├── homework/
│   ├── attendance/
│   ├── fees/ (+ /payment, /summary)
│   ├── classes/
│   ├── subjects/
│   ├── teachers/
│   ├── schools/
│   ├── reports/ (+ /student/:id, /class/:id, /generate/:id)
│   ├── announcements/
│   └── notifications/sms/
├── lib/
│   ├── supabase/         # client, server, admin, middleware clients
│   ├── validators/       # Zod schemas per entity
│   ├── services/         # Business logic: grades, fees, reportCards, notifications
│   ├── notifications/    # sms.ts (Africa's Talking), email.ts (Resend)
│   ├── utils/            # grades.ts (ZIMSEC), fees.ts (balance), pdf.ts (report card)
│   └── api-helpers.ts    # Shared route utilities (context, parseBody, apiSuccess/Error)
├── types/
│   ├── database.ts       # Supabase generated types
│   └── api.ts            # API request/response types
├── middleware.ts          # Tenant resolution + auth + role guards
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql   # All tables + RLS
        └── 002_seed.sql             # Demo data
```

---

## Payment Methods

Supported `payment_method` values for Zimbabwe:
- `ecocash` — EcoCash mobile money
- `zimswitch` — ZimSwitch bank card
- `cash` — Cash at bursar
- `bank_transfer` — Bank transfer
- `rtgs` — RTGS (Real Time Gross Settlement)

Receipt numbers are auto-generated in format `<SCHOOL_PREFIX>/<YEAR>/<SEQUENCE>` (e.g. `SGC/2026/0001`).
