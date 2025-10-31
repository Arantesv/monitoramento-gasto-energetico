const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'energia_secret_2024';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'energia_db'
};

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

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const [result] = await pool.query(
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
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
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
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nome, email FROM usuarios WHERE id = ?',
      [req.user.id]
    );
    res.json(users[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/comodos', authenticateToken, async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const [result] = await pool.query(
      'INSERT INTO comodos (usuario_id, nome, descricao) VALUES (?, ?, ?)',
      [req.user.id, nome, descricao]
    );
    res.status(201).json({ id: result.insertId, usuario_id: req.user.id, nome, descricao });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/comodos', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM comodos WHERE usuario_id = ? ORDER BY nome',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/comodos/:id', authenticateToken, async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    await pool.query(
      'UPDATE comodos SET nome = ?, descricao = ? WHERE id = ? AND usuario_id = ?',
      [nome, descricao, req.params.id, req.user.id]
    );
    res.json({ message: 'Cômodo atualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/comodos/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM comodos WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Cômodo deletado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/aparelhos', authenticateToken, async (req, res) => {
  try {
    const { comodo_id, nome, categoria, potencia_watts, horas_uso_dia } = req.body;

    const [comodo] = await pool.query(
      'SELECT id FROM comodos WHERE id = ? AND usuario_id = ?',
      [comodo_id, req.user.id]
    );
    if (comodo.length === 0) {
      return res.status(403).json({ error: 'Cômodo não pertence ao usuário' });
    }

    const [result] = await pool.query(
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
});

app.get('/api/aparelhos/comodo/:comodo_id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.* FROM aparelhos a
      JOIN comodos c ON a.comodo_id = c.id
      WHERE c.id = ? AND c.usuario_id = ?
      ORDER BY a.nome
    `, [req.params.comodo_id, req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/aparelhos/:id', authenticateToken, async (req, res) => {
  try {
    const { nome, categoria, potencia_watts, horas_uso_dia } = req.body;

    const [aparelho] = await pool.query(`
      SELECT a.id FROM aparelhos a
      JOIN comodos c ON a.comodo_id = c.id
      WHERE a.id = ? AND c.usuario_id = ?
    `, [req.params.id, req.user.id]);

    if (aparelho.length === 0) {
      return res.status(403).json({ error: 'Aparelho não encontrado' });
    }

    await pool.query(
      'UPDATE aparelhos SET nome = ?, categoria = ?, potencia_watts = ?, horas_uso_dia = ? WHERE id = ?',
      [nome, categoria || 'outros', potencia_watts, horas_uso_dia, req.params.id]
    );
    res.json({ message: 'Aparelho atualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/aparelhos/:id', authenticateToken, async (req, res) => {
  try {
    const [aparelho] = await pool.query(`
      SELECT a.id FROM aparelhos a
      JOIN comodos c ON a.comodo_id = c.id
      WHERE a.id = ? AND c.usuario_id = ?
    `, [req.params.id, req.user.id]);

    if (aparelho.length === 0) {
      return res.status(403).json({ error: 'Aparelho não encontrado' });
    }

    await pool.query('DELETE FROM aparelhos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Aparelho deletado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/consumo', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
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
});

app.get('/api/relatorio/mensal', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
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
});

app.get('/api/estatisticas/media-geral', async (req, res) => {
  try {
    const [rows] = await pool.query(`
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
});

app.get('/api/estatisticas/media-brasil', async (req, res) => {
  res.json({
    media_consumo_kwh: 152.0,
    media_custo_reais: 98.80,
    fonte: 'EPE - Empresa de Pesquisa Energética 2024'
  });
});

app.get('/api/estatisticas/por-categoria', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
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
});

async function chamarGeminiIA(prompt) {
  try {
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY não configurada, usando análise padrão');
      return null;
    }

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 60000,
      }
    };

    console.log('Enviando requisição para Gemini API com payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    console.log('Status da resposta da Gemini API:', response.status);



    const data = await response.json();

    console.log('Resposta da Gemini API:', JSON.stringify(data, null, 2));

    if (data.candidates && data.candidates[0]) {
      if (data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
      }
      if (data.candidates[0].content.text) {
        return data.candidates[0].content.text;
      }
      console.warn('Resposta da Gemini API sem texto:', data.candidates[0].content);
      return JSON.stringify(data.candidates[0].content);
    }


    console.warn('Resposta da Gemini API sem candidatos:', data);
    return null;
  } catch (error) {
    console.error('Erro ao chamar Gemini:', error);
    return null;
  }
}

app.get('/api/ia/analise-consumo', authenticateToken, async (req, res) => {
  try {
    const [consumo] = await pool.query(`
      SELECT 
        c.nome as comodo,
        c.id as comodo_id,
        COALESCE(SUM(a.potencia_watts * a.horas_uso_dia / 1000 * 30), 0) as consumo_kwh,
        COALESCE(SUM(a.potencia_watts * a.horas_uso_dia / 1000 * 30 * 0.65), 0) as custo_reais,
        GROUP_CONCAT(
          CONCAT(
            '{"nome":"', COALESCE(a.nome, ''), 
            '","potencia":', COALESCE(a.potencia_watts, 0),
            ',"horas":', COALESCE(a.horas_uso_dia, 0),
            ',"consumo_mensal":', COALESCE(a.potencia_watts * a.horas_uso_dia / 1000 * 30, 0), '}'
          )
          SEPARATOR ','
        ) as aparelhos_str
      FROM comodos c
      LEFT JOIN aparelhos a ON c.id = a.comodo_id
      WHERE c.usuario_id = ?
      GROUP BY c.id, c.nome
    `, [req.user.id]);

    const consumoProcessado = consumo.map(c => {
      let aparelhos = [];
      if (c.aparelhos_str) {
        try {
          aparelhos = JSON.parse('[' + c.aparelhos_str + ']');
        } catch (e) {
          console.error('Erro ao parsear aparelhos:', e);
          aparelhos = [];
        }
      }
      return {
        ...c,
        aparelhos: aparelhos.filter(a => a.nome && a.nome !== '')
      };
    });

    if (!consumoProcessado || consumoProcessado.length === 0) {
      return res.json({
        analise_por_comodo: [],
        total_economia_potencial_reais: 0,
        resumo: 'Nenhum cômodo cadastrado ainda. Adicione cômodos e aparelhos para gerar análise.'
      });
    }

    const comodosComAparelhos = consumoProcessado.filter(c =>
      c.aparelhos && c.aparelhos.length > 0
    );

    if (comodosComAparelhos.length === 0) {
      return res.json({
        analise_por_comodo: [],
        total_economia_potencial_reais: 0,
        resumo: 'Nenhum aparelho cadastrado ainda. Adicione aparelhos para gerar análise.'
      });
    }

    const prompt = `Você é um especialista em eficiência energética residencial. Analise o consumo de energia abaixo e forneça uma análise detalhada.

DADOS DO CONSUMO:
${JSON.stringify(comodosComAparelhos, null, 2)}

Para cada cômodo, forneça:
1. Uma expectativa realista de consumo mensal em kWh (baseado no tipo de cômodo e aparelhos)
2. Se o consumo está acima, dentro ou abaixo da expectativa
3. 2-3 dicas específicas e práticas para economia de energia

Responda APENAS no formato JSON válido (sem markdown, sem \`\`\`json), seguindo exatamente esta estrutura:
{
  "analise_por_comodo": [
    {
      "comodo": "nome do cômodo",
      "comodo_id": id,
      "consumo_atual_kwh": valor,
      "consumo_atual_reais": valor,
      "expectativa_kwh": valor,
      "expectativa_reais": valor,
      "economia_potencial_kwh": valor,
      "economia_potencial_reais": valor,
      "percentual_acima": valor,
      "dicas": ["dica 1", "dica 2", "dica 3"]
    }
  ],
  "total_economia_potencial_reais": valor,
  "resumo": "resumo geral em uma frase"
}`;

    const respostaIA = await chamarGeminiIA(prompt);

    if (respostaIA) {
      try {
        let jsonStr = respostaIA.trim();

        const markdownMatch = jsonStr.match(/```(?:json)?([\s\S]*?)```/);
        if (markdownMatch && markdownMatch[1]) {
          jsonStr = markdownMatch[1].trim();
        }

        const analise = JSON.parse(jsonStr);
        return res.json(analise);
      } catch (parseError) {
        console.error('Erro ao parsear resposta da IA:', parseError);
        console.log('Resposta bruta recebida:', respostaIA);
      }
    }

    const analise = comodosComAparelhos.map(comodo => {
      const expectativaBase = {
        'sala': 80, 'quarto': 60, 'cozinha': 120,
        'banheiro': 90, 'escritório': 70, 'lavanderia': 50
      };

      const tipoComodo = Object.keys(expectativaBase).find(tipo =>
        comodo.comodo.toLowerCase().includes(tipo)
      ) || 'sala';

      const expectativa_kwh = expectativaBase[tipoComodo];
      const expectativa_reais = expectativa_kwh * 0.65;
      const economia_potencial = Math.max(0, comodo.consumo_kwh - expectativa_kwh);
      const percentual_acima = ((comodo.consumo_kwh / expectativa_kwh - 1) * 100).toFixed(1);

      let dicas = [];
      const aparelhos = comodo.aparelhos || [];

      aparelhos.forEach(ap => {
        if (ap.nome.toLowerCase().includes('ar condicionado') && ap.horas > 8) {
          dicas.push(`Reduza o uso do ${ap.nome} em 2-3 horas por dia para economizar até R$ ${(ap.consumo_mensal * 0.25 * 0.65).toFixed(2)}/mês`);
        }
        if (ap.nome.toLowerCase().includes('chuveiro') && ap.horas > 1) {
          dicas.push(`Reduza o tempo de banho para 10-15 minutos, economize até R$ ${(ap.consumo_mensal * 0.20 * 0.65).toFixed(2)}/mês`);
        }
        if (ap.potencia > 1000 && ap.horas > 5) {
          dicas.push(`${ap.nome} consome muito! Considere alternativas mais eficientes`);
        }
      });

      if (dicas.length === 0) {
        dicas.push('Consumo dentro do esperado! Continue assim.');
      }

      return {
        comodo: comodo.comodo,
        comodo_id: comodo.comodo_id,
        consumo_atual_kwh: parseFloat(comodo.consumo_kwh || 0),
        consumo_atual_reais: parseFloat(comodo.custo_reais || 0),
        expectativa_kwh,
        expectativa_reais,
        economia_potencial_kwh: parseFloat(economia_potencial.toFixed(2)),
        economia_potencial_reais: parseFloat((economia_potencial * 0.65).toFixed(2)),
        percentual_acima: parseFloat(percentual_acima),
        dicas
      };
    });

    const total_economia = analise.reduce((sum, a) => sum + a.economia_potencial_reais, 0);

    res.json({
      analise_por_comodo: analise,
      total_economia_potencial_reais: parseFloat(total_economia.toFixed(2)),
      resumo: total_economia > 50 ?
        'Há grande potencial de economia! Siga as dicas para reduzir seus gastos.' :
        'Seu consumo está controlado, mas sempre há espaço para melhorias.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`IA Google Gemini: ${GEMINI_API_KEY ? 'ATIVADA' : 'DESATIVADA (usando análise padrão)'}`);
  });
});