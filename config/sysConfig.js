
module.exports = function(){
	if(process.env.NODE_ENV === 'development' ) {
			return {redis : {
				ip : "10.129.4.99",
				port : 6379,
				option : {},
				keyHead : "ZhiGongNet"
			}};
	} else if (process.env.NODE_ENV==='production') {
			return {redis : {
				ip : "172.31.23.229",
				port : 6379,
				option : {auth_pass:'qwe123QWE!@#'},
				keyHead : "ZhiGongNet"
			}};
	} else {
			return {redis : {
				ip : "localhost",
				port : 6379,
				option : {},
				keyHead : "ZhiGongNet"
			}};
  }
};
