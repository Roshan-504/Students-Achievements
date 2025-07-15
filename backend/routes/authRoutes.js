import express from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { authenticate } from '../middlewares/auth.js';
import student_profile from '../models/student_profileModel.js';

const router = express.Router();

router.use(cookieParser());

// Google OAuth Login
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account', // Forces Google to show account selection
  })
);

// Google OAuth Callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failWithError: true,
  }),
  (req, res) => {
    const { user, token } = req.user;
    res.redirect(`${process.env.FRONTEND_URL}/auth/redirect?token=${token}`);
  },
  (err, req, res, next) => {
    // FAILURE
    console.error('OAuth Error:', err.message);

    let reason = 'unauthorized';
    if (err.message.includes('VES email')) reason = 'invalid-email';
    else if (err.message.includes('registered')) reason = 'not-registered';

    res.redirect(`${process.env.FRONTEND_URL}/login?error=${reason}`);
  }
);

// Logout (Clear JWT Cookie)
router.get('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});


// Profile route
router.get('/profile', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const profile = await student_profile.findOne({ email_id: req.user.email }).lean();

      if (!profile) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      return res.json({
        user: {
          ...req.user,
          ...profile, // updated fields from database
        },
      });
    }

    // For faculty or admin, return just the JWT data
    res.json({ user: req.user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;
