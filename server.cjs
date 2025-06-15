require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3008;

// Configuração CORS simplificada
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

app.post('/api/chat', async (req, res) => {
  const { messages, threadId, assistantId } = req.body;
  const activeAssistantId = assistantId || process.env.OPENAI_ASSISTANT_ID;

  try {
    console.log(`Processando chat: assistantId=${activeAssistantId}, mensagens=${messages.length}`);
    
    // Criar thread
    const thread = threadId ? { id: threadId } : await openai.beta.threads.create();
    console.log(`Thread: ${thread.id}`);

    // Adicionar mensagem do usuário
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: messages[messages.length - 1].content,
    });

    // Configurar SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Enviar mensagem inicial para testar o streaming
    res.write(`data: ${JSON.stringify({ content: "Conectado. " })}\n\n`);
    
    // Iniciar streaming
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: activeAssistantId,
      stream: true,
    });

    // Processar stream de resposta
    for await (const chunk of run) {
      if (chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content) {
        const content = chunk.choices[0].delta.content;
        console.log(`[DELTA] "${content}"`);
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Finalizar stream
    console.log("Stream finalizado");
    res.write(`event: done\ndata: ${thread.id}\n\n`);
    res.end();
  } catch (err) {
    console.error('Erro no chat:', err);
    res.status(500).json({ error: 'Erro ao processar chat.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
}); 