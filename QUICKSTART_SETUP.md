# 🚀 Quick Start - HireMe Application

## Prerequisites
- Node.js (v14+)
- MySQL Server running
- Git

## Setup Instructions

### 1. Database Setup
```bash
# Import the database schema
mysql -u root -p hireme_db < backend/database_schema.sql
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file with your configuration
# DATABASE_HOST=localhost
# DATABASE_USER=root
# DATABASE_PASSWORD=your_password
# DATABASE_NAME=hireme_db
# PORT=5000
# JWT_SECRET=your_secret_key
# CORS_ORIGIN=http://localhost:5173

# Start server
npm start

# Server will run on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will run on http://localhost:5173
```

## 🧪 Testing the Application

### Option 1: Test as Worker
1. Navigate to http://localhost:5173
2. Click on "Get Started" → "I'm a Worker"
3. Fill registration form:
   - Name: John Doe
   - Mobile: 9876543210
   - Password: password123
   - Address: 123 Main Street
   - Skills: Plumbing, Carpentry (add one at a time)
   - Experience: 1-3 years
   - Availability: Full-time
   - Wages: 500 per hour
4. Click Register
5. You'll be logged in as a worker
6. Explore nearby jobs, apply, manage applications

### Option 2: Test as Employer
1. Navigate to http://localhost:5173
2. Click on "Get Started" → "I'm an Employer"
3. Fill registration form:
   - Business Name: ABC Constructions
   - Mobile: 9123456789
   - Password: password123
   - Location Name: Downtown Office
   - Get Current Location (or enter coordinates)
4. Click Register
5. You'll be logged in as an employer
6. Post jobs, manage applications, find workers

## 📚 Key Features to Try

### Worker Features
- 🔍 Search nearby jobs with filters
- 💼 Apply for jobs
- 📋 Track job applications
- 🤝 Manage employer requests
- ⭐ View your rating

### Employer Features
- ➕ Post new jobs
- 📊 Manage job postings and applications
- 👥 Find nearby workers
- 📤 Send hiring requests
- ⭐ Rate workers

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is not in use
- Verify MySQL is running
- Check `.env` file configuration
- Check database credentials

### Frontend won't load
- Check if port 5173 is not in use
- Clear browser cache
- Run `npm install` again
- Check console for errors

### Can't login
- Verify user was registered successfully
- Check mobile number and password match
- Check JWT_SECRET in .env file

### Jobs not appearing
- Ensure workers have location set (update profile)
- Ensure employers are posting jobs with valid locations
- Check distance filters (reduce distance value)

## 📞 Default Test Credentials

After registration, use these to login:

**Worker Example:**
- Mobile: 9876543210
- Password: password123

**Employer Example:**
- Mobile: 9123456789
- Password: password123

## 🎯 Next Steps

1. Create more test accounts
2. Post multiple jobs from employer accounts
3. Update worker locations for better job matching
4. Test the complete workflow from job posting to hiring
5. Check ratings and reviews system

## 📖 Documentation

- Backend API: See `API_DOCUMENTATION.md`
- Project Overview: See `PROJECT_SUMMARY.md`
- Features Built: See `FEATURES_IMPLEMENTATION.md`
- Full Setup: See `SETUP.md`

## ✅ Verification Checklist

- [ ] Backend server is running on port 5000
- [ ] Frontend is running on port 5173
- [ ] Database is properly initialized
- [ ] Can register as a worker
- [ ] Can register as an employer
- [ ] Can login with credentials
- [ ] Can search for jobs (as worker)
- [ ] Can post jobs (as employer)
- [ ] Can see job applications
- [ ] Can manage hiring requests

---

**Happy Testing! 🎉**
