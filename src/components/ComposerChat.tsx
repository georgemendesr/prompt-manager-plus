import { useState, useRef, useEffect } from 'react';
import { useComposerChat } from '../hooks/useComposerChat';

export default function ComposerChat() {
  const { messages, send } = useComposerChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      await send(input);
      setInput('');
    }
  };

  // Scroll automático para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-0 flex flex-col h-[480px] border border-gray-100">
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-2">
        {[...messages].map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-2 rounded-lg text-base ${msg.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'}`}>{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-100 p-4 bg-white rounded-b-xl">
        <input
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition">Enviar</button>
      </form>
    </div>
  );
} 