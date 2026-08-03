function roleMiddleware(...perfisPermitidos) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !perfisPermitidos.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}

module.exports = roleMiddleware;

