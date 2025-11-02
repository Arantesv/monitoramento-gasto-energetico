const mysql = require('mysql2/promise');
const { dbConfig } = require('./env');

let pool;

async function initDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('Conectado ao MySQL');
        await createTables();
    } catch (error) {
        console.error('Erro ao conectar ao banco:', error);
        process.exit(1);
    }
}

async function createTables() {
    const connection = await pool.getConnection();
    try {
        await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await connection.query(`
      CREATE TABLE IF NOT EXISTS comodos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);

        await connection.query(`
      CREATE TABLE IF NOT EXISTS aparelhos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        comodo_id INT NOT NULL,
        nome VARCHAR(100) NOT NULL,
        categoria ENUM('climatizacao', 'iluminacao', 'eletrodomesticos', 'entretenimento', 'higiene', 'outros') DEFAULT 'outros',
        potencia_watts DECIMAL(10,2) NOT NULL,
        horas_uso_dia DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (comodo_id) REFERENCES comodos(id) ON DELETE CASCADE,
        INDEX idx_categoria (categoria)
      )
    `);

        await connection.query(`
      CREATE TABLE IF NOT EXISTS registros_consumo (
        id INT AUTO_INCREMENT PRIMARY KEY,
        aparelho_id INT NOT NULL,
        consumo_kwh DECIMAL(10,2) NOT NULL,
        data_registro DATE NOT NULL,
        hora_inicio TIME,
        hora_fim TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (aparelho_id) REFERENCES aparelhos(id) ON DELETE CASCADE
      )
    `);

        console.log('Tabelas criadas com sucesso');
    } finally {
        connection.release();
    }
}

module.exports = {
    initDatabase,
    get pool() {
        if (!pool) {
            throw new Error('Pool do banco de dados não inicializado!');
        }
        return pool;
    }
};