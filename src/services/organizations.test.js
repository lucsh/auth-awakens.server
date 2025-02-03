import {
  fetchAllOrganizations,
  createNewOrganization,
} from './organizations.js'; // Adjust the path if necessary
import knex from '../config/knex'; // Mock this module

jest.mock('../config/knex'); // Mock knex

describe('Organization Service', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('fetchAllOrganizations', () => {
    it('should fetch all organizations from the database', async () => {
      // Mock data
      const mockOrganizations = [
        { id: 1, name: 'Org1', domain: 'org1.com' },
        { id: 2, name: 'Org2', domain: 'org2.com' },
      ];

      // Create mock chainable methods
      const selectMock = jest.fn().mockResolvedValue(mockOrganizations);
      const mockKnex = jest.fn(() => ({ select: selectMock }));

      knex.mockImplementation(mockKnex); // Use mock implementation

      // Call the function
      const organizations = await fetchAllOrganizations();

      // Assertions
      expect(knex).toHaveBeenCalledWith('organizations');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(organizations).toEqual(mockOrganizations);
    });
  });

  describe('createNewOrganization', () => {
    it('should insert a new organization and return the resulting record', async () => {
      // Mock input
      const newOrg = { name: 'NewOrg', domain: 'neworg.com' };
      // Mock output
      const mockInsertedOrganization = {
        id: 1,
        name: 'NewOrg',
        domain: 'neworg.com',
      };

      // Create mock chainable methods
      const returningMock = jest
        .fn()
        .mockResolvedValue([mockInsertedOrganization]);
      const insertMock = jest.fn(() => ({ returning: returningMock }));
      const mockKnex = jest.fn(() => ({ insert: insertMock }));

      knex.mockImplementation(mockKnex); // Use mock implementation

      // Call the function
      const createdOrganization = await createNewOrganization(newOrg);

      // Assertions
      expect(knex).toHaveBeenCalledWith('organizations');
      expect(insertMock).toHaveBeenCalledWith(newOrg);
      expect(returningMock).toHaveBeenCalledWith('*');
      expect(createdOrganization).toEqual(mockInsertedOrganization);
    });

    it('should throw an error if required data is missing', async () => {
      const incompleteData = { name: 'IncompleteOrg' };

      await expect(createNewOrganization(incompleteData)).rejects.toThrow(
        Error,
      );
    });
  });
});
