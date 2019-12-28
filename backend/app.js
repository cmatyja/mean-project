const path = require('path');
const express = require('express');

const bodyParcer = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');

const app_settings = require('./settings');

const connectURL = 'mongodb+srv://' + app_settings.database.login + ':'
  + app_settings.database.password + '@cluster0-1mheh.mongodb.net/' + app_settings.database.name + '?retryWrites=true&w=majority';
const connectConfig = {
  useNewUrlParser: true,
};
const app = express();

mongoose.connect(connectURL, connectConfig)
  .then(() => {
    console.log('Connecté à la base de données');
  })
  .catch(() => {
    console.log('La connection à la BDD a échoué');
  })
;

app.use(bodyParcer.json());
app.use(bodyParcer.urlencoded({extends: false}));
app.use('/images', express.static(path.join('backend/images'))); // autoriser les requetes du dossier Images

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept' +
    '');
  res.setHeader('Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  next();
});

app.use("/api/posts", postsRoutes);

module.exports = app;
