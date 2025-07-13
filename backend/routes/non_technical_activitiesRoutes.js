import express from 'express';
import { 
    getNonTechnicalActivities, 
    uploadNonTechnicalActivity, 
    updateNonTechnicalActivity, 
    deleteNonTechnicalActivity, 
    downloadNonTechnicalActivityProof
} from '../controllers/non_technical_activitiesController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

// GET - Fetch all non-technical activities
router.get('/non-technical-activities', authenticate, authorizeRoles('student'), getNonTechnicalActivities);

// POST - Upload new non-technical activity
router.post('/upload/non-technical-activity', authenticate, authorizeRoles('student'), upload.single('proof'), uploadNonTechnicalActivity);

// PUT - Update existing non-technical activity
router.put('/update/non-technical-activity/:id', authenticate, authorizeRoles('student'), upload.single('proof'), updateNonTechnicalActivity);

// GET - Download non-technical activity proof
router.get('/download/non-technical-activity/:id', authenticate, authorizeRoles('student'), downloadNonTechnicalActivityProof);

// DELETE - Delete non-technical activity
router.delete('/non-technical-activity/:id', authenticate, authorizeRoles('student'), deleteNonTechnicalActivity);

export default router;