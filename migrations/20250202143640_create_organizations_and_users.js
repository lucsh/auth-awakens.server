export const up = async (knex) => {
  await knex.schema.createTable('organizations', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('domain').unique().notNullable();
  });

  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').unique().notNullable();
    table.string('password');
    table.integer('organization_id').references('id').inTable('organizations');
    table.string('role').notNullable();
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('organizations');
};
