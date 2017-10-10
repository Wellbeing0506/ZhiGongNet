var crypto = require('crypto');
//var p = crypto.createHash('sha1').update("OK").digest('hex');

var salt = "81324230-aafa-11e7-94b3-fbe9fca57371";
var password = "ttt"
var p = crypto.createHash('sha1').update(salt+password).digest('hex');
console.log(p);


/*
crypto.pbkdf2Sync('OK','salt',100000,128,'sha128',function(err,key){
	if(err){
		console.log(err);
	}
	else {
		console.log(key,key.toString('hex'));
	}
});
*/
