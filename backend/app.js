//load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authroutes.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

//import routes
app.use('/api/auth', authRoutes);
//participant
//organizer
//admin

export default app;