const express = require('express');
const router = express.Router();
const { createAparelho, getAparelhosByComodo, updateAparelho, deleteAparelho } = require('../controllers/aparelhoController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Todas as rotas de aparelhos são protegidas
router.use(authenticateToken);

router.post('/', createAparelho);
router.get('/comodo/:comodo_id', getAparelhosByComodo);

router.route('/:id')
    .put(updateAparelho)
    .delete(deleteAparelho);

module.exports = router;