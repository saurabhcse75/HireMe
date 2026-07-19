# 🏗️ HireMe — System Design

## 1. Overview

**HireMe** is a location-based blue-collar job marketplace that connects **Workers** (daily-wage labourers, skilled/semi-skilled individuals) with **Employers** (businesses or individuals who need short-term help). The platform supports two hiring pathways:

| Pathway | Initiator | Description |
|---|---|---|
| Job Application | Worker → Employer | Worker browses nearby open jobs and applies |
| Hiring Request | Employer → Worker | Employer browses nearby available workers and sends a direct request |

Both pathways ultimately create a **Worker Assignment**, which tracks the active working relationship.

---

## 2. Architecture

HireMe follows a classic **3-tier web architecture**:

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT (Frontend)                  │
│             React SPA  ─  Vite dev server            │
│          Communicates via REST over HTTP/HTTPS        │
└──────────────────────┬───────────────────────────────┘
                       │  JSON over HTTP
┌──────────────────────▼───────────────────────────────┐
│                  APPLICATION LAYER                    │
│              Node.js + Express.js (REST API)          │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Routes    │  │  Controllers │  │   Models    │ │
│  │  (routing)  │→ │  (business   │→ │  (data      │ │
│  │             │  │   logic)     │  │   access)   │ │
│  └─────────────┘  └──────────────┘  └─────────────┘ │
│                                                       │
│  ┌──────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Middleware  │  │  Validators │  │   Helpers   │ │
│  │ (auth/roles) │  │  (Joi)      │  │ (jwt/bcrypt)│ │
│  └──────────────┘  └─────────────┘  └─────────────┘ │
└──────────────────────┬───────────────────────────────┘
                       │  mysql2/promise pool
┌──────────────────────▼───────────────────────────────┐
│                  DATA LAYER                           │
│           MySQL 8 — hireme_db                        │
│   7 tables: users, workers, employers, jobs,         │
│   job_applications, hiring_requests,                 │
│   worker_assignments, ratings                        │
└──────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React + Vite | SPA, component-based UI |
| **Backend Runtime** | Node.js | JavaScript server runtime |
| **Web Framework** | Express.js | HTTP routing and middleware |
| **Database** | MySQL 8 | Relational data storage |
| **DB Driver** | mysql2/promise | Async MySQL connection pool |
| **Authentication** | JWT (jsonwebtoken) | Stateless session tokens |
| **Password Hashing** | bcryptjs | Secure password storage |
| **Input Validation** | Joi | Schema-based request validation |
| **Environment Config** | dotenv | Secrets management via `.env` |

---

## 4. Backend Directory Structure

```
backend/
├── database_schema.sql          ← DB DDL (table definitions)
└── src/
    ├── config/
    │   └── database.js          ← mysql2 connection pool
    ├── controllers/
    │   ├── index.js             ← barrel export
    │   ├── auth/
    │   │   └── authController.js
    │   ├── employer/
    │   │   └── employerController.js
    │   └── worker/
    │       └── workerController.js
    ├── middleware/
    │   └── authMiddleware.js    ← JWT verify + role check
    ├── models/
    │   ├── index.js             ← barrel export
    │   ├── user/userModel.js
    │   ├── worker/workerModel.js
    │   ├── employer/employerModel.js
    │   ├── job/jobModel.js
    │   ├── application/applicationModel.js
    │   ├── hiringRequest/hiringRequestModel.js
    │   ├── assignment/assignmentModel.js
    │   └── rating/ratingModel.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── employerRoutes.js
    │   └── workerRoutes.js
    ├── utils/
    │   └── helpers.js           ← JWT, bcrypt, Haversine, parseSkills
    └── validators/
        └── schemas.js           ← Joi schemas for all endpoints
```

---

## 5. API Route Map

### Auth Routes — `/api/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register/worker` | Public | Register a new worker |
| POST | `/register/employer` | Public | Register a new employer |
| POST | `/login` | Public | Login and receive JWT |
| GET | `/me` | Protected | Get current user session |
| POST | `/logout` | Public | Logout user |

### Employer Routes — `/api/employer` *(JWT + role: employer)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/profile` | Get employer profile |
| PUT | `/location` | Update employer location |
| POST | `/jobs` | Post a new job |
| GET | `/jobs` | List employer's own jobs |
| PUT | `/jobs/:jobId/close` | Close a job |
| GET | `/jobs/:jobId/applications` | List applicants for a job |
| PUT | `/applications/:applicationId` | Accept / Reject application |
| GET | `/workers/nearby` | Find available workers nearby |
| POST | `/hire` | Send direct hiring request to worker |
| GET | `/hired` | List all hired workers (assignments) |
| PUT | `/hire/status` | Complete or cancel an assignment |
| POST | `/rate/:workerId` | Submit rating for a worker |

### Worker Routes — `/api/worker` *(JWT + role: worker)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/profile` | Get worker profile |
| PUT | `/profile` | Update worker profile fields |
| PUT | `/location` | Update worker's GPS location |
| GET | `/jobs/nearby` | Browse nearby open jobs |
| POST | `/jobs/:jobId/apply` | Apply for a job |
| GET | `/applications` | List own applications |
| GET | `/requests` | List incoming hiring requests |
| PUT | `/requests/:requestId` | Accept / Reject a hiring request |

---

## 6. Authentication & Authorization Flow

```
Client
  │
  ├─ POST /api/auth/login
  │     └─ Server validates credentials
  │         └─ Returns JWT { id, role }
  │
  ├─ All protected requests: Authorization: Bearer <JWT>
  │
  └─ authMiddleware.js
        ├─ Extracts token from header
        ├─ jwt.verify() → decodes payload into req.user
        └─ roleCheck('employer' | 'worker')
              └─ Compares req.user.role
```

JWT payload:
```json
{ "id": 1, "role": "worker" }
```
Token expiry: **7 days** (configurable via `JWT_EXPIRE` env var).

---

## 7. Key Design Decisions

### 7.1 Shared `users` Table
Both workers and employers share a single `users` table for credentials (`mobile_number`, `password_hash`, `role`). Role-specific data lives in the `workers` or `employers` table linked by `user_id`. This avoids credential duplication and simplifies login.

### 7.2 Dual Hiring Pathways
The system has two completely separate paths that both converge at `worker_assignments`:
- **Job Application** path: `jobs` → `job_applications` → `worker_assignments`
- **Direct Request** path: `hiring_requests` → `worker_assignments`

### 7.3 Optimistic Locking with `FOR UPDATE`
To prevent race conditions (e.g., two employers accepting the same worker simultaneously), critical DB reads use `SELECT ... FOR UPDATE` inside an explicit transaction before any write. This is implemented in:
- `getApplicationByIdAndEmployerUserWithLock`
- `getWorkerByIdWithLock`
- `getRequestByIdAndWorkerUserWithLock`
- `getAssignmentByIdAndEmployerWithLock`

### 7.4 Skills Stored as JSON
Worker skills and job required skills are stored as `JSON` columns in MySQL (`["plumbing", "welding"]`). The `parseSkills()` helper safely deserializes them, handling both valid JSON arrays and legacy plain strings.

### 7.5 Location-Based Discovery via Haversine
Location queries (nearby workers, nearby jobs) are done **application-side** using the Haversine formula rather than DB spatial queries. All open workers/jobs are fetched, then filtered and sorted by computed distance in JavaScript. The default radius is **5 km**.

### 7.6 Connection Pooling
A single `mysql2` connection pool (`connectionLimit: 10`) is shared across the entire app. Controllers that need transactional atomicity acquire a dedicated connection from the pool, run `beginTransaction`, and release it in `finally`.

---

## 8. Worker Status State Machine

```
          Register
              │
              ▼
           [ open ]  ←──────────────────────────────┐
              │                                      │
    Employer accepts application                     │
    OR Worker accepts hiring request                 │
              │                                      │
              ▼                                 Assignment
          [ working ]                     completed or cancelled
              │                                      │
              └──────────────────────────────────────┘

    Worker can also self-set → [ unavailable ]
```

---

## 9. Rating System

- Ratings are **1–5 integer** scale, stored in the `ratings` table.
- Each `worker_assignment` can have **at most one rating** (enforced by `UNIQUE` constraint on `assignment_id`).
- After each new rating, the worker's `rating` and `total_ratings` fields in the `workers` table are **recalculated** using `AVG()` from the `ratings` table.
- A **legacy fallback** path exists for ratings not tied to a specific assignment (upsert by employer+worker).

---

## 10. Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `localhost` | MySQL host |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | *(empty)* | MySQL password |
| `DB_NAME` | `hireme_db` | Database name |
| `DB_PORT` | `3306` | MySQL port |
| `JWT_SECRET` | *(required)* | Secret key for JWT signing |
| `JWT_EXPIRE` | `7d` | JWT token expiry duration |
