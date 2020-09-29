const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
var celery = require('node-celery');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../../../config/config.json')[env];
var amqp = require('amqplib/callback_api');

module.exports.create = async (req,res,next) => {

const db = {};

let sequelize;
const tablename = req.body.tablename;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
	res.status(200).send({success:success, message:'one or more required contents is empty'});
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
	//console.log(sequelize)
	await sequelize.query(`CREATE TABLE ${tablename}_tbl(id serial PRIMARY KEY,username VARCHAR (50) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "deletedAt" TIMESTAMP WITH TIME ZONE);`)
	
	var ext =  sequelize.define(`${tablename}_tbl`, {
	id: {
		 allowNull: false,
		 autoIncrement: true,
         primaryKey: true,
		 type: Sequelize.INTEGER
	  },
  	username: {
		 allowNull: false,
		  type: Sequelize.STRING(50)
	  },
	createdAt:{
		type: Sequelize.DATE
	  },
	updatedAt:{
		allowNull: true,
		type: Sequelize.DATE
	 },
	dletedAt:{
		allowNull: true,
		type: Sequelize.DATE
	 }
	},{
	  timestamp: false,
	  tableName: `${tablename}_tbl`,
	  paranoid: false,
	  freezeTableName: true,
      underscored: false,
  });

	
	db.sequelize = sequelize;
	await ext
		.create({
			username: 'userJson',
		}).then((result)=>{
			res.status(200).send(result);
		}).catch((err)=>{
			res.status(400).send({err});
		});	
	
	
	
	//res.status(400).send({success:false, message:'one or more required contents is empty'});
}

	
};

module.exports.write = async (req,res,next) => {
/*	
   var client = celery.createClient({
        CELERY_BROKER_URL: 'amqp://guest:guest@localhost:5672//',
        //CELERY_RESULT_BACKEND: 'amqp://'
	    CELERY_IGNORE_RESULT: true,
    });
	
	client.on('error', function(err) {
    console.log(err);
});

client.on('connect', function() {
    client.call('tasks.echo', ['Hello World!'], function(result) {
        console.log(result);
        client.end();
    });
});	

	
client.on('connect', function() {
	var result = client.call('tasks.add', [1, 10]);
	result.on('ready', function(data) {
		console.log(data);
	});
});

*/
const object = {
  protocol: 'amqp',
  hostname: '34.64.235.208',
  port: 5672,
  username: 'admin',
  password: 'hjy1234##',
  locale: 'en_US',
  frameMax: 0,
  heartbeat: 0,
  vhost: '/',
}

amqp.connect(object, function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'fq';
        var msg = 'Hello World!';

        channel.assertQueue(queue, {
            durable: false
        });
        channel.sendToQueue(queue, Buffer.from(msg));

        //console.log(" [x] Sent %s", msg);
    });
    setTimeout(function() {
        connection.close();
        //process.exit(0);
    }, 500);
});

	const tablename = req.body.table;
	const db = {};
	let sequelize;
	if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
	res.status(200).send({success:success, message:'one or more required contents is empty'});
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
	/*
	var ext = sequelize.import(`${tablename}_tbl`, (sequelize, DataTypes) => {
  return sequelize.define(`${tablename}_tbl`, {
	id: {
		 allowNull: false,
		 autoIncrement: true,
         primaryKey: true,
		 type: DataTypes.INTEGER
	  },
  	username: {
		 allowNull: false,
		  type: DataTypes.STRING(50)
	  },
	createdAt:{
		type: DataTypes.DATE
	  },
	updatedAt:{
		allowNull: true,
		type: DataTypes.DATE
	 },
	dletedAt:{
		allowNull: true,
		type: DataTypes.DATE
	 }
	},{
	  timestamp: false,
	  tableName: `${tablename}_tbl`,
	  paranoid: false,
	  freezeTableName: true,
      underscored: false,
  });
});
*/	
	
	var ext =  sequelize.define(`${tablename}_tbl`, {
	id: {
		 allowNull: false,
		 autoIncrement: true,
         primaryKey: true,
		 type: Sequelize.INTEGER
	  },
  	username: {
		 allowNull: false,
		  type: Sequelize.STRING(50)
	  },
	createdAt:{
		type: Sequelize.DATE
	  },
	updatedAt:{
		allowNull: true,
		type: Sequelize.DATE
	 },
	dletedAt:{
		allowNull: true,
		type: Sequelize.DATE
	 }
	},{
	  timestamp: false,
	  tableName: `${tablename}_tbl`,
	  paranoid: false,
	  freezeTableName: true,
      underscored: false,
  });

	db.sequelize = sequelize;
	await ext
		.create({
			username: `${req.body.name}`,
		}).then((result)=>{
			res.status(200).send(result);
		}).catch((err)=>{
			res.status(400).send({err});
		});	
}
	
};

module.exports.rmqpub = async (req,res,next) => {

const object = {
  protocol: 'amqp',
  hostname: '34.64.235.208',
  port: 5672,
  username: 'admin',
  password: 'hjy1234##',
  locale: 'en_US',
  frameMax: 0,
  heartbeat: 0,
  vhost: '/',
}

amqp.connect(object, function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var exchange = 'logs';
	var queue = 'fq'
    var msg = process.argv.slice(2).join(' ') || 'Hello World!';
	  
    channel.assertExchange(exchange, 'direct', {
      durable: false
    });
	  
	channel.assertQueue(queue, {
            durable: false
    },function(error2,q){
		 if (error2) {
        throw error2;
      }
		channel.bindQueue(q.queue, exchange, queue);
	});
	  

    channel.publish(exchange, queue, Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
  });

  setTimeout(function() { 
    connection.close(); 
    //process.exit(0); 
  }, 500);
});

return res.status(200).send({success:true});
	
};

module.exports.rmqsub = async (req,res,next) => {

const object = {
  protocol: 'amqp',
  hostname: '34.64.235.208',
  port: 5672,
  username: 'admin',
  password: 'hjy1234##',
  locale: 'en_US',
  frameMax: 0,
  heartbeat: 0,
  vhost: '/',
}

amqp.connect(object, function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var exchange = 'logs';
	var queue = 'fq'

    channel.assertExchange(exchange, 'direct', {
      durable: false
    });

    channel.assertQueue(queue, {
      durable: false
    }, function(error2, q) {
      if (error2) {
        throw error2;
      }
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
      channel.bindQueue(q.queue, exchange, queue);

      channel.consume(q.queue, function(msg) {
        if(msg.content) {
            console.log(" [x] %s", msg.content.toString());
          }
      }, {
        noAck: true
      });
    });
  });
});

return res.status(200).send({success:true});
	
};