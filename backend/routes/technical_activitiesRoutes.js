import express from 'express';
import { 
    getTechnicalActivities, 
    uploadTechnicalActivity, 
    updateTechnicalActivity, 
    deleteTechnicalActivity, 
    downloadTechnicalActivityProof
} from '../controllers/technical_activitiesController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

// GET - Fetch all technical activities
router.get('/technical-activities', authenticate, authorizeRoles('student'), getTechnicalActivities);

// POST - Upload new technical activity
router.post('/upload/technical-activity', authenticate, authorizeRoles('student'), upload.single('proof'), uploadTechnicalActivity);

// PUT - Update existing technical activity
router.put('/update/technical-activity/:id', authenticate, authorizeRoles('student'), upload.single('proof'), updateTechnicalActivity);

// GET - Download technical activity proof
router.get('/download/technical-activity/:id', authenticate, authorizeRoles('student'), downloadTechnicalActivityProof);

// DELETE - Delete technical activity
router.delete('/technical-activity/:id', authenticate, authorizeRoles('student'), deleteTechnicalActivity);

export default router;