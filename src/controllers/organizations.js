import {
  fetchAllOrganizations,
  createNewOrganization,
} from '../services/organizations.js';
import { roles } from '../middleware/rbac.js';

export const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await fetchAllOrganizations(); // Fetch all organizations
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createOrganization = async (req, res) => {
  try {
    const { name, domain } = req.body;
    const { email, role } = req.user;

    // Extract user domain from email
    const userDomain = email.split('@')[1];

    // Check if the user is SUPERADMIN or if the domain matches
    if (role !== roles.SUPERADMIN && domain !== userDomain) {
      console.error(
        'Forbidden: You can only create organizations under your domain.',
      );
      return res.status(403).json({
        error:
          'Forbidden: You can only create organizations under your domain.',
      });
    }

    // Proceed to create the organization
    const newOrg = await createNewOrganization({ name, domain });
    return res.status(201).json(newOrg);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
