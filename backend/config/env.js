// Centraliza todas as variáveis de ambiente
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'energia_db'
};

module.exports = {
    PORT: process.env.PORT || 3001,
    JWT_SECRET: process.env.JWT_SECRET || 'energia_secret_2024',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    dbConfig
};