const jwt = require('jsonwebtoken');

const app_settings = require('../settings');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodeToken = jwt.verify(token, app_settings.security.hash_string);
    req.userData = {email: decodeToken.email, userId: decodeToken.userId};
    next();
  } catch (error) {
    res.status(401).json({message: 'Vous devez être connecté pour effectuer cette action'});
  }
};
