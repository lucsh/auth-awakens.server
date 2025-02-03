export const roles = {
  SUPERADMIN: 'SUPERADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER',
  READ_ONLY: 'READ_ONLY',
};

export const authorize = (allowedRoles) => {
  console.log(allowedRoles);
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
