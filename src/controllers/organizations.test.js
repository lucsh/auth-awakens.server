import { getAllOrganizations, createOrganization } from './organizations.js';
import {
  fetchAllOrganizations,
  createNewOrganization,
} from '../services/organizations.js';
import { roles } from '../middleware/rbac';

// Mock the organization service module
jest.mock('../services/organizations.js');

// Utilities for mock request and response
const createMockResponse = () => {
  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
  return res;
};

const createMockRequest = (body = {}, user = {}) => ({
  body,
  user,
});

describe('Organization Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOrganizations', () => {
    it('should return all organizations on success', async () => {
      // Arrange
      const mockOrganizations = [
        { id: 1, name: 'Org1', domain: 'org1.com' },
        { id: 2, name: 'Org2', domain: 'org2.com' },
      ];
      fetchAllOrganizations.mockResolvedValue(mockOrganizations);

      const req = createMockRequest();
      const res = createMockResponse();

      // Act
      await getAllOrganizations(req, res);

      // Assert
      expect(fetchAllOrganizations).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockOrganizations);
      expect(res.status).not.toHaveBeenCalled(); // Ensures no error response was sent
    });

    it('should handle errors when fetching organizations', async () => {
      // Arrange
      const mockError = new Error('Database error');
      fetchAllOrganizations.mockRejectedValue(mockError);

      const req = createMockRequest();
      const res = createMockResponse();

      // Act
      await getAllOrganizations(req, res);

      // Assert
      expect(fetchAllOrganizations).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: mockError.message });
    });
  });

  describe('createOrganization', () => {
    it('should successfully create a new organization', async () => {
      // Arrange
      const reqBody = { name: 'New Org', domain: 'neworg.com' };
      const user = { email: 'admin@neworg.com', role: roles.SUPERADMIN };
      const mockOrganization = {
        id: 3,
        name: reqBody.name,
        domain: reqBody.domain,
      };
      createNewOrganization.mockResolvedValue(mockOrganization);

      const req = createMockRequest(reqBody, user);
      const res = createMockResponse();

      // Act
      await createOrganization(req, res);

      // Assert
      expect(createNewOrganization).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockOrganization);
    });

    it('should return 403 if the domain does not match and user is not SUPERADMIN', async () => {
      // Arrange
      const reqBody = { name: 'New Org', domain: 'notallowed.com' };
      const user = { email: 'user@allowed.com', role: roles.USER };

      const req = createMockRequest(reqBody, user);
      const res = createMockResponse();

      // Act
      await createOrganization(req, res);

      // Assert
      expect(createNewOrganization).not.toHaveBeenCalled(); // No call to the service
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error:
          'Forbidden: You can only create organizations under your domain.',
      });
    });

    it('should handle errors when creating an organization', async () => {
      // Arrange
      const reqBody = { name: 'New Org', domain: 'neworg.com' };
      const user = { email: 'admin@neworg.com', role: roles.SUPERADMIN };
      const mockError = new Error('Creation error');
      createNewOrganization.mockRejectedValue(mockError);

      const req = createMockRequest(reqBody, user);
      const res = createMockResponse();

      // Act
      await createOrganization(req, res);

      // Assert
      expect(createNewOrganization).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: mockError.message });
    });
  });
});
