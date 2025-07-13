import express from 'express';
import Contact from '../models/contact_us.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Submit contact form (public)
router.post('/message',authenticate ,async (req, res) => {    
    try {
      const { name, email, type, subject, message } = req.body;
      
      const newContact = new Contact({
        name,
        email,
        type,
        subject,
        message
      });

      await newContact.save();

      res.status(201).json({
        success: true,
        message: 'Your message has been submitted successfully',
        data: newContact
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit your message',
        error: error.message
      });
    }
  }
);

// Get all messages (admin only)
router.get('/messages', authenticate, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

export default router;