import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Avatar / Name (Optional) */}
        <span className="text-xs text-slate-400 mb-1 px-1">
          {isUser ? '나' : '독도 바이브 봇'}
        </span>

        {/* Bubble */}
        <div
          className={`px-5 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed break-words ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm user-message'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
          }`}
        >
          <div className="markdown-content">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        </div>

        {/* Sources Section */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-2 p-3 bg-slate-50 border border-slate-100 rounded-lg w-full">
            <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              참고 출처
            </p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-xs text-blue-600 transition-colors duration-200 truncate max-w-full"
                  title={source.title}
                >
                  <span className="truncate max-w-[150px]">{source.title}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Timestamp */}
        <span className="text-[10px] text-slate-300 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;