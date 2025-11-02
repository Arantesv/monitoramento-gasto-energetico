const db = require('../config/db');
const { chamarGeminiIA } = require('../services/geminiService');

const getAnaliseConsumo = async (req, res) => {
    try {
        const [consumo] = await db.pool.query(`
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
};

module.exports = {
    getAnaliseConsumo
};