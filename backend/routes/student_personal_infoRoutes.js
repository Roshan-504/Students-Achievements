import express from 'express';
import { 
    getPersonalInfo, 
    createPersonalInfo, 
    updatePersonalInfo, 
    getActivityStatus
} from '../controllers/student_personal_infoController.js'; 

import { authenticate, authorizeRoles } from '../middlewares/auth.js'; 

const router = express.Router();

// GET - Fetch activity status for logged-in student
router.get('/activity-status', authenticate, authorizeRoles('student'), getActivityStatus);

// GET - Fetch personal information for logged-in student
router.get('/personal-info', authenticate, authorizeRoles('student'), getPersonalInfo);

// POST - Create personal information (first time setup)
router.post('/upload/personal-info', authenticate, authorizeRoles('student'), createPersonalInfo);

// PUT - Update personal information (only updatable fields)
router.put('/personal-info', authenticate, authorizeRoles('student'), updatePersonalInfo);

export default router;
