// Update the routes to use the controller
import express from 'express';
import { 
  submitContactForm, 
  getAllMessages, 
  updateMessageStatus 
} from '../controllers/ContactusFormController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Submit contact form (public)
router.post('/message', submitContactForm);

// Get all messages (admin only)
router.get('/messages', authenticate, getAllMessages);

// Update message status (admin only)
router.patch('/message/:id', authenticate, updateMessageStatus);

export default router;