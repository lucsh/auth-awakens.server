import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import knex from '../config/knex.js';
import { sendEmail } from '../config/email.js';
import { authenticateUser } from '../middleware/auth.js';
import passport from 'passport';
import { roles } from '../middleware/rbac.js';
import helmet from 'helmet';
import { loginLimiter } from '../config/limiter.js';
import { findOrCreateOrganization } from '../models/organizations.js';
import { createUserService } from '../services/users.js';

const router = express.Router();

// ---------------------- Middleware ----------------------

// Apply security headers
router.use(helmet());

// ---------------------- Helper Functions ----------------------

/**
 * Generates a secure token and expiration date.
 * @returns {Object} resetToken, hashedToken, and expiration timestamp
 */
const generateToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const expires = new Date(Date.now() + 3600000); // Expire in 1 hour
  return { resetToken, hashedToken, expires };
};

// ---------------------- Routes ----------------------

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        organizationId: user.organization_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    // Set token as a cookie
    res.cookie('token', token, {
      httpOnly: true, // Prevent JS access
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'Strict', // Prevent CSRF
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

// Password reset request
router.post('/reset-password', loginLimiter, async (req, res) => {
  const { email } = req.body;

  try {
    const user = await knex('users').where({ email }).first();
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { resetToken, hashedToken, expires } = generateToken();

    await knex('users').where({ email }).update({
      reset_token: hashedToken,
      reset_token_expires: expires,
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Password Reset Request',
      `You requested a password reset. Click the link to reset your password:\n\n${resetLink}`,
    );

    return res.json({ message: 'Password reset link sent successfully.' });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ error: 'Unable to process password reset request.' });
  }
});

// Password reset completion
router.post('/set-password', loginLimiter, async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await knex('users')
      .where({ reset_token: hashedToken })
      .andWhere('reset_token_expires', '>', new Date())
      .first();

    if (!user)
      return res.status(400).json({ error: 'Invalid or expired token.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await knex('users').where({ id: user.id }).update({
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null,
    });

    res.json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Unable to reset password.' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// Google SSO Login
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

// Google Callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  async (req, res) => {
    try {
      const { name, email } = req.user;
      const userDomain = email.split('@')[1];

      // Find or create organization and user
      const organization = await findOrCreateOrganization(userDomain);
      const user = await createUserService({
        name,
        email,
        role: roles.USER,
        domain:organization.domain,
      });

      res.json({ message: 'Login successful', user });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Unable to handle Google login.' });
    }
  },
);

export default router;
