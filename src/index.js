import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import passport from 'passport';
// import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import requestLogger from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { authenticateToken } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import orgRoutes from './routes/organizations.js';
import userRoutes from './routes/users.js';
import './config/googleAuth.js';

import { PORT, APP_NAME, NODE_ENV } from './config/config.js';
import { apiLimiter } from './config/limiter.js';
import morgan from 'morgan';

// Initialize Express app
const app = express();

app.use(morgan('combined'));

// === Middleware === //
// Security Middleware
app.use(helmet());
app.use(cookieParser());
// Uncomment below to enable CSRF protection
// app.use(csurf({ cookie: true }));

// Utility Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(requestLogger('dev'));

// === Swagger API Documentation === //
const swaggerAuthDocs = YAML.load('./src/docs/auth.swagger.yml');
const swaggerOrgDocs = YAML.load('./src/docs/organizations.swagger.yml');
const swaggerUserDocs = YAML.load('./src/docs/users.swagger.yml');

// Merge all loaded YAML documentation into a single Swagger document
const swaggerDocs = {
  openapi: '3.0.0',
  info: {
    title: `${APP_NAME}`,
    version: '1.0.0',
    description:
      'Multi-tenant REST API with authentication, organizations, and security enhancements.',
  },
  servers: [{ url: `http://localhost:${PORT}` }],
  paths: {
    ...swaggerAuthDocs.paths,
    ...swaggerOrgDocs.paths,
    ...swaggerUserDocs.paths,
  },
  components: {
    ...(swaggerAuthDocs.components || {}),
    ...(swaggerOrgDocs.components || {}),
    ...(swaggerUserDocs.components || {}),
  },
};

// Set up Swagger UI to serve the merged documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// Serve raw Swagger JSON for external integrations/testing
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerDocs);
});

// === Routes === //
// Authentication Routes
app.use('/v1/auth', apiLimiter, authRoutes);

// Organization Routes (protected)
app.use('/v1/organizations', apiLimiter, authenticateToken, orgRoutes);

// User Routes (protected)
app.use('/v1/users', apiLimiter, authenticateToken, userRoutes);

// General Utility Routes
app.get('/health', (req, res) => res.send('OK!')); // Health Check
app.get('/ping', (req, res) => res.send('pong')); // Ping response

// === Optional CSRF Token Middleware === //
// app.use((req, res, next) => {
//     res.cookie('XSRF-TOKEN', req.csrfToken());
//     next();
// });

// === Start Server === //
if (NODE_ENV !== 'test') {
  console.log(`Swagger UI available on /api-docs`);
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export { app };
