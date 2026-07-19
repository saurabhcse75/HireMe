# HireMe - Complete Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Testing the API](#testing-the-api)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Make sure you have the following installed:
- **Node.js** v14 or higher (Download from https://nodejs.org/)
- **MySQL Server** (Download from https://www.mysql.com/downloads/mysql/)
- **npm** (comes with Node.js)
- **Git** (optional, for version control)
- **Postman** (optional, for API testing)

### Verify Installations

Open Command Prompt/Terminal and run:
```bash
node --version    # Should show v14.x.x or higher
npm --version     # Should show npm version
mysql --version   # Should show MySQL version
```

## Database Setup

### Step 1: Create Database

Open MySQL Command Line or MySQL Workbench:

```bash
mysql -u root -p
```

Enter your MySQL password when prompted.

### Step 2: Run Schema

Copy the entire content from `database_schema.sql` and paste it into MySQL:

```sql
-- Paste the entire database_schema.sql content here
```

Or from command line:
```bash
mysql -u root -p < backend/database_schema.sql
```

### Step 3: Verify Database Creation

```sql
USE hireme_db;
SHOW TABLES;
```

You should see 8 tables:
- users
- workers
- employers
- jobs
- job_applications
- hiring_requests
- worker_assignments
- ratings

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- express (Web framework)
- mysql2 (Database driver)
- bcryptjs (Password hashing)
- jsonwebtoken (JWT auth)
- joi (Validation)
- cors (Cross-origin)
- dotenv (Environment variables)
- nodemon (Dev auto-reload)

### Step 3: Create Environment File

Create `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hireme_db
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=hireme_super_secret_key_change_in_production_12345
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Important**: Replace `your_mysql_password` with your actual MySQL password.

### Step 4: Test Backend

```bash
npm start
```

You should see:
```
Server running on http://localhost:5000
Environment: development
```

If you see this, the backend is working! Stop it with `Ctrl+C`.

### Step 5: Start Backend in Development Mode

```bash
npm run dev
```

This enables auto-reload when files change.

## Frontend Setup

### Step 1: Navigate to Frontend Directory

In a new terminal/command prompt:

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- react (UI library)
- react-dom (React rendering)
- react-router-dom (Routing)
- axios (HTTP client)
- tailwindcss (Styling)
- @tailwindcss/vite (Vite plugin)
- vite (Build tool)

### Step 3: Update API URL (Optional)

Edit `frontend/src/services/api.js` if backend is on different port:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';  // Change port if different
```

### Step 4: Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Open http://localhost:5173 in your browser.

## Running the Application

### Terminal Setup

Open 3 terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - For commands if needed**
```bash
# Leave for any additional commands
```

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## Testing the API

### Using Postman

1. Download and install Postman from https://www.postman.com/downloads/

2. Create a new request collection

### Test Endpoints

#### 1. Register Worker

```
POST http://localhost:5000/api/auth/register/worker
Content-Type: application/json

{
  "name": "John Doe",
  "mobileNumber": "9876543210",
  "password": "password123",
  "address": "123 Main St, City",
  "skills": ["Plumbing", "Carpentry"],
  "experience": "1-3",
  "availabilityTime": "full-time",
  "wagesPerHour": 500
}
```

**Response:**
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

#### 2. Register Employer

```
POST http://localhost:5000/api/auth/register/employer
Content-Type: application/json

{
  "name": "ABC Constructions",
  "mobileNumber": "9123456789",
  "password": "password123",
  "locationName": "Downtown Office",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

#### 3. Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "mobileNumber": "9876543210",
  "password": "password123"
}
```

#### 4. Get Worker Profile (with token)

```
GET http://localhost:5000/api/worker/profile
Authorization: Bearer <your_token_here>
Content-Type: application/json
```

Replace `<your_token_here>` with the token received from login/registration.

### Using Frontend UI

1. Go to http://localhost:5173
2. Click "Get Started"
3. Select "I'm a Worker" or "I'm an Employer"
4. Fill in the registration form
5. Click "Create Account"
6. You'll be redirected to login
7. Login with your credentials
8. You'll be taken to your dashboard

## Troubleshooting

### Backend Won't Start

**Error: `Error: connect ECONNREFUSED 127.0.0.1:3306`**
- MySQL is not running
- Solution: Start MySQL Server

**Error: `Error: Access denied for user 'root'@'localhost'`**
- Wrong MySQL password in `.env`
- Solution: Update DB_PASSWORD in `.env`

**Error: `Error: Unknown database 'hireme_db'`**
- Database not created
- Solution: Run database_schema.sql

### Frontend Won't Start

**Error: `Port 5173 is already in use`**
- Another app is using port 5173.
- Solution: Vite will automatically fall back to port `5174` in development mode, or you can kill the process using that port or specify a custom port in `vite.config.js`.

**Error: `Cannot find module 'react-router-dom'`**
- Dependencies not installed
- Solution: Run `npm install` in frontend directory

### CORS Errors in Browser Console

**Error: `Access to XMLHttpRequest has been blocked by CORS policy`**
- Backend CORS_ORIGIN doesn't match frontend URL
- Solution: Update CORS_ORIGIN in backend `.env`

### Unable to Login

**Issue: "Invalid credentials" error**
- Check mobile number and password are correct
- Ensure you used exact format during registration

**Issue: "Token expired"**
- Clear browser localStorage (F12 → Application → Local Storage → Clear All)
- Re-login

### Database Connection Issues

**Issue: Can't connect to MySQL**

1. Check if MySQL is running:
```bash
# Windows
tasklist | find "mysql"

# Mac/Linux
ps aux | grep mysql
```

2. Test MySQL connection:
```bash
mysql -u root -p -h localhost
```

3. Check MySQL service status and restart if needed

### Port Already in Use

**Change Backend Port:**
Update `PORT` in backend `.env`:
```env
PORT=5001
```

**Change Frontend Port:**
Update `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 5174
  }
})
```

## Common Commands

### Backend Commands
```bash
npm run dev      # Start with auto-reload
npm start        # Start production
npm test         # Run tests (when added)
```

### Frontend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

### Database Commands
```bash
# Backup database
mysqldump -u root -p hireme_db > backup.sql

# Restore database
mysql -u root -p hireme_db < backup.sql

# Access MySQL
mysql -u root -p hireme_db

# Show all tables
SHOW TABLES;

# View table structure
DESC table_name;
```

## Testing Workflow

### Step 1: Register Users

Register at least one worker and one employer

### Step 2: Test Worker Features

- Update location
- Browse nearby jobs
- Apply for jobs
- Check applications status

### Step 3: Test Employer Features

- Update location
- Post a job
- View applications
- Send hiring requests
- Rate workers

### Step 4: Test Authentication

- Try accessing protected routes without token
- Try with expired/invalid token
- Verify login redirects

## Next Steps

1. **Data Validation**
   - Add more comprehensive validation rules
   - Implement file uploads for worker images

2. **Features to Add**
   - Real-time notifications
   - In-app messaging
   - Payment integration
   - Advanced search filters

3. **Performance**
   - Add database query caching
   - Implement pagination
   - Optimize API responses

4. **Security**
   - Add rate limiting
   - Implement HTTPS
   - Add user verification
   - Implement refresh tokens

## Support & Help

For issues:
1. Check the Troubleshooting section
2. Review error messages in terminal
3. Check browser console (F12) for errors
4. Verify all prerequisites are installed
5. Ensure database is properly configured

Happy coding! 🚀
