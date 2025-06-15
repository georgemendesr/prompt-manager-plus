import { useState } from 'react';

export function useComposerChat() {
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null);

  async function send(userText) {
    setMessages(m => [...m, { role: 'user', content: userText }]);
    const es = new EventSource('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [...messages, { role: 'user', content: userText }], threadId }),
    });

    let assistantMsg = { role: 'assistant', content: '' };
    es.onmessage = e => {
      const delta = JSON.parse(e.data);
      if (delta.content) {
        assistantMsg.content += delta.content;
        setMessages(m => [...m.slice(0, -1), assistantMsg]);
      }
    };
    es.addEventListener('done', e => {
      const newThreadId = e.data;
      setThreadId(newThreadId);
      es.close();
    });
  }

  return { messages, send };
} 