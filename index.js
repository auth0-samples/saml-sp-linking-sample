'use strict';

const dotenv = require('dotenv');
dotenv.load()

const passport = require('./config/passport');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const request = require('request-promise').defaults({
  baseUrl: 'https://' + process.env.AUTH0_DOMAIN + '/api/v2/',
  headers: { Authorization: 'Bearer ' + process.env.AUTH0_APIV2_TOKEN },
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
      let primary_account_user_id = encodeURIComponent(req.user.user_id);
      request.post({
          url: 'users/' + primary_account_user_id + '/identities',
          json: {
            provider: req.account.provider,
            user_id: req.account.user_id
          }
      }).then(function(user) {
        res.render('index', {user: user, account: req.account});
      }).catch(function(err) {
        console.log(err);
        res.status(err.statusCode).json(err.error);
      });
    } else if (req.user) {
      let result = {
        user: req.user,
        account: req.account
      };
      res.render('index', result);
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
