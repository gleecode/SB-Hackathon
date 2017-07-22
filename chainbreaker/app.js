var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');

var index = require('./routes/index');
var users = require('./routes/users');
var chain = require('./routes/chain');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/chain', chain);

app.use(session({
  cookieName: 'hecks',
  secret: 'amanaplanacanalpanama',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

app.use(function(req, res, next) {
  if (req.hecks.user && req.hecks.pass) {
    res.setHeader('X-Seen-You', 'true');
  } else {
    // setting a property will automatically cause a Set-Cookie response
    // to be sent
    req.hecks.user = req.body.user;
    req.hecks.pass = req.body.pass
    res.setHeader('X-Seen-You', 'false');
  }
});

app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    user = userKnown(req.session.user.email);
    if (user) {
      req.user = user;
      delete req.user.password; // delete the password from the session
      req.session.user = user;  //refresh the session value
      res.locals.user = user;
    }
    // finishing processing the middleware and run the route
    next();
  } else {
    next();
  }
});

var requireLogin = function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
};

app.use(requireLogin);

function userKnown(emailAddr){
    users.forEach(function(user){
        if(user.emailaddr == emailAddr){
            return user;
        }
    });
    return null;
}

var users = [
    {username:'test', emailaddr:'test@test.com', password: 'password'},
    {username:'test1', emailaddr:'test1@test.com', password: 'password1'},
    {username:'test2', emailaddr:'test2@test.com', password: 'password2'}
];

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
