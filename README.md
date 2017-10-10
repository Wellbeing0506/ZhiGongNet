# TaNaData
TaNaData

Based on nodejs, cassandra, and redis for Openshift

### Run Server 
for Developement 
```
npm run dev
```

for Production 
```
npm run start 
```

for MacDev 
```
npm run mac
```


### Dev Document 
1. Redis Key Namespace 

  - ZhiGongNet_Users : Set Type 
```javascript
['admin','test',...]
```

  - ZhiGongNet_User_NAME : Hash Type
```javascript
{ 
  username:"UserName", 
  password:"UserPasswordWithSaltHash", 
  salt : "saltByTimeHash"
  createdTime:"2017-10-06 00:00:00", 
  email:"UserEmail@mail.com", 
  phone:"UserPhoneNumber", 
  deposit : 0,
  role :"admin/user"
}
```

  - ZhiGongNet_Category_Category : Set Type
```javascript
['videoID1','videoID2',...]
```

  - ZhiGongNet_Video_videoID1 : Hash Type
```javascript
{
  name : "videoTitle",
  description : "videoDescription",
  creater : "whoAdd",
  createdTime : "2017-10-06 00:00:00",
  sourceFrom : "YouKu"
}
```



