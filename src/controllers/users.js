import { createUserService } from '../services/users.js';
import { roles } from '../middleware/rbac.js';

export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  const requesterDomain = (req.user.email || '').split('@')[1]; // Domain of the requester
  const userDomain = (email || '').split('@')[1]; // Domain of the user being created

  // Check if the current user's role allows creating a SUPERADMIN
  if (role === roles.SUPERADMIN && req.user.role !== roles.SUPERADMIN) {
    return res.status(403).json({
      error: 'Forbidden: Only a SUPERADMIN can create another SUPERADMIN.',
    });
  }
  // Check if the current user's role allows creating other roles
  if (![roles.SUPERADMIN, roles.ADMIN].includes(req.user?.role || [])) {
    return res.status(403).json({
      error: 'Forbidden: Only SUPERADMIN or ADMIN can create users.',
    });
  }

  // Check additional domain restriction for Admins creating users
  if (req.user.role === roles.ADMIN && userDomain !== requesterDomain) {
    return res.status(403).json({
      error:
        'Forbidden: Admins can only create users within their own organization.',
    });
  }

  try {
    const user = await createUserService({
      name,
      email,
      password,
      role,
      userDomain,
    });
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
