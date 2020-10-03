const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
var celery = require('node-celery');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../../../config/config.json')[env];
var amqp = require('amqplib/callback_api');
var amqplib = require('amqplib');


module.exports.createqueue = async (req,res,next) => {
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
    var exchange = req.body.exchange || 'exc';
	var queue = req.body.queue || 'q'
    var msg = req.body.msg || 'Hello World!';
	var type = req.body.type || 'direct';
	var key = req.body.key || null;
	  
    channel.assertExchange(exchange, type, {
      durable: false
    },function(error1){
		if(error1){
			throw error1;
		}
		//assertQueue([queue, [options, [function(err, ok) {...}]]])
		//queue: if user gives null or empty string, random queue name be set
		//
		channel.assertQueue(queue, {
            durable: false
    	},function(error2,q){
		 	if (error2) {
        	throw error2;
      	}
			console.log('q:',q);
			if(key){
				channel.bindQueue(q.queue, exchange, key); //exchange type direct
			} else {
				channel.bindQueue(q.queue, exchange);
			}

		});
	});

  });

  setTimeout(function() { 
    connection.close();
	console.log('[-]Publisher connection colosed');
    //process.exit(0); 
  }, 500);
});

return res.status(200).send({success:true});
	
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
    var exchange = req.body.exchange || 'exc';
	var queue = req.body.queue || 'q'
    var msg = req.body.msg || 'Hello World!';
	var type = req.body.type || 'direct';
	var key = req.body.key || null;
	  
    channel.assertExchange(exchange, type, {
      durable: false
    },function(error1){
		if(error1){
			throw error1;
		}
		//assertQueue([queue, [options, [function(err, ok) {...}]]])
		//queue: if user gives null or empty string, random queue name be set
		//
		channel.assertQueue(queue, {
            durable: false
    	},function(error2,q){
		 	if (error2) {
        	throw error2;
      	}
			console.log('q:',q);
			
			if(key){
				channel.bindQueue(q.queue, exchange, key);
			} else {
				channel.bindQueue(q.queue, exchange);
			}

		});
	});
	  
    channel.publish(exchange, queue, Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
  });

  setTimeout(function() { 
    connection.close();
	console.log('[-]Publisher connection colosed');
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
	  
    var exchange = req.body.exchange || 'exc';
	var queue = req.body.queue || 'q'
    var msg = req.body.msg || 'Hello World!';
	var type = req.body.type || 'direct';

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
	
  setTimeout(function() { 
    connection.close();
	console.log('[-]Subscriber connection colosed');
    //process.exit(0); 
  }, 500);
});

return res.status(200).send({success:true});
	
};

module.exports.deletequeue = async (req,res,next) => {

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
	var queue = req.body.queue;
    channel.deleteQueue(queue);
  });
	
  setTimeout(function() { 
    connection.close();
	console.log('[-]connection colosed');
    //process.exit(0); 
  }, 500);
});

return res.status(200).send({success:true});
};

module.exports.rmqroutepub = async (req,res,next) => {

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
    var exchange = req.body.exchange || 'exc';
	var queue = req.body.queue || 'q';
    var msg = req.body.msg || 'Hello World!';
	var key = req.body.severity || "info";
	var exctype =req.body.type || "direct";
	  
    channel.assertExchange(exchange, exctype, {
      		durable: false
    	}, function(error1){
			if(error1){
				throw error1;
			}
			//ch.assertQueue([queue, [options, [function(err, ok) {...}]]])
			//queue: if user gives null or empty string, random queue name be set
			channel.assertQueue(queue, {
            		durable: false
    			},function(error2,q){
					if (error2) {
        				throw error2;
      				}
				channel.bindQueue(q.queue, exchange, key);//ch.bindQueue(queue, exchange, routing_key, [args_upon_exchange_type])
			});
	});
	  
    channel.publish(exchange, key, Buffer.from(msg)); //ch.publish(exchangename, routing_key, msg_buffer)
    console.log(" [x] Sent %s : %s", key, msg);
	
  });
  	setTimeout(function() { 
    	connection.close();
		console.log('[-]Publisher connection colosed');
    	//process.exit(0); 
  		}, 500);
  });
	
return res.status(200).send({success:true});
};

module.exports.rmqroutesub = async (req,res,next) => {

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
    var exchange = req.body.exchange || 'exc';
	var queue = req.body.queue || 'queue';
	var key =  req.body.severity ? req.body.severity : "info";

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
	
	  //channel.bindQueue(q.queue, exchange, args);
	
      channel.consume(q.queue, function(msg) {
        if(msg.content) {
			
			var secs = msg.content.toString().split('.').length - 1;
            console.log(" [x] %s : %s", msg.fields.routingKey, msg.content.toString());
			
			setTimeout(function() {
        	console.log(" [x] Done");
        	channel.ack(msg);
      		}, secs * 1000);
			
          }
      }, {
        noAck: true
      });
    });
  });
	/*
  setTimeout(function() { 
    connection.close();
	console.log('[-]Subscriber connection colosed');
    //process.exit(0); 
  }, 1500);*/
});

return res.status(200).send({success:true});
	
};

module.exports.rmqrouteconsume = async (req,res,next) => {

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

const connection = await amqplib.connect(object);
	
const channel =  await connection.createChannel();
	
    var exchange = req.body.exchange || 'exc';
	var queue = req.body.queue || "q"
	var key =  req.body.severity ? req.body.severity : "info";

	await channel.prefetch(2); //un ack된 메세지 한번에 읽어오는 개수... 
	
	await channel.bindQueue(queue, exchange, key);//bindQueue([queue, exchange, routing_key])
	
    try{
		channel.consume(queue, function(msg) {
        	if(msg.content) {
				console.log(msg);
            	console.log(" [x] %s: %s : %s", queue, msg.fields.routingKey, msg.content.toString());
			
				setTimeout(function() {
					console.log('waiting ack')
        			channel.ack(msg);
			},10000);//ack되면 메세지 큐에서 빠짐... prefetch 개수 만큼 ack를 실행함. 그리고 바로 다음 메세지 읽어옴 
			//channel.close();
		}
      }, {
        noAck: false
	});
	   } catch(err){
		   console.log(err);
	   }

/*
  setTimeout(function() { 
	//channel.ack(mes);
    connection.close();
	console.log('[-]consumer connection colosed');
    //process.exit(0); 
  }, 1500);
*/

return res.status(200).send({success:true});
	
};