import express from 'express';
import { downloadPatentDocument, getPatents, updatePatent, uploadPatent } from '../controllers/patentsController.js'; 
import { authenticate, authorizeRoles } from '../middlewares/auth.js'; 
import upload from '../utils/upload.js';

const router = express.Router();

// GET - Fetch all patents for logged-in student
router.get('/patents', authenticate, authorizeRoles('student'), getPatents);

// POST - Upload new patent data
router.post('/upload/patent', authenticate, authorizeRoles('student'), upload.single('proof'), uploadPatent);

// PUT - Update existing patent
router.put('/update/patent/:id', authenticate, authorizeRoles('student'), upload.single('proof'), updatePatent);

router.get('/download/patent/:id', authenticate, authorizeRoles('student'), downloadPatentDocument);

export default router;
