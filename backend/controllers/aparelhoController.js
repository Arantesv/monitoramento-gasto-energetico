const db = require('../config/db');

const createAparelho = async (req, res) => {
    try {
        const { comodo_id, nome, categoria, potencia_watts, horas_uso_dia } = req.body;

        const [comodo] = await db.pool.query(
            'SELECT id FROM comodos WHERE id = ? AND usuario_id = ?',
            [comodo_id, req.user.id]
        );
        if (comodo.length === 0) {
            return res.status(403).json({ error: 'Cômodo não pertence ao usuário' });
        }

        const [result] = await db.pool.query(
            'INSERT INTO aparelhos (comodo_id, nome, categoria, potencia_watts, horas_uso_dia) VALUES (?, ?, ?, ?, ?)',
            [comodo_id, nome, categoria || 'outros', potencia_watts, horas_uso_dia]
        );
        res.status(201).json({
            id: result.insertId,
            comodo_id,
            nome,
            categoria: categoria || 'outros',
            potencia_watts,
            horas_uso_dia
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAparelhosByComodo = async (req, res) => {
    try {
        const [rows] = await db.pool.query(` 
      SELECT a.* FROM aparelhos a
      JOIN comodos c ON a.comodo_id = c.id
      WHERE c.id = ? AND c.usuario_id = ?
      ORDER BY a.nome
    `, [req.params.comodo_id, req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateAparelho = async (req, res) => {
    try {
        const { nome, categoria, potencia_watts, horas_uso_dia } = req.body;

        const [aparelho] = await db.pool.query(` 
      SELECT a.id FROM aparelhos a
      JOIN comodos c ON a.comodo_id = c.id
      WHERE a.id = ? AND c.usuario_id = ?
    `, [req.params.id, req.user.id]);

        if (aparelho.length === 0) {
            return res.status(403).json({ error: 'Aparelho não encontrado' });
        }

        await db.pool.query(
            'UPDATE aparelhos SET nome = ?, categoria = ?, potencia_watts = ?, horas_uso_dia = ? WHERE id = ?',
            [nome, categoria || 'outros', potencia_watts, horas_uso_dia, req.params.id]
        );
        res.json({ message: 'Aparelho atualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteAparelho = async (req, res) => {
    try {
        const [aparelho] = await db.pool.query(` 
      SELECT a.id FROM aparelhos a
      JOIN comodos c ON a.comodo_id = c.id
      WHERE a.id = ? AND c.usuario_id = ?
    `, [req.params.id, req.user.id]);

        if (aparelho.length === 0) {
            return res.status(403).json({ error: 'Aparelho não encontrado' });
        }

        await db.pool.query('DELETE FROM aparelhos WHERE id = ?', [req.params.id]);
        res.json({ message: 'Aparelho deletado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createAparelho,
    getAparelhosByComodo,
    updateAparelho,
    deleteAparelho
};