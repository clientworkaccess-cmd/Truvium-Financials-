import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingEffectActive, setIsTypingEffectActive] = useState(false);
  
  // Use a ref to keep track of if we should continue typing to avoid closure staleness
  const typingRef = useRef(false);

  const processedMessageText = message.text;

  useEffect(() => {
    // Only apply effect if it's an agent message and it is the last one (newly arrived)
    if (message.sender === 'agent' && message.isLast) {
      typingRef.current = true;
      setIsTypingEffectActive(true);
      let currentIndex = 0;
      setDisplayedText(''); // Start empty

      const typeChar = () => {
        if (!typingRef.current) return;

        if (currentIndex < processedMessageText.length) {
          // Slice allows us to handle special characters slightly better than appending
          setDisplayedText(processedMessageText.slice(0, currentIndex + 1));
          currentIndex++;
          
          // Constant speed for smooth typewriter effect
          setTimeout(typeChar, 20);
        } else {
          setIsTypingEffectActive(false);
          typingRef.current = false;
        }
      };
      
      // Start typing
      typeChar();
    } else {
      // If not last or not agent, show full text immediately
      typingRef.current = false;
      setDisplayedText(processedMessageText);
      setIsTypingEffectActive(false);
    }

    return () => {
      typingRef.current = false;
    };
  }, [processedMessageText, message.sender, message.isLast]);

  return (
    <div 
      className={`flex w-full animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}
      role="listitem"
      aria-label={`${isUser ? 'You said' : 'Truvium said'}: ${message.text}`}
    >
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div 
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md border ${
            isUser 
              ? 'bg-violet-50 text-violet-600 border-white' 
              : 'bg-white text-truvium-dark border-white/60'
          }`}
          aria-hidden="true"
        >
          {isUser ? <User size={16} /> : <Sparkles size={16} className="text-truvium-primary" />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0`}>
          <div 
            className={`
              relative px-5 py-3 rounded-2xl text-sm shadow-sm backdrop-blur-md
              break-words whitespace-pre-wrap overflow-hidden transition-all duration-300
              ${isUser 
                ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-violet-200/50' 
                : 'glass-panel text-slate-700 rounded-tl-sm border-white/40'
              }
            `}
          >
             {/* Using ReactMarkdown to safely render bot responses which might contain formatting */}
             {isUser ? (
                <span className="font-medium tracking-wide leading-relaxed">{message.text}</span>
             ) : (
                <div className="markdown-body font-medium leading-snug text-slate-700">
                   <ReactMarkdown>{displayedText}</ReactMarkdown>
                </div>
             )}
          </div>
          
          <span 
            className={`text-[10px] font-semibold tracking-wider mt-1 px-1 opacity-70 ${isUser ? 'text-violet-400' : 'text-slate-500'}`}
            aria-label={`Sent at ${message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          >
            {message.sender === 'agent' ? 'TRUVIUM AI' : 'YOU'} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};