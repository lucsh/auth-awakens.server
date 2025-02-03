import { findUserByEmail, createUser } from './users.js';
import knex from '../config/knex.js';

// Mock the knex default export properly as a function
jest.mock('../config/knex.js', () => jest.fn());

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test to avoid cross-test interference
  });

  describe('findUserByEmail', () => {
    it('should return the user if a matching email is found', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      // Mock knex chain for `where().first()`
      const mockKnex = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValueOnce(mockUser),
      };

      knex.mockReturnValueOnce(mockKnex);

      const result = await findUserByEmail('john.doe@example.com');

      // Assertions
      expect(knex).toHaveBeenCalledWith('users');
      expect(mockKnex.where).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
      });
      expect(mockKnex.first).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if no user is found with the given email', async () => {
      const mockKnex = {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValueOnce(undefined),
      };

      knex.mockReturnValueOnce(mockKnex);

      const result = await findUserByEmail('jane.doe@example.com');

      // Assertions
      expect(knex).toHaveBeenCalledWith('users');
      expect(mockKnex.where).toHaveBeenCalledWith({
        email: 'jane.doe@example.com',
      });
      expect(mockKnex.first).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('createUser', () => {
    it('should insert a new user into the database and return it', async () => {
      const userInput = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'hashedpassword',
        organizationId: 2,
        role: 'user',
      };

      const newUser = {
        id: 42,
        name: userInput.name,
        email: userInput.email,
        organization_id: userInput.organizationId,
        role: userInput.role,
      };

      // Mock knex chain for `insert().returning()`
      const mockKnex = {
        insert: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValueOnce([newUser]),
      };

      knex.mockReturnValueOnce(mockKnex);

      const result = await createUser(userInput);

      // Assertions
      expect(knex).toHaveBeenCalledWith('users');
      expect(mockKnex.insert).toHaveBeenCalledWith({
        name: userInput.name,
        email: userInput.email,
        password: userInput.password,
        organization_id: userInput.organizationId,
        role: userInput.role,
      });
      expect(mockKnex.returning).toHaveBeenCalledWith([
        'id',
        'name',
        'email',
        'organization_id',
        'role',
      ]);
      expect(result).toEqual(newUser);
    });
  });
});
