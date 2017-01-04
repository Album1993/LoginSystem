var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/userinfo')
var userinfo = require('./userinfo/UserInfo.js')
var pbkdf2 = require('pbkdf2');
let salt = "akkasalt";

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

app.use(function(req,res,next) {
	if (req.body.password) {
		var password = req.body.password;
		var newpassword = pbkdf2.pbkdf2Sync(password, salt, 1, 20, 'sha256');
		req.body.password = newpassword;
	}
	next();
});

//登陆
app.post('/user/:name/login',function(req,res) {
	userinfo.findOne({name:req.params.name, password : req.body.password} , function(err,user) {
	 if (user) {
		 res.json({'message' : 'login success'});
	 } else {
		 res.json({'message' : 'error username or password'});
	 }
 });
});

// 注册用户
app.post('/user/:name',function(req,res) {
	 userinfo.findOne({'name':req.params.name} , function(err,user) {
		if (!user) {
			new userinfo({
				name:req.params.name,
				password:req.body.password,
				email:req.body.email,
			}).save(function(err) {
				if (err) {
					res.send(err);
				} else {
					res.json({'message' : 'success'})
				}
			});
		} else {
			res.json({'message' : 'has user'});
		}
	});
});

// 更新用户信息
app.put('/user/:email',function(req,res) {
	userinfo.update({email:req.params.email},
									{$set: {'name': req.body.name ,'password': req.body.password}},
									{upsert:true},
									function(err){
										if(err) {
											res.send(err.stack);
										} else {
											res.json({'message' : 'success'})
										}
									});
});

// 获取用户信息
app.post('/user/:name/info',function(req,res) {
	userinfo.findOne({name:req.params.name, password:req.body.password},function(err,user) {
		if (err) {
			res.send(err.stack);
		}
		if (user) {
			res.json({
				'name':user.name,
				'password':user.password,
				'email':user.email
			});
		} else {
			res.json({'message':'we dont have the user'});
		}
	})
});

// 找回密码
app.post('/user/:email',function(req,res) {
	userinfo.findOne({email:req.params.email}, function(err,user) {
		if (err) {
			res.send(err.stack);
		}
		if (user) {
			// 发送邮件
		} else {
			res.json({'message':'we dont have the user'});
		}
	});
});

app.listen(port);
console.log('Login system at Port:' + port);
