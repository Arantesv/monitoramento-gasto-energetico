const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/comodos', require('./comodoRoutes'));
router.use('/aparelhos', require('./aparelhoRoutes'));
router.use('/ia', require('./iaRoutes'));

router.use('/', require('./relatorioRoutes'));

module.exports = router;