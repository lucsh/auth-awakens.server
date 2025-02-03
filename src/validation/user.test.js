import { userSchema, validateUserSchemaInput } from './user.js';

describe('userSchema Validation Tests', () => {
  it('should pass with valid input', () => {
    const validInput = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'securePassword123',
      role: 'ADMIN',
    };
    expect(() => userSchema.parse(validInput)).not.toThrow();
  });

  it('should fail if name is empty', () => {
    const invalidInput = {
      name: '',
      email: 'johndoe@example.com',
      password: 'securePassword123',
      role: 'ADMIN',
    };
    expect(() => userSchema.parse(invalidInput)).toThrowError(
      'Name is required',
    );
  });

  it('should fail if email is invalid', () => {
    const invalidInput = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'securePassword123',
      role: 'ADMIN',
    };
    expect(() => userSchema.parse(invalidInput)).toThrowError(
      'Invalid email format',
    );
  });

  it('should fail if role is not in allowed enum', () => {
    const invalidInput = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'securePassword123',
      role: 'INVALID_ROLE',
    };
    expect(() => userSchema.parse(invalidInput)).toThrowError();
  });

  it('should fail if any required field is missing', () => {
    const invalidInput = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      // Missing 'password' and 'role'
    };
    expect(() => userSchema.parse(invalidInput)).toThrowError();
  });
});

describe('validateUserSchemaInput Middleware Tests', () => {
  const mockReq = (body) => ({ body });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const mockNext = jest.fn();

  it('should call next() when input is valid', () => {
    const req = mockReq({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'securePassword123',
      role: 'USER',
    });
    const res = mockRes();

    validateUserSchemaInput(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.body).toEqual({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'securePassword123',
      role: 'USER',
    });
  });

  it('should return 400 if validation fails', () => {
    jest.clearAllMocks();

    const req = mockReq({
      name: '',
      email: 'invalid-email',
      password: 'securePassword123',
      role: 'INVALID_ROLE',
    });
    const res = mockRes();

    validateUserSchemaInput(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.any(Array),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return detailed error messages from Zod', () => {
    const req = mockReq({
      name: '',
      email: 'invalid-email',
    });
    const res = mockRes();

    validateUserSchemaInput(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.arrayContaining([
        expect.objectContaining({
          message: 'Name is required',
        }),
        expect.objectContaining({
          message: 'Invalid email format',
        }),
      ]),
    });
  });
});
