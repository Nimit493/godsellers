var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var client = require('twilio')('AC14e6e781ac71d95e371a849369ae48f1','632122e2975bce6a8a66ea48de33ee4c');
var cloudinary = require('cloudinary');
var multer = require('multer');

cloudinary.config({
	cloud_name : 'dx4smoqgc',
	api_key: '691337517113189',
	api_secret : 'yqyyu8NefIekkAVNPwV790PZFX4'
});


mongoose.connect(config.mongoURL);
var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',function(){
	console.log('connected to the server');
});


var routes = require('./routes/index');
var godSellers = require('./routes/godsellers');
//var pictures = require('./routes/pictures');
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

var admin = require('./models/admin');
app.use(passport.initialize());
passport.use(new LocalStrategy(admin.authenticate()));
passport.serializeUser(admin.serializeUser());
passport.deserializeUser(admin.deserializeUser());



app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/godsellers',godSellers);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});


module.exports = app;
