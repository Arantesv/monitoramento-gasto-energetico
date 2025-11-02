const db = require('../config/db'); // MUDANÇA AQUI

const createComodo = async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const [result] = await db.pool.query( // MUDANÇA AQUI
      'INSERT INTO comodos (usuario_id, nome, descricao) VALUES (?, ?, ?)',
      [req.user.id, nome, descricao]
    );
    res.status(201).json({ id: result.insertId, usuario_id: req.user.id, nome, descricao });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllComodos = async (req, res) => {
  try {
    const [rows] = await db.pool.query( // MUDANÇA AQUI
      'SELECT * FROM comodos WHERE usuario_id = ? ORDER BY nome',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateComodo = async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    await db.pool.query( // MUDANÇA AQUI
      'UPDATE comodos SET nome = ?, descricao = ? WHERE id = ? AND usuario_id = ?',
      [nome, descricao, req.params.id, req.user.id]
    );
    res.json({ message: 'Cômodo atualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteComodo = async (req, res) => {
  try {
    await db.pool.query( // MUDANÇA AQUI
      'DELETE FROM comodos WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Cômodo deletado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createComodo,
  getAllComodos,
  updateComodo,
  deleteComodo
};