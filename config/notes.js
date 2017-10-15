//pass : admin
//HMSET 
  ZhiGongNet_User_admin 
  username "admin" 
  password "cb7c07e59c17643a060d6f6e8750a44b7a82c18b" 
  salt "81324230-aafa-11e7-94b3-fbe9fca57371" 
  createdTime "2017-10-07 09:00:00" 
  email "wellbeing0506@icloud.com" 
  phone "+86-159-1981-1321" 
  role "admin" 
  deposite 0 
//HMSET ZhiGongNet_User_test username "test" password "eb1f70f58e18fa6125219164e0abf3247700072b" salt "81324230-aafa-11e7-94b3-fbe9fca57371" createdTime "2017-10-07 09:00:00" email "wellbeing0506@icloud.com" phone "+86-159-1981-1321" role "user" deposite 0 
//SADD ZhiGongNet_Users admin test
//redis-cli -a 'qwe123QWE!@#'
module.exports = {
	admin : {
		username : "admin",
		password : "cb7c07e59c17643a060d6f6e8750a44b7a82c18b",
		salt : "81324230-aafa-11e7-94b3-fbe9fca57371",
		createdTime : "2017-10-07 09:00:00",
    deposite : 0
		email : "wellbeing0506@icloud.com",
		phone : "+86-159-1981-1321",
		role : "admin",
    project : "oc login https://api.starter-us-west-2.openshift.com",
    access : "oc project zhigongnet",
    stat : "oc status"
	}
	video : {
		name : "demoVide",
		description : "demo video for test CURD mechanism",
		creater : "user",
		createdTime "now",
		sourceFrom "YouKu",
		url : "http://m.youku.com/video/id_XMzA3MzQ1NTY0OA==_ev1.html?spm=a2hww.20020887.m_205902.5~5~5~5~5~5~5~A"
	}
};
