import knex from '../config/knex.js';

export const findUserByEmail = async (email) => {
  return knex('users').where({ email }).first();
};

export const createUser = async ({
  name,
  email,
  password,
  organizationId,
  role,
}) => {
  const [newUser] = await knex('users')
    .insert({
      name,
      email,
      password,
      organization_id: organizationId,
      role,
    })
    .returning(['id', 'name', 'email', 'organization_id', 'role']);

  return newUser;
};
