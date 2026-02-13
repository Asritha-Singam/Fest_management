# Assignment 1 - Full Stack Application

A full-stack MERN (MongoDB, Express, React, Node.js) application with a RESTful API backend and React frontend.

## Project Structure

```
Assignment_1/
├── backend/              # Node.js Express server
│   ├── config/          # Configuration files
│   │   └── db.js        # MongoDB connection setup
│   ├── controllers/     # Route controllers
│   │   └── authcontrollers.js  # Authentication logic
│   │   └── eventControllers.js # Event management logic
│   ├── middleware/      # Custom middleware
│   │   ├── authMiddleware.js   # JWT verification
│   │   └── roleMiddleware.js   # Role-based access control
│   ├── models/          # Database models
│   │   ├── User.js      # User model (admin, organizer)
│   │   └── participant.js      # Participant model
│   │   └── events.js     # Event model
│   ├── routes/          # API routes
│   │   └── authroutes.js       # Authentication endpoints
│   │   └── eventRoutes.js      # Event endpoints
│   ├── app.js           # Express app configuration
│   ├── server.js        # Entry point
│   └── package.json     # Backend dependencies
│
└── frontend/            # React application
    ├── src/
    │   ├── components/  # Reusable components
    │   │   ├── loginForm.jsx      # Login form component
    │   │   ├── signupForm.jsx     # Signup form component
    │   │   └── ProtectedRoute.jsx # Route protection wrapper
    │   │   └── participantNavbar.jsx # Participant navigation bar
    │   ├── context/     # Context API providers
    │   │   └── AuthContext.jsx    # Authentication state management
    │   ├── pages/       # Page components
    │   │   ├── LoginPage.jsx      # Login page
    │   │   ├── signupPage.jsx     # Signup page
    │   │   └── authLandingPage.jsx # Auth landing page
    │   │   └── browseEvents.jsx   # Browse events page
    │   ├── services/    # API service calls
    │   │   ├── api.js             # Axios instance
    │   │   └── authServices.js    # Auth API functions
    │   ├── App.jsx      # Main app component with routing
    │   └── main.jsx     # React entry point
    ├── index.html       # HTML template
    ├── vite.config.js   # Vite configuration
    └── package.json     # Frontend dependencies
```

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **dotenv** - Environment variable management
- **bcrypt** - Password hashing
- **jsonwebtoken (JWT)** - Token-based authentication
- **cors** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client

## Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
PORT=4001
MONGODB_URI=mongodb://localhost:27017/your_database_name
# Or use MongoDB Atlas connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

JWT_SECRET=your_jwt_secret_key_here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:4001`

**Note:** On first startup, an admin user will be automatically created with the credentials from your `.env` file.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend application will run on `http://localhost:5173` (Vite default)

## Getting Started / Usage

### First Time Setup

1. **Start both servers** (backend and frontend) as described in the installation section

2. **Access the application** at `http://localhost:5173`

3. **Admin Login:**
   - The admin account is automatically created on first backend startup
   - Use the credentials from your `.env` file (ADMIN_EMAIL and ADMIN_PASSWORD)
   - After login, you'll be redirected to `/admin/dashboard`

4. **New Participant Registration:**
   - Navigate to the signup page
   - Fill in the registration form with your details
   - Select participant type (IIIT or Non-IIIT)
   - After successful registration, you'll be redirected to login
   - Login with your credentials to access `/participant/dashboard`

### Application Flow

```
Landing Page (/) → Login or Signup
                    ↓
                  Login
                    ↓
            Role-based Redirect:
            ├─ Admin → /admin/dashboard
            ├─ Organizer → /organizer/dashboard
            └─ Participant → /participant/dashboard
```

### Testing the Application

You can test different user roles:
1. Login as **Admin** using the credentials from `.env`
2. Register a new **Participant** using the signup form
3. Create additional users directly in MongoDB for testing Organizer role

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new participant
  - Body: `{ firstName, lastName, email, password, participantType, collegeOrOrg, contactNumber, interests }`
- `POST /api/auth/login` - Login user (admin, organizer, or participant)
  - Body: `{ email, password }`
  - Returns: `{ token, role }`
- `POST /api/auth/createOrganizer` - Create an organizer account
  - Body: `{ firstName, lastName, email, password }`

### Events
- `POST /api/events/create` - Create a new event (organizer only)
  - Auth: `Authorization: Bearer <token>`
  - Body: `{ eventName, eventDescription, eventType, eligibility, registrationDeadline, eventStartDate, eventEndDate, registrationLimit, registrationFee, eventTags, merchandiseDetails, customFormFields }`
- `GET /api/events/all` - List published events with optional filters
  - Query: `search`, `type`, `eligibility`, `startDate`, `endDate`

### Protected Routes
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## Environment Variables

Create a `.env` file in the backend directory with:

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Backend server port | 4001 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/mydb |
| JWT_SECRET | Secret key for JWT signing | your_secret_key_here |
| ADMIN_EMAIL | Default admin email | admin@example.com |
| ADMIN_PASSWORD | Default admin password | SecurePassword123 |

## Features

### Implemented ✅

#### Backend
- ✅ RESTful API architecture
- ✅ MongoDB database integration with Mongoose
- ✅ User authentication with JWT
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (Admin, Organizer, Participant)
- ✅ Authentication middleware for protected routes
- ✅ Role verification middleware
- ✅ User model with role management
- ✅ Participant model with IIIT/Non-IIIT types
- ✅ Auto-creation of admin user on server start
- ✅ CORS configuration for frontend communication
- ✅ Organizer creation endpoint
- ✅ Event model and event CRUD (create/list)

#### Frontend
- ✅ React with Vite for fast development
- ✅ React Router for navigation
- ✅ Authentication Context for global state management
- ✅ Protected routes with role-based access
- ✅ Login page and form
- ✅ Signup/Registration page and form
- ✅ Role-based dashboard routing:
  - Admin Dashboard (`/admin/dashboard`)
  - Organizer Dashboard (`/organizer/dashboard`)
  - Participant Dashboard (`/participant/dashboard`)
- ✅ Axios integration for API calls
- ✅ Token persistence in localStorage
- ✅ Automatic redirect based on user role after login
- ✅ Browse events page (`/browse`) with search and type filter
- ✅ Participant navigation bar

## Project Status

This project is currently in active development.

### Completed
- ✅ Basic authentication system
- ✅ User registration and login
- ✅ Role-based access control
- ✅ Protected routes on frontend
- ✅ JWT token management
- ✅ Database models for users and participants

### In Progress / Planned
- 🔄 Dashboard UI implementation
- 🔄 Event management system
- 🔄 Complete CRUD operations for organizers
- 🔄 Profile management
- 🔄 Event registration functionality
- 🔄 Admin panel features
- 🔄 Form validation and error handling improvements
- 🔄 Responsive design and styling

## User Roles

### Admin
- Full system access
- User management capabilities
- System configuration
- Access via: `/admin/dashboard`

### Organizer
- Create and manage events
- View participant registrations
- Event analytics
- Access via: `/organizer/dashboard`

### Participant
- Register for events
- View registered events
- Update profile
- Access via: `/participant/dashboard`
- Types: IIIT or Non-IIIT

## Author

Asritha Singam

## Acknowledgments

- Express.js documentation
- MongoDB documentation
- React documentation
