# 🔄 HireMe — Data Movement in This Project

This document traces how data physically moves through every layer of the application — from the client's HTTP request through validation, business logic, database, and back out as a JSON response. Every major flow is covered.

---

## 1. Request Lifecycle (Every API Call)

```
Browser / Mobile App
        │
        │  HTTP Request
        │  Headers: { Authorization: "Bearer <JWT>" }
        │  Body:    { ...JSON payload }
        ▼
Express Router (routes/*.js)
        │  Matches method + path
        ▼
authMiddleware  (if protected route)
        │  jwt.verify(token) → req.user = { id, role, mobileNumber }
        ▼
roleCheck('employer' | 'worker')  (if role-restricted)
        │  req.user.role === required → next()
        ▼
Controller Function (controllers/**/*.js)
        │  Joi schema validation → 400 if invalid
        │  Business logic
        ▼
Model Function (models/**/*.js)
        │  pool.query() or connection.query()
        ▼
MySQL 8 (hireme_db)
        │  SQL execution → result set / affected rows
        ▼
Controller
        │  Formats response object
        ▼
Express res.json()
        │
        ▼
Browser / Mobile App  ← JSON response
```

---

## 2. Flow A — Worker Registration

**Endpoint:** `POST /api/auth/register/worker`

```
Client sends:
{
  "name": "Ravi Kumar",
  "mobileNumber": "9876543210",
  "password": "secret123",
  "address": "123 Main St, Chennai",
  "skills": ["plumbing", "welding"],
  "experience": "1-3",
  "availabilityTime": "full-time",
  "wagesPerHour": 250
}
```

**Data movement:**

```
Request Body
    │
    ▼ workerRegistrationSchema.validate()  [validators/schemas.js]
    │  ✓ name, mobileNumber (10 digits), password (min 6), skills array, experience enum
    │
    ▼ model.getUserByMobile(mobileNumber)  [models/user/userModel.js]
    │  SELECT FROM users WHERE mobile_number = ?
    │  → if found: 409 Conflict
    │
    ▼ hashPassword(password)  [utils/helpers.js]
    │  bcrypt.genSalt(10) + bcrypt.hash()
    │  → passwordHash (60-char bcrypt string)
    │
    ▼ connection.beginTransaction()
    │
    ▼ model.createUser(mobileNumber, passwordHash, 'worker', name)
    │  INSERT INTO users → userId (insertId)
    │
    ▼ model.createWorkerProfile(userId, address, skills, experience, ...)
    │  INSERT INTO workers (skills stored as JSON.stringify(array))
    │
    ▼ connection.commit()
    │
    ▼ model.getUserById(userId)
    │  SELECT id, mobile_number, role, name FROM users WHERE id = ?
    │
    ▼ generateToken(user)  [utils/helpers.js]
    │  jwt.sign({ id, mobileNumber, role }, JWT_SECRET, { expiresIn: '7d' })
    │
Response:
{
  "message": "Worker registered successfully",
  "user": { "id": 1, "name": "Ravi Kumar", "mobileNumber": "9876543210", "role": "worker" },
  "token": "<JWT>"
}
```

---

## 3. Flow B — Login

**Endpoint:** `POST /api/auth/login`

```
Client sends: { "mobileNumber": "9876543210", "password": "secret123" }

    ▼ loginSchema.validate()
    │
    ▼ model.getUserByMobile(mobileNumber)
    │  SELECT id, mobile_number, password_hash, role, name FROM users
    │  → if not found: 401
    │
    ▼ bcrypt.compare(password, user.password_hash)
    │  → if mismatch: 401
    │
    ▼ generateToken(user)
    │  JWT payload: { id, mobileNumber, role }

Response:
{
  "message": "Login successful",
  "user": { "id": 1, "name": "...", "role": "worker" },
  "token": "<JWT>"
}
```

---

## 4. Flow C — Worker Updates GPS Location

**Endpoint:** `PUT /api/worker/location`

```
Client sends:
  Headers: Authorization: Bearer <JWT>
  Body: { "latitude": 13.0827, "longitude": 80.2707 }

    ▼ authMiddleware → req.user.id = 1
    ▼ roleCheck('worker')
    ▼ locationUpdateSchema.validate()  (lat -90..90, lon -180..180)
    ▼ model.updateWorkerLocation(req.user.id, latitude, longitude)
       UPDATE workers SET current_latitude=?, current_longitude=? WHERE user_id=?

Response: { "message": "Location updated successfully" }
```

**Effect in DB:** `workers.current_latitude` and `workers.current_longitude` are now set — this worker will appear in employer's nearby-worker searches.

---

## 5. Flow D — Employer Finds Nearby Workers

**Endpoint:** `GET /api/employer/workers/nearby?latitude=13.08&longitude=80.27&distance=5`

```
Client sends: JWT + query params (latitude, longitude, distance=5km default)

    ▼ authMiddleware + roleCheck('employer')
    ▼ Controller reads query params
    ▼ model.getAllOpenWorkers()
       SELECT w.*, u.name, u.mobile_number
       FROM workers w JOIN users u ON w.user_id = u.id
       WHERE w.status='open'
         AND w.current_latitude IS NOT NULL
         AND w.current_longitude IS NOT NULL
       → returns all available, located workers

    ▼ For each worker (in JS, not DB):
       dist = calculateDistance(reqLat, reqLon, w.lat, w.lon)  [Haversine]
       → filter: dist <= distance
       → sort: ascending by dist
       → parseSkills(w.skills)  (JSON.parse the skills array)

Response:
{
  "workers": [
    { "id": 3, "name": "Ravi", "skills": ["plumbing"], "distance": "1.23", ... },
    ...
  ]
}
```

---

## 6. Flow E — Employer Posts a Job

**Endpoint:** `POST /api/employer/jobs`

```
Client sends:
{
  "title": "Plumber needed",
  "description": "Fix kitchen sink ...",
  "locationName": "T Nagar, Chennai",
  "latitude": 13.04,
  "longitude": 80.23,
  "requiredSkills": ["plumbing"],
  "wagesPerHour": 300,
  "workingHours": 4
}

    ▼ jobCreationSchema.validate()
    ▼ model.getEmployerByUserId(req.user.id)
       SELECT e.*, u.name FROM employers e JOIN users u ON e.user_id=u.id
       WHERE u.id = ?
    ▼ model.createJob(employer.id, title, description, ...)
       INSERT INTO jobs (employer_id, title, ..., required_skills=JSON.stringify([...]))

Response: { "message": "Job posted successfully", "jobId": 7 }
```

---

## 7. Flow F — Worker Browses Nearby Jobs

**Endpoint:** `GET /api/worker/jobs/nearby?latitude=13.08&longitude=80.27&wages=200`

```
    ▼ authMiddleware + roleCheck('worker')
    ▼ model.getNearbyJobs({ wages, hours, experience })
       SELECT j.*, e.location_name, u.name as employer_name
       FROM jobs j JOIN employers e ON j.employer_id=e.id JOIN users u ON e.user_id=u.id
       WHERE j.status='open'
         [AND j.wages_per_hour >= ? if wages filter]
         [AND j.working_hours <= ? if hours filter]
         [AND j.min_experience = ? if experience filter]

    ▼ For each job (in JS):
       dist = calculateDistance(workerLat, workerLon, job.lat, job.lon)
       filter: dist <= distance (default 5km)
       sort: ascending by dist
       parseSkills(job.required_skills)

Response: { "jobs": [ { "id": 7, "title": "Plumber needed", "distance": "0.78", ... } ] }
```

---

## 8. Flow G — Worker Applies for a Job

**Endpoint:** `POST /api/worker/jobs/:jobId/apply`

```
    ▼ authMiddleware + roleCheck('worker')
    ▼ model.getWorkerByUserId(req.user.id)          → get worker.id
    ▼ model.getApplicationByWorkerAndJob(jobId, workerId)
       SELECT id FROM job_applications WHERE job_id=? AND worker_id=?
       → if found: 409 (already applied)
    ▼ model.createApplication(jobId, workerId)
       INSERT INTO job_applications (job_id, worker_id, status='pending')

Response: { "message": "Application submitted successfully" }
```

**DB state after:** A `job_applications` row with `status='pending'` now exists.

---

## 9. Flow H — Employer Accepts an Application

