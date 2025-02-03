import bcrypt from 'bcrypt';
import knex from '../src/config/knex.js';
import { roles } from '../src/middleware/rbac.js';
import {
  findOrCreateOrganization,
  findOrCreateUser,
} from '../src/routes/users.js';

const bootstrapSuperAdmin = async () => {
  const name = 'lucas'; // Replace with the desired name
  const email = 'lucas@rebel-scrum.com'; // Replace with the desired email
  const password = 'RebelScrum777'; // Replace with the desired password

  try {
    console.log('Starting SUPERADMIN bootstrap process...');

    // Check if a SUPERADMIN already exists
    const existingSuperAdmin = await knex('users')
      .where({ role: roles.SUPERADMIN })
      .first();

    if (existingSuperAdmin) {
      console.error('Error: A SUPERADMIN already exists. Aborting.');
      process.exit(1);
    }

    // Extract the domain from the email
    const userDomain = email.split('@')[1];

    // Create the organization
    const organization = await findOrCreateOrganization(userDomain);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the SUPERADMIN user
    const superAdmin = await findOrCreateUser(
      name,
      email,
      organization.id,
      roles.SUPERADMIN,
      hashedPassword,
    );

    console.log('SUPERADMIN created successfully:', superAdmin);
    process.exit(0); // Exit the script successfully
  } catch (error) {
    console.error('Error bootstrapping SUPERADMIN:', error.message);
    process.exit(1); // Exit the script with an error code
  }
};

// Execute the function
bootstrapSuperAdmin();
