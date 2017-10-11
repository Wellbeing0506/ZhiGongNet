var express = require('express');
var nameList = require('../config/nameList.js');
var router = express.Router();
var Passport = require('passport');
var captchapng = require('captchapng');
var moment = require('moment');
var events = require('events');
var Config = require('../config/sysConfig'),
    config = new Config();
var redis = require('redis');
var client = redis.createClient(config.redis.port,config.redis.ip,config.redis.option);

var list = {};
router.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

/* remove Video */
router.post("/videoDelete",function(req,res){
	client.SREM(config.redis.keyHead+"_Category_"+req.body.removeType,req.body.removeVideo,function(err,result){
		client.DEL(config.redis.keyHead+"_Video_"+req.body.removeVideo,function(err1,result1){
			res.send({message:"success",data:req.body,result:result,result1,result1});
		});
	});
});

/* page for each category */
router.get("/each/:type/:id",function(req,res){
  client.HGETALL(config.redis.keyHead+"_Video_"+req.params.id,function(err,item){
    if(err) {
      console.log("[error] redis get video detail fail",err);
    } else {
  		if(req.session.passport){
	  		res.render('each.ejs',{nameList:nameList,user:req.session.passport.user, id:req.params.id,videoList : item,thisType : req.params.type});
  		}else{
		 	 	res.render('each.ejs',{nameList:nameList,user:{username:"",role:""}, id:req.params.id,videoList:item,thisType : req.params.type});
  		}
    }
  });
});

/* page for each category */
router.get("/page/:type",function(req,res){
  var thisList = {}
	var proxy = new events.EventEmitter();
	proxy.setMaxListeners(0);	
	var count = 0;
	proxy.on("each",function(message,id,detail,length) {
    if(message === "zero") {
  		if(req.session.passport){
	  		res.render('page.ejs',{nameList:nameList,user:req.session.passport.user, videoList : thisList,thisType : req.params.type});
  		}else{
		 	 	res.render('page.ejs',{nameList:nameList,user:{username:"",role:""}, videoList:thisList,thisType : req.params.type});
  		}
    }
    thisList[id] = detail;
		count = (message === "success") ? count+1 : count;	
		if(count === length) {
  		if(req.session.passport){
	  		res.render('page.ejs',{nameList:nameList,user:req.session.passport.user, videoList : thisList,thisType : req.params.type});
  		}else{
		 	 	res.render('page.ejs',{nameList:nameList,user:{username:"",role:""}, videoList:thisList,thisType : req.params.type});
  		}
		}
	});
	client.SMEMBERS(config.redis.keyHead+"_Category_"+req.params.type,function(err,result) {
		if(err) { 
			console.log("error",err);
			proxy.emit("each","error");
		} else {
			if(result.length > 0) {
			result.forEach(function(thisOne) {
      	client.HGETALL(config.redis.keyHead+"_Video_"+thisOne,function(err,item){
      	  if(err) {
      	    console.log("[error] redis get video detail fail",err);
      	    proxy.emit('each',"error");
      	  } else {
      	    proxy.emit("each","success",thisOne,item,result.length);
      	  }
      	});
			});
			}else {
				proxy.emit("each","zero");
			}
		}
	});
});

/* GET home page. */
router.get('/', function(req, res) {
	list = {};
	var proxy = new events.EventEmitter();
	proxy.setMaxListeners(0);	
	var count = 0;
	var zero_count = 0;
	var final_count = 0;
	proxy.on("final",function(message){
		final_count++;	
		if( final_count> 1 && final_count === Object.keys(nameList).length) {
  		if(req.session.passport){
	  		res.render('index.ejs',{nameList:nameList,user:req.session.passport.user, videoList : list});
  		}else{
		 	 	res.render('index.ejs',{nameList:nameList,user:{username:"",role:""}, videoList:list});
  		}
		}
	});
	proxy.on("each",function(message,type,item,result) {
		count = (message === "success") ? count+1:count;	
		zero_count = (message === "zero") ? zero_count+1:zero_count;	
		list[type]= (list.hasOwnProperty(type)) 
				? list[type] 
				: {};
		list[type][item] = (list[type].hasOwnProperty(item)) 
				? list[type][item]
				: result;
		if(message === "error") {
			proxy.emit("final","error");
  	}else {
			proxy.emit("final","OK");
		}
	});
	var total_length = 0;
	var zero_length = 0;
	Object.keys(nameList).forEach(function(i,e){
		client.SMEMBERS(config.redis.keyHead+"_Category_"+i,function(err,result) {
			if(err) { 
				proxy.emit("each","error",i,err) ;
			} else {
				if(result.length > 0) {
				total_length += result.length;
				result.forEach(function(thisOne) {
        	client.HGETALL(config.redis.keyHead+"_Video_"+thisOne,function(err,item){
        	  if(err) {
        	    console.log("[error] redis get video detail fail",err);
        	    proxy.emit('each',"error");
        	  } else {
        	    proxy.emit("each","success",i,thisOne,item);
        	  }
        	});
				});
				}else {
							zero_length++;
        	    proxy.emit("each","zero");
				}
			}
		});
	});
});


/* login page */
router.get('/login',function(req,res) {
      res.render('login.ejs',{message:req.flash('LoginMessage'),nameList:nameList,user:{username:"",role:""}});
});
router.post('/login',
    Passport.authenticate('local-login',{
      successRedirect : '/',
      failureRedirect : '/login',
      failureFlash : true,
    })
);

/* validation png */ 
router.get('/captcha.png',function(req,res){
	var vcode = parseInt(Math.random()*9000+1000);
	req.session.checkcode = vcode;
	var p = new captchapng(66,20,vcode);
	p.color(99,109,129,168);
	p.color(80,80,80,255);
	var img = p.getBase64();
	var imgbase64 = new Buffer(img,'base64');
	res.writeHead(200,{
		'Content-Type' : 'image/png'
	});
	res.end(imgbase64);
});

/* profile */
router.get('/profile',isLoggedIn,function(req,res){
	client.HGETALL(config.redis.keyHead+"_User_"+req.session.passport.user.username,function(err,result){
		if(err) {
			res.render('profile.ejs',{nameList:nameList,user:req.session.passport.user,userList:{}});
		} else {
			res.render('profile.ejs',{nameList:nameList,user:req.session.passport.user,userList:result});
		}
	});
});
router.post('/updateProfile',function(req,res){
	var phone = req.body.phone;
	var email = req.body.email;
	var username = req.body.username;
	client.HMSET(config.redis.keyHead+"_User_"+username,"phone",phone,"email",email,function(err,result){
		if(err){
			console.log("update Profile",err);
		}
	});
});

/* message */
router.post('/message',function(req,res){
	var now=moment().format('YYYY-MM-DD h:mm:ss');
	req.body["time"] = now;
	client.LPUSH(config.redis.keyHead+"_Message",JSON.stringify(req.body),function(err,result){
		if(err) {
		console.log("message fail",err);
		res.send({message:"fail",data:err});

		} else {
		res.send({message:"success",data:"OK"});
		}
	});	
});

/* logout */ 
router.get('/logout',function(req,res){
  req.logout();
  req.session.passport = {user:{username:"",role:""}};
  res.render('index.ejs',{nameList:nameList,user:{username:"",role:""}, videoList:list});
});

/* video management */ 
router.get('/videoManagement',isLoggedIn,function(req,res){
	var list = {};
	var proxy = new events.EventEmitter();
	proxy.setMaxListeners(0);	
	var count = 0;
	var zero_count = 0;
	var final_count = 0;
	proxy.on("final",function(message){
		final_count++;	
		if( final_count> 1 && final_count === Object.keys(nameList).length) {
  		if(req.session.passport){
	  		res.render('videoManagement.ejs',{nameList:nameList,user:req.session.passport.user, videoList : list});
  		}else{
		 	 	res.render('videomanagement.ejs',{nameList:nameList,user:{username:"",role:""}, videoList:list});
  		}
		}
	});
	proxy.on("each",function(message,type,item,result) {
		count = (message === "success") ? count+1:count;	
		zero_count = (message === "zero") ? zero_count+1:zero_count;	
		list[type]= (list.hasOwnProperty(type)) 
				? list[type] 
				: {};
		list[type][item] = (list[type].hasOwnProperty(item)) 
				? list[type][item]
				: result;
		if(message === "error") {
			proxy.emit("final","error");
  	}else {
			proxy.emit("final","OK");
		}
	});
	var total_length = 0;
	var zero_length = 0;
	Object.keys(nameList).forEach(function(i,e){
		client.SMEMBERS(config.redis.keyHead+"_Category_"+i,function(err,result) {
			if(err) { 
				proxy.emit("each","error",i,err) ;
			} else {
				if(result.length > 0) {
				total_length += result.length;
				result.forEach(function(thisOne) {
        	client.HGETALL(config.redis.keyHead+"_Video_"+thisOne,function(err,item){
        	  if(err) {
        	    console.log("[error] redis get video detail fail",err);
        	    proxy.emit('each',"error");
        	  } else {
        	    proxy.emit("each","success",i,thisOne,item);
        	  }
        	});
				});
				}else {
							zero_length++;
        	    proxy.emit("each","zero");
				}
			}
		});
	});

});

/* vidoe list */
router.get('/videoList/:type',function(req,res){
	var proxy = new events.EventEmitter();
	proxy.setMaxListeners(0);	
	var count = 0;
	var list = {};
	proxy.on("detail",function(message,item,detail,each,len){
		count = (message === "success") ? count+1 : count;	
		list[item] = detail;
		if(message === "error" ){
			res.send({message:"error",data:"video list fail"});
			proxy.removeListener("detail",function(){console.log("redis wrong");});
		}
		if(count === len) {
			proxy.removeListener("detail",function(){console.log("redis done");});
			res.send({message:"success",data:list});
		}
	});
	client.SMEMBERS(config.redis.keyHead+"_Category_"+req.params.type,function(err,result){
		if(err) {
			res.send({message:"error",data:"video list fail"});
		} else {
			for(var i in result) {
				client.HGETALL(config.redis.keyHead+"_Video_"+result[i],function(err,item){
					if(err) {
    	      console.log("[error] redis get video detail fail",err);
    	      proxy.emit('detail',"error");		
					} else {
						proxy.emit("detail","success",result[i],item,i,result.length);
					}
				});
			}	
		}
	});
});


/* add vidoe */
router.post('/videoAdd',function(req,res){
	var proxy = new events.EventEmitter();
	proxy.setMaxListeners(0);	
	var count = 0;
	var now=moment().format('YYYY-MM-DD h:mm:ss');
	var thisUser = JSON.parse(req.body.thisUser);
	if(thisUser.role === "admin") {
		var regular = /id_(\S{15})==/;
		var test = regular.test(req.body.videoURL);
		var id = regular.exec(req.body.videoURL);
		if(regular.test(req.body.videoURL)){
			proxy.on('close',function(message){
				count = (message === "success") ? count+1 : count;
				if(message === "error") {
					res.send({message:"error",data:"video insert wrong"});
					proxy.removeListener('close',function(){
						console.log("redis wrong");
					});
				}
				if(count === 2) {
					res.send({message:"success",data:"video done"});
				}
			});
			/* add id into category video ste */
			client.SADD(config.redis.keyHead+"_Category_"+req.body.type,id[1],function(err,result){
				if(err) {
					console.log("[error] redis insert catergory fail",err);	
					proxy.emit('close',"error");
				} else {
					proxy.emit('close',"success");
				}
			});
			/* add vidoe info into vidoe hash */
			var videoHash = ["name",req.body.videoName, "description",req.body.videoDescription, "creater",thisUser.username,"createdTime",now,"sourceFrom","YouKu"];
			client.HMSET(config.redis.keyHead+"_Video_"+id[1],videoHash,function(err,result) {
				if(err) {
					console.log("[error] redis hash fail",err);	
					proxy.emit('close',"error");
				} else {
					proxy.emit('close',"success");
				}
			});
		} else {
			res.send({message:"fail",data:"video URL is wrong!"});
		}
	} else {
		res.send({message:"fail",data:"you done't have permission to access"});
	}
});


/* isLoggedIn function */
function isLoggedIn(req,res,next){
  if(req.isAuthenticated())
    return next();
  res.redirect('/login');
}

module.exports = router;
