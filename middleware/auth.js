const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ msg: 'No token, authorization denied' });

  const token = authHeader.split(' ')[1]; // get the token part

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid or expired' });
  }
}

module.exports = authMiddleware;

