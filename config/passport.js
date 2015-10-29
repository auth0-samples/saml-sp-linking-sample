const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
require('dotenv').load();

const issuer = 'urn:' + process.env.AUTH0_DOMAIN;
const entryPoint = 'https://' + process.env.AUTH0_DOMAIN + '/samlp/' + process.env.AUTH0_CLIENT_ID;

function strategyCallback(profile, done) {
  done(null, profile);
}

const loginStrategy = new SamlStrategy({
    issuer: issuer,
    path: '/login/callback',
    entryPoint: entryPoint,
  },
  strategyCallback
);

function processUser(user, done) {
  done(null, user);
}

passport.use('saml', loginStrategy);
passport.serializeUser(processUser);
passport.deserializeUser(processUser);

module.exports = passport;
