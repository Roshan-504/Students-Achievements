import express from 'express';
import { 
    getPersonalInfo, 
    getActivityStatus,
    updateStudentProfile
} from '../controllers/student_personal_infoController.js'; 

import { authenticate, authorizeRoles } from '../middlewares/auth.js'; 

const router = express.Router();

// GET - Fetch activity status for logged-in student
router.get('/activity-status', authenticate, authorizeRoles('student'), getActivityStatus);

// GET - Fetch personal information for logged-in student
router.get('/personal-info', authenticate, authorizeRoles('student'), getPersonalInfo);

// PUT - Update personal information (only updatable fields)
router.put('/update-student-profile', authenticate, authorizeRoles(['student','admin']), updateStudentProfile);

export default router;
