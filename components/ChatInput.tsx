import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4 pb-6 sm:pb-4">
      <div className="max-w-3xl mx-auto relative">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-100 rounded-3xl p-2 border border-transparent focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-300">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="독도에 대해 궁금한 점을 물어보세요..."
            className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-slate-700 placeholder:text-slate-400 max-h-[120px] overflow-y-auto"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full mb-1 transition-all duration-200 ${
              input.trim() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-105'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </form>
        <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">
                AI는 실수를 할 수 있습니다. 중요한 정보는 확인이 필요합니다. | Powered by Gemini
            </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;