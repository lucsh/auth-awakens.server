import knex from '../config/knex.js';

export const findOrCreateOrganization = async (domain) => {
  // Check if the organization exists
  let organization = await knex('organizations').where({ domain }).first();

  // If not, insert a new organization
  if (!organization) {
    const [newOrganization] = await knex('organizations')
      .insert({ name: domain, domain })
      .returning('*');

    organization = newOrganization;
  }

  return organization;
};
