const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app_settings = require('../settings');

const User = require('../models/user');

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user.save()
        .then(result => {
          res.status(201).json({
            message: 'Utilisateur créé',
            result: result
          });
        })
        .catch(err => {
          res.status(500).json({
            message: 'Email et/ou mot de passe invalide'
          });
        });
    })
};

exports.userLogin = (req, res, next) => {
  let userConnected;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: 'Email et/ou mot de passe incorrect'
        })
      }
      userConnected = user;
      bcrypt.compare(req.body.password, user.password)
        .then(result => {
          if (!result) {
            return res.status(401).json({
              message: 'Email et/ou mot de passe incorrect'
            });
          }
          const token = jwt.sign(
            { email: userConnected.email, userId: userConnected._id },
            app_settings.security.hash_string,
            { expiresIn: '1h' });
          res.status(200).json({
            message: 'Authentification réussie',
            token: token,
            expiresIn: 3600,
            userId: userConnected._id
          })
        })
        .catch(err => {
          return res.status(401).json({
            message: 'Email et/ou mot de passe incorrect'
          });
        });
    })
};
