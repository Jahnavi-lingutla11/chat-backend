const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader)
    return res.status(401).json({ msg: 'No token, authorization denied' });

  // Expecting header format: 'Bearer <token>'
  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({ msg: 'Token missing from header' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: user._id, iat, exp }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

module.exports = authMiddleware;
