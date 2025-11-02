const express = require('express');
const router = express.Router();
const { createComodo, getAllComodos, updateComodo, deleteComodo } = require('../controllers/comodoController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.route('/')
    .post(createComodo)
    .get(getAllComodos);

router.route('/:id')
    .put(updateComodo)
    .delete(deleteComodo);

module.exports = router;