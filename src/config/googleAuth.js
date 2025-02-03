import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import knex from './knex.js';
import { roles } from '../middleware/rbac.js';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} from '../config/config.js';

// Configure the Google OAuth 2.0 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID, // From environment variables
      clientSecret: GOOGLE_CLIENT_SECRET, // From environment variables
      callbackURL: GOOGLE_CALLBACK_URL, // Ensure this matches Google’s OAuth settings
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value; // Extract the user's email
        const name = profile.displayName; // Extract the user's full name
        const userDomain = email.split('@')[1]; // Extract the email domain to link with organizations

        // Find or create the organization
        let organization = await knex('organizations')
          .where({ domain: userDomain })
          .first();
        if (!organization) {
          const [newOrganization] = await knex('organizations')
            .insert({
              name: userDomain,
              domain: userDomain,
            })
            .returning('*');
          organization = newOrganization;
        }

        // Find or create the user
        let user = await knex('users').where({ email }).first();
        if (!user) {
          const [newUser] = await knex('users')
            .insert({
              name,
              email,
              organization_id: organization.id,
              role: roles.USER,
            })
            .returning('*');
          user = newUser;
        }

        // Pass the user object to Passport
        done(null, user);
      } catch (error) {
        console.error('Google authentication error:', error.message);
        done(error, null);
      }
    },
  ),
);

// Serialize the user to save their ID in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize the user by retrieving details for the given ID
passport.deserializeUser(async (id, done) => {
  try {
    const user = await knex('users').where({ id }).first();
    done(null, user);
  } catch (error) {
    console.error('Error deserializing user:', error.message);
    done(error, null);
  }
});

export default passport;
