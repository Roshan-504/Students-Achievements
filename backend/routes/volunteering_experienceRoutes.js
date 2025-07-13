import express from 'express';
import { 
    getVolunteerings, 
    uploadVolunteering, 
    updateVolunteering, 
    deleteVolunteering, 
    downloadVolunteeringProof
} from '../controllers/volunteering_experienceController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

// GET - Fetch all volunteering activities for logged-in student
router.get('/volunteerings', authenticate, authorizeRoles('student'), getVolunteerings);

// POST - Upload new volunteering activity
router.post('/upload/volunteering', authenticate, authorizeRoles('student'), upload.single('proof'), uploadVolunteering);

// PUT - Update existing volunteering activity
router.put('/update/volunteering/:id', authenticate, authorizeRoles('student'), upload.single('proof'), updateVolunteering);

// GET - Download proof file
router.get('/download/volunteering/:id', authenticate, authorizeRoles('student'), downloadVolunteeringProof);

// DELETE - Delete volunteering activity
router.delete('/volunteering/:id', authenticate, authorizeRoles('student'), deleteVolunteering);

export default router;