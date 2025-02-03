import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import knex from '../config/knex.js';
import { JWT_SECRET } from '../config/config.js';

// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
  // First, try to get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  // If the token isn't in the Authorization header, check the cookies
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token is found at all, respond with an error
  if (!token) {
    return res.status(401).json({ error: 'Authorization token is required' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user; // Attach user info to the request
    next();
  });
};

// Function to authenticate a user by email and password
const authenticateUser = async (email, password) => {
  try {
    // Fetch user by email using Knex
    const user = await knex('users').where({ email }).first(); // Get only one record

    if (!user) {
      return null; // No user found
    }

    // Compare input password with hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    // Return user if passwords match; otherwise, return null
    return isMatch ? user : null;
  } catch (error) {
    console.error('Error in authenticateUser:', error.message);
    throw new Error('Authentication failed');
  }
};

export { authenticateToken, authenticateUser };
