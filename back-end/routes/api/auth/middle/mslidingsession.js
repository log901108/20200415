//middleware for sliding session
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
	var AccessToken = jwt.sign(JSON.parse(JSON.stringify({"id":req.user.id,"refresh":req.user.refresh_token})),process.env.JWTSECRET, {expiresIn: 30*60});
	res.cookie('token', AccessToken, {httpOnly:true, expires: new Date(Date.now() + 30*60*1000)});
    return next();
};