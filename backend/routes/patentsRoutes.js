import express from 'express';
import { 
    getPatents, 
    uploadPatent, 
    updatePatent, 
    deletePatent 
} from '../controllers/patentsController.js'; 

import { authenticate, authorizeRoles } from '../middlewares/auth.js'; 

const router = express.Router();

// GET - Fetch all patents for logged-in student
router.get('/patents', authenticate, authorizeRoles('student'), getPatents);

// POST - Upload new patent data
router.post('/upload/patent', authenticate, authorizeRoles('student'), uploadPatent);

// PUT - Update existing patent
router.put('/patent/:id', authenticate, authorizeRoles('student'), updatePatent);

// DELETE - Delete patent
router.delete('/patent/:id', authenticate, authorizeRoles('student'), deletePatent);

export default router;
