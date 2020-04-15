var express = require('express');
var router = express.Router();

const authCtrl = require('./auth.ctrl');

router.get('/', authCtrl.getList);

router.get('/login', function(req,res,next){
	res.render('login.ejs');
});

router.get('/signup', function(req,res,next){
	res.render('signup.ejs');
});

/* POST users listing. */
router.post('/signup',  authCtrl.postSignup);

router.post('/login',  authCtrl.postLogin);

router.post('/logout', authCtrl.postLogout);

router.get('/check', authCtrl.getCheck);

router.post('/post', authCtrl.transaction);

router.delete('/delete/:id', authCtrl.deleteDelete);

router.patch('/update/:id', authCtrl.postUpdate);

router.get('/info/:id', authCtrl.getInfo);

module.exports = router;