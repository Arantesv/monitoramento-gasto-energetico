const express = require('express');
const router = express.Router();
const {
    getConsumoTotal,
    getRelatorioMensal,
    getMediaGeral,
    getMediaBrasil,
    getStatsPorCategoria
} = require('../controllers/relatorioController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/estatisticas/media-geral', getMediaGeral);
router.get('/estatisticas/media-brasil', getMediaBrasil);

router.get('/consumo', authenticateToken, getConsumoTotal);
router.get('/relatorio/mensal', authenticateToken, getRelatorioMensal);
router.get('/estatisticas/por-categoria', authenticateToken, getStatsPorCategoria);

module.exports = router;