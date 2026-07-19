# HireMe API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register Worker
**POST** `/auth/register/worker`

**Request Body:**
```json
{
  "name": "John Doe",
  "mobileNumber": "9876543210",
  "password": "password123",
  "address": "123 Main Street, City, State",
  "skills": ["Plumbing", "Carpentry", "Electrical"],
  "experience": "1-3",
  "availabilityTime": "full-time",
  "wagesPerHour": 500
}
```

**Response (201):**
```json
{
  "message": "Worker registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "mobileNumber": "9876543210",
    "role": "worker"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Valid Values:**
- `experience`: "0-1", "1-3", "3-5", "5-10", "10+"
- `availabilityTime`: "part-time", "full-time", "flexible", "weekends"

---

### Register Employer
**POST** `/auth/register/employer`

**Request Body:**
```json
{
  "name": "ABC Constructions",
  "mobileNumber": "9123456789",
  "password": "password123",
  "locationName": "Downtown Office",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

**Response (201):**
```json
{
  "message": "Employer registered successfully",
  "user": {
    "id": 2,
    "name": "ABC Constructions",
    "mobileNumber": "9123456789",
    "role": "employer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "mobileNumber": "9876543210",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "mobileNumber": "9876543210",
    "role": "worker"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Get Current User (Me)
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "mobileNumber": "9876543210",
    "role": "worker"
  }
}
```

---

### Logout
**POST** `/auth/logout`

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```


---

## 👷 Worker Endpoints

All endpoints require `Authorization: Bearer <token>` and `role: worker`

### Get Worker Profile
**GET** `/worker/profile`

**Response (200):**
```json
{
  "worker": {
    "id": 1,
    "user_id": 1,
    "name": "John Doe",
    "mobile_number": "9876543210",
    "address": "123 Main Street",
    "skills": ["Plumbing", "Carpentry"],
    "experience": "1-3",
    "availability_time": "full-time",
    "wages_per_hour": 500,
    "current_latitude": 28.6139,
    "current_longitude": 77.2090,
    "status": "open",
    "rating": 4.5,
    "total_ratings": 10
  }
}
```

---

### Update Worker Profile
**PUT** `/worker/profile`

**Request Body (all optional):**
```json
{
  "skills": ["Plumbing", "Carpentry", "Masonry"],
  "experience": "3-5",
  "availabilityTime": "flexible",
  "wagesPerHour": 600,
  "address": "New Address"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully"
}
```

---

### Update Worker Location
**PUT** `/worker/location`

**Request Body:**
```json
{
  "latitude": 28.6200,
  "longitude": 77.2100
}
```

**Response (200):**
```json
{
  "message": "Location updated successfully"
}
```

---

### Get Nearby Jobs
**GET** `/worker/jobs/nearby?latitude=28.6139&longitude=77.2090&distance=5&wages=400&hours=8&skills=Plumbing&experience=1-3`

**Query Parameters:**
- `latitude` (required): Worker's latitude
- `longitude` (required): Worker's longitude
- `distance` (optional, default=5): Distance in km
- `wages` (optional): Minimum wages per hour
- `hours` (optional): Maximum working hours
- `skills` (optional): Required skill
- `experience` (optional): Required experience level

**Response (200):**
```json
{
  "jobs": [
    {
      "id": 1,
      "employer_id": 1,
      "title": "Plumbing Expert Needed",
      "description": "Need experienced plumber for renovation project",
      "location_name": "Downtown Renovation",
      "latitude": 28.6150,
      "longitude": 77.2100,
      "required_skills": ["Plumbing", "Pipe Fitting"],
      "min_experience": "1-3",
      "wages_per_hour": 500,
      "working_hours": 8,
      "status": "open",
      "distance": "1.50",
      "employer_name": "ABC Constructions",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Apply for Job
**POST** `/worker/jobs/:jobId/apply`

**Response (201):**
```json
{
  "message": "Application submitted successfully"
}
```

---

### Get Job Applications
**GET** `/worker/applications`

**Response (200):**
```json
{
  "applications": [
    {
      "id": 1,
      "job_id": 1,
      "worker_id": 1,
      "status": "pending",
      "title": "Plumbing Expert Needed",
      "wages_per_hour": 500,
      "working_hours": 8,
      "location_name": "Downtown",
      "employer_name": "ABC Constructions",
      "applied_at": "2024-01-16T10:00:00Z"
    }
  ]
}
```

---

### Get Hiring Requests
**GET** `/worker/requests`

**Response (200):**
```json
{
  "requests": [
    {
      "id": 1,
      "employer_id": 1,
      "worker_id": 1,
      "status": "pending",
      "employer_name": "ABC Constructions",
      "location_name": "Downtown Office",
      "sent_at": "2024-01-16T11:00:00Z"
    }
  ]
}
```

---

### Respond to Hiring Request
**PUT** `/worker/requests/:requestId`

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Status Values:** "accepted", "rejected"

**Response (200):**
```json
{
  "message": "Request accepted successfully"
}
```

---

## 🏢 Employer Endpoints

All endpoints require `Authorization: Bearer <token>` and `role: employer`

### Get Employer Profile
**GET** `/employer/profile`

**Response (200):**
```json
{
  "employer": {
    "id": 1,
    "user_id": 2,
    "name": "ABC Constructions",
    "mobile_number": "9123456789",
    "location_name": "Downtown Office",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "rating": 4.8,
    "total_ratings": 25
  }
}
```

---

### Update Employer Location
**PUT** `/employer/location`

**Request Body:**
```json
{
  "latitude": 28.6200,
  "longitude": 77.2100
}
```

**Response (200):**
```json
{
  "message": "Location updated successfully"
}
```

---

### Post a Job
**POST** `/employer/jobs`

**Request Body:**
```json
{
  "title": "Plumbing Expert Needed",
  "description": "Looking for an experienced plumber for a 3-month renovation project. Must have at least 1 year of experience.",
  "locationName": "Downtown Renovation Site",
  "latitude": 28.6150,
  "longitude": 77.2100,
  "requiredSkills": ["Plumbing", "Pipe Fitting"],
  "minExperience": "1-3",
  "wagesPerHour": 500,
  "workingHours": 8
}
```

**Response (201):**
```json
{
  "message": "Job posted successfully",
  "jobId": 1
}
```

---

### Get Employer's Jobs
**GET** `/employer/jobs`

**Response (200):**
```json
{
  "jobs": [
    {
      "id": 1,
      "employer_id": 1,
      "title": "Plumbing Expert Needed",
      "description": "Looking for experienced plumber...",
      "location_name": "Downtown",
      "latitude": 28.6150,
      "longitude": 77.2100,
      "required_skills": ["Plumbing"],
      "wages_per_hour": 500,
      "working_hours": 8,
      "status": "open",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Close a Job
**PUT** `/employer/jobs/:jobId/close`

**Response (200):**
```json
{
  "message": "Job closed successfully"
}
```

---

### Get Job Applications
**GET** `/employer/jobs/:jobId/applications`

**Response (200):**
```json
{
  "applications": [
    {
      "id": 1,
      "job_id": 1,
      "worker_id": 1,
      "worker_name": "John Doe",
      "mobile_number": "9876543210",
      "status": "pending",
      "skills": ["Plumbing", "Carpentry"],
      "experience": "1-3",
      "wages_per_hour": 500,
      "rating": 4.5,
      "total_ratings": 10,
      "applied_at": "2024-01-16T10:00:00Z"
    }
  ]
}
```

---

### Respond to Application
**PUT** `/employer/applications/:applicationId`

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Status Values:** "accepted", "rejected"

**Response (200):**
```json
{
  "message": "Application accepted successfully"
}
```

---

### Get Nearby Workers
**GET** `/employer/workers/nearby?latitude=28.6139&longitude=77.2090&distance=5`

**Query Parameters:**
- `latitude` (required): Employer's latitude
- `longitude` (required): Employer's longitude
- `distance` (optional, default=5): Distance in km

**Response (200):**
```json
{
  "workers": [
    {
      "id": 1,
      "user_id": 1,
      "name": "John Doe",
      "mobile_number": "9876543210",
      "skills": ["Plumbing", "Carpentry"],
      "experience": "1-3",
      "wages_per_hour": 500,
      "status": "open",
      "rating": 4.5,
      "current_latitude": 28.6200,
      "current_longitude": 77.2100,
      "distance": "1.30"
    }
  ]
}
```

---

### Send Hiring Request
**POST** `/employer/hire`

**Request Body:**
```json
{
  "workerId": 1
}
```

**Response (201):**
```json
{
  "message": "Hiring request sent successfully"
}
```

---

### Get Sent Hiring Requests
**GET** `/employer/hiring-requests`

**Response (200):**
```json
{
  "workerIds": [1, 3]
}
```

---

### Get Hired Workers
**GET** `/employer/hired`

**Response (200):**
```json
{
  "workers": [
    {
      "hire_source": "assignment",
      "hire_id": 5,
      "status": "active",
      "hired_at": "2026-06-23T05:00:00.000Z",
      "worker_id": 3,
      "user_id": 4,
      "name": "Ravi Kumar",
      "mobile_number": "9876543210",
      "skills": ["plumbing", "welding"],
      "experience": "1-3",
      "availability_time": "full-time",
      "wages_per_hour": 250.00,
      "rating": 4.50,
      "total_ratings": 8,
      "worker_status": "working",
      "is_rated": false
    }
  ]
}
```

---

### Update Hire Status (Complete/Cancel Assignment)
**PUT** `/employer/hire/status`

**Request Body:**
```json
{
  "hireId": 5,
  "action": "complete"
}
```
*Valid Actions:* "complete", "cancel"

**Response (200):**
```json
{
  "message": "Hire completed successfully",
  "workerId": 3,
  "promptRating": true
}
```

---

### Rate Worker
**POST** `/employer/rate/:workerId`

**Request Body:**
```json
{
  "rating": 5,
  "feedback": "Excellent work, very professional and punctual!",
  "assignmentId": 5
}
```

**Valid Rating Values:** 1, 2, 3, 4, 5
**assignmentId:** (optional) The ID of the assignment to link the rating to.

**Response (200):**
```json
{
  "message": "Rating submitted successfully"
}
```

---

## ❌ Error Responses

### 400 - Bad Request
```json
{
  "message": "Mobile number must be 10 digits"
}
```

### 401 - Unauthorized
```json
{
  "message": "Invalid or expired token"
}
```

### 403 - Forbidden
```json
{
  "message": "Access denied"
}
```

### 404 - Not Found
```json
{
  "message": "Worker profile not found"
}
```

### 409 - Conflict
```json
{
  "message": "Mobile number already registered"
}
```

### 500 - Server Error
```json
{
  "message": "Registration failed"
}
```

---

## 📊 Status Values

### Worker Status
- `open` - Available for work
- `working` - Currently assigned to an employer
- `unavailable` - Not available for work

### Application/Request Status
- `pending` - Awaiting response
- `accepted` - Accepted
- `rejected` - Rejected
- `cancelled` - Cancelled

### Job Status
- `open` - Job is open for applications
- `closed` - Job is closed

---

## 🔢 Pagination Notes

Current API returns all results. For large datasets, add pagination support:
- `?page=1&limit=10`

---

## 📝 Notes

1. All timestamps are in ISO 8601 format (UTC)
2. Coordinates are in decimal format (latitude: -90 to 90, longitude: -180 to 180)
3. Distance is calculated using Haversine formula
4. Ratings are decimal values (0.00 to 5.00)
5. All monetary values are in the local currency (INR in this case)

---

## 🧪 Testing Tools

- **Postman**: GUI for API testing
- **curl**: Command-line tool
- **Insomnia**: API client alternative
- **Thunder Client**: VS Code extension

---

**Last Updated:** June 2026
