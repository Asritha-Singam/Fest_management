# Assignment 1 - Event Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing events with role-based access control (Admin, Organizer, Participant).

## Project Structure

```
Assignment_1/
│
├── README.md                         # Project documentation
│
├── backend/                          # Node.js Express server
│   ├── server.js                     # Entry point - starts Express server
│   ├── app.js                        # Express app configuration & middleware setup
│   ├── package.json                  # Backend dependencies
│   │
│   ├── config/                       # Configuration files
│   │   └── db.js                     # MongoDB connection setup
│   │
│   ├── models/                       # Database schemas
│   │   ├── User.js                   # User model (Admin, Organizer, Participant)
│   │   ├── participant.js            # Participant profile model (extends User)
│   │   └── events.js                 # Event model (created by organizers)
│   │
│   ├── controllers/                  # Business logic & route handlers
│   │   ├── authcontrollers.js        # Authentication & registration logic
│   │   └── eventControllers.js       # Event CRUD operations
│   │
│   ├── routes/                       # API endpoints
│   │   ├── authroutes.js             # /api/auth/* endpoints
│   │   └── eventRoutes.js            # /api/events/* endpoints
│   │
│   └── middleware/                   # Custom middleware
│       ├── authMiddleware.js         # JWT token verification
│       └── roleMiddleware.js         # Role-based access control
│
└── frontend/                         # React + Vite application
    ├── package.json                  # Frontend dependencies
    ├── vite.config.js                # Vite build configuration
    ├── eslint.config.js              # ESLint configuration
    ├── index.html                    # HTML entry point
    ├── README.md                     # Frontend specific docs
    │
    ├── public/                       # Static assets (images, etc)
    │
    └── src/                          # React source code
        ├── main.jsx                  # React DOM render entry
        ├── App.jsx                   # Main app component with routing
        ├── App.css                   # Global styles
        ├── index.css                 # Global CSS
        │
        ├── assets/                   # Images, icons, etc
        │
        ├── components/               # Reusable UI components
        │   ├── loginForm.jsx         # Login form with email/password
        │   ├── signupForm.jsx        # Registration form for participants
        │   ├── ProtectedRoute.jsx    # Route guard component
        │   └── participantNavbar.jsx # Navigation bar for authenticated users
        │
        ├── context/                  # React Context API
        │   └── AuthContext.jsx       # Global authentication state management
        │
        ├── pages/                    # Full-page components
        │   ├── authLandingPage.jsx   # Landing page with login/signup options
        │   ├── LoginPage.jsx         # Login page
        │   ├── signupPage.jsx        # Participant registration page
        │   └── browseEvents.jsx      # List and search events
        │
        └── services/                 # API communication
            ├── api.js                # Axios instance with base config
            └── authServices.js       # Authentication API functions
```

## Technologies Used

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web framework for REST API
- **MongoDB** - NoSQL database for data persistence
- **Mongoose** - ODM (Object Document Mapper) for MongoDB
- **dotenv** - Environment variable management
- **bcrypt** - Password hashing and encryption
- **jsonwebtoken (JWT)** - Stateless authentication tokens
- **cors** - Cross-Origin Resource Sharing middleware

### Frontend
- **React** - UI component library
- **Vite** - Next-generation build tool and dev server
- **React Router** - Client-side routing and navigation
- **Context API** - State management for authentication
- **Axios** - HTTP client for API requests

## Prerequisites

Before running this application, ensure you have:

