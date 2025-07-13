import express from 'express';
import { 
    getEntrepreneurshipProjects, 
    uploadEntrepreneurshipProject, 
    updateEntrepreneurshipProject, 
    deleteEntrepreneurshipProject 
} from '../controllers/entrepreneurship_projectsController.js'; 
import { authenticate, authorizeRoles } from '../middlewares/auth.js'; 

const router = express.Router();

// GET - Fetch all entrepreneurship projects for logged-in student
router.get('/entrepreneurship-projects', authenticate, authorizeRoles('student'), getEntrepreneurshipProjects);

// POST - Upload new entrepreneurship project data
router.post('/upload/entrepreneurship-project', authenticate, authorizeRoles('student'), uploadEntrepreneurshipProject);

// PUT - Update existing entrepreneurship project
router.put('/entrepreneurship-project/:id', authenticate, authorizeRoles('student'), updateEntrepreneurshipProject);

// DELETE - Delete entrepreneurship project
router.delete('/entrepreneurship-project/:id', authenticate, authorizeRoles('student'), deleteEntrepreneurshipProject);

export default router;
