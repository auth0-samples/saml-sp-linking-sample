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
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  if (req.isAuthenticated()) {
    res.render('index', req.user);
  } else {
    res.redirect('/login');
  }
});

app.post('/login/callback',
  passport.authenticate('saml', {
    failureRedirect: '/error',
    failureFlash: true
  }),
  function(req, res) {
    res.redirect('/');
  }
);

app.get('/login',
  passport.authenticate('saml', {
    failureRedirect: '/login',
    failureFlash: true
  })
);

app.get('/link',
  passport.authorize('saml', {
    failureRedirect: '/link',
    failureFlash: true
  })
);

const server = app.listen(3000, function() {
  console.log('Listening on port 3000');
});
