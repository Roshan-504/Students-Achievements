import express from 'express';
import { 
  getEntrepreneurships,
  uploadEntrepreneurship,
  updateEntrepreneurship,
  deleteEntrepreneurship,
  downloadEntrepreneurshipProof
} from '../controllers/entrepreneurship_projectsController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

// Student routes
router.get('/entrepreneurships', authenticate, authorizeRoles('student'), getEntrepreneurships);
router.post('/upload/entrepreneurship', authenticate, authorizeRoles('student'), upload.single('proof'), uploadEntrepreneurship);
router.put('/update/entrepreneurship/:id', authenticate, authorizeRoles('student'), upload.single('proof'), updateEntrepreneurship);
router.get('/download/entrepreneurship/:id', authenticate, authorizeRoles('student'), downloadEntrepreneurshipProof);
router.delete('/entrepreneurship/:id', authenticate, authorizeRoles('student'), deleteEntrepreneurship);

export default router;