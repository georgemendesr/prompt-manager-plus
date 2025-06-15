import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';

interface Agent {
  id: string;
  name: string;
  slug: string;
}

interface ChatPanelProps {
  assistant: Agent | null;
}

export const ChatPanel = ({ assistant }: ChatPanelProps) => {
  const assistantId = assistant?.id || '';
  const { messages, send, loading, clearMessages } = useChat(assistantId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousAssistantId = useRef<string | null>(null);
  
  // Limpar as mensagens quando trocar de assistente
  useEffect(() => {
    if (assistantId && previousAssistantId.current !== assistantId) {
      console.log("ChatPanel: trocando assistente, limpando mensagens");
      clearMessages();
      previousAssistantId.current = assistantId;
    }
  }, [assistantId, clearMessages]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("ChatPanel.handleSend:", { input, assistantId });
    
    if (!assistantId) {
      console.warn("ChatPanel: assistantId vazio");
      alert("Selecione um agente para enviar mensagens");
      return;
    }
    
    if (!input.trim()) {
      console.warn("ChatPanel: texto vazio");
      return;
    }
    
    try {
      await send(input);
      setInput('');
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  if (!assistant) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-lg">Selecione um agente para iniciar o chat</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col min-h-[400px]">
      {/* Cabeçalho do chat */}
      <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center">
        <h2 className="font-semibold text-lg">{assistant.name} <span className="text-xs text-gray-500">({assistant.id})</span></h2>
        {loading && <span className="text-sm text-violet-600 animate-pulse">Processando...</span>}
      </div>
      
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Envie uma mensagem para iniciar a conversa</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block px-4 py-2 rounded-lg text-base ${
                msg.role === 'user' 
                  ? 'bg-blue-100 text-blue-900' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.content || (msg.role === 'assistant' && loading ? 'Gerando resposta...' : '')}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Formulário de envio */}
      <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-100 p-4 bg-white rounded-b-xl">
        <input
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={loading || !assistantId}
        />
        <button 
          type="submit" 
          className={`bg-violet-600 text-white px-6 py-2 rounded font-semibold hover:bg-violet-700 transition ${
            (loading || !assistantId || !input.trim()) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading || !assistantId || !input.trim()}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}; 