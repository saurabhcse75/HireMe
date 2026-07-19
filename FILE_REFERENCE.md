# HireMe - File Reference Guide

## 📁 Complete File Structure

```
HireMe/
├── README.md                          # Main project documentation
├── SETUP.md                           # Detailed setup instructions
├── QUICKSTART.md                      # Quick start guide
├── QUICKSTART_SETUP.md                # Simplified quick setup checklist
├── API_DOCUMENTATION.md               # Complete API reference
├── PROJECT_SUMMARY.md                 # Project overview & summary
├── INDEX.md                           # Complete guides index
├── systemdesign.md                    # System architecture design decisions
├── how_database_is_working.md         # Database references & pool patterns
├── data_movement.md                   # Visual API request traces
├── COMPLETION_CHECKLIST.md            # Features completeness checklist
├── BUILD_SUMMARY.md                   # Feature build summaries
├── FEATURES_IMPLEMENTATION.md          # User pages walkthrough manual
├── IMPLEMENTATION_CHANGES.md          # Logs of recent bug fixes & updates
├── DEPLOYMENT.md                      # Production server setup manual
│
├── backend/
│   ├── index.js                       # Main server entry point
│   ├── .env                           # Environment variables
│   ├── package.json                   # Backend dependencies
│   ├── database_schema.sql            # Database schema setup DDL
│   ├── update_fks.sql                 # Foreign key constraints updates script
│   │
│   └── src/
│       ├── config/
│       │   └── database.js            # Database connection pool settings
│       │
│       ├── controllers/
│       │   ├── index.js               # Controllers exports barrel
│       │   ├── auth/
│       │   │   └── authController.js  # Auth (register, login, getMe) logic
│       │   ├── employer/
│       │   │   └── employerController.js # Employer discovery, hiring, rating logic
│       │   └── worker/
│       │       └── workerController.js # Worker profile, applications, requests logic
│       │
│       ├── routes/
│       │   ├── authRoutes.js          # /api/auth endpoints routing
│       │   ├── workerRoutes.js        # /api/worker endpoints routing
│       │   └── employerRoutes.js      # /api/employer endpoints routing
│       │
│       ├── middleware/
│       │   └── authMiddleware.js      # JWT verify & Role validation filters
│       │
│       ├── validators/
│       │   └── schemas.js             # Joi validation schemas for JSON payloads
│       │
│       ├── utils/
│       │   └── helpers.js             # Distance (Haversine), hashing, parsing helper functions
│       │
│       ├── models/
│       │   ├── index.js               # Models exports barrel
│       │   ├── user/
│       │   │   └── userModel.js       # SQL queries for User credentials
│       │   ├── worker/
│       │   │   └── workerModel.js     # SQL queries for Worker profiles
│       │   ├── employer/
│       │   │   └── employerModel.js   # SQL queries for Employer locations
│       │   ├── job/
│       │   │   └── jobModel.js        # SQL queries for Job postings
│       │   ├── application/
│       │   │   └── applicationModel.js # SQL queries for Job applications
│       │   ├── hiringRequest/
│       │   │   └── hiringRequestModel.js # SQL queries for Direct hiring requests
│       │   ├── assignment/
│       │   │   └── assignmentModel.js # SQL queries for Active engagements
│       │   └── rating/
│       │       └── ratingModel.js     # SQL queries for Worker ratings
│       │
│       └── services/
│           └── (folder for business services)
│
└── frontend/
    ├── index.html                     # HTML page entry point
    ├── package.json                   # Frontend dependencies
    ├── vite.config.js                 # Vite build settings
    ├── tailwind.config.js             # Tailwind CSS style tokens
    ├── eslint.config.js               # ESLint code syntax checker
    │
    └── src/
        ├── main.jsx                   # React application entry point
        ├── App.jsx                    # Routing configuration with ToastContainer
        ├── index.css                  # Global styling directives
        │
        ├── pages/
        │   ├── LandingPage.jsx        # Landing page with workflows presentation
        │   ├── LoginPage.jsx          # Login credentials form
        │   ├── RegistrationPage.jsx   # Role selector registrations switcher
        │   ├── WorkerDashboard.jsx    # Worker stats dashboard with geolocation triggers
        │   └── EmployerDashboard.jsx  # Employer stats dashboard with jobs/workers management
        │
        ├── components/
        │   ├── Navbar.jsx             # Navigation header bar
        │   ├── Footer.jsx             # Informational footer bar
        │   ├── WorkerRegistration.jsx # Detailed worker profile registration form
        │   ├── EmployerRegistration.jsx # Detailed employer location registration form
        │   ├── ProtectedRoute.jsx     # Route guarding client checker
        │   │
        │   ├── common/
        │   │   ├── StarRating.jsx      # Reusable click-and-hover Star component
        │   │   └── DashboardLayout.jsx # Reusable layout shell
        │   │
        │   ├── employer/
        │   │   ├── PostJob.jsx        # Job postings creation form
        │   │   ├── ManageJobs.jsx     # Jobs expansion list with applications processors
        │   │   ├── ManageWorkers.jsx  # Assignments controller loader
        │   │   ├── HiredWorkers.jsx   # Hired workers completion and rating prompt list
        │   │   └── NearbyWorkers.jsx  # Workers discovery search map list
        │   │
        │   └── worker/
        │       ├── NearbyJobs.jsx     # Jobs search, filter, and apply list
        │       ├── MyApplications.jsx # Applications grid layout status card list
        │       └── EmployerRequests.jsx # Incoming requests acceptance checklist
        │
        ├── context/
        │   └── AuthContext.jsx        # Credentials and tokens context store
        │
        ├── services/
        │   └── api.js                 # API client & services
        │
        ├── hooks/
        │   └── (folder for custom hooks)
        │
        └── assets/
            └── (folder for images/icons)
```

---

## 📄 Key Files Description

### Root Level Documentation

| File | Purpose |
|------|---------|
| README.md | Main project documentation with features and setup |
| SETUP.md | Detailed step-by-step setup guide with troubleshooting |
| QUICKSTART.md | Quick reference for getting started in 5 minutes |
| API_DOCUMENTATION.md | Complete API endpoints with request/response examples |
| PROJECT_SUMMARY.md | Overview of everything built and how to extend |
| FILE_REFERENCE.md | This file - structure and purpose of all files |

---

### Backend - Core Files

#### Server & Configuration
| File | Lines | Purpose |
|------|-------|---------|
| `backend/index.js` | 50 | Express server setup, middleware, routes |
| `backend/.env` | 10 | Environment configuration (database, JWT, CORS) |
| `src/config/database.js` | 18 | MySQL connection pool configuration |

#### Database
| File | Lines | Purpose |
|------|-------|---------|
| `database_schema.sql` | 200+ | Complete database schema with 8 tables |

#### Controllers (Business Logic)
| File | Purpose |
|------|---------|
| `src/controllers/index.js` | Barrel file exporting controllers |
| `src/controllers/auth/authController.js` | User registrations, login, and me logic |
| `src/controllers/worker/workerController.js` | Worker profile, applications, requests, and jobs discovery |
| `src/controllers/employer/employerController.js` | Employer profile, job postings, discovery, assignments, and rating |

#### Routes (API Endpoints)
| File | Purpose |
|------|---------|
| `src/routes/authRoutes.js` | Auth endpoints (/register, /login, /me, /logout) routing |
| `src/routes/workerRoutes.js` | Worker endpoints (profile, locations, jobs, applications, requests) routing |
| `src/routes/employerRoutes.js` | Employer endpoints (profile, location, jobs, applications, workers, hired, status, rate) routing |

#### Models (Data Access Modules)
| File | Purpose |
|------|---------|
| `src/models/index.js` | Barrel file exporting model helpers |
| `src/models/user/userModel.js` | SQL helper queries on `users` table |
| `src/models/worker/workerModel.js` | SQL helper queries on `workers` table |
| `src/models/employer/employerModel.js` | SQL helper queries on `employers` table |
| `src/models/job/jobModel.js` | SQL helper queries on `jobs` table |
| `src/models/application/applicationModel.js` | SQL queries on `job_applications` table |
| `src/models/hiringRequest/hiringRequestModel.js` | SQL queries on `hiring_requests` table |
| `src/models/assignment/assignmentModel.js` | SQL queries on `worker_assignments` table |
| `src/models/rating/ratingModel.js` | SQL queries on `ratings` table |

#### Middleware & Validation
| File | Lines | Purpose |
|------|-------|---------|
| `src/middleware/authMiddleware.js` | 25 | JWT verification and role checking |
| `src/validators/schemas.js` | 80 | Joi validation schemas for all requests |

#### Utilities
| File | Lines | Purpose |
|------|-------|---------|
| `src/utils/helpers.js` | 60 | JWT, password, distance calculation functions |

#### Package Management
| File | Lines | Purpose |
|------|-------|---------|
| `backend/package.json` | 30 | Dependencies: express, mysql2, bcryptjs, jwt, joi |

---

### Frontend - React Components

#### Page Components
| File | Lines | Purpose | Features |
|------|-------|---------|----------|
| `src/pages/LandingPage.jsx` | 200+ | Home page | Hero, features, about, workflows, CTA |
| `src/pages/LoginPage.jsx` | 100+ | Login form | Mobile number, password, validation, redirect |
| `src/pages/RegistrationPage.jsx` | 50 | Registration wrapper | Role selector, form switching |
| `src/pages/WorkerDashboard.jsx` | 80 | Worker dashboard | Stats, placeholders for features |
| `src/pages/EmployerDashboard.jsx` | 80 | Employer dashboard | Stats, placeholders for features |

#### Layout Components
| File | Lines | Purpose | Features |
|------|-------|---------|----------|
| `src/components/Navbar.jsx` | 80 | Navigation bar | Logo, menu, mobile responsive, user info |
| `src/components/Footer.jsx` | 100 | Footer | Links, company info, social placeholders |

#### Authentication Components
| File | Lines | Purpose | Features |
|------|-------|---------|----------|
| `src/components/WorkerRegistration.jsx` | 200+ | Worker form | All 8 fields, validation, error display |
| `src/components/EmployerRegistration.jsx` | 200+ | Employer form | Location fields, geolocation, validation |
| `src/components/ProtectedRoute.jsx` | 20 | Route guard | Auth check, role verification |

#### State, Hooks & Utilities
| File | Purpose |
|------|---------|
| `src/context/AuthContext.jsx` | User authentication credentials state store |
| `src/services/api.js` | Axios HTTP request configuration and operations endpoints maps |
| `src/hooks/useAutoLocationUpdate.js` | Custom react hook trigger for automated GPS tracking checks |
| `src/utils/toastNotification.js` | Alerts dispatcher wrapping standard Toast Container actions |
| `src/utils/geolocation.js` | Async native browser location coordinate fetcher |

#### Configuration
| File | Purpose |
|------|---------|
| `src/App.jsx` | Routing schema registration, Toast notification layout container integration |
| `src/index.css` | Global Tailwind layout tokens and custom components directives |
| `tailwind.config.js` | Standard color themes, layout frames config |
| `vite.config.js` | Bundle generation settings with React and Tailwind processors |

#### Package Management
| File | Purpose |
|------|---------|
| `frontend/package.json` | React 19, Tailwind v4, react-router v7, and axios dependencies |

---

## 🔑 File Dependencies

### API Routes
```
authRoutes.js
├── authMiddleware.js (JWT verification & validation checks)
└── authController.js
    ├── schemas.js (Joi schema validation checks)
    ├── helpers.js (JWT generation & password hashing)
    └── userModel.js (Database identity query functions)

workerRoutes.js
├── authMiddleware.js
└── workerController.js
    ├── schemas.js
    ├── helpers.js (distance calculations)
    ├── workerModel.js (Worker status and statistics database updates)
    ├── jobModel.js (Nearby jobs filtering queries)
    ├── applicationModel.js (Worker job applications submission queries)
    └── hiringRequestModel.js (Hiring requests acceptance queries)

employerRoutes.js
├── authMiddleware.js
└── employerController.js
    ├── schemas.js
    ├── helpers.js (proximity calculations)
    ├── employerModel.js (Employer coordinates database updates)
    ├── jobModel.js (Employer job listings creation and closing queries)
    ├── applicationModel.js (Job applications review queries)
    ├── workerModel.js (Nearby workers list retrieval)
    ├── hiringRequestModel.js (Direct hiring requests send queries)
    ├── assignmentModel.js (Assignments completion queries)
    └── ratingModel.js (Worker reviews database submissions)
```

### React Routing
```
App.jsx
├── AuthProvider (AuthContext.jsx)
├── Routes:
│   ├── / → LandingPage
│   │       ├── Navbar
│   │       ├── Footer
│   ├── /login → LoginPage
│   │           ├── Navbar
│   │           ├── AuthService (api.js)
│   │           └── Footer
│   ├── /register → RegistrationPage
│   │              ├── WorkerRegistration
│   │              ├── EmployerRegistration
│   │              └── AuthService (api.js)
│   ├── /worker/dashboard → ProtectedRoute
│   │                      └── WorkerDashboard
│   │                          ├── Navbar
│   │                          └── Footer
│   ├── /employer/dashboard → ProtectedRoute
│                            └── EmployerDashboard
│                                ├── Navbar
│                                └── Footer
```

---

## 🔄 Data Flow

### Registration Flow
```
Frontend (RegistrationPage)
  ↓
API Client (api.js)
  ↓
Backend (authRoutes)
  ↓
Controller (authController.js)
  ↓
Validator (schemas.js)
  ↓
Database (database.js)
  ↓
Response → Frontend (redirects to login)
```

### Login Flow
```
Frontend (LoginPage)
  ↓
API Client (api.js)
  ↓
Backend (authRoutes)
  ↓
Controller (authController.js)
  ↓
Database → Compare password (helpers.js)
  ↓
Generate Token (helpers.js)
  ↓
Response (token + user)
  ↓
Frontend → AuthContext updates → Redirect to dashboard
```

### Protected Route Access
```
Click on protected route
  ↓
ProtectedRoute checks AuthContext
  ↓
If authenticated → Load component
If not → Redirect to /login
  ↓
If wrong role → Redirect to home
```

---

## 📊 Statistics

### Code Metrics
- **Total Files**: 30+
- **Frontend Components**: 15
- **Backend Controllers**: 3
- **API Endpoints**: 19
- **Database Tables**: 8
- **Lines of Code**: 2000+
- **Documentation Pages**: 5

### File Sizes (Approximate)
- Backend Total: ~1500 lines
- Frontend Total: ~1200 lines
- Documentation: ~1000 lines
- Database Schema: ~200 lines

---

## 🎯 Development Workflow

### To Add a New Feature

1. **Database** - Add tables to `database_schema.sql`
2. **Backend** - Create controller → Create routes → Add validation
3. **Frontend** - Create component → Add to routing → Connect API

### Common Tasks

**Add API Endpoint:**
1. Edit `src/controllers/{entity}Controller.js`
2. Add route in `src/routes/{entity}Routes.js`
3. Add validation in `src/validators/schemas.js`
4. Add to `src/services/api.js`
5. Use in React component

**Fix CORS Error:**
1. Check `backend/.env` → `CORS_ORIGIN`
2. Should match frontend URL

**Add Database Field:**
1. Edit `database_schema.sql`
2. Update controller queries
3. Update validation schema

---

## 🔍 Finding Things

### To Find...
- **Authentication Logic** → `src/controllers/authController.js`
- **Worker Features** → `src/controllers/workerController.js`
- **Job Posting** → `src/controllers/employerController.js`
- **Form Validation** → `src/validators/schemas.js`
- **API Calls** → `src/services/api.js`
- **User State** → `src/context/AuthContext.jsx`
- **UI Components** → `src/components/`
- **Page Layouts** → `src/pages/`
- **Styling** → `tailwind.config.js` & `src/index.css`
- **Database Setup** → `database_schema.sql`
- **Server Config** → `.env`

---

## ✅ Checklist for Getting Started

- [ ] Read README.md for overview
- [ ] Follow SETUP.md to configure environment
- [ ] Use QUICKSTART.md to start servers
- [ ] Register test users via UI
- [ ] Review API_DOCUMENTATION.md for endpoints
- [ ] Check PROJECT_SUMMARY.md for what's next
- [ ] Explore code structure following this guide

---

## 📞 File Ownership

### Frontend Ownership
- UI/UX: Tailwind Config, CSS, Components
- Routing: App.jsx, React Router
- State: AuthContext.jsx
- API Communication: api.js

### Backend Ownership
- Business Logic: Controllers
- Data Validation: Validators
- Authentication: Middleware
- Data Access: Controllers + Database

### Database Ownership
- Schema: database_schema.sql
- Queries: Controllers
- Configuration: database.js

---

**Last Updated**: January 2024
**Project**: HireMe - Job Matching Platform
**Version**: 1.0.0 (Foundation)

---

*Use this file as a quick reference to understand project structure and find what you need quickly.*
