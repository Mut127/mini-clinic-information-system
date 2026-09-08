const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Unauthorized: Token tidak ditemukan', {}, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return error(res, 'Unauthorized: Token tidak valid atau sudah expired', {}, 401);
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return error(res, 'Forbidden: Anda tidak memiliki akses', {}, 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };