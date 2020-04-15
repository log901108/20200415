const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = express.Router();
require('../../../config/passport')(passport);
const models = require('../../../models');
const user_tbl = require('../../../models').user_tbl;
const signin_trial_tbl = require('../../../models').signin_trial_tbl;

const requestIp = require('request-ip');
const validator = require('validator');

exports.getList = async (req,res) =>{
	user_tbl.findAndCountAll({order: [['_id', 'ASC']]})
			.then((result)=>{
				res.status(200).send({success:true, datacount: result.count, data:result.rows})})
			.catch(err => res.status(400).send({success:false, err:err}));

}

exports.getInfo = async (req,res) =>{
	user_tbl.findOne({
				where: {
							_id:req.params.id,	
						},
				limit: 1,
			})
			.then((result)=>{
				res.status(200).send({success:true, data:result})})
			.catch(err => res.status(400).send({success:false, err:err}));

}

passwordValidator = (password) => {
	if(!validator.isAlphanumeric(password) && validator.isLength(password,{min:5, max: 15})){
		return true;
	}else{
		return false;
	}

}

//post router function for signup
module.exports.postSignup = function(req, res) {
  console.log(req.body);
  if (!req.body.userid || !req.body.username || !req.body.password) {
    res.status(400).send({msg: 'Please pass username and password.'});
  } else { //all include 
	  if(!validator.isAlphanumeric(req.body.password) && validator.isLength(req.body.password,{min:5, max: 15})){
		user_tbl
      	.create({
			userid: req.body.userid,
        	username: req.body.username,
        	password_hash: req.body.password
      	})
      	.then(async (user) => {
			
			//회원가입과 동시에 로그인 처리를 할 것임으로 signin_trial_tbl 업데이트 
			  signin_trial_tbl.create({
					requested_userid: req.body.userid,
					requested_password: req.body.password,
					trial_time: Date.now(),
					trial_ip:requestIp.getClientIp(req),	
			  });
			
			//회원가입과 동시에 로그인 처리를 할 것임으로 user_tbl 업데이트
			  const RefreshToken = await user.UpdateRefreshtoken(user.userid, 86400 * 14);
			  user.UpdateClearLoginFailCount(user.userid);
			  user.UpdateLoginIp(req, req.body.userid);
			  user.UpdateloginTrialDate(req.body.userid);
			  user.UpdateLoginDate(req.body.userid);
			  
			var AccessToken = await jwt.sign(JSON.parse(JSON.stringify({"id":user._id,"userid":user.userid,"refresh":RefreshToken})), process.env.JWTSECRET, {expiresIn: 30*60 });
			res.cookie('token', AccessToken, {httpOnly:true, expires: new Date(Date.now() + 30*60*1000)});
			res.status(201).send(user)})
   		.catch((error) => {
        	console.log(error);
	
			if(error.parent.code == 23505){//unique constraint error
				res.status(409).send({masg:'id already exist'})
			}else{
			    res.status(400).send({msg:'commit db error'});	
			}
      });
	}else{//validator
		res.status(400).send({msg: 'Please pass valid username and password.'});
	}
  }
};

//post router function for login
module.exports.postLogin =  function(req,res, next){
	
	signin_trial_tbl.create({
					requested_userid: req.body.userid,
					requested_password: req.body.password,
					trial_time: Date.now(),
					trial_ip:requestIp.getClientIp(req),	
	});
	
	user_tbl
      .findOne({
        where: {
		  userid:req.body.userid,
        },
		limit:1,
      })
      .then((user) => {

        if (!user) {
          return res.status(401).send({
            message: 'Authentication failed. User not found.',
          });
        }
		//bcryt hash화된 pw와 매칭 후 token 발급하는 과정임
		//1. user의 instance method 인 comparePassword로 hash pw check
        user.comparePassword(req.body.password, async (err, isMatch) => {
		  //2. hash pw check가 맞으면 아래 실행 
          if(isMatch && !err) {
			  
			if(user.is_account_lock){ //account_lock status check
			  res.status(409).send({success: false, msg: 'Authentication failed. account locked because of invalid id or password trial more than 5.'}); 
			}else{//account_lock is false
			  //3.user_tbl의 login 관련 정보 업데이트
			  const RefreshToken = await user.UpdateRefreshtoken(req.body.userid, 86400 * 14);
			  user.UpdateClearLoginFailCount(req);
			  user.UpdateLoginIp(req, req.body.userid);
			  user.UpdateloginTrialDate(req.body.userid);
			  user.UpdateLoginDate(req.body.userid);
			  
			  //4.보안을 위해 accesstoken + refreshtoken + sliding session 으로 구성: access토큰 발행
			  var AccessToken = await jwt.sign(JSON.parse(JSON.stringify({"id":user._id,"userid":user.userid,"refresh":RefreshToken})), process.env.JWTSECRET, {expiresIn: 30*60 });
			 
			  //5. access 토큰을 쿠키로 브라우져에 저장 
			  //refresh 토큰은 로그인시마다 발행해서 db에 저장(update)하는 방식으로 사용
			  //refresh 토큰을 발행할경우 db에 refresh토큰을 저장하고 그것으로 access토큰을 발행해야함
			  //refresh 토큰의 유효기간 길이는 길게하고 access token은 짧게함
			  //보안이 필요한 api의 경우 요청시 access token을 통해 
			  //쿠키와 저장된 refresh token이 같은지 확인하고 이상없을시 accesstoken 재발행(슬라이딩세션 미들웨어를 통해)
			  //access token 유효기간 만료나 api요청으로 재발급시 refresh token과 같은지 확인하는 절차가 있으면 됨

			  res.cookie('token', AccessToken, {httpOnly:true, expires: new Date(Date.now() + 30*60*1000)});

			  //6.access 토큰을 json으로 보내기
			  res.status(200).send({success: true, token: 'JWT ' + AccessToken, userid: user.userid, createdAt: user.createdAt }); //줘야 되는 정보만 보내도록 바꿀것
			}
          } else { //!isMatch == dismatched password 
			user.PlusLoginFailCount(req);
            res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
          }
        });
      })
      .catch((error) => res.status(400).send(error));

}

module.exports.postLogout =  function(req,res){
	var token = getToken(req);
	if(token){		
		res.cookie('token', '', {httpOnly:true, expires: new Date(Date.now())}); //token 값을 없애고 바로 유효기간 없애기
		res.status(201).send({}); 
	}else{
		return res.status(403).send({success:false, msg: 'Unauthorized'});
	}
};

module.exports.getCheck2 = async function(req,res){
	var access = await getToken(req);

	if(!access){
		res.status(401).send({success:false, message:"unAutorized"});
	}else{
		var decoded = await jwt.verify(access, process.env.JWTSECRET, function(err, data){
			console.log("decoded:",data);
				console.log(data._id);
				console.log(data.userid);
				var user = {id:data._id, userid: data.userid}
				res.status(200).send(user);
			});
		
	}

};

module.exports.getCheck = async function(req,res){

	var user = null;
	if(req.user){
		user = req.user;
	}

	if(!user){
		res.status(401).send({success:false, message:"unAutorized"});
	}else{
		res.status(200).send(user);
	}

};

exports.transaction = function(req, res){
  return models.sequelize.transaction(t => {

	  console.log(req.body);
  if (!req.body.userid || !req.body.username || !req.body.password) {
    res.status(400).send({msg: 'Please pass username and password.'});
  } else { //all include 
	if(!validator.isAlphanumeric(req.body.password) && validator.isLength(req.body.password,{min:5, max: 15})){
 	 // chain all your queries here. make sure you return them.
  		return user_tbl.create({
    				userid: req.body.userid,
    				password_hash: req.body.password,
	  				username: req.body.username,
  					}, {transaction: t})	  
		   }
        }

      })
	  .then( async user => {
  // Transaction has been committed
  // result is whatever the result of the promise chain returned to the transaction callback
//회원가입과 동시에 로그인 처리를 할 것임으로 signin_trial_tbl 업데이트 
			  signin_trial_tbl.create({
					requested_userid: req.body.userid,
					requested_password: req.body.password,
					trial_time: Date.now(),
					trial_ip:requestIp.getClientIp(req),	
			  });
			
			//회원가입과 동시에 로그인 처리를 할 것임으로 user_tbl 업데이트
			  const RefreshToken = await user.UpdateRefreshtoken(user.userid);
			  user.UpdateClearLoginFailCount(user.userid);
			  user.UpdateLoginIp(req, req.body.userid);
			  user.UpdateloginTrialDate(req.body.userid);
			  user.UpdateLoginDate(req.body.userid);
			  
			var AccessToken = await jwt.sign(JSON.parse(JSON.stringify({"id":user._id,"userid":user.userid,"refresh":RefreshToken})), process.env.JWTSECRET, {expiresIn: 30*60 });
			res.cookie('token', AccessToken, {httpOnly:true, expires: new Date(Date.now() + 30*60*1000)});
			res.status(201).send(user);
	  })
	  .catch(err => {
 	 // Transaction has been rolled back
  	// err is whatever rejected the promise chain returned to the transaction callback
        	console.log(err);
	
			if(err.parent.code == 23505){//unique constraint error
				res.status(409).send({masg:'id already exist'})
			}else{
			    res.status(400).send({msg:'commit db error'});
			}	
	});
}

exports.deleteDelete = async (req, res) => {
	const user_Id = req.params.id;
	return models.sequelize.transaction(t => {
		return user_tbl.destroy({where: {_id:user_Id},transaction:t});
	})
	.then(result =>{
		res.status(200).send({success:true, deleted: user_Id, msg: `#${user_Id} user is deleted`});
	})
	.catch(err => {
		res.status(400).send({success:false, msg: err});
	})
}

exports.postUpdate = async (req, res) => {
	const user_Id = req.params.id;
	var updatePhrase = {};
	
	if(req.body.username){
		updatePhrase['username'] = req.body.username;
	}
	
	//TODO: validation need
	if(req.body.password){
		if(passwordValidator(req.body.password)){
		   updatePhrase['password_hash'] = req.body.password;
		}else{
			return res.status(409).send({success:false, msg:'validation failed'});
		}
	}
	
	return models.sequelize.transaction(t => {
		return user_tbl.findByPk(user_Id).then((user)=>{
			user.update(updatePhrase,{
										returning: true,
									 	plain:true
									 })
			})
				
	})
	.then(result =>{
		if(!req.body.username && !req.body.password){
			res.status(204).send({success:true, changed:false});
		}else{
			res.status(200).send({success:true, changed:true});
		}
	})
	.catch(err => {
		res.status(400).send({success:false, msg: err});
	})
}

getToken = function(req){
  var token = null;
  if (req && req.cookies) token = req.cookies.token;
  //if(req&& req.cookies) token = req.cookies['token'];
  return token;
};