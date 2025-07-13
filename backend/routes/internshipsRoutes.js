import express from 'express';
import { 
    getInternships, 
    uploadInternship, 
    updateInternship, 
    deleteInternship, 
    downloadInternshipProof
} from '../controllers/internshipsController.js'; 
import { authenticate, authorizeRoles } from '../middlewares/auth.js'; 
import upload from '../utils/upload.js';

const router = express.Router();

// GET - Fetch all internships for logged-in student
router.get('/internships', authenticate, authorizeRoles('student'), getInternships);

// POST - Upload new internship data
router.post('/upload/internship', authenticate, authorizeRoles('student'), upload.single('proof'), uploadInternship);

// PUT - Update existing internship
router.put('/update/internship/:id', authenticate, authorizeRoles('student'), upload.single('proof'), updateInternship);

// download internship
router.get('/download/internship/:id', authenticate, authorizeRoles('student'), downloadInternshipProof)

// DELETE - Delete internship
router.delete('/internship/:id', authenticate, authorizeRoles('student'), deleteInternship);

export default router;
