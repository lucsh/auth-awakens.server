import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

export const DATABASE_URL = process.env.DATABASE_URL;
export const APP_NAME = process.env.APP_NAME;
export const JWT_SECRET = process.env.JWT_SECRET;
export const PORT = process.env.PORT || 3000;
export const REDIS_URL = process.env.REDIS_URL;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
