import express from 'express';
import uploadXcel from '../middlewares/uploadXcel.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import {uploadStudents, uploadFaculty, getBatches, getBatchStudents} from '../controllers/adminController.js';

const router = express.Router();

// Student data upload
router.post('/upload/students', authenticate, authorizeRoles('admin'), uploadXcel.single('file'), uploadStudents);

// Faculty data upload
router.post('/upload/faculty', authenticate, authorizeRoles('admin'), uploadXcel.single('file'), uploadFaculty);

// get batches
router.get('/batches', authenticate, authorizeRoles('admin'), getBatches);

// get students in batch
router.get('/batch-students', getBatchStudents);


export default router;
