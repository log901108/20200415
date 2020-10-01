var express = require('express');
var router = express.Router();

const tableCtrls = require('./table.ctrl');

router.post('/', tableCtrls.create);
router.post('/a', tableCtrls.write);
router.post('/b', tableCtrls.rmqpub);
router.post('/c', tableCtrls.rmqsub);
router.post('/routepub', tableCtrls.rmqroutepub)
router.post('/routesub', tableCtrls.rmqroutesub)
router.post('/routeconsume', tableCtrls.rmqrouteconsume)
router.delete('/', tableCtrls.deletequeue);

module.exports = router;