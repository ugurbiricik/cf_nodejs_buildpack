const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const xsenv = require('@sap/xsenv');
const { createSecurityContext, requests, constants, TokenInfo, JWTStrategy } = require("@sap/xssec").v3;

const users = require('./users.json');
const app = express();

const services = xsenv.getServices({ uaa: 'nodeuaa' });

passport.use(new JWTStrategy(services.uaa));

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));

app.get('/users', function (req, res) {
  var isAuthorized = req.authInfo.checkLocalScope('Display');
  if (isAuthorized) {
    res.status(200).json(users);
  } else {
    res.status(403).send('Forbidden');
  }
});

app.post('/users', function (req, res) {
  const isAuthorized = req.authInfo.checkLocalScope('Update');
  if (!isAuthorized) {
    res.status(403).json('Forbidden');
    return;
  }

  var newUser = req.body;
  newUser.id = users.length;
  users.push(newUser);

  res.status(201).json(newUser);
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('myapp listening on port ' + port);
});
