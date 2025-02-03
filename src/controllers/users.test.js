import request from 'supertest'; // Supertest for HTTP requests
import express from 'express'; // Express app mock
import { createUser } from '../controllers/users.js'; // The controller function to test
import { roles } from '../middleware/rbac.js';
import { createUserService } from '../services/users.js';

jest.mock('../services/users.js'); // Mock the user service

const app = express();
app.use(express.json());
app.post(
  '/create-user',
  (req, res, next) => {
    req.user = JSON.parse(req.headers.user); // Parse the user header and assign it to req.user
    next();
  },
  createUser,
);

describe('createUser Controller Tests', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mock calls between tests
  });

  it('should create a user successfully if all criteria are met', async () => {
    const userMock = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: roles.ADMIN,
    };

    createUserService.mockResolvedValue(userMock); // Mock successful user creation

    const res = await request(app)
      .post('/create-user')
      .send(userMock)
      .set(
        'user',
        JSON.stringify({ role: roles.ADMIN, email: 'jane@example.com' }),
      );

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User created successfully');
    expect(res.body.user).toEqual(userMock);
    expect(createUserService).toHaveBeenCalledTimes(1);
  });

  it('should fail if creator is not admin', async () => {
    const userMock = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: roles.USER,
    };

    createUserService.mockResolvedValue(userMock);

    const res = await request(app)
      .post('/create-user')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'securepassword',
        role: roles.ADMIN,
      })
      .set('user', JSON.stringify({ role: roles.USER }));

    expect(res.status).toBe(403);
    expect(res.error.message).toBe('cannot POST /create-user (403)');
    expect(createUserService).not.toHaveBeenCalled();
  });

  it('should return 403 if a non-SUPERADMIN tries to create a SUPERADMIN', async () => {
    const res = await request(app)
      .post('/create-user')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepassword',
        role: roles.SUPERADMIN,
      })
      .set('user', JSON.stringify({ role: roles.ADMIN }));

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(
      'Forbidden: Only a SUPERADMIN can create another SUPERADMIN.',
    );
  });

  it('should return 403 if a non-ADMIN or non-SUPERADMIN tries to create a user', async () => {
    const res = await request(app)
      .post('/create-user')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepassword',
        role: roles.USER,
      })
      .set('user', JSON.stringify({ role: roles.USER }));

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(
      'Forbidden: Only SUPERADMIN or ADMIN can create users.',
    );
  });

  it('should return 403 if an ADMIN tries to create a user with a different domain', async () => {
    const res = await request(app)
      .post('/create-user')
      .send({
        name: 'John Doe',
        email: 'john@otherdomain.com',
        password: 'securepassword',
        role: roles.USER,
      })
      .set(
        'user',
        JSON.stringify({ role: roles.ADMIN, email: 'admin@mydomain.com' }),
      );

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(
      'Forbidden: Admins can only create users within their own organization.',
    );
  });

  it('should return 500 if createUserService throws an error', async () => {
    createUserService.mockRejectedValue(new Error('Internal Server Error'));

    const res = await request(app)
      .post('/create-user')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepassword',
        role: roles.ADMIN,
      })
      .set('user', JSON.stringify({ role: roles.SUPERADMIN }));

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
    expect(createUserService).toHaveBeenCalledTimes(1);
  });
});
