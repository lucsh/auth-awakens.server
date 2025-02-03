import { roles, authorize } from './rbac.js';

describe('Roles Object', () => {
  it('should contain the correct role values', () => {
    expect(roles).toEqual({
      SUPERADMIN: 'SUPERADMIN',
      ADMIN: 'ADMIN',
      USER: 'USER',
      READ_ONLY: 'READ_ONLY',
    });
  });
});

describe('Middleware: authorize', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: null, // Default user is null
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 403 if user is not authenticated (req.user is null)', () => {
    const middleware = authorize([roles.ADMIN, roles.USER]);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if user role is not in allowedRoles', () => {
    req.user = { role: 'unknown_role' }; // A role not in allowedRoles
    const middleware = authorize([roles.ADMIN, roles.USER]);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if user role is in allowedRoles', () => {
    req.user = { role: roles.ADMIN }; // A valid role
    const middleware = authorize([roles.ADMIN, roles.USER]);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should support multiple roles in allowedRoles', () => {
    req.user = { role: roles.USER }; // Another valid role
    const middleware = authorize([roles.ADMIN, roles.USER]);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 403 if allowedRoles is empty', () => {
    req.user = { role: roles.SUPERADMIN };
    const middleware = authorize([]);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });
});
