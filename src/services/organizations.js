import knex from '../config/knex.js';

export const fetchAllOrganizations = async () => {
  // Fetch all organizations from the database
  return knex('organizations').select('*');
};

export const createNewOrganization = async ({ name, domain }) => {
  if (!name || !domain) {
    throw new Error('Missing required fields: name or domain');
  }

  // Insert a new organization and return the resulting record
  const [organization] = await knex('organizations')
    .insert({ name, domain })
    .returning('*');

  return organization;
};
