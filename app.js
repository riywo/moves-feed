
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var uuid = require('node-uuid');

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);
var Schema = mongoose.Schema;
var userSchema = new Schema({
  _id:          { type: Number, required: true },
  feedToken:    { type: String, required: true, unique: true },
  accessToken:  { type: String, required: true, unique: true },
  refreshToken: { type: String, required: true, unique: true }
});
var User = mongoose.model('User', userSchema);

var Shakes = require('shakes');
var moves = new Shakes({
    client_id:     process.env.MOVES_CLIENT_ID,
    client_secret: process.env.MOVES_CLIENT_SECRET,
    redirect_uri:  process.env.MOVES_REDIRECT_URI
});

var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
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

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(process.env.MOVES_CLIENT_SECRET));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
app.configure('development', function() {
  edt = require('express-debug');
  edt(app, { depth: 10 });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

function ensureValidFeedToken(req, res, next) {
  User.findOne({feedToken: req.query.token}, function(err, user) {
    if (err == null && user != null) {
      req.user = user;
      return next();
    } else {
      res.status(400).send('Invalid Token');
    }
  });
}

app.get('/', routes.index);
app.get('/auth',          passport.authenticate('moves', { scope: 'activity location' }));
app.get('/auth/callback', passport.authenticate('moves', {
  successRedirect: '/user',
  failuerRedirect: '/'
}));

app.get('/user',                 ensureAuthenticated,  user.index);
app.get('/user/summary.atom',    ensureValidFeedToken, user.summary);
app.get('/user/activities.atom', ensureValidFeedToken, user.activities);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
