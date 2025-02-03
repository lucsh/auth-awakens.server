import { z } from 'zod';

export const organizationSchema = z.object({
  name: z.string().nonempty({ message: 'Organization name is required' }),
  domain: z.string().nonempty({ message: 'Organization domain is required' }),
});

export const validateOrganizationSchemaInput = (req, res, next) => {
  try {
    req.body = organizationSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};
