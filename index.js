'use strict';

const dotenv = require('dotenv');
dotenv.load()

const passport = require('./config/passport');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const request = require('request');

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
      console.log(req.account);
      let tenant                  = process.env.AUTH0_DOMAIN;
      let apiv2_token             = process.env.AUTH0_APIV2_TOKEN;
      let primary_account_user_id = encodeURIComponent(req.user.user_id); 

      request({
          url: 'https://' + tenant + '.auth0.com/api/v2/users/' + primary_account_user_id + '/identities', //URL to hit
          method: 'POST',
          headers: {Authorization: 'Bearer ' + apiv2_token },
          json: {
            provider: req.account.provider,
            user_id: req.account.user_id
          },
      }, function(error, response, body){
          console.log(body);
          if(error) {
              console.log(error);
          } else { 
              console.log(response.statusCode.toString(), body);
          }
      });
    }
    if (req.user) {
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
