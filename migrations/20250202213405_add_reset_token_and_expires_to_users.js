export const up = async (knex) => {
  await knex.schema.table('users', (table) => {
    table.string('reset_token').unique().nullable(); // Stores the hashed reset token
    table.timestamp('reset_token_expires').nullable(); // Stores the expiration date for the reset token
  });
};

export const down = async (knex) => {
  await knex.schema.table('users', (table) => {
    table.dropColumn('reset_token'); // Removes the column if rolled back
    table.dropColumn('reset_token_expires');
  });
};
