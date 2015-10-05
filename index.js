var passport = require('passport');
var SamlStrategy = require('passport-saml').Strategy;
var express = require('express');
var app = express();

passport.use(new SamlStrategy(
    {
        issuer: 'urn:yvonne-test.auth0.com',
        path: '/login/callback',
        entryPoint: 'https://yvonne-test.auth0.com/samlp/M7usYUzW6t7YlhpCBRoPPfDaPfyFfgXZ'
    },
    function (profile, done) {
        console.log(profile);
        done(null, profile);
    }
));

app.use(passport.initialize());
app.use(passport.session());

app.post('/login/callback',
         passport.authenticate('saml', { failureRedirect: '/error', failureFlash: true }),
         function (req, res) {
             console.log(req);
             res.redirect('/');
         }
);

app.get('/login',
         passport.authenticate('saml', { failureRedirect: '/error', failureFlash: true }),
         function (req, res) {
             res.redirect('/');
         }
);

var server = app.listen(3000, function () {
    console.log('Listening on port 3000');
});
