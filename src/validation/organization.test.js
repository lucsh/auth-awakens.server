import { validateOrganizationSchemaInput } from './organization.js';

// Mocking necessary components for Express middleware
const mockRequest = (body) => ({
  body,
});
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe('validateOrganizationSchemaInput Middleware', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Reset mock functions between tests
  });

  it('should call next() for valid input', () => {
    const req = mockRequest({ name: 'TestOrg', domain: 'test.org' });
    const res = mockResponse();

    validateOrganizationSchemaInput(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled(); // No errors
  });

  it('should return 400 with error details for missing name', () => {
    const req = mockRequest({ domain: 'test.org', name: '' }); // Missing name
    const res = mockResponse();

    validateOrganizationSchemaInput(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.any(Array), // Error object from Zod
    });
    const [errors] = res.json.mock.calls[0];

    expect(errors.error[0].message).toBe('Organization name is required');
  });

  it('should return 400 with error details for missing domain', () => {
    const req = mockRequest({ name: 'TestOrg' }); // Missing domain
    const res = mockResponse();

    validateOrganizationSchemaInput(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.any(Array),
    });
    const [errors] = res.json.mock.calls[0];
    expect(errors.error[0].message).toBe('Required');
  });

  it('should return 400 when body is empty', () => {
    const req = mockRequest({}); // Empty body
    const res = mockResponse();

    validateOrganizationSchemaInput(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.any(Array),
    });
    const [errors] = res.json.mock.calls[0];
    expect(errors.error.length).toBeGreaterThan(0);
  });
});
