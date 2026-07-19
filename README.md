# HireMe - Job Matching Platform

A comprehensive job-matching platform connecting skilled workers with employers using real-time location tracking and intelligent filtering.

## Project Overview

HireMe is a full-stack application built with:
- **Frontend**: React + Vite + Tailwind CSS + React Router + Axios
- **Backend**: Node.js + Express + MySQL
- **Authentication**: JWT + bcryptjs
- **Validation**: Joi (Backend) + React Form Validation (Frontend)

## Features

### For Workers
- Create detailed profiles with skills, experience, and availability
- Real-time location tracking and updates
- Browse nearby jobs with advanced filtering (wages, hours, distance, skills)
- Apply for jobs and manage applications
- Accept/reject direct hiring requests from employers
- Availability status management (Open/Working)
- View ratings and feedback from employers

### For Employers
- Create business profiles with location
- Post jobs with detailed requirements and location (coordinates)
- Review worker applications with full profiles
- Send direct hiring requests to nearby workers
- Track worker status and assignments
- Rate and provide feedback to workers
- Find nearby available workers

## Project Structure

```
HireMe/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Modular business logic (auth, employer, worker)
│   │   ├── middleware/      # Authentication & authorization
│   │   ├── models/          # Implemented data models (user, worker, employer, etc.)
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business services
│   │   ├── utils/           # Helper functions
│   │   └── validators/      # Joi validation schemas
│   ├── .env                 # Environment variables
│   ├── database_schema.sql  # Database schema
│   ├── update_fks.sql       # Foreign keys update script
│   └── index.js             # Main server file
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   │   ├── common/      # Reusable UI elements (StarRating, DashboardLayout)
    │   │   ├── employer/    # Employer-specific features
    │   │   └── worker/      # Worker-specific features
    │   ├── context/         # Context API (Auth)
    │   ├── pages/           # Page components (dashboards, login, landing)
    │   ├── services/        # API service
    │   ├── hooks/           # Custom hooks (useAutoLocationUpdate)
    │   ├── utils/           # Toast notification and geolocation utilities
    │   ├── App.jsx          # Main app with routes & toast container
    │   ├── main.jsx         # Entry point
    │   └── index.css        # Global styles
    ├── tailwind.config.js   # Tailwind configuration
    ├── vite.config.js       # Vite configuration
    └── package.json         # Dependencies
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MySQL Server

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Create Database**
```bash
mysql -u root -p
```
Then run the schema:
```bash
source database_schema.sql
```

Or manually create database and tables:
```bash
mysql -u root -p < database_schema.sql
```

3. **Configure Environment Variables**
Create `.env` file in backend directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hireme_db
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

For the frontend, create `frontend/.env` from `frontend/.env.example` and set:
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start Backend Server**
```bash
npm run dev    # Development mode with auto-reload
# or
npm start      # Production mode
```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Update API Base URL (if needed)**
Set `VITE_API_URL` in `frontend/.env` to your deployed backend API URL.

3. **Start Development Server**
```bash
npm run dev
```

The frontend will be running on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register/worker` - Register as worker
- `POST /api/auth/register/employer` - Register as employer
- `POST /api/auth/login` - Login with mobile number and password
- `GET /api/auth/me` - Get current authenticated user
- `POST /api/auth/logout` - Logout worker/employer

### Worker Routes (Protected - requires JWT)
- `GET /api/worker/profile` - Get worker profile
- `PUT /api/worker/profile` - Update worker profile details
- `PUT /api/worker/location` - Update worker current GPS coordinates (Auto/Manual)
- `GET /api/worker/jobs/nearby` - Get nearby open jobs within distance radius
- `POST /api/worker/jobs/:jobId/apply` - Apply for a job listing
- `GET /api/worker/applications` - Get own job applications
- `GET /api/worker/requests` - Get direct hiring requests from employers
- `PUT /api/worker/requests/:requestId` - Accept or reject a direct hiring request

### Employer Routes (Protected - requires JWT)
- `GET /api/employer/profile` - Get employer profile
- `PUT /api/employer/location` - Update business location coordinates
- `POST /api/employer/jobs` - Post a new job listing
- `GET /api/employer/jobs` - Get all job listings posted by the employer
- `PUT /api/employer/jobs/:jobId/close` - Close an open job listing
- `GET /api/employer/jobs/:jobId/applications` - Get applications for a specific job
- `PUT /api/employer/applications/:applicationId` - Respond to application (accept/reject/cancel)
- `GET /api/employer/workers/nearby` - Find nearby available workers within distance radius
- `POST /api/employer/hire` - Send direct hiring request to a worker
- `GET /api/employer/hiring-requests` - Get sent hiring requests status
- `GET /api/employer/hired` - Get list of hired workers (active, completed, or cancelled assignments)
- `PUT /api/employer/hire/status` - Update assignment status (complete/cancel)
- `POST /api/employer/rate/:workerId` - Rate a worker (optionally linked to assignmentId)

## Database Schema

The application uses 8 main tables:

1. **users** - Stores user credentials (workers & employers)
2. **workers** - Worker-specific information
3. **employers** - Employer-specific information
4. **jobs** - Job listings
5. **job_applications** - Worker applications for jobs
6. **hiring_requests** - Direct hiring requests
7. **worker_assignments** - Active worker-employer assignments
8. **ratings** - Worker ratings from employers

All tables include proper indexing for location-based queries and optimal performance.

## Color Scheme

- **Primary Navy**: `#0f1270`
- **Navy Dark**: `#1a1fa8`
- **Navy Medium**: `#2d35aa`
- **White**: `#ffffff`
- **Light Background**: `#f5f7fb`

## Validation

### Frontend Validation
- Form validation using React state
- Email/Mobile format validation
- Password strength requirements
- File upload validation

### Backend Validation
- Joi schema validation
- Database constraints
- Authentication checks
- Authorization role checks

## Security Features

- **Password Hashing**: bcryptjs with 10-salt rounds
- **JWT Authentication**: Token-based API authentication
- **CORS**: Cross-origin requests controlled
- **SQL Injection Prevention**: Parameterized queries
- **Role-Based Access Control**: Worker vs Employer routes

## Completed Features
- **Auto Location Update**: Real-time geolocation detection using the browser API with graceful permission handling.
- **Centralized Toast Notifications**: Replaced native browser alerts with custom elegant toasts via react-toastify.
- **Modern Star Rating Component**: Fully interactive custom StarRating component for worker reviews.
- **Enhanced Application Details**: Gradient headers and layout styling based on application statuses in worker views.
- **Hired Workers Assignment Controls**: Complete or cancel worker assignments with prompt-to-rate workflows.

## Future Enhancements
- [ ] Payment integration
- [ ] In-app messaging/notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (Socket.io)
- [ ] Email notifications
- [ ] Worker portfolio/gallery
- [ ] Skill verification system

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check credentials in `.env` file
- Ensure database is created
- Check firewall settings

### CORS Errors
- Verify CORS_ORIGIN in `.env` matches frontend URL
- Restart backend server after changes

### Token Expiration
- Clear localStorage
- Re-login with credentials

## Contributing

To contribute to this project:
1. Create a feature branch
2. Commit changes
3. Push to branch
4. Submit pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please contact: support@hireme.com

---

**Built with ❤️ for connecting workers and employers**