**Endpoint:** `PUT /api/employer/applications/:applicationId`  
**Body:** `{ "status": "accepted" }`

This is the most complex flow — it uses a full transaction with row-level locks.

```
    ▼ authMiddleware + roleCheck('employer')
    ▼ Validate status ∈ ['accepted','rejected','cancelled']
    ▼ connection = pool.getConnection()
    ▼ connection.beginTransaction()

    ▼ model.getApplicationByIdAndEmployerUserWithLock(applicationId, userId, connection)
       SELECT ja.*, j.employer_id FROM job_applications ja
       JOIN jobs j ON ja.job_id=j.id
       JOIN employers e ON j.employer_id=e.id
       WHERE ja.id=? AND e.user_id=?
       FOR UPDATE                          ← locks this application row
       → if not found: rollback + 404
       → if status != 'pending': rollback + 400

    IF status === 'accepted':
    ▼ model.getWorkerByIdWithLock(application.worker_id, connection)
       SELECT * FROM workers WHERE id=? FOR UPDATE   ← locks this worker row
       → if worker.status != 'open': rollback + 400

    ▼ model.createAssignment(worker_id, employer_id, job_id, connection)
       INSERT INTO worker_assignments (worker_id, employer_id, job_id, status='active')

    ▼ model.updateWorkerStatus(worker_id, 'working', connection)
       UPDATE workers SET status='working' WHERE id=?

    ▼ model.updateApplicationStatus(applicationId, 'accepted', connection)
       UPDATE job_applications SET status='accepted', responded_at=NOW() WHERE id=?

    ▼ connection.commit()
    ▼ connection.release()

Response: { "message": "Application accepted successfully" }
```

**DB state after:**
- `job_applications.status` → `'accepted'`
- `worker_assignments` → new row, `status='active'`
- `workers.status` → `'working'`

---

## 10. Flow I — Employer Sends Direct Hiring Request

**Endpoint:** `POST /api/employer/hire`  
**Body:** `{ "workerId": 3 }`

```
    ▼ model.getEmployerByUserId(req.user.id)          → employer.id
    ▼ connection.beginTransaction()
    ▼ model.getPendingRequest(employerId, workerId, connection)
       SELECT id FROM hiring_requests
       WHERE employer_id=? AND worker_id=? AND status='pending'
       → if found: rollback + 409 (already pending)
    ▼ model.createHiringRequest(employerId, workerId, connection)
       INSERT INTO hiring_requests (employer_id, worker_id, status='pending')
    ▼ connection.commit()

Response: { "message": "Hiring request sent successfully" }
```

---

## 11. Flow J — Worker Accepts a Hiring Request

**Endpoint:** `PUT /api/worker/requests/:requestId`  
**Body:** `{ "status": "accepted" }`

```
    ▼ model.getRequestByIdAndWorkerUserWithLock(requestId, userId, connection)
       SELECT hr.*, w.id as worker_id FROM hiring_requests hr
       JOIN workers w ON hr.worker_id=w.id
       WHERE hr.id=? AND w.user_id=?
       FOR UPDATE
       → if not pending: rollback + 400

    ▼ model.getWorkerByIdWithLock(request.worker_id, connection)
       → if worker.status != 'open': rollback + 400

    ▼ model.createAssignment(worker_id, employer_id, null, connection)
       INSERT INTO worker_assignments (worker_id, employer_id, job_id=NULL, status='active')
       NOTE: job_id is NULL — no job listing involved

    ▼ model.updateWorkerStatus(worker_id, 'working', connection)
    ▼ model.updateRequestStatus(requestId, 'accepted', connection)
    ▼ connection.commit()

Response: { "message": "Request accepted successfully" }
```

---

## 12. Flow K — Employer Completes/Cancels Assignment

**Endpoint:** `PUT /api/employer/hire/status`  
**Body:** `{ "hireId": 5, "action": "complete" }`

