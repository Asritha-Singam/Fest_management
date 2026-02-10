# Assignment 1 - Full Stack Application

A full-stack MERN (MongoDB, Express, React, Node.js) application with a RESTful API backend and React frontend.

## Project Structure

```
Assignment_1/
├── backend/              # Node.js Express server
│   ├── config/          # Configuration files (database, etc.)
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── server.js        # Entry point
│   └── package.json     # Backend dependencies
│
└── frontend/            # React application
    ├── components/      # Reusable components
    ├── context/         # Context API providers
    ├── pages/           # Page components
    ├── services/        # API service calls
    └── App.js           # Main app component
```

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **dotenv** - Environment variable management

### Frontend
- **React** - UI library
- **Context API** - State management

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
MONGODB_URI=mongodb://localhost:27017/your_database_name
# Or use MongoDB Atlas connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
```

4. Start the backend server:
```bash
npm start
```

The backend server will run on `http://localhost:4001`

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
npm start
```

The frontend application will typically run on `http://localhost:3000`

## API Endpoints

### Organizers
- `GET /api/organizers` - Get all organizers

*Note: Additional endpoints will be added as development progresses*

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
npm start
```

## Environment Variables

Create a `.env` file in the backend directory with:

| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/mydb |

## Features

- RESTful API architecture
- MongoDB database integration
- Express server with middleware support
- React frontend with component-based architecture
- Context API for state management

## Project Status

This project is currently in development. The following features are planned:
- Complete CRUD operations for organizers
- Additional models and routes
- Authentication and authorization
- Frontend UI components and pages
- API integration with frontend

## Author

Asritha Singam

## Acknowledgments

- Express.js documentation
- MongoDB documentation
- React documentation
