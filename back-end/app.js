var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config();
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/api/auth');
var postRouter = require('./routes/api/posts');
var tableRouter = require('./routes/api/table');
var cron = require('./lib/node-cron/src/node-cron.js');

// second minute hour day-of-month month day-of-week
cron.schedule('* * * * *', function(){
  console.log('node-cron 실행 테스트');
});

var mjwtdecode = require('./routes/api/auth/middle/mjwtdecode');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(mjwtdecode);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth',authRouter);
app.use('/api/posts', postRouter);
app.use('/api/table', tableRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;

/*
1. 'apt-get install postgresql'로 postgresql 리눅스환경에 인스톨
2. postgresql 패스워드 및 외부 접속 설정 (참고 postgresql 제타위키:https://zetawiki.com/wiki/%EC%9A%B0%EB%B6%84%ED%88%AC_PostgreSQL_%EC%84%A4%EC%B9%98)
	2-1. '/etc/init.d/postgresql start'로 postgresql 서버 시작(자동시작 스크립트 설정 가능)
	2-2. 'sudo -u postgres psql template1'명령어로 postgresql ->template1=# 커맨드화면시작후
     	 'ALTER USER postgres with encrypted password 'hjy1234';'명령으로 패스워드설정
	2-3. 'vi /etc/postgresql/9.3/main/postgresql.conf'명령으로 접속ip 편집시작
		2-3-1. #listen_address='localhost'를 listen_address='*'로 변경 (vi 편집모드 a 명령모드 esc 저장후종료 :wq)
	2-4. 'vi /etc/postgresql/9.3/main/pg_hba.conf' 명령으로 모든 계정 접속가능 편집시작
		2-4-1. #IPv4 로컬 커넥션 설정 및의 127.0.0.1/32를 0.0.0.0/0으로 변경하고 저장및 종료
	2-5. 추가 설정 및 저장하여 postgresql 설정 완료
3. nodejs + express+ passport + psql 설정(참고: https://www.djamware.com/post/5bf94d9a80aca747f4b9ce9f/secure-nodejs-expressjs-and-postgresql-api-using-passportjs) 
	3-1. 'npm install -g sequelize-cli' 명령으로 sequlize-cli를 글로벌로 인스톨
	3-2. 'npm install sequlize pg pg-hstore '명령으로 sequlize, pg, pg-hstore인스톨
	3-3. 'touch .sequelizerc'로 해당 파일 생성 및 코드 작성
	3-4. 'sequelize init'명령으로 sequelize 코드 및 파일(config, migrations, models, seeders) 생성
	3-5. config/config.json 에 설정관련 입력
		3-5-1. 'CREATE ROLE adm WITH LOGIN PASSWORD 'hjy1234';' 'ARTER ROLE adm CREATEDB';'명령으로 관련 설정
		3-5-2. 다시 psql 명령커맨드입력후 'CREATE DATABASE secure_node;' 및 'GRANT ALL PRIVILEGES ON DATABASE secure_node TO adm;' 명령으로 설정완료
		
	3-6. 'sequelize model:create --name Product --attributes prod_name:string,prod_desc:string,prod_price:float'
'sequelize model:create --name User --attributes username:string,password:string' 명령으로 ./models폴더내에 Product 및 User모델 자동으로 생성
	3-7. psql커맨드에서 각 테이블 생성 및 권한 설정
		3-7-1. CREATE TABLE "Users" (
					ID SERIAL PRIMARY KEY,
					username VARCHAR,
					password VARCHAR,
					"createdAt" VARCHAR,
					"updatedAt" VARCHAR
				);
		3-7-2. CREATE TABLE "Products" (
					ID SERIAL PRIMARY KEY,
					prod_name VARCHAR,
					prod_desc VARCHAR,
					prod_price float,
					"createdAt" VARCHAR,
					"updatedAt" VARCHAR
				);
		3-7-3. 'sudo -u postgres psql' ->'\c secure_node'로 DB 선택후 
		'GRANT ALL PRIVILEGES ON TABLE "Users" TO adm;'
		'GRANT ALL PRIVILEGES ON TABLE "Products" TO adm;'
		'GRANT ALL ON SEQUENCE "Users_id_seq" to adm;' 
		'GRANT ALL ON SEQUENCE "Products_id_seq" to adm;'
	으로 권한 설정
	3-7-2. 혹은 migration준비가 되었을 경우 back-end 폴더에서 sequlize db:migrate
	3-8. ./config/passport.js 코드작성 및 app.js routes 수정
	3-9. 'bcrypt-nodejs', 'jsontwebtoken', 'passport', 'passport-jwt', 'http-errors' 등 필요 모듈 npm install 후 동작확인
	
4. redis를 통한 프로세스간 연동 (참조: https://bcho.tistory.com/887) 
5. jwt 의 access token, refresh token 구현 =>현재 일반 jwt stretegy 30일 exp
	5-1.세션기능 (참조:https://www.zerocho.com/category/NodeJS/post/57b7101ecfbef617003bf457)
	5-2. what is refresh token?(ref:https://tansfil.tistory.com/59) https://tansfil.tistory.com/58
	5-3. refresh token in nodejs(참고:https://solidgeargroup.com/refresh-token-with-jwt-authentication-node-js)
	5-4. sliding session + access token & sliding session + access token + refresh token (ref: https://blog.ull.im/engineering/2019/02/07/jwt-strategy.html)
	5-5. cookie httpOnly 구현 (참고: https://backend-intro.vlpt.us/4/02.html)
6. 관리자 구현 (참조: https://velopert.com/2448)
7. 로그아웃 https://dev-yakuza.github.io/ko/laravel/jwt-logout/
https://parkseokje.github.io/2017/03/07/jwt/
DB sequelize 관련
http://webframeworks.kr/tutorials/expressjs/expressjs_orm_two/
http://docs.sequelizejs.com/class/lib/sequelize.js~Sequelize.html
https://velog.io/@cadenzah/sequelize-document-2
	
 ES6 참고:https://zellwk.com/blog/es6/
 curly braces variable arrowfunction : https://stackoverflow.com/questions/37661166/what-do-curly-braces-inside-of-function-parameter-lists-do-in-es6
 
 pm2적용
 
 8.2019-09-13 operationalaises 지우기(영향가는부분있는지 알아볼것), 클러스터 글로벌변수 세팅  
 machinelearning usual term site: https://www.codeonweb.com/@mookiekim/ml-glossary
 
 cookie-setting b/w react and node
 https://stackoverflow.com/questions/43002444/make-axios-send-cookies-in-its-requests-automatically?noredirect=1&lq=1
 
 
 //https://velog.io/@velopert/create-react-app-v2#5.-proxy-%EC%84%A4%EC%A0%95%EC%9D%84-%EC%BB%A4%EC%8A%A4%ED%84%B0%EB%A7%88%EC%9D%B4%EC%A7%95-%EA%B0%80%EB%8A%A5
//https://tbang.tistory.com/124
//https://bytrustu.tistory.com/73 -> webpackDevServer.config.js
	개발 후 nginx를 이용한 reverse proxy 설정까지 완료 후
	로컬호스트 상에 db를 구축하였을 경우 
	/etc/postgresql/10/main 의 postgresql.conf 와 pg_hba.conf의 설정을 
	로컬호스트로 맞게 고쳐주어야 한다.
*/