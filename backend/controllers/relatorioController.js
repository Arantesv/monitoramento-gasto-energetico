const db = require('../config/db');

const getConsumoTotal = async (req, res) => {
    try {
        const [rows] = await db.pool.query(` 
      SELECT 
        c.nome as comodo,
        a.nome as aparelho,
        a.id as aparelho_id,
        a.categoria,
        a.potencia_watts,
        a.horas_uso_dia,
        (a.potencia_watts * a.horas_uso_dia / 1000) as consumo_diario_kwh,
        (a.potencia_watts * a.horas_uso_dia / 1000 * 30) as consumo_mensal_kwh,
        (a.potencia_watts * a.horas_uso_dia / 1000 * 30 * 0.65) as custo_mensal_reais
      FROM aparelhos a
      JOIN comodos c ON a.comodo_id = c.id
      WHERE c.usuario_id = ?
      ORDER BY consumo_mensal_kwh DESC
    `, [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRelatorioMensal = async (req, res) => {
    try {
        const [rows] = await db.pool.query(` 
      SELECT 
        c.id as comodo_id,
        c.nome as comodo,
        COUNT(a.id) as total_aparelhos,
        SUM(a.potencia_watts * a.horas_uso_dia / 1000 * 30) as consumo_mensal_kwh,
        SUM(a.potencia_watts * a.horas_uso_dia / 1000 * 30 * 0.65) as custo_mensal_reais,
        SUM(a.potencia_watts * a.horas_uso_dia) as watts_diarios
      FROM comodos c
      LEFT JOIN aparelhos a ON c.id = a.comodo_id
      WHERE c.usuario_id = ?
      GROUP BY c.id, c.nome
      ORDER BY consumo_mensal_kwh DESC
    `, [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMediaGeral = async (req, res) => {
    try {
        const [rows] = await db.pool.query(` 
      SELECT 
        AVG(consumo_total) as media_consumo_kwh,
        AVG(custo_total) as media_custo_reais
      FROM (
        SELECT 
          c.usuario_id,
          SUM(a.potencia_watts * a.horas_uso_dia / 1000 * 30) as consumo_total,
          SUM(a.potencia_watts * a.horas_uso_dia / 1000 * 30 * 0.65) as custo_total
        FROM comodos c
        JOIN aparelhos a ON c.id = a.comodo_id
        GROUP BY c.usuario_id
      ) as user_totals
    `);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMediaBrasil = async (req, res) => {
    res.json({
        media_consumo_kwh: 152.0,
        media_custo_reais: 98.80,
        fonte: 'EPE - Empresa de Pesquisa Energética 2024'
    });
};

const getStatsPorCategoria = async (req, res) => {
    try {
        const [rows] = await db.pool.query(` 
      SELECT 
        a.categoria,
        COUNT(a.id) as total_aparelhos,
        SUM(a.potencia_watts * a.horas_uso_dia / 1000 * 30) as consumo_mensal_kwh,
        SUM(a.potencia_watts * a.horas_uso_dia / 1000 * 30 * 0.65) as custo_mensal_reais
      FROM aparelhos a
      JOIN comodos c ON a.comodo_id = c.id
      WHERE c.usuario_id = ?
      GROUP BY a.categoria
      ORDER BY consumo_mensal_kwh DESC
    `, [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getConsumoTotal,
    getRelatorioMensal,
    getMediaGeral,
    getMediaBrasil,
    getStatsPorCategoria
};