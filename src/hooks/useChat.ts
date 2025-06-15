import { useState, useCallback, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function useChat(assistantId: string, temperature: number = 0.7) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  
  // Usar refs para evitar dependências que mudam a cada render
  const assistantIdRef = useRef(assistantId);
  
  // Atualizar refs quando as props mudarem
  useEffect(() => {
    console.log("useChat: assistantId atualizado", { old: assistantIdRef.current, new: assistantId });
    assistantIdRef.current = assistantId;
    
    // Limpar mensagens quando o assistente mudar
    if (assistantId && assistantIdRef.current !== assistantId) {
      console.log("useChat: limpando mensagens por mudança de assistente");
      setMessages([]);
      setThreadId(null);
    }
  }, [assistantId]);

  // Função auxiliar para adicionar texto à última mensagem do assistente
  const appendAssistantText = useCallback((text: string) => {
    setMessages(currentMessages => {
      // Se não há mensagens ou a última não é do assistente, não faz nada
      if (currentMessages.length === 0 || currentMessages[currentMessages.length - 1].role !== 'assistant') {
        return currentMessages;
      }
      
      // Cria uma cópia profunda das mensagens
      const updatedMessages = [...currentMessages];
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      
      // Adiciona o novo texto ao conteúdo existente
      updatedMessages[updatedMessages.length - 1] = {
        ...lastMessage,
        content: lastMessage.content + text
      };
      
      return updatedMessages;
    });
  }, []);

  const send = useCallback(async (userText: string) => {
    console.log("useChat.send: iniciando", { assistantId: assistantIdRef.current, userText });
    
    if (!assistantIdRef.current) {
      console.warn("useChat: assistantId vazio, não é possível enviar mensagem");
      return;
    }

    if (!userText.trim()) {
      console.warn("useChat: texto vazio, não é possível enviar mensagem");
      return;
    }

    setLoading(true);
    
    // Adiciona a mensagem do usuário imediatamente
    const userMessage: Message = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Preparar o corpo da requisição
      const requestBody = {
        assistantId: assistantIdRef.current,
        messages: [...messages, userMessage],
        temperature,
        threadId
      };

      console.log("dispatchChat", { 
        assistantId: assistantIdRef.current, 
        url: `/api/chat`,
        body: JSON.stringify(requestBody)
      });
      
      // Fazer a requisição para o backend usando o proxy configurado no Vite
      const res = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      console.log("useChat: resposta recebida", { status: res.status, ok: res.ok });

      if (!res.ok) {
        throw new Error(`Erro na requisição: ${res.status}`);
      }

      if (!res.body) {
        throw new Error('Resposta sem corpo');
      }

      // Inicializar a mensagem do assistente vazia
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      console.log("Mensagem do assistente inicializada");

      // Processar o stream de resposta
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      
      console.log("Iniciando leitura do stream SSE");
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log("Stream finalizado (done)");
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        console.log("Buffer recebido:", buffer.substring(0, 100) + (buffer.length > 100 ? "..." : ""));
        
        // Processa blocos completos
        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const chunk = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);
          
          console.log("Processando chunk:", chunk);
          
          if (chunk.startsWith("event: done")) {
            // Stream encerrado
            console.log("Evento 'done' recebido");
            
            // Extrair o threadId
            const match = chunk.match(/data: (.+)/);
            if (match && match[1]) {
              console.log("Thread ID extraído:", match[1]);
              setThreadId(match[1]);
            }
            
            continue;
          }
          
          if (chunk.startsWith("data:")) {
            try {
              const payload = JSON.parse(chunk.slice(5).trim());
              console.log("Payload extraído:", payload);
              
              if (payload.content) {
                console.log("Delta recebido:", payload.content);
                appendAssistantText(payload.content);
              }
            } catch (e) {
              console.error('Erro ao processar chunk:', e, chunk);
            }
          }
        }
      }
      
      console.log("Stream finalizado");
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setLoading(false);
    }
  }, [messages, threadId, temperature, appendAssistantText]);

  // Função para limpar as mensagens (útil ao trocar de agente)
  const clearMessages = useCallback(() => {
    setMessages([]);
    setThreadId(null);
  }, []);

  return { messages, send, loading, clearMessages };
} 