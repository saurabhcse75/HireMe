# 🗄️ HireMe — How the Database Works

## 1. Database at a Glance

| Property | Value |
|---|---|
| **Engine** | MySQL 8 |
| **Database** | `hireme_db` |
| **Charset** | `utf8mb4` / `utf8mb4_unicode_ci` |
| **Driver** | `mysql2/promise` (Node.js) |
| **Connection strategy** | Connection pool (max 10 connections) |
| **Transaction strategy** | Explicit `BEGIN` / `COMMIT` / `ROLLBACK` for multi-step writes |
| **Schema file** | `backend/database_schema.sql` |

---

## 2. Entity-Relationship Overview

```
users (1) ──────────── (1) workers
  │                          │
  │                          │ (many)
  │                          ▼
  │                    job_applications ─────► jobs (many)
  │                          │                   │ (1)
  │                    hiring_requests             │
  │                          │                    │
  └──── (1) employers ◄──────┘                    │
              │ (1)                                │
              └───────────── worker_assignments ◄──┘
                                    │ (1)
                                    ▼
                                 ratings
```

---

## 3. Table-by-Table Reference

### 3.1 `users` — Identity & Credentials

The **root table** for everyone in the system. Both workers and employers have a row here.

```sql
CREATE TABLE users (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  mobile_number VARCHAR(15) UNIQUE NOT NULL,   -- login identifier
  password_hash VARCHAR(255) NOT NULL,          -- bcrypt hash (10 rounds)
  role          ENUM('worker', 'employer') NOT NULL,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255),                   -- optional
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active     BOOLEAN DEFAULT TRUE
);
```

**Key points:**
- `mobile_number` is the login credential — must be unique across both roles.
- `password_hash` is produced by `bcryptjs` with `salt rounds = 10`.
- `role` determines which route group the user can access after login.
- The `users` row is the **parent** of either a `workers` row or an `employers` row via `user_id`.

**Indexes:** `idx_role(role)`, `idx_mobile(mobile_number)`, `idx_users_mobile(mobile_number)`

---

### 3.2 `workers` — Worker Profile & Status

One row per worker. Linked 1:1 to `users`.

