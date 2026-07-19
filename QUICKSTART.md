# HireMe - Quick Start Guide

## 🚀 Start Application in 5 Minutes

### Prerequisites Check
```bash
node --version    # v14+
npm --version     
mysql --version   
```

### 1️⃣ Setup Database (First Time Only)

```bash
mysql -u root -p
# Enter password
# Paste content from backend/database_schema.sql
```

### 2️⃣ Start Backend (Terminal 1)

```bash
cd backend
npm install       # First time only
npm run dev
```

**Expected Output:**
```
Server running on http://localhost:5000
Environment: development
```

### 3️⃣ Start Frontend (Terminal 2)

```bash
cd frontend
npm install       # First time only
npm run dev
```

**Expected Output:**
```
Local: http://localhost:5173/
```

### 4️⃣ Open Browser

Go to: http://localhost:5173

## 📋 Test Scenarios

### Worker Workflow
1. Click "Get Started" → "I'm a Worker"
2. Fill: Name, Mobile (10 digits), Password, Address, Skills, Experience, Availability, Wages
3. Click "Create Account"
4. Login with mobile & password
5. You're in Worker Dashboard

### Employer Workflow
1. Click "Get Started" → "I'm an Employer"
2. Fill: Business Name, Mobile, Location, Click "Get Current Location"
3. Click "Create Account"
4. Login with mobile & password
5. You're in Employer Dashboard

## 🔗 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Main app |
| Backend | http://localhost:5000 | API server |
| API Health | http://localhost:5000/api/health | Check if API is running |

## 📁 Project Structure

```
HireMe/
├── backend/          # Node.js Express API
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── controllers/ # Modular controllers subfolders
│   │   ├── models/      # Database models subfolders
│   │   ├── routes/      # Endpoints routing files
│   │   ├── middleware/  # JWT validation checks middleware
│   │   ├── validators/  # Joi validation schemas
│   │   └── utils/       # Helpers (Haversine formula, hashing)
│   ├── .env          # Environment variables
│   ├── database_schema.sql # Database schema setup
│   └── index.js      # Main server entry point
│
└── frontend/         # React app
    ├── src/
    │   ├── pages/       # Dashboards & registration pages
    │   ├── components/  # Shared, worker, and employer components
    │   ├── context/     # Auth Context API store
    │   ├── hooks/       # Geolocation coordinates update hook
    │   ├── utils/       # Geolocation fetcher & toast notifications
    │   └── services/    # Axios API client
    ├── vite.config.js
    └── tailwind.config.js
```

## 🛠️ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Port 5000 in use" | Change PORT in backend/.env |
| "Port 5173 in use" | Kill process: `lsof -ti:5173` OR `kill -9 <PID>` |
| "MySQL connection refused" | Start MySQL service |
| "Database not found" | Run database_schema.sql |
| "CORS error" | Update CORS_ORIGIN in backend/.env |
| "Cannot find module" | Run `npm install` again |

## 🔑 Test Credentials (After First Registration)

Use any registered worker/employer credentials to login with their mobile number and password.

## 📝 API Testing with Curl

### Register Worker
```bash
curl -X POST http://localhost:5000/api/auth/register/worker \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "mobileNumber": "9876543210",
    "password": "password123",
    "address": "123 Main St",
    "skills": ["Plumbing"],
    "experience": "1-3",
    "availabilityTime": "full-time",
    "wagesPerHour": 500
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "9876543210",
    "password": "password123"
  }'
```

## 🎨 UI Features

### Color Scheme
- **Primary Navy**: #0f1270
- **Light Navy**: #1a1fa8
- **White**: #ffffff
- **Gray**: #6B7280

### Responsive Design
- Mobile first approach
- Tailwind CSS responsive classes
- All pages work on desktop, tablet, mobile

## 📚 Features Overview

### ✅ Completed
- Landing page with about section
- User registration (Worker & Employer)
- User login and JWT authentication
- Worker Dashboard with real-time stats cards and auto geolocation updates
- Employer Dashboard with posted jobs, applications reviews, and workers discovery
- Worker job search, browse, filter (distance, wages, hours, skills, experience), and application submission
- Employer job postings creation, close job, and job applications manager (accept/reject/cancel)
- Nearby available workers discovery (search distance filter, direct hiring request action)
- Hired workers assignments list with complete/cancel assignment actions
- StarRating component and rating submission workflows linked to assignmentIds
- Centralized react-toastify alerts utility
- Database schema with 8 tables, indexes, and transactions optimisations
- All 23 API endpoints integrated on backend and frontend

### 🔜 Future Enhancements
- Real-time notifications using WebSockets (Socket.io)
- Chat/messaging system between workers and employers
- Payment gateway integration for job completion
- Skill verification badge system
- Advanced business analytics reporting

## 🔐 Security

- Passwords hashed with bcryptjs
- JWT tokens for authentication
- CORS configured
- Input validation with Joi
- SQL parameterized queries
- Role-based access control

## 📞 Support

If something doesn't work:

1. **Check if servers are running**
   - Backend: http://localhost:5000/api/health
   - Frontend: http://localhost:5173

2. **Check console errors**
   - Backend: Terminal output
   - Frontend: Browser F12 Console

3. **Verify MySQL is running**
   - `mysql -u root -p`

4. **Clear browser cache**
   - Ctrl+Shift+Delete (Windows/Linux)
   - Cmd+Shift+Delete (Mac)

5. **Restart everything**
   - Stop all terminals (Ctrl+C)
   - Start fresh from step 2️⃣

## 📖 Full Documentation

- **Setup Guide**: See SETUP.md
- **README**: See README.md
- **Database Schema**: See backend/database_schema.sql
- **API Documentation**: Endpoints listed in README.md

---

**Now you're ready to develop! 🎉**

Happy coding!