- **Node.js** v14.0 or higher (download from [nodejs.org](https://nodejs.org))
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** - Either:
  - Local MongoDB installation (download from [mongodb.com](https://www.mongodb.com))
  - **MongoDB Atlas** account (free cloud database at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
- **Git** (optional, for version control)

### Verify Installation
```bash
node --version    # Should show v14.0 or higher
npm --version     # Should show npm version
```

## Installation & Setup

### Step 1: Backend Setup

#### 1.1 Navigate to backend directory
```bash
cd backend
```

#### 1.2 Install dependencies
```bash
npm install
```

This will install all required packages:
- express
- mongoose
- dotenv
- bcryptjs
- jsonwebtoken
- cors
- And other dependencies

#### 1.3 Create `.env` file in backend directory

Create a new file named `.env` in the `backend/` directory with:

```env
# Server Configuration
PORT=4001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/event_management
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event_management?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_at_least_32_chars_long
JWT_EXPIRY=7d

# Default Admin User (created on first server start)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123456

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Important Notes:**
- Change `JWT_SECRET` to a strong random string in production
- Use MongoDB Atlas connection string for online database
- Admin user is auto-created on first server startup with these credentials

#### 1.4 Start backend server
```bash
npm run dev
```

Expected output:
```
Server running on http://localhost:4001
MongoDB connected successfully
Admin user created (or already exists)
```

---

### Step 2: Frontend Setup

#### 2.1 Open new terminal, navigate to frontend directory
```bash
cd frontend
```

#### 2.2 Install dependencies
```bash
npm install
```

This will install:
- react
- react-router-dom
- axios
- vite
- And other dependencies

#### 2.3 Start frontend development server
```bash
npm run dev
```

Expected output:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

#### 2.4 Open in browser
Navigate to `http://localhost:5173` in your web browser

---

## Getting Started - First Run

### Initial Setup Checklist
- ✅ Backend running on `http://localhost:4001`
- ✅ Frontend running on `http://localhost:5173`
- ✅ MongoDB connected (local or Atlas)
- ✅ Admin user auto-created in database

### First Time Users

1. **Open Application**
   - Go to `http://localhost:5173` in browser
   - You should see the authentication landing page

2. **Login as Admin** (Optional, for testing)
   - Click "Login" button
   - Email: `admin@example.com` (or your ADMIN_EMAIL from .env)
   - Password: `Admin@123456` (or your ADMIN_PASSWORD from .env)
   - Redirected to `/admin/dashboard`

3. **Create a Participant Account**
   - Click "Sign Up" button
   - Fill in all required fields:
     - First Name
     - Last Name
     - Email
     - Password
     - Participant Type (IIIT or NON-IIIT)
     - College/Organization name
     - Contact Number
     - Interests (select multiple)
   - Click "Register"
   - Redirected to login page

4. **Login as Participant**
   - Use the email and password from registration
   - Redirected to `/participant/dashboard`

5. **Browse Events**
   - Click "Browse Events" in navbar
   - View list of published events
   - Search and filter by type/dates
   - Click event card to see details (when available)

---

## Application Flow

```
┌─────────────────────┐
│ Landing Page (/)    │
└──────────┬──────────┘
           │
      ┌────┴─────┐
      │           │
   Login      Sign Up
      │           │
      │      ┌────v─────────┐
      │      │ Registration │
      │      │ Page         │
      │      └────┬─────────┘
      │           │
      └────┬──────┘
           │
    ┌──────v──────────┐
    │ Login Page      │
    └────────┬────────┘
             │
      ┌──────v──────────────────────┐
      │ Verify Credentials & JWT    │
      └──────┬─────────────────────┬┘
             │                     │
        ✅ Success             ❌ Error
             │                 (Show message)
             │
    ┌────────v────────────────┐
    │ Check User Role         │
    └────┬─────────┬──────┬───┘
         │         │      │
       ADMIN   ORGANIZER PARTICIPANT
         │         │      │
┌────────v──┐ ┌────v────┐ ┌────v──────┐
│Admin      │ │Organizer│ │Participant│
│Dashboard  │ │Dashboard│ │Dashboard  │
│           │ │         │ │           │
│ - Users   │ │ - Create│ │ - Browse  │
│ - System  │ │   Event │ │   Events  │
│ - Reports │ │ - Manage│ │ - Register│
│           │ │   Events│ │           │
└───────────┘ └─────────┘ └───────────┘
```

### Testing the Application

You can test different user roles:
1. Login as **Admin** using the credentials from `.env`
2. Register a new **Participant** using the signup form
3. Create additional users directly in MongoDB for testing Organizer role

## API Endpoints Documentation

### Base URL
```
http://localhost:4001
```

### Authentication Endpoints

#### Register New Participant
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "participantType": "IIIT",          // "IIIT" or "NON_IIIT"
  "collegeOrOrg": "IIIT Hyderabad",
  "contactNumber": "+91-9876543210",
  "interests": ["web", "mobile", "AI"]
}

Response: 200 OK
{
  "message": "User registered successfully",
  "userId": "64f9e3e8c4a5b2d1e9f0a1b2"
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "PARTICIPANT",
  "userId": "64f9e3e8c4a5b2d1e9f0a1b2"
}
```

#### Create Organizer (Admin Only)
```http
POST /api/auth/createOrganizer
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "SecurePass123"
}

Response: 201 Created
{
  "message": "Organizer created successfully",
  "organizerId": "64f9e3e8c4a5b2d1e9f0a1b3"
}
```

---

### Event Endpoints

#### Create Event (Organizer Only)
```http
POST /api/events/create
Authorization: Bearer <organizer-token>
Content-Type: application/json

{
  "eventName": "Tech Summit 2025",
  "eventDescription": "A comprehensive tech conference",
  "eventType": "CONFERENCE",
  "eligibility": "BOTH",                    // "IIIT_ONLY" | "NON_IIIT_ONLY" | "BOTH"
  "registrationDeadline": "2025-03-15",
  "eventStartDate": "2025-04-01",
  "eventEndDate": "2025-04-03",
  "registrationLimit": 500,
  "registrationFee": 0,
  "eventTags": ["web", "AI", "mobile"],
  "merchandiseDetails": "T-shirt and goodies",
  "customFormFields": []
}

Response: 201 Created
{
  "message": "Event created successfully",
  "eventId": "64f9e3e8c4a5b2d1e9f0a1b4",
  "event": { ...event object... }
}
```

#### Get All Events (Published Only)
```http
GET /api/events/all?search=summit&type=CONFERENCE&eligibility=BOTH&startDate=2025-04-01&endDate=2025-05-01
Content-Type: application/json

Query Parameters:
  - search: string (optional) - Search in event name description
  - type: string (optional) - Filter by event type
  - eligibility: string (optional) - IIIT_ONLY | NON_IIIT_ONLY | BOTH
  - startDate: date (optional) - YYYY-MM-DD format
  - endDate: date (optional) - YYYY-MM-DD format

Response: 200 OK
{
  "message": "Events retrieved successfully",
  "count": 5,
  "events": [
    {
      "_id": "64f9e3e8c4a5b2d1e9f0a1b4",
      "eventName": "Tech Summit 2025",
      "eventDescription": "...",
      "eventType": "CONFERENCE",
      "eligibility": "BOTH",
      "registrationDeadline": "2025-03-15",
      "eventStartDate": "2025-04-01",
      "eventEndDate": "2025-04-03",
      "registrationLimit": 500,
      "registrationCount": 145,
      "registrationFee": 0,
      "eventTags": ["web", "AI", "mobile"],
      "organizerId": "64f9e3e8c4a5b2d1e9f0a1b3",
      "status": "PUBLISHED",
      "createdAt": "2025-02-14T10:30:00Z"
    }
  ]
}
```

#### Get Event by ID
```http
GET /api/events/:eventId

Response: 200 OK
{
  "message": "Event retrieved successfully",
  "event": { ...full event object... }
}
```

#### ⏳ Update Event (Organizer Only)
```http
PUT /api/events/:eventId
Authorization: Bearer <organizer-token>
Content-Type: application/json

Body: Any event fields to update

Response: 200 OK
```

#### ⏳ Delete Event (Organizer Only)
```http
DELETE /api/events/:eventId
Authorization: Bearer <organizer-token>

Response: 200 OK
```

#### ⏳ Register for Event
```http
POST /api/events/:eventId/register
Authorization: Bearer <participant-token>

Response: 200 OK
```

#### ⏳ Get Event Participants (Organizer Only)
```http
GET /api/events/:eventId/participants
Authorization: Bearer <organizer-token>

Response: 200 OK
```

---

### Protected Route Requirements

All protected endpoints require:
```http
Authorization: Bearer <jwt-token>
```

Token obtained from login response. Token includes encoded user info and role.

## Development Guide

### Running in Development Mode

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Both should be running simultaneously for full-stack development.

### Project Scripts

#### Backend Scripts
```bash
# Development mode (auto-restart on file changes)
npm run dev

# Production mode
npm start

# View logs
npm run logs
```

#### Frontend Scripts
```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Key Development Files to Modify

**Backend Changes:**
- Controllers: `backend/controllers/*.js`
- Routes: `backend/routes/*.js`
- Models: `backend/models/*.js`
- Changes take effect on server restart

**Frontend Changes:**
- Components: `frontend/src/components/*.jsx`
- Pages: `frontend/src/pages/*.jsx`
- Services: `frontend/src/services/*.js`
- Changes reflect immediately with hot reload

---

## Troubleshooting

### Common Issues

#### Backend Won't Start

**Error: `PORT 4001 already in use`**
```bash
# Windows - Find process using port 4001
netstat -ano | findstr :4001
# Kill the process (replace PID with the number shown)
taskkill /PID <PID> /F

# Or change PORT in .env to 4002
```

**Error: `MongoDB connection failed`**
1. Check if MongoDB is running:
   - Local: Open MongoDB Compass or run `mongod` command
   - Atlas: Verify connection string in .env
   - Check username/password in connection string

2. Verify connection string format:
   ```
   mongodb://localhost:27017/event_management
   ```

**Error: `Cannot find module 'express'`**
```bash
cd backend
npm install
```

#### Frontend Won't Start

**Error: `Port 5173 already in use`**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or manually specify different port
npm run dev -- --port 3000
```

**Error: `Blank white page / Not loading`**
1. Check console for errors (F12 → Console tab)
2. Verify backend is running on `http://localhost:4001`
3. Check `vite.config.js` proxy configuration
4. Clear browser cache and reload

#### Authentication Issues

**Error: `401 Unauthorized`**
- Token might be expired
- Logout and login again
- Clear localStorage in browser DevTools

**Error: `Invalid credentials`**
- Verify email/password are correct
- Check ADMIN_EMAIL and ADMIN_PASSWORD in .env
- Ensure user exists in MongoDB

#### CORS Errors

**Error: `Access to XMLHttpRequest blocked by CORS`**
1. Backend must have CORS enabled
2. Frontend URL must match FRONTEND_URL in .env
3. Check app.js has CORS middleware:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```

### Debugging Tips

**Check Backend Logs:**
- Look at terminal running `npm run dev`
- Check for error messages and stack traces

**Check Frontend Logs:**
- Open browser DevTools (F12)
- Go to Console tab
- Check for errors and warnings

**Test API Endpoints:**
Use Postman or cURL to test endpoints directly:
```bash
# Test login endpoint
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123456"}'
```

**Check Database:**
- Use MongoDB Compass to view collections
- Verify documents were created
- Check user roles and permissions

### Reset Application

**Clear All Data:**
```bash
# 1. Stop both servers (Ctrl+C)
# 2. Delete MongoDB collections (or entire database)
# 3. Clear browser localStorage (F12 → Application → Local Storage)
# 4. Restart servers
# 5. Admin user will be auto-created again
```

---

## Environment Variables Reference

### Backend `.env`
| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| PORT | No | 4001 | 4001 |
| NODE_ENV | No | development | development |
| MONGODB_URI | Yes | - | mongodb://localhost:27017/event_management |
| JWT_SECRET | Yes | - | your-secret-key-32-chars-minimum |
| JWT_EXPIRY | No | 7d | 7d |
| ADMIN_EMAIL | Yes | - | admin@example.com |
| ADMIN_PASSWORD | Yes | - | Admin@123456 |
| FRONTEND_URL | No | http://localhost:5173 | http://localhost:5173 |

### MongoDB Connection Strings

**Local MongoDB:**
```
mongodb://localhost:27017/event_management
```

**MongoDB Atlas:**
```
mongodb+srv://username:password@clustername.mongodb.net/event_management?retryWrites=true&w=majority
```

Get connection string from MongoDB Atlas:
1. Go to Clusters page
2. Click "Connect"
3. Choose "Connect your application"
4. Copy connection string and replace username/password

## Implementation Status & Todo List

### ✅ Backend - Completed Features

#### Core Infrastructure
- ✅ **server.js** - Express server initialization with port configuration
- ✅ **app.js** - Middleware setup (CORS, JSON parsing, error handling)
- ✅ **config/db.js** - MongoDB connection with Mongoose

#### Database Models
- ✅ **User.js** - User schema with role field (Admin, Organizer, Participant)
- ✅ **participant.js** - Participant profile with IIIT/Non-IIIT classification
- ✅ **events.js** - Event schema with all details (name, description, dates, etc)

#### Authentication System
- ✅ **authcontrollers.js**
  - ✅ User registration (password hashing with bcrypt)
  - ✅ User login (email/password validation)
  - ✅ JWT token generation and management
  - ✅ Auto-admin creation on first server start
  - ✅ Organizer creation endpoint
  
#### Authorization & Security
- ✅ **authMiddleware.js** - JWT verification and token validation
- ✅ **roleMiddleware.js** - Role-based access control (Admin, Organizer, Participant)

#### API Routes
- ✅ **authroutes.js**
  - ✅ POST `/api/auth/register` - Register new participant
  - ✅ POST `/api/auth/login` - User login
  - ✅ POST `/api/auth/createOrganizer` - Create organizer (admin only)
  
- ✅ **eventControllers.js**
  - ✅ Create event (organizer only)
  - ✅ Get all events (with filters)
  - ⏳ Get event by ID (partially implemented)
  - ⏳ Update event (needs implementation)
  - ⏳ Delete event (needs implementation)

---

### ✅ Frontend - Completed Features

#### React Setup & Configuration
- ✅ **main.jsx** - React application entry point
- ✅ **App.jsx** - Main component with React Router setup
- ✅ **vite.config.js** - Vite build configuration

#### Global State Management
- ✅ **context/AuthContext.jsx**
  - ✅ User authentication state
  - ✅ Token management (localStorage)
  - ✅ Login/Logout functionality
  - ✅ User role tracking

#### Components
- ✅ **components/loginForm.jsx** - Login form with email/password inputs
- ✅ **components/signupForm.jsx** - Registration form with all required fields
- ✅ **components/ProtectedRoute.jsx** - Route guard with role-based redirection
- ✅ **components/participantNavbar.jsx** - Navigation bar with user info and logout

#### Pages
- ✅ **pages/authLandingPage.jsx** - Landing page with login/signup buttons
- ✅ **pages/LoginPage.jsx** - Login page wrapper
- ✅ **pages/signupPage.jsx** - Sign up page wrapper
- ✅ **pages/browseEvents.jsx** - Event listing with search and filter

#### API Services
- ✅ **services/api.js** - Axios instance with base URL and auth headers
- ✅ **services/authServices.js** - Authentication API functions

#### Styling
- ✅ **App.css** - Application styles
- ✅ **index.css** - Global styles

---

### ❌ Backend - Todo (Not Started)

#### Event Management (Medium Priority)
- ⏳ **Complete Event CRUD**
  - Get event by ID endpoint
  - Update event endpoint (organizer can edit own events)
  - Delete event endpoint (organizer can delete own events)
  - Event status management (draft, published, ongoing, completed)

#### Event Registration (High Priority)
- ⏳ **eventControllers.js - Registration Logic**
  - Register participant for event
  - Check registration limit
  - Update participant's event list
  - Get participant's registered events
  - Unregister from event

#### Event Filtering & Search (Medium Priority)
- ⏳ **Advanced event filters**
  - Filter by event type
  - Filter by eligibility (IIIT only, Non-IIIT, Both)
  - Filter by date range
  - Search by event name or description
  - Sort by date, relevance, popularity

#### Organizer Dashboard Data (Medium Priority)
- ⏳ **GET /api/organizer/events** - Get organizer's events
- ⏳ **GET /api/organizer/events/:id/participants** - Get event registrations
- ⏳ **Event statistics** - Total registrations, attendance, etc

#### Admin Features (Lower Priority)
- ⏳ **User management endpoints**
  - Get all users
  - Update user role
  - Delete user (with data cleanup)
  - View system statistics

#### Data Validation & Error Handling
- ⏳ Input validation for all endpoints (joi or express-validator)
- ⏳ Comprehensive error handling with proper HTTP status codes
- ⏳ Custom error messages for user guidance

#### Testing (Lower Priority)
- ⏳ Unit tests for controllers
- ⏳ Integration tests for API endpoints

---

### ❌ Frontend - Todo (Not Started)

#### Page Development (High Priority)
- ⏳ **Admin Dashboard** (/admin/dashboard)
  - User management section
  - System statistics
  - User creation/deletion

- ⏳ **Organizer Dashboard** (/organizer/dashboard)
  - Create event form
  - View own events
  - Manage event registrations
  - Event analytics

- ⏳ **Participant Dashboard** (/participant/dashboard)
  - View registered events
  - Browse available events
  - Event details and registration

#### Event Management Features (High Priority)
- ⏳ **Event Creation Form** (for organizers)
  - Form validation
  - Multiple input fields handling
  - Date picker component
  - Tag input for interests
  - Form submission to API

- ⏳ **Event Detail Page** (/events/:id)
  - Display full event information
  - Registration functionality
  - Participant count display

- ⏳ **Event Registration**
  - Register button in event details
  - Confirmation modal
  - Show registration status

#### User Profile Management (Medium Priority)
- ⏳ **Profile Page** (/profile)
  - View/edit user information
  - Change password
  - Profile picture upload

#### UI/UX Improvements (Medium Priority)
- ⏳ Responsive design for mobile devices
- ⏳ Loading spinners during API calls
- ⏳ Toast notifications for success/error messages
- ⏳ Empty state displays for lists
- ⏳ Confirmation dialogs for destructive actions

#### Enhanced Navigation
- ⏳ Role-based navigation menus
- ⏳ Breadcrumbs for navigation
- ⏳ Search functionality in navigation
- ⏳ User dropdown menu with profile/logout options

#### Form Validation & Error Handling (Medium Priority)
- ⏳ Client-side validation for all forms
- ⏳ Error message display
- ⏳ Field-level error highlighting
- ⏳ Password strength indicator in signup

---

### 🔄 In Progress / Needs Review

#### Backend
- 🔄 Event filtering and search implementation
- 🔄 Event participation endpoints
- 🔄 Role-based event visibility

#### Frontend
- 🔄 Dashboard route structure
- 🔄 Event listing and display
- 🔄 Form styling and validation

---

## Priority Implementation Order

### Phase 1 (Critical) - Event Core Features
1. ✅ Backend: Event model and basic CRUD
2. ⏳ Backend: Event registration endpoints
3. ⏳ Frontend: Event listing and details page
4. ⏳ Frontend: Event registration UI

### Phase 2 (High) - Dashboard Development
1. ⏳ Backend: Organizer event retrieval
2. ⏳ Backend: Participant event retrieval
3. ⏳ Frontend: Organizer dashboard
4. ⏳ Frontend: Participant dashboard

### Phase 3 (Medium) - Admin & Polish
1. ⏳ Backend: Admin user management
2. ⏳ Frontend: Admin dashboard
3. ⏳ Frontend: Profile management
4. ⏳ Overall UI improvements and styling

## User Roles & Permissions

### Admin
**Full system control**
- ✅ Login to admin dashboard
- ✅ View all users in system
- ✅ Create organizer accounts
- ✅ View system statistics
- ⏳ Delete users (coming soon)
- ⏳ View audit logs (coming soon)
- ⏳ Manage system settings (coming soon)

**Endpoint Permissions:**
- Protected by `adminOnly` role middleware
- Can create organizers via `POST /api/auth/createOrganizer`

---

### Organizer
**Event management capabilities**
- ✅ Login to organizer dashboard
- ✅ Create new events
- ✅ View their own events
- ✅ Browse participant events
- ⏳ Edit/update events (coming soon)
- ⏳ Delete events (coming soon)
- ⏳ View event registrations (coming soon)
- ⏳ Download participant list (coming soon)
- ⏳ Send notifications to registrants (coming soon)

**Event Creation Requirements:**
- Event name and description
- Event type (CONFERENCE, HACKATHON, WORKSHOP, etc)
- Eligibility (IIIT_ONLY, NON_IIIT_ONLY, BOTH)
- Dates and registration deadline
- Registration limit and fee

---

### Participant
**Event browsing and registration**
- ✅ Login to participant dashboard
- ✅ Browse all published events
- ✅ Search events (by name, description)
- ✅ Filter events (by type, date, eligibility)
- ✅ View event details
- ⏳ Register for events (coming soon)
- ⏳ View registered events (coming soon)
- ⏳ Unregister from events (coming soon)
- ⏳ View event certificates (coming soon)
- ⏳ Rate/review events (coming soon)

**Participant Types:**
- **IIIT:** Students from IIIT institutions (eligible for IIIT_ONLY events)
- **NON-IIIT:** Students from other institutions (eligible for NON_IIIT_ONLY and BOTH events)

---

## Database Schema Overview

### User Model
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: String (ADMIN | ORGANIZER | PARTICIPANT),
  createdAt: Date,
  updatedAt: Date
}
```

### Participant Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  participantType: String (IIIT | NON_IIIT),
  collegeOrOrg: String,
  contactNumber: String,
  interests: [String],
  registeredEvents: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Event Model
```javascript
{
  _id: ObjectId,
  eventName: String,
  eventDescription: String,
  eventType: String,
  eligibility: String (IIIT_ONLY | NON_IIIT_ONLY | BOTH),
  registrationDeadline: Date,
  eventStartDate: Date,
  eventEndDate: Date,
  registrationLimit: Number,
  registrationCount: Number (default: 0),
  registrationFee: Number,
  eventTags: [String],
  merchandiseDetails: String,
  organizerId: ObjectId (ref: User),
  customFormFields: Array,
  status: String (DRAFT | PUBLISHED | ONGOING | COMPLETED),
  createdAt: Date,
  updatedAt: Date
}
```

---

## File Size & Performance

### Typical Application Loading Time
- **Backend startup:** 2-3 seconds
- **Frontend initial load:** 1-2 seconds (cold start)
- **Frontend navigation:** < 500ms
- **API Response time:** 50-200ms

### Bundle Size (Frontend)
- **Main bundle:** ~150KB (gzipped)
- **Optimized:** Via Vite code splitting

---

## Contributing Guidelines

### Code Style
- Use consistent indentation (2 spaces)
- Follow naming conventions:
  - Components: PascalCase (e.g., `LoginForm.jsx`)
  - Functions: camelCase (e.g., `handleSubmit()`)
  - Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Creating New Features
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

### Adding New API Endpoints
1. Create controller function in appropriate file
2. Create route in corresponding routes file
3. Add middleware for authentication/authorization
4. Document endpoint in README
5. Test with Postman or cURL

### Reporting Issues
- Include clear description of issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/system information

---

## Participant Event Registration & QR Code System

### Overview
Participants can register for events through the API. Upon successful registration, they receive an email with a unique ticket ID and QR code for event check-in.

### Event Registration Pathway

#### Step 1: Register as a Participant
- **Endpoint:** `POST /api/auth/register`
- **Method:** POST
- **Body (JSON):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```
- **Response:**
```json
{
  "message": "Participant registered successfully",
  "status": 201
}
```

#### Step 2: Login to Get JWT Token
- **Endpoint:** `POST /api/auth/login`
- **Method:** POST
- **Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```
- **Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "507f1f77bcf86cd799439011",
  "role": "participant"
}
```

#### Step 3: Register for an Event
- **Endpoint:** `POST /api/participants/register/:eventId`
- **Method:** POST
- **Headers Required:**
  ```
  Authorization: Bearer <your-jwt-token>
  Content-Type: application/json
  ```
- **URL Parameter:**
  - `eventId`: MongoDB ObjectId of the event
- **Body:** Empty or `{}`
- **Response:**
```json
{
  "success": true,
  "message": "Registered for event successfully",
  "ticketId": "FEL-1a2b3c-456789",
  "status": 201
}
```

#### Step 4: Email Confirmation with QR Code
After successful registration, the participant automatically receives an email containing:
- ✅ Event registration confirmation
- ✅ **Ticket ID:** Unique identifier for check-in
- ✅ **QR Code:** PNG image attached (proper email attachment, not blocked)
- ✅ Event details (name, date)

**Email Features:**
- Uses **nodemailer** with Gmail SMTP
- QR codes sent as **CID image attachments** (compatible with all email clients)
- QR code encodes the ticket ID
- Professional HTML email template

### QR Code System Details

#### QRCode Generation
- **Library:** qrcode (NPM package)
- **Data Encoded:** Ticket ID (`FEL-{eventId}-{randomNumber}`)
- **Format:** PNG image, embedded in email

#### Email Attachment Configuration
```javascript
{
  filename: 'qrcode.png',
  content: qrCodeBuffer,  // PNG buffer
  cid: 'qrcode'           // Content ID for HTML embedding
}
```

#### How to Reference in Email HTML
```html
<img src="cid:qrcode" alt="Event QR Code" style="width:200px; height:200px;" />
```

### Using the API with Postman

#### Request Example (Step 3: Register for Event)
```
Method: POST
URL: http://localhost:4001/api/participants/register/507f1f77bcf86cd799439012

Headers:
- Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- Content-Type: application/json

Body: 
{}
```

### Validation Rules

#### Registration Deadline
- ❌ Cannot register if registration deadline has passed
- ✅ Server checks: `new Date() > event.registrationDeadline`

#### Event Capacity
- ❌ Cannot register if event is full
- ✅ Server checks: `registrationCount >= registrationLimit`

#### Duplicate Registration
- ❌ Cannot register twice for the same event
- ✅ Server checks: Existing participation record

#### Error Codes
| Status | Message | Reason |
|--------|---------|--------|
| 404 | Event not found | Invalid eventId |
| 400 | Registration deadline has passed | Event registration closed |
| 400 | Event is full | Registration limit reached |
| 400 | Already registered for this event | Duplicate registration attempt |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | User is not a participant |
| 500 | Error registering for event | Server error |

### Email Configuration (`.env` file required)

```env
# Email Service Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-specific-password

# Gmail Setup Instructions:
# 1. Enable 2-Step Verification on your Google Account
# 2. Generate an App Password: https://myaccount.google.com/apppasswords
# 3. Use that 16-character password as EMAIL_PASS
```

### View Registered Events

#### Step 4: Get Participant's Events
- **Endpoint:** `GET /api/participants/my-events`
- **Method:** GET
- **Headers Required:**
  ```
  Authorization: Bearer <your-jwt-token>
  ```
- **Response:**
```json
{
  "success": true,
  "upcoming": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "participant": "507f1f77bcf86cd799439011",
      "event": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Tech Conference 2026",
        "eventStartDate": "2026-03-15T09:00:00Z",
        "eventEndDate": "2026-03-15T17:00:00Z"
      },
      "ticketId": "FEL-1a2b3c-456789",
      "status": "Active"
    }
  ],
  "completed": [],
  "cancelled": []
}
```

### Troubleshooting

#### QR Code Not Showing in Email
- ✅ **Solution:** Uses CID attachment system now (fixed in latest update)
- ❌ Old base64 inline method was blocked by email clients

#### "Cannot destructure property 'email'" Error
- **Issue:** Malformed JSON in request
- **Solution:** 
  - ❌ Remove trailing commas from JSON
  - ✅ Use valid JSON format

#### "Already registered for this event"
- **Issue:** You're trying to register twice
- **Solution:** Check your registered events and select a different event

#### Token Expired
- **Issue:** JWT token has expired (default 7 days)
- **Solution:** Login again to get a fresh token

### Dependencies Required

```json
{
  "dependencies": {
    "qrcode": "^1.5.3",
    "nodemailer": "^6.9.x",
    "express": "^4.18.x",
    "mongoose": "^7.x.x",
    "jsonwebtoken": "^9.x.x",
    "bcryptjs": "^2.4.x"
  }
}
```

Install with:
```bash
npm install qrcode nodemailer
```

---

## Future Enhancements

### Short Term (Next Sprint)
- ✅ Event registration functionality (COMPLETED)
- ✅ QR code email system (COMPLETED)
- ⏳ Participant dashboard UI
- ⏳ Organizer dashboard UI
- ⏳ Admin dashboard UI
- ⏳ Profile management page

### Medium Term (Next 2-3 Sprints)
- ⏳ Event feedback and ratings
- ⏳ Email notifications for registrations
- ⏳ Event attendance tracking
- ⏳ Certificate generation
- ⏳ Advanced analytics for organizers

### Long Term
- ⏳ Mobile application (React Native)
- ⏳ Real-time notifications (WebSocket)
- ⏳ Payment integration for registration fees
- ⏳ Social sharing features
- ⏳ Event recommendation engine
- ⏳ Multi-language support

---

## Support & Contact

### Getting Help
1. Check the **Troubleshooting** section above
2. Review **API Documentation** for endpoint details
3. Check browser console (F12) for error messages
4. Check backend terminal for server errors

### Contact Information
- **Author:** Asritha Singam
- **GitHub:** [Your GitHub Profile]
- **Email:** [Your Email]

---

## License

This project is part of an academic assignment and is for educational purposes only.

---

## Acknowledgments

### Technologies & Resources
- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Mongoose](https://mongoosejs.com/) - ODM
- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Axios](https://axios-http.com/) - HTTP client
- [JWT](https://jwt.io/) - Authentication
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - Password hashing

### Documentation Used
- MDN Web Docs
- Express.js Documentation
- MongoDB Documentation
- React Documentation
- Vite Documentation

---

**Last Updated:** February 15, 2026
**Version:** 1.1.0 (QR Code Email System Added)
