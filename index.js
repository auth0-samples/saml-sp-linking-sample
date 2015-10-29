'use strict';

const dotenv = require('dotenv');
dotenv.load()

const passport = require('./config/passport');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const _ = require('lodash');
const app = express();
const request = require('request-promise').defaults({
  baseUrl: 'https://' + process.env.AUTH0_DOMAIN + '/api/v2/',
  headers: {
    Authorization: 'Bearer ' + process.env.AUTH0_APIV2_TOKEN
  },
});

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(session({
  secret: 'foo',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.redirect('/login');
});

app.post('/login/callback',
  function(req, res, next) {
    if (!req.user) {
      passport.authenticate('saml')(req, res, next);
    } else {
      passport.authorize('saml')(req, res, next);
    }
  },
  function(req, res) {
    if (req.account) {
      const user_id = req.account['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      const provider = req.account['http://schemas.auth0.com/identities/default/provider'];
      request.post({
        url: 'users/' + encodeURIComponent(user_id) + '/identities',
        json: {
          provider: provider,
          user_id: user_id
        }
      }).then(function() {
        res.render('index', {
          user_id: user_id,
          user: req.user,
          account: req.account
        });
      }).catch(function(err) {
        res.status(err.statusCode).json(err.error);
      });
    } else if (req.user) {
      const user_id = req.user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      const provider = req.user['http://schemas.auth0.com/identities/default/provider'];
      res.render('index', {
        user_id: user_id,
        user: req.user
      });
    } else {
      res.redirect('/login');
    }
  }
);

app.get('/login',
  passport.authenticate('saml')
);

app.listen(3000, function() {
  console.log('Listening on port 3000');
});