```
    ▼ Validate action ∈ ['complete','cancel']
    ▼ model.getEmployerByUserId(userId)
    ▼ connection.beginTransaction()

    ▼ model.getAssignmentByIdAndEmployerWithLock(hireId, employerId, connection)
       SELECT * FROM worker_assignments WHERE id=? AND employer_id=? FOR UPDATE
       → if not found: rollback + 404
       → if status != 'active': rollback + 400

    ▼ model.getWorkerByIdWithLock(workerId, connection)

    ▼ model.updateAssignmentStatus(hireId, 'completed'|'cancelled', connection)
       UPDATE worker_assignments SET status=?, end_date=NOW() WHERE id=?

    IF worker.status === 'working':
    ▼ model.updateWorkerStatus(workerId, 'open', connection)
       → worker is now available again

    ▼ connection.commit()

Response: { "message": "Hire completed successfully", "workerId": 3, "promptRating": true }
```

**DB state after:**
- `worker_assignments.status` → `'completed'` or `'cancelled'`
- `worker_assignments.end_date` → now
- `workers.status` → `'open'`

---

## 13. Flow L — Employer Rates a Worker

**Endpoint:** `POST /api/employer/rate/:workerId`  
**Body:** `{ "rating": 4, "feedback": "Very punctual", "assignmentId": 5 }`

```
    ▼ ratingSchema.validate()  (rating 1-5, feedback max 500 chars)
    ▼ model.getEmployerByUserId(userId)                 → employer.id

    IF assignmentId provided:
    ▼ model.getAssignmentByIdAndWorkerAndEmployer(assignmentId, workerId, employerId)
       SELECT id FROM worker_assignments WHERE id=? AND worker_id=? AND employer_id=?
       → if not found: 404

    ▼ model.getRatingByAssignmentId(assignmentId)
       SELECT id FROM ratings WHERE assignment_id=?
       → if found: 400 (already rated)

    ▼ model.createRating(employerId, workerId, assignmentId, rating, feedback)
       INSERT INTO ratings (rater_id, worker_id, assignment_id, rating, feedback)

    ELSE (legacy path, no assignmentId):
    ▼ model.getLegacyRating(employerId, workerId)       → upsert
    ▼ model.createLegacyRating() or model.updateLegacyRating()

    ▼ model.getAverageRatingForWorker(workerId)
       SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM ratings WHERE worker_id=?

    ▼ model.updateWorkerStats(workerId, avg_rating, total)
       UPDATE workers SET rating=?, total_ratings=? WHERE id=?

Response: { "message": "Rating submitted successfully" }
```

**DB state after:**
- New row in `ratings`
- `workers.rating` recalculated (denormalized average)
- `workers.total_ratings` incremented

---

## 14. Data Transformation Points

| Location | Transformation | Direction |
|---|---|---|
| `authController` | Plain password → bcrypt hash | In (write) |
| `authController` | User record → JWT string | Out (read) |
| `workerModel.createWorkerProfile` | `skills[]` → `JSON.stringify()` | In (write) |
| `jobModel.createJob` | `requiredSkills[]` → `JSON.stringify()` | In (write) |
| `helpers.parseSkills()` | DB JSON string → `skills[]` | Out (read) |
| `helpers.calculateDistance()` | Two lat/lon pairs → km float | Computed |
| `authMiddleware` | JWT string → `req.user` object | In-memory |
| `ratingModel.updateWorkerStats` | `AVG()` from DB → worker denorm fields | In (write) |

---

## 15. Summary: Which Tables Each Flow Touches

| Flow | Tables Read | Tables Written |
|---|---|---|
| Register Worker | `users` | `users`, `workers` |
| Register Employer | `users` | `users`, `employers` |
| Login | `users` | — |
| Update Worker Location | — | `workers` |
| Nearby Workers | `workers`, `users` | — |
| Post Job | `employers` | `jobs` |
| Browse Nearby Jobs | `jobs`, `employers`, `users` | — |
| Apply for Job | `workers`, `job_applications` | `job_applications` |
| Accept Application | `job_applications`, `workers` | `job_applications`, `worker_assignments`, `workers` |
| Send Hiring Request | `employers`, `hiring_requests` | `hiring_requests` |
| Accept Hiring Request | `hiring_requests`, `workers` | `hiring_requests`, `worker_assignments`, `workers` |
| Complete/Cancel Assignment | `worker_assignments`, `workers` | `worker_assignments`, `workers` |
| Rate Worker | `employers`, `worker_assignments`, `ratings` | `ratings`, `workers` |
