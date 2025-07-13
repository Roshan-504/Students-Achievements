import dotenv from 'dotenv';
import express from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import internshipsRoutes from './routes/internshipsRoutes.js';
import certificationRoutes from './routes/course_certificationsRoutes.js'
import studentPersonalInfo from './routes/student_personal_infoRoutes.js';
import contactUsRoutes from './routes/contact_usRoutes.js';
import technicalActivityRoutes from './routes/technical_activitiesRoutes.js';
import nonTechnicalActivityRoutes from './routes/non_technical_activitiesRoutes.js'
import paperPublicationRoutes from './routes/paper_publicationsRoutes.js'
import workshopRoutes from './routes/workshopRoutes.js'
import volunteeringRoutes from './routes/volunteering_experienceRoutes.js';
import EntrepreneurshipRoutes from './routes/entrepreneurship_projectsRoutes.js'
import OtherAchievementsRoutes from './routes/other_achievementsRoutes.js'

import './config/passport.js'; // Load Passport config BEFORE routes
import {connectDB} from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import filterRoutes from './routes/filterRoutes.js'

dotenv.config();

const app = express();
connectDB();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

// Routes general
app.use('/auth', authRoutes);
app.use('/contact-us', contactUsRoutes)

// admin routes
app.use('/admin',adminRoutes);

// student routes
app.use('/student',studentPersonalInfo);
app.use('/student',internshipsRoutes);
app.use('/student',certificationRoutes);
app.use('/student',technicalActivityRoutes);
app.use('/student',nonTechnicalActivityRoutes);
app.use('/student',paperPublicationRoutes);
app.use('/student',workshopRoutes);
app.use('/student',volunteeringRoutes);
app.use('/student',EntrepreneurshipRoutes);
app.use('/student',OtherAchievementsRoutes);
app.use('/api/faculty',filterRoutes);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
