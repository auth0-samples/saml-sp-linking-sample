var passport = require('passport');
var SamlStrategy = require('passport-saml').Strategy;
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();

function normalize(user) {
    return {
        id: user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        email: user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
    };
}

passport.use(new SamlStrategy(
    {
        issuer: 'urn:yvonne-test.auth0.com',
        path: '/login/callback',
        entryPoint: 'https://yvonne-test.auth0.com/samlp/M7usYUzW6t7YlhpCBRoPPfDaPfyFfgXZ'
    },
    function (profile, done) {
        console.log(profile);
        console.log(normalize(profile));
        done(null, normalize(profile));
    }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({ secret: 'foo', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.post('/login/callback',
         passport.authenticate('saml', { failureRedirect: '/error', failureFlash: true }),
         function (req, res) {
             console.log(req);
             res.sendStatus(200);
         }
);

app.get('/login',
         passport.authenticate('saml', { failureRedirect: '/login', failureFlash: true })
);

var server = app.listen(3000, function () {
    console.log('Listening on port 3000');
});
