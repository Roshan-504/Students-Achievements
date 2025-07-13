import express from 'express';
import { 
  getOtherAchievements,
  uploadOtherAchievement,
  updateOtherAchievement,
  deleteOtherAchievement,
  downloadOtherAchievementProof
} from '../controllers/other_achievementsController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

// GET - Fetch all other achievements for logged-in student
router.get('/other-achievements', authenticate, authorizeRoles('student'), getOtherAchievements);

// POST - Upload new other-achievement
router.post('/upload/other-achievement', authenticate, authorizeRoles('student'), upload.single('proof'), uploadOtherAchievement);

// PUT - Update existing other achievement
router.put('/update/other-achievement/:id', authenticate, authorizeRoles('student'), upload.single('proof'), updateOtherAchievement);

// GET - Download proof file
router.get('/download/other-achievement/:id', authenticate, authorizeRoles('student'), downloadOtherAchievementProof);

// DELETE - Delete other achievement
router.delete('/other-achievement/:id', authenticate, authorizeRoles('student'), deleteOtherAchievement);

export default router;