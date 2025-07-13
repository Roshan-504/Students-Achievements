import express from 'express';
import { 
    getCertifications, 
    uploadCertification, 
    updateCertification, 
    deleteCertification, 
    downloadCertificationProof
} from '../controllers/course_certificationsController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

// GET - Fetch all certifications for logged-in student
router.get('/certifications', authenticate, authorizeRoles('student'), getCertifications);

// POST - Upload new certification data
router.post('/upload/certification', authenticate, authorizeRoles('student'), upload.single('proof'), uploadCertification);

// PUT - Update existing certification
router.put('/update/certification/:id', authenticate, authorizeRoles('student'), upload.single('proof'), updateCertification);

// GET - Download certification proof
router.get('/download/certification/:id', authenticate, authorizeRoles('student'), downloadCertificationProof);

// DELETE - Delete certification
router.delete('/certification/:id', authenticate, authorizeRoles('student'), deleteCertification);

export default router;