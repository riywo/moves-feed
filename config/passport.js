var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var uuid = require('node-uuid');

var moves = require('./moves');
var User = require('../models/user');

passport.use('moves', new OAuth2Strategy({
  authorizationURL: 'moves://app/authorize',
  tokenURL:         'https://api.moves-app.com/oauth/v1/access_token',
  clientID:         process.env.MOVES_CLIENT_ID,
  clientSecret:     process.env.MOVES_CLIENT_SECRET,
  callbackURL:      process.env.MOVES_REDIRECT_URL
}, function(accessToken, refreshToken, profile, done) {
  moves.get('userProfile', {}, accessToken, function(data) {
    User.findById(data.userId, function(err, user) {
      if (err) {
        return done(err, null);
      }

      if (user == null) {
        user = new User({
          _id:       data.userId,
          feedToken: uuid.v4()
        });
      }

      user.accessToken  = accessToken;
      user.refreshToken = refreshToken;
      user.save(function(err) {
        if (err) {
          return done(err, null);
        } else {
          return done(null, user)
        }
      });
    });
  });
}));

passport.serializeUser = function(user, done) {
  done(null, user.id);
}

passport.deserializeUser = function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
}

module.exports = passport;
