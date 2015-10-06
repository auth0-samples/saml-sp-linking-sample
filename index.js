const passport = require('./config/passport');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

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

app.post('/login/callback',
  passport.authenticate('saml', {
    failureRedirect: '/error',
    failureFlash: true
  }),
  function(req, res) {
    res.send(req.user);
  }
);

app.get('/login',
  passport.authenticate('saml', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  function(req, res) {
    res.redirect('/');
  }
);

const server = app.listen(3000, function() {
  console.log('Listening on port 3000');
});
