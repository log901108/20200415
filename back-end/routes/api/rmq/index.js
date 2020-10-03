var express = require('express');
var router = express.Router();

const rmqCtrls = require('./rmq.ctrl');

router.post('/createqueue', rmqCtrls.createqueue);
router.post('/publish', rmqCtrls.rmqpub);
router.post('/subscribe', rmqCtrls.rmqsub);
router.post('/routepub', rmqCtrls.rmqroutepub)
router.post('/routesub', rmqCtrls.rmqroutesub)
router.post('/routeconsume', rmqCtrls.rmqrouteconsume)
router.delete('/', rmqCtrls.deletequeue);

module.exports = router;