import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { authorize, roles } from '../middleware/rbac.js';
import {
  getAllOrganizations,
  createOrganization,
} from '../controllers/organizations.js';
import { validateOrganizationSchemaInput } from '../validation/organization.js';

const router = express.Router();

// Get all organizations (SUPERADMIN only)
router.get(
  '/',
  authenticateToken,
  authorize([roles.SUPERADMIN]),
  getAllOrganizations,
);

// Create organization (SUPERADMIN or based on user's domain)
router.post(
  '/',
  validateOrganizationSchemaInput,
  authenticateToken,
  createOrganization,
);

export default router;
