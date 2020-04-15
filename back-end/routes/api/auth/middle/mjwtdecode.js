//middleware for check login status
const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
	var token = null;
  	if (req && req.cookies) token = req.cookies.token;
	
	if(!token){
		return next();
	}else{
		try{
		 	var decoded = await jwt.verify(token, process.env.JWTSECRET, function(err, data){
					req.user = data;
		 		});
			return next();
		}catch(e){ //token validation fail
			return next();
		}
	}
};