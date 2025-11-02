const db = require('../config/db'); // MUDANÇA AQUI
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const [existing] = await db.pool.query('SELECT id FROM usuarios WHERE email = ?', [email]); // MUDANÇA AQUI
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const [result] = await db.pool.query( // MUDANÇA AQUI
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, hashedPassword]
    );

    const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      usuario: { id: result.insertId, nome, email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const [users] = await db.pool.query('SELECT * FROM usuarios WHERE email = ?', [email]); // MUDANÇA AQUI
    if (users.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      usuario: { id: user.id, nome: user.nome, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const [users] = await db.pool.query( // MUDANÇA AQUI
      'SELECT id, nome, email FROM usuarios WHERE id = ?',
      [req.user.id] // req.user é injetado pelo authenticateToken
    );
    res.json(users[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe
};