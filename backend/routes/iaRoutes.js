const express = require('express');
const router = express.Router();
const { getAnaliseConsumo } = require('../controllers/iaController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/analise-consumo', authenticateToken, getAnaliseConsumo);

module.exports = router;