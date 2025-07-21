// controllers/ContactusFormController.js
import Contact from '../models/contact_us.js';

// Submit contact form
export const submitContactForm = async (req, res) => {
  try {
    const { type, subject, message } = req.body;
    const email = req.user.email
    const name = req.user.firstName + ' ' + req.user.lastName;
    
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
};

// Get all messages
export const getAllMessages = async (req, res) => {
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
};

// Update message status - delete when resolved
export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['new', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Handle resolved status - delete the message
    if (status === 'resolved') {
      const deletedMessage = await Contact.findByIdAndDelete(id);
      
      if (!deletedMessage) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      return res.json({
        success: true,
        message: 'Message resolved and deleted successfully',
        data: deletedMessage
      });
    }

    // Handle other status updates
    const updatedMessage = await Contact.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: updatedMessage
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status',
      error: error.message
    });
  }
};