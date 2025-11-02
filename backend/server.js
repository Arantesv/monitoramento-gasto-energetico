const express = require('express');
const cors = require('cors');
const { PORT, GEMINI_API_KEY } = require('./config/env');
const { initDatabase } = require('./config/db');
const allRoutes = require('./routes/index');

// Inicializa o app Express
const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Monta todas as rotas da API sob o prefixo /api
app.use('/api', allRoutes);

// Rota de Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Inicializa o banco de dados e inicia o servidor
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`IA Google Gemini: ${GEMINI_API_KEY ? 'ATIVADA' : 'DESATIVADA'}`);
  });
}).catch(err => {
  console.error("Falha ao inicializar o servidor:", err);
  process.exit(1);
});