import express from 'express';
import {
  getWorkshops,
  uploadWorkshop,
  updateWorkshop,
  downloadWorkshopProof,
  deleteWorkshop
} from '../controllers/workshopController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

// Get all workshops for student
router.get('/workshops', authenticate, authorizeRoles('student'), getWorkshops);

// Upload new workshop
router.post(
  '/upload/workshop',
  authenticate,
  authorizeRoles('student'),
  upload.single('proof'),
  uploadWorkshop
);

// Update workshop
router.put(
  '/update/workshop/:id',
  authenticate,
  authorizeRoles('student'),
  upload.single('proof'),
  updateWorkshop
);

// Download workshop certificate
router.get(
  '/download/workshop/:id',
  authenticate,
  authorizeRoles('student'),
  downloadWorkshopProof
);

// Delete workshop
router.delete(
  '/workshop/:id',
  authenticate,
  authorizeRoles('student'),
  deleteWorkshop
);

export default router;