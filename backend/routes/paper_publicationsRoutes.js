import express from 'express';
import { 
    getPaperPublications, 
    uploadPaperPublication, 
    updatePaperPublication, 
    deletePaperPublication, 
} from '../controllers/paper_publicationsController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

// GET - Fetch all paper publications
router.get('/paper-publications', authenticate, authorizeRoles('student'), getPaperPublications);

// POST - Upload new paper publication
router.post('/upload/paper-publication', authenticate, authorizeRoles('student'), upload.single('proof'), uploadPaperPublication);

// PUT - Update existing paper publication
router.put('/update/paper-publication/:id', authenticate, authorizeRoles('student'), upload.single('proof'), updatePaperPublication);

// DELETE - Delete paper publication
router.delete('/paper-publication/:id', authenticate, authorizeRoles('student'), deletePaperPublication);

export default router;