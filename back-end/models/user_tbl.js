'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const requestIp = require('request-ip');

module.exports = (sequelize, DataTypes) => {
  const user_tbl = sequelize.define('user_tbl', {
	_id: {
		 allowNull: false,
		 autoIncrement: true,
         primaryKey: true,
		  type: DataTypes.BIGINT
	  },
    userid: {
		 allowNull: false,
		  type: DataTypes.STRING(50)
	  },
  	username: {
		 allowNull: false,
		  type: DataTypes.STRING(50)
	  },
    password_hash:{
		 allowNull: false,
		  type: DataTypes.STRING(255)
	  },
	login_fail_count: {
		type: DataTypes.INTEGER, 
		defaultValue: 0,
	},
	is_account_lock: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	latest_login_date: DataTypes.DATE,
	try_login_date: DataTypes.DATE,
	is_admin: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	login_ip: DataTypes.STRING(15),
	refresh_token: DataTypes.STRING(255),
  }, {
	  timestamp:true,
	  tableName: 'user_tbl',
	  paranoid: true,
	  freezeTableName: true,
      underscored: false,
  });
	
 //class method - 각 인스턴스의 생명주기중 실행되는 함수
	
 //password 컬럼내 값 생성 혹은 변경시 bcrypt 해쉬로 변경되어 저장 되도록 하는 함수
  user_tbl.beforeSave((user, options) => { 
    if (user.changed('password_hash')) {
      user.password_hash = bcrypt.hashSync(user.password_hash, bcrypt.genSaltSync(10), null);
    }
  });
		
	
//instance method - 모델에 기능 추가 구현 함수 

  //로그인 실패시 시도 횟수 증가하는 함수	
  user_tbl.prototype.PlusLoginFailCount = function (user) {

 	  this.increment({login_fail_count : 1},
						 {
		                  where: {userid: user.body.userid},
						 })
	  //this.update({login_fail_count :sequelize.literal('login_fail_count + 1')},
	  //			 {where: {username: user.body.username}})
		  .then((user)=>{

		  if(user.dataValues.login_fail_count >=5){ //set account lock when login_fail_count more than 5 times
			
			  return user_tbl.update({is_account_lock :true},
	  								{where: {userid: user.dataValues.userid}});
		  }
	  });
 };
  
  //로그인 시도시 db내 비밀번호와 일치 하는지 확인하는 함수
  user_tbl.prototype.comparePassword = function (passw, cb) { 
    bcrypt.compare(passw, this.password_hash, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
  };

//login trial date update
  user_tbl.prototype.UpdateloginTrialDate = function (user) {
	
			  this.update({
								try_login_date: new Date()
							},
							{where:
							  {userid : user}});	
 };	
	
//admin update true
  user_tbl.prototype.UpdateAdminTrue = function (user) {
			  this.update({
								is_admin: true
							},
							{where:{userid : user}});	
 };	
	
//admin update false	
  user_tbl.prototype.UpdateAdminFalse = function (user) {
			  this.update({
								is_admin: false
							},
							{where:{userid : user}});	
 };	
	
//login_date update
  user_tbl.prototype.UpdateLoginDate = function (user) {
			  this.update({
								latest_login_date: new Date()
							},
							{where:{userid : user}});	
 };
	
//login IP update
  user_tbl.prototype.UpdateLoginIp = function (client, user) {	
			  this.update({
								login_ip:requestIp.getClientIp(client)
							},
							{where:{userid : user}});	
 };
	
  user_tbl.prototype.SelectLockStatus = function(user){
	  return this.is_account_lock;
  };
	
  user_tbl.prototype.UpdateClearLoginFailCount= function(user){
	   	  this.update({
			  			login_fail_count :0,
			  			is_account_lock : false,
					  },
					 {where: {userid: user}})
  };
	
  user_tbl.prototype.UpdateClearLockCount= function(user){
	  this.update({
			  			lock_count :0,
					  },
					 {where: {userid: user}})
  };
	
  user_tbl.prototype.UpdateRefreshtoken = async function(user, expiretime){
	  var RefreshToken = await jwt.sign(JSON.parse(JSON.stringify({"userid":user,"signinDate":Date.now()})), process.env.JWTSECRET, {expiresIn: expiretime });//14days
	  this.update({
		  			refresh_token: RefreshToken,
	  				},{where:{userid: user}});
	  return RefreshToken;
  }	
	
  user_tbl.associate = function(models) {
    // associations can be defined here
  };
  return user_tbl;
};