var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var Config = require('./config/sysConfig');
		config = new Config();
var log = require('tracer').colorConsole();

var index = require('./routes/index');

var crypto = require('crypto');
var flash = require('connect-flash');
var Passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var helmet = require('helmet');
var moment = require('moment');

var app = express();

log.info("[SYS]ENV:",process.env.NODE_ENV,config);

var redis = require('redis');
var client = redis.createClient(config.redis.port,config.redis.ip,config.redis.option);
client.on('ready',function(res){
	log.info("[SYS]Redis:","connecting");
});
client.on('error',function(err){
	log.error("[SYS]Redis:",err);
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('combined', {skip: function (req, res) { return res.statusCode < 400 }}));

app.use(session({
  secret : 'davetest',
  name : 'sessionId',
  httpOnly : true,
  resave : false,
  saveUninitialized : false
}));
app.use(Passport.initialize());
app.use(Passport.session());
app.use(flash());
app.use(function(req,res,next){
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if(req.method === "POST" && req.url==="/"){
    if(req.body.remember === "yes") {
      req.session.cookie.maxAge = 30*24*60*60*1000;
    } else {
      req.session.cookie.expires = false;
    }
  }
  next();
});

Passport.serializeUser(function(user, done) {
	done(null, user);
});
Passport.deserializeUser(function(user, done) {
	done(null, user);
});

Passport.use('local-login',
  new LocalStrategy({
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true
  },function(req,username,password,done){
    client.hgetall(config.redis.keyHead+"_User_"+req.body.username,function(err,result){
      if(!result){
        return done(null,false,req.flash('LoginMessage',"User not found"));
      } else {
				if(req.session.checkcode === parseInt(req.body.vcode)) {
					var pass = crypto.createHash('sha1').update(result.salt+password).digest('hex');
					if(result.password === pass) {
						return done(null,{username:username,role:result.role});
					} else {
        		return done(null,false,req.flash('LoginMessage',"Password Wrong!"));
					}
				} else {
        	return done(null,false,req.flash('LoginMessage',"Vcode Wrong!"));
				}
      }
    });
  })
);


app.use('/', index);

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
