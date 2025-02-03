import Knex from 'knex';
import dotenv from 'dotenv';
import { DATABASE_URL } from './config.js';

// Load environment variables
dotenv.config();

const knex = Knex({
  client: 'pg', // PostgreSQL
  connection: {
    connectionString: DATABASE_URL,
    // Uncomment if you're not using DATABASE_URL
    // host: process.env.DB_HOST,
    // port: process.env.DB_PORT,
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME,
  },
  pool: { min: 2, max: 10 }, // Connection pooling
  migrations: {
    tableName: 'knex_migrations', // Optional: Table to track migrations
  },
});

export default knex;
