import express from 'express';
import { 
    getFeatured, 
    uploadFeatured, 
    updateFeatured, 
    deleteFeatured 
} from '../controllers/featuredController.js'; 

import { authenticate, authorizeRoles } from '../middlewares/auth.js'; 

const router = express.Router();

// GET - Fetch all featured media for logged-in student
router.get('/featured', authenticate, authorizeRoles('student'), getFeatured);

// POST - Upload new featured media data
router.post('/upload/featured', authenticate, authorizeRoles('student'), uploadFeatured);

// PUT - Update existing featured media
router.put('/featured/:id', authenticate, authorizeRoles('student'), updateFeatured);

// DELETE - Delete featured media
router.delete('/featured/:id', authenticate, authorizeRoles('student'), deleteFeatured);

export default router;
