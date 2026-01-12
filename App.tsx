import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { sendMessageToGemini } from './services/gemini';
import { Message } from './types';
import { v4 as uuidv4 } from 'uuid'; // Since we can't install uuid, we'll make a simple helper or assume we can use crypto.randomUUID

// Helper for UUID if package not available in this env, but crypto.randomUUID is standard in modern browsers
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: 'model',
      text: '안녕하세요! 저는 독도 바이브 챗봇입니다. https://pnumin.github.io/vibe_dokdo 사이트의 내용을 바탕으로 독도에 대해 알려드릴게요. 무엇이 궁금하신가요?',
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Pass only the message history context that is relevant. 
      // We pass the full history to keep conversation context if needed.
      const response = await sendMessageToGemini(messages, text);
      
      const botMessage: Message = {
        id: generateId(),
        role: 'model',
        text: response.text,
        sources: response.sources,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: generateId(),
        role: 'model',
        text: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">Dokdo Vibe</h1>
            <p className="text-xs text-slate-500 font-medium">Dokdo Info Chatbot</p>
          </div>
        </div>
        <a 
          href="https://pnumin.github.io/vibe_dokdo" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
        >
          <span>Visit Site</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col min-h-full">
            <div className="flex-1">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
      </main>

      {/* Input Area */}
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;