var express = require('express');
var router = express.Router();

const postsCtrls = require('./posts.ctrl');

router.get('/', postsCtrls.list);
router.get('/tag/:tags', postsCtrls.taglist);
router.post('/', postsCtrls.write);
router.get('/:id', postsCtrls.read);
router.delete('/:id', postsCtrls.remove);
router.patch('/:id', postsCtrls.update);

module.exports = router;