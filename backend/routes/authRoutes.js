import express from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { authenticate } from '../middlewares/auth.js';

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

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // critical for cross-site
    });

    res.redirect(`${process.env.FRONTEND_URL}/auth/redirect`);
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
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
  });

  res.status(200).json({ message: 'Logged out successfully' });
});


// Profile route
router.get('/profile', authenticate, (req, res) => {
  res.json({
    user: req.user,
  });
});

export default router;
