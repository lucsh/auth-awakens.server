import { findOrCreateOrganization } from './organizations.js';
import knex from '../config/knex.js';

// Mock the knex default export properly as a function
jest.mock('../config/knex.js', () => jest.fn());

describe('findOrCreateOrganization', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test to avoid state bleed
  });

  it('should return an organization if it already exists', async () => {
    const mockOrganization = {
      id: 1,
      name: 'example.com',
      domain: 'example.com',
    };

    // Mock the knex query chain for `where().first()`
    const mockKnex = {
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValueOnce(mockOrganization),
    };

    knex.mockReturnValueOnce(mockKnex); // Return the mock implementation for this test

    const result = await findOrCreateOrganization('example.com');

    // Verify knex structure and behavior
    expect(knex).toHaveBeenCalledWith('organizations');
    expect(mockKnex.where).toHaveBeenCalledWith({ domain: 'example.com' });
    expect(mockKnex.first).toHaveBeenCalled();
    expect(result).toEqual(mockOrganization);
  });

  it('should create an organization if it does not already exist', async () => {
    const domain = 'newdomain.com';
    const newOrganization = { id: 2, name: domain, domain: domain };

    // Mock the knex query chain for `where().first()` -> undefined (no match)
    const mockKnexFind = {
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValueOnce(undefined),
    };

    knex.mockReturnValueOnce(mockKnexFind); // First knex call for find

    // Mock the knex query chain for `insert().returning()`
    const mockKnexInsert = {
      insert: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValueOnce([newOrganization]),
    };

    knex.mockReturnValueOnce(mockKnexInsert); // Second knex call for insert

    const result = await findOrCreateOrganization(domain);

    // Verify knex structure and behavior
    expect(knex).toHaveBeenCalledWith('organizations');
    expect(mockKnexFind.where).toHaveBeenCalledWith({ domain });
    expect(knex).toHaveBeenCalledWith('organizations'); // For insert
    expect(mockKnexInsert.insert).toHaveBeenCalledWith({
      name: domain,
      domain,
    });
    expect(mockKnexInsert.returning).toHaveBeenCalledWith('*');
    expect(result).toEqual(newOrganization);
  });
});
