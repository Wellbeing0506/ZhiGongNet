var Config = require('../config/sysConfig');
    config = new Config();
var log = require('tracer').colorConsole();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var redis = require('redis');
var client = redis.createClient(config.redis.port,config.redis.ip,config.redis.option);
client.on('ready',function(res){
      log.info("[SYS]Redis:","connecting");
});
client.on('error',function(err){
      log.error("[SYS]Redis:",err);
});
passport.use(new LocalStrategy(
  function(username,password,done){
    console.log(username,password,done);
  }
));

