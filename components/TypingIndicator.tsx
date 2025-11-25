import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex space-x-1 items-center bg-white/40 border border-white/50 rounded-2xl px-4 py-3 w-fit shadow-sm backdrop-blur-md">
      <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
};