import bcrypt from 'bcrypt';
import { createUserService } from './users.js';
import { createUser, findUserByEmail } from '../models/users.js';
import { findOrCreateOrganization } from '../models/organizations.js';

jest.mock('../models/users.js', () => ({
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
}));

jest.mock('../models/organizations.js', () => ({
  findOrCreateOrganization: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('createUserService', () => {
  const mockUserInput = {
    name: 'John Doe',
    email: 'test@example.com',
    password: 'password123',
    role: 'admin',
    userDomain: 'example.com',
  };

  const mockOrganization = { id: 1, domain: 'example.com' };
  const mockCreatedUser = {
    id: 1,
    name: 'John Doe',
    email: 'test@example.com',
    hashedPassword: 'hashedpassword123',
    organizationId: 1,
    role: 'admin',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a user successfully', async () => {
    // Mock dependencies
    findOrCreateOrganization.mockResolvedValue(mockOrganization);
    bcrypt.hash.mockResolvedValue('hashedpassword123');
    findUserByEmail.mockResolvedValue(null); // No pre-existing user
    createUser.mockResolvedValue(mockCreatedUser);

    // Execute service
    const result = await createUserService(mockUserInput);

    // Verify results
    expect(findOrCreateOrganization).toHaveBeenCalledWith(
      mockUserInput.userDomain,
    );
    expect(bcrypt.hash).toHaveBeenCalledWith(mockUserInput.password, 10);
    expect(findUserByEmail).toHaveBeenCalledWith(mockUserInput.email);
    expect(createUser).toHaveBeenCalledWith({
      name: mockUserInput.name,
      email: mockUserInput.email,
      password: 'hashedpassword123',
      organizationId: mockOrganization.id,
      role: mockUserInput.role,
    });
    expect(result).toEqual(mockCreatedUser);
  });

  it('should throw an error if user already exists', async () => {
    // Mock dependencies
    findOrCreateOrganization.mockResolvedValue(mockOrganization);
    findUserByEmail.mockResolvedValue(mockCreatedUser); // User already exists

    // Execute service and verify results
    await expect(createUserService(mockUserInput)).rejects.toThrow(
      'User with this email already exists.',
    );

    expect(findUserByEmail).toHaveBeenCalledWith(mockUserInput.email);
    expect(createUser).not.toHaveBeenCalled(); // Ensure user creation is skipped
  });

  it('should throw an error if organization creation fails', async () => {
    // Mock the organization model to throw an error
    findOrCreateOrganization.mockRejectedValue(
      new Error('Organization creation failed.'),
    );

    // Execute service and verify
    await expect(createUserService(mockUserInput)).rejects.toThrow(
      'Organization creation failed.',
    );

    expect(findOrCreateOrganization).toHaveBeenCalledWith(
      mockUserInput.userDomain,
    );
    expect(createUser).not.toHaveBeenCalled();
  });

  it('should throw an error if password hashing fails', async () => {
    // Mock dependencies
    findOrCreateOrganization.mockResolvedValue(mockOrganization);
    bcrypt.hash.mockRejectedValue(new Error('Password hashing failed.'));

    // Execute service and verify
    await expect(createUserService(mockUserInput)).rejects.toThrow(
      'Password hashing failed.',
    );

    expect(bcrypt.hash).toHaveBeenCalledWith(mockUserInput.password, 10);
    expect(createUser).not.toHaveBeenCalled();
  });

  it('should throw an error if user creation in the database fails', async () => {
    // Mock dependencies
    findOrCreateOrganization.mockResolvedValue(mockOrganization);
    bcrypt.hash.mockResolvedValue('hashedpassword123');
    findUserByEmail.mockResolvedValue(null); // No pre-existing user
    createUser.mockRejectedValue(new Error('Database error'));

    // Execute service and verify results
    await expect(createUserService(mockUserInput)).rejects.toThrow(
      'Database error',
    );

    expect(createUser).toHaveBeenCalledWith({
      name: mockUserInput.name,
      email: mockUserInput.email,
      password: 'hashedpassword123',
      organizationId: mockOrganization.id,
      role: mockUserInput.role,
    });
  });
});
