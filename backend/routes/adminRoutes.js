import express from 'express';
import uploadXcel from '../middlewares/uploadXcel.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import {uploadStudents, uploadFaculty} from '../controllers/adminController.js';

const router = express.Router();

// Student data upload
router.post('/upload/students', authenticate, authorizeRoles('admin'), uploadXcel.single('file'), uploadStudents);

// Faculty data upload
router.post('/upload/faculty', authenticate, authorizeRoles('admin'), uploadXcel.single('file'), uploadFaculty);

export default router;
