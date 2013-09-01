var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var passport = require('./config/passport');
var User = require('./models/user');

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
