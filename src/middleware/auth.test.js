import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import knex from '../config/knex';
import { authenticateToken, authenticateUser } from './auth.js';
import { JWT_SECRET } from '../config/config.js';

jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('../config/knex', () => jest.fn()); // Mock knex as a function

describe('Middleware: authenticateToken', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {},
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 401 if no token is provided', () => {
    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Authorization token is required',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should get the token from cookies if not present in headers', () => {
    req.cookies.token = 'test_token';
    jwt.verify.mockImplementation((token, secret, callback) =>
      callback(null, { id: 1 }),
    );

    authenticateToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      'test_token',
      JWT_SECRET,
      expect.any(Function),
    );
    expect(req.user).toEqual({ id: 1 });
    expect(next).toHaveBeenCalled();
  });

  it('should return 403 if token verification fails', () => {
    req.headers.authorization = 'Bearer invalid_token';
    jwt.verify.mockImplementation((token, secret, callback) =>
      callback(new Error('Invalid token')),
    );

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid or expired token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next and set user if token is valid', () => {
    req.headers.authorization = 'Bearer valid_token';
    const mockUser = { id: 123, email: 'test@example.com' };
    jwt.verify.mockImplementation((token, secret, callback) =>
      callback(null, mockUser),
    );

    authenticateToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      'valid_token',
      JWT_SECRET,
      expect.any(Function),
    );
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });
});

describe('Function: authenticateUser', () => {
  const email = 'test@example.com';
  const password = 'password123';

  let knexMockWhere, knexMockFirst;

  beforeEach(() => {
    // Mock chainable knex methods
    knexMockWhere = jest.fn().mockReturnThis(); // Mock `.where()` to chain
    knexMockFirst = jest.fn(); // Mock `.first()` for specific cases

    // Mock the knex function itself to return chainable methods
    knex.mockImplementation(() => ({
      where: knexMockWhere,
      first: knexMockFirst,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if no user is found', async () => {
    // Simulate `.first()` returning null (no user found)
    knexMockFirst.mockResolvedValueOnce(null);

    const user = await authenticateUser(email, password);

    expect(knex).toHaveBeenCalledWith('users'); // Assert table selection
    expect(knexMockWhere).toHaveBeenCalledWith({ email }); // Assert `where` clause
    expect(knexMockFirst).toHaveBeenCalled(); // Assert `first` was called
    expect(user).toBeNull(); // Expect no user
  });

  it('should return null if password does not match', async () => {
    // Simulate `.first()` returning a valid user
    knexMockFirst.mockResolvedValueOnce({
      id: 1,
      email,
      password: 'hashed_password',
    });
    bcrypt.compare.mockResolvedValueOnce(false); // Mock bcrypt mismatch

    const user = await authenticateUser(email, password);

    expect(bcrypt.compare).toHaveBeenCalledWith(password, 'hashed_password'); // Assert bcrypt check
    expect(user).toBeNull(); // Expect null due to password mismatch
  });

  it('should return the user if email and password match', async () => {
    // Simulate `.first()` returning a valid user
    knexMockFirst.mockResolvedValueOnce({
      id: 1,
      email,
      password: 'hashed_password',
    });
    bcrypt.compare.mockResolvedValueOnce(true); // Mock bcrypt match

    const user = await authenticateUser(email, password);

    expect(knexMockWhere).toHaveBeenCalledWith({ email }); // Assert `where` clause
    expect(bcrypt.compare).toHaveBeenCalledWith(password, 'hashed_password'); // Assert bcrypt check
    expect(user).toEqual({ id: 1, email, password: 'hashed_password' }); // Expect the user
  });

  it('should throw an error if knex query fails', async () => {
    // Simulate `.first()` throwing an error
    knexMockFirst.mockRejectedValueOnce(new Error('Database error'));

    await expect(authenticateUser(email, password)).rejects.toThrow(
      'Authentication failed',
    );

    expect(knex).toHaveBeenCalledWith('users'); // Assert table selection
    expect(knexMockWhere).toHaveBeenCalledWith({ email }); // Assert where clause
    expect(knexMockFirst).toHaveBeenCalled(); // Assert `first` was called
  });
});
