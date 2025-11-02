const { GEMINI_API_KEY } = require('../config/env');

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

        console.log('Enviando requisição para Gemini API...');

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
        console.log('Resposta da Gemini API recebida.');

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

module.exports = { chamarGeminiIA };