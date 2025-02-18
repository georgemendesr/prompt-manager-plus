
import { useState, useEffect } from 'react';
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    setInput('');
    
    // Adiciona mensagem do usuário
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsThinking(true);

    // Simula resposta do assistente (por enquanto)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Esta é uma versão inicial do assistente. Em breve implementaremos a integração com modelos de IA mais avançados!' 
      }]);
      setIsThinking(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      ) : (
        <Card className={`
          w-[380px] 
          transition-all duration-300 ease
          ${isMinimized ? 'h-14' : 'h-[600px]'}
          flex flex-col
          shadow-xl
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold">Assistente</h3>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message, i) => (
                    <div
                      key={i}
                      className={`
                        flex 
                        ${message.role === 'user' ? 'justify-end' : 'justify-start'}
                      `}
                    >
                      <div
                        className={`
                          max-w-[80%] p-3 rounded-lg
                          ${message.role === 'user' 
                            ? 'bg-primary text-primary-foreground ml-4' 
                            : 'bg-muted mr-4'
                          }
                        `}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg mr-4">
                        Pensando...
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="w-full"
                  disabled={isThinking}
                />
              </form>
            </>
          )}
        </Card>
      )}
    </div>
  );
};
