import express from 'express';
import { validateUserSchemaInput } from '../validation/user.js';
import { authenticateToken } from '../middleware/auth.js';
import { createUser } from '../controllers/users.js';

const router = express.Router();

router.post('/', validateUserSchemaInput, authenticateToken, createUser);

export default router;
