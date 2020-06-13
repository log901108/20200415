var express = require('express');
var router = express.Router();

const tableCtrls = require('./table.ctrl');

router.post('/', tableCtrls.create);
router.post('/a', tableCtrls.write);

module.exports = router;