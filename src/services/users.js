import bcrypt from 'bcrypt';
import { createUser, findUserByEmail } from '../models/users.js';
import { findOrCreateOrganization } from '../models/organizations.js';

export const createUserService = async ({
  name,
  email,
  password,
  role,
  userDomain,
}) => {
  // Find or create the organization
  const organization = await findOrCreateOrganization(userDomain);
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if user already exists
  let user = await findUserByEmail(email);
  if (user) {
    throw new Error('User with this email already exists.');
  }

  // Create the user
  user = await createUser({
    name,
    email,
    password: hashedPassword,
    organizationId: organization.id,
    role,
  });

  return user;
};