```sql
CREATE TABLE workers (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  user_id           INT UNIQUE NOT NULL,           -- FK → users.id
  address           TEXT NOT NULL,
  skills            JSON NOT NULL,                  -- e.g. ["plumbing","welding"]
  experience        VARCHAR(50) NOT NULL,           -- "0-1"|"1-3"|"3-5"|"5-10"|"10+"
  availability_time VARCHAR(50) NOT NULL,           -- "part-time"|"full-time"|"flexible"|"weekends"
  wages_per_hour    DECIMAL(10,2) NOT NULL,
  current_latitude  DECIMAL(10,8),                  -- updated by worker in real-time
  current_longitude DECIMAL(11,8),
  status            ENUM('open','working','unavailable') DEFAULT 'open',
  rating            DECIMAL(3,2) DEFAULT 0.00,      -- denormalized avg (auto-updated)
  total_ratings     INT DEFAULT 0,                  -- denormalized count (auto-updated)
  feedback          TEXT,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Key points:**
- `skills` is a native MySQL `JSON` column. The app always stores it as a JSON array string and uses `parseSkills()` to deserialize it on read.
- `current_latitude` / `current_longitude` are `NULL` until the worker calls `PUT /api/worker/location`. Only workers with non-NULL coordinates appear in employer's nearby-worker search.
- `status` is the worker's availability flag and drives the hiring flow:
  - `open` → can be hired
  - `working` → currently in an active assignment
  - `unavailable` → manually taken themselves off the market
- `rating` and `total_ratings` are **denormalized** for fast reads. They are recomputed from the `ratings` table every time a new rating is submitted.

**Indexes:** `idx_location(lat,lon)`, `idx_status`, `idx_rating`, `idx_workers_user_id`

---

### 3.3 `employers` — Employer Profile & Location

One row per employer. Linked 1:1 to `users`.

```sql
CREATE TABLE employers (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  user_id        INT UNIQUE NOT NULL,    -- FK → users.id
  location_name  VARCHAR(255) NOT NULL,  -- human-readable address
  latitude       DECIMAL(10,8) NOT NULL,
  longitude      DECIMAL(11,8) NOT NULL,
  rating         DECIMAL(3,2) DEFAULT 0.00,
  total_ratings  INT DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Key points:**
- Employer location is set at **registration** and can be updated via `PUT /api/employer/location`.
- Employer's `latitude` / `longitude` is used as the origin for nearby-worker distance calculations.

**Indexes:** `idx_location(lat,lon)`, `idx_rating`, `idx_employers_user_id`

---

### 3.4 `jobs` — Job Postings

Each job is owned by one employer. Workers browse and apply to open jobs.

```sql
CREATE TABLE jobs (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  employer_id     INT NOT NULL,            -- FK → employers.id
  title           VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  location_name   VARCHAR(255) NOT NULL,
  latitude        DECIMAL(10,8) NOT NULL,  -- job-site coordinates
  longitude       DECIMAL(11,8) NOT NULL,
  required_skills JSON,                    -- e.g. ["carpentry"]
  min_experience  VARCHAR(50),             -- optional experience filter
  wages_per_hour  DECIMAL(10,2) NOT NULL,
  working_hours   INT,                     -- hours per day / per engagement
  status          ENUM('open','closed') DEFAULT 'open',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE
);
```

**Key points:**
- A job has its **own** `latitude`/`longitude` (the job site), which may differ from the employer's registered location.
- `required_skills` is JSON — stored and read the same way as worker skills.
- `status` transitions: `open` → `closed`. Closing is one-way; the employer calls `PUT /jobs/:id/close`.
- Workers see only `status = 'open'` jobs in their nearby-jobs search.

**Indexes:** `idx_status`, `idx_employer`, `idx_location`, `idx_wages`, `idx_jobs_employer`

---

### 3.5 `job_applications` — Worker-Initiated Applications

Created when a worker applies to a job listing.

```sql
CREATE TABLE job_applications (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  job_id       INT NOT NULL,      -- FK → jobs.id
  worker_id    INT NOT NULL,      -- FK → workers.id
  status       ENUM('pending','accepted','rejected','cancelled') DEFAULT 'pending',
  applied_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP NULL,
  FOREIGN KEY (job_id)    REFERENCES jobs(id)    ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (job_id, worker_id)
);
```

**Key points:**
- The `UNIQUE KEY (job_id, worker_id)` prevents duplicate applications — a worker can apply to the same job only once.
- `responded_at` is stamped by `NOW()` when the employer calls `PUT /applications/:id`.
- When an application is **accepted**, the system atomically:
  1. Checks `worker.status = 'open'` (with `FOR UPDATE` lock)
  2. Creates a `worker_assignments` row
  3. Sets `worker.status = 'working'`
  4. Sets `job_applications.status = 'accepted'`

**Indexes:** `idx_status`, `idx_worker`, `idx_applied_at`, `idx_applications_worker`

---

### 3.6 `hiring_requests` — Employer-Initiated Direct Hire

Created when an employer sends a direct invitation to a specific worker.

```sql
CREATE TABLE hiring_requests (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  employer_id  INT NOT NULL,   -- FK → employers.id
  worker_id    INT NOT NULL,   -- FK → workers.id
  status       ENUM('pending','accepted','rejected','cancelled') DEFAULT 'pending',
  sent_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP NULL,
  FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id)   REFERENCES workers(id)   ON DELETE CASCADE
);
```

**Key points:**
- No `UNIQUE` constraint — an employer **can** send multiple requests to the same worker over time (only one `pending` at a time is enforced at the **application layer** via `getPendingRequest`).
- When the worker **accepts**, the system atomically (same pattern as above):
  1. Checks `worker.status = 'open'`
  2. Creates a `worker_assignments` row (with `job_id = NULL` since no listing was involved)
  3. Sets `worker.status = 'working'`
  4. Sets `hiring_requests.status = 'accepted'`

**Indexes:** `idx_status`, `idx_worker`, `idx_employer`, `idx_sent_at`, `idx_hiring_requests_worker`

---

### 3.7 `worker_assignments` — Active Engagements

The **convergence point** of both hiring pathways. One row = one working engagement.

```sql
CREATE TABLE worker_assignments (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  worker_id   INT NOT NULL,      -- FK → workers.id
  employer_id INT NOT NULL,      -- FK → employers.id
  job_id      INT,               -- FK → jobs.id (NULL for direct-hire)
  start_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date    TIMESTAMP NULL,    -- stamped on complete/cancel
  status      ENUM('active','completed','cancelled') DEFAULT 'active',
  FOREIGN KEY (worker_id)   REFERENCES workers(id)   ON DELETE CASCADE,
  FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id)      REFERENCES jobs(id)      ON DELETE SET NULL
);
```

**Key points:**
- `job_id` is **nullable** — `NULL` means the assignment came from a direct `hiring_request`, not a job listing.
- `end_date` starts as `NULL` and is set by `updateAssignmentStatus()` when the employer calls `PUT /hire/status` with `complete` or `cancel`.
- On `complete` or `cancel`, `worker.status` is reset to `'open'` (if they were `'working'`).
- This row is the **prerequisite for a rating** — the employer can only rate a worker by referencing a valid `assignment_id`.

**Indexes:** `idx_status`, `idx_dates(start_date, end_date)`, `idx_assignments_worker`

---

### 3.8 `ratings` — Worker Performance Ratings

Employer submits a 1–5 star rating after an assignment ends.

```sql
CREATE TABLE ratings (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  rater_id      INT NOT NULL,        -- FK → employers.id
  worker_id     INT NOT NULL,        -- FK → workers.id
  assignment_id INT UNIQUE NULL,     -- FK → worker_assignments.id (NULL = legacy)
  rating        INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback      TEXT,
  rated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rater_id)      REFERENCES employers(id)         ON DELETE CASCADE,
  FOREIGN KEY (worker_id)     REFERENCES workers(id)           ON DELETE CASCADE,
  FOREIGN KEY (assignment_id) REFERENCES worker_assignments(id) ON DELETE CASCADE
);
```

**Key points:**
- `UNIQUE (assignment_id)` guarantees **one rating per assignment** at the DB level.
- `assignment_id = NULL` is the legacy path (used when no specific assignment ID is provided). This allows upsert logic by `(rater_id, worker_id)`.
- After every insert/update, `AVG(rating)` and `COUNT(*)` are recomputed and written back to `workers.rating` and `workers.total_ratings` for fast denormalized reads.

**Indexes:** `idx_worker`, `idx_rater`

---

## 4. Connection Pool Configuration

```js
// src/config/database.js
const pool = mysql.createPool({
  host:                    process.env.DB_HOST || 'localhost',
  user:                    process.env.DB_USER || 'root',
  password:                process.env.DB_PASSWORD || '',
  database:                process.env.DB_NAME || 'hireme_db',
  port:                    process.env.DB_PORT || 3306,
  waitForConnections:      true,   // queue requests when all connections busy
  connectionLimit:         10,     // max simultaneous connections
  queueLimit:              0,      // unlimited queue
  enableKeepAlive:         true,
  keepAliveInitialDelayMs: 0,
});
```

**Normal queries** call `pool.query()` directly — the pool picks any available connection.  
**Transactional operations** call `pool.getConnection()` to acquire a **dedicated connection**, then release it in `finally`.

---

## 5. Transaction Pattern

All multi-step writes use this pattern to guarantee atomicity:

```js
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  try {
    // Step 1: SELECT ... FOR UPDATE  (acquire row lock)
    // Step 2: Validate business rules
    // Step 3: INSERT / UPDATE
    // Step 4: INSERT / UPDATE
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  }
} finally {
  connection.release();  // always return to pool
}
```

Operations that use transactions:
| Controller action | Why |
|---|---|
| `registerWorker` | Create `users` row + `workers` row atomically |
| `registerEmployer` | Create `users` row + `employers` row atomically |
| `respondToApplication` (accept) | Lock worker, create assignment, update worker status, update application status |
| `sendHiringRequest` | Check for duplicate pending request, then insert |
| `respondToRequest` (accept) | Lock worker, create assignment, update worker status, update request status |
| `updateHireStatus` | Lock assignment, update assignment status, update worker status |

---

## 6. Indexes Summary

| Table | Index | Columns | Purpose |
|---|---|---|---|
| `users` | `unique_mobile` | `mobile_number` | Unique login lookup |
| `users` | `idx_role` | `role` | Filter by role |
| `workers` | `idx_location` | `lat, lon` | Geo-filter candidates |
| `workers` | `idx_status` | `status` | Filter `open` workers |
| `workers` | `idx_rating` | `rating` | Sort by rating |
| `employers` | `idx_location` | `lat, lon` | Origin for distance calc |
| `jobs` | `idx_status` | `status` | Filter `open` jobs |
| `jobs` | `idx_wages` | `wages_per_hour` | Filter by min wage |
| `job_applications` | `unique_application` | `job_id, worker_id` | Prevent duplicates |
| `job_applications` | `idx_status` | `status` | Filter pending |
| `ratings` | `assignment_id` (UNIQUE) | `assignment_id` | One rating per job |

---

## 7. Data Types & Conventions

| Convention | Detail |
|---|---|
| **Skills** | MySQL `JSON` column; always an array of strings |
| **Coordinates** | `DECIMAL(10,8)` for lat, `DECIMAL(11,8)` for lon (7-digit precision ≈ 1 cm) |
| **Money** | `DECIMAL(10,2)` — no floating-point rounding errors |
| **Timestamps** | `TIMESTAMP` (UTC); all `created_at` auto-set, `responded_at` / `end_date` set explicitly |
| **Soft delete** | `users.is_active` flag (currently unused in queries) |
| **Cascade deletes** | Deleting a `user` cascades to `workers`/`employers`, which cascades to their child rows |
