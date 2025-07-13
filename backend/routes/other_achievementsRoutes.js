import express from 'express';
import { 
    getOtherAchievements, 
    uploadOtherAchievement, 
    updateOtherAchievement, 
    deleteOtherAchievement 
} from '../controllers/other_achievementsController.js'; 

import { authenticate, authorizeRoles } from '../middlewares/auth.js'; 

const router = express.Router();

// GET - Fetch all other achievements for logged-in student
router.get('/other-achievements', authenticate, authorizeRoles('student'), getOtherAchievements);

// POST - Upload new other achievement data
router.post('/upload/other-achievement', authenticate, authorizeRoles('student'), uploadOtherAchievement);

// PUT - Update existing other achievement
router.put('/other-achievement/:id', authenticate, authorizeRoles('student'), updateOtherAchievement);

// DELETE - Delete other achievement
router.delete('/other-achievement/:id', authenticate, authorizeRoles('student'), deleteOtherAchievement);

export default router;
