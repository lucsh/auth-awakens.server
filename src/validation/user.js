import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().nonempty('Email is required').email('Invalid email format'),
  password: z.string().nonempty('Password is required'),
  role: z.enum(['ADMIN', 'USER']),
});

export const validateUserSchemaInput = (req, res, next) => {
  try {
    req.body = userSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};
