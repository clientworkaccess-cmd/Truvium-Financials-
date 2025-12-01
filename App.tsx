import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { TypingIndicator } from './components/TypingIndicator';
import { AuthScreen } from './components/AuthScreen';
import { Message, User } from './types';
import { sendMessageToWebhook } from './services/webhookService';
import { refineText, suggestReply } from './services/geminiService';
import { Send, Sparkles, Wand2, Mic, MicOff, LogOut } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './services/supabaseClient';

// Type definition for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}
const _window = window as unknown as IWindow;

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello. I am Truvium, your corporate assistant. How may I help you with your tasks today?",
      sender: 'agent',
      timestamp: new Date(),
      isLast: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(uuidv4());
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isRefining, setIsRefining] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to map Supabase user to App User
  const mapSessionToUser = (supabaseUser: any): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
      role: 'Employee', // Default role
      status: 'online',
      avatar: `https://ui-avatars.com/api/?name=${supabaseUser.user_metadata?.full_name || supabaseUser.email}&background=7c3aed&color=fff`
    };
  };

  useEffect(() => {
    // Check for active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(mapSessionToUser(session.user));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(mapSessionToUser(session.user));
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, currentUser, suggestions]); 

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [inputValue]);
  
  // Manage isLast property on messages
  useEffect(() => {
    if (messages.length > 0) {
        const updatedMessages = messages.map((msg, index) => ({
            ...msg,
            isLast: index === messages.length - 1
          }));
        
        const lastMsgOriginal = messages[messages.length - 1];
        const lastMsgUpdated = updatedMessages[updatedMessages.length - 1];
        
        if (lastMsgOriginal?.isLast !== lastMsgUpdated?.isLast) {
          setMessages(updatedMessages);
        }
      }
    }, [messages.length]);
    
    
    const handleSend = async () => {
      if (!inputValue.trim() || !currentUser) return;
      
      const userMsg: Message = {
        id: uuidv4(),
        text: inputValue,
        sender: 'user',
        timestamp: new Date(),
        isLast: false
      };
      
      setMessages(prev => {
        const resetLast = prev.map(m => ({ ...m, isLast: false }));
        return [...resetLast, userMsg];
      });
      
      setInputValue('');
      setSuggestions([]); 
      setIsTyping(true);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      try {
      // Send to n8n webhook with user details
      const responseText = await sendMessageToWebhook(
          userMsg.text, 
          sessionId, 
          currentUser.email,
          currentUser.name
      );
      
      const agentMsg: Message = {
        id: uuidv4(),
        text: responseText,
        sender: 'agent',
        timestamp: new Date(),
        isLast: true
      };
      console.log(responseText);
      
      setMessages(prev => [...prev, agentMsg]);
      
      generateSuggestions([...messages, userMsg, agentMsg]);

    } catch (error) {
       const errorMsg: Message = {
        id: uuidv4(),
        text: "I'm having trouble connecting to the Truvium server. Please try again later.",
        sender: 'system',
        timestamp: new Date(),
        isLast: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRefine = async () => {
    if (!inputValue.trim()) return;
    setIsRefining(true);
    try {
      const refined = await refineText(inputValue, 'professional');
      setInputValue(refined);
    } catch (e) {
      // fail silently
    } finally {
      setIsRefining(false);
    }
  };

  const generateSuggestions = async (historyMsg: Message[]) => {
      // Logic relies on service to check key availability
      try {
          const historyStrings = historyMsg.slice(-5).map(m => `${m.sender}: ${m.text}`);
          const replies = await suggestReply(historyStrings);
          setSuggestions(replies);
      } catch (e) {
          console.error("Failed to generate suggestions", e);
      }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = _window.SpeechRecognition || _window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInputValue(prev => {
            const spacer = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + spacer + finalTranscript;
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
      setMessages([{
        id: '1',
        text: "Hello. I am Truvium, your corporate assistant. How may I help you with your tasks today?",
        sender: 'agent',
        timestamp: new Date(),
        isLast: true
      }]);
      setInputValue('');
  };

  if (!currentUser) {
      return <AuthScreen />;
  }

  return (
    <div className="flex h-screen w-full relative font-sans selection:bg-purple-200 selection:text-purple-900 overflow-hidden">
      
      {/* Dynamic Ambient Background */}
      <div className="ambient-bg" aria-hidden="true">
        {/* Top Left - Purple */}
        <div className="absolute top-0 -left-10 w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        
        {/* Top Right - Violet */}
        <div className="absolute top-0 -right-10 w-[500px] h-[500px] bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob-reverse animation-delay-2000"></div>
        
        {/* Bottom Left - Pink */}
        <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        
        {/* Bottom Right - Blue */}
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob-reverse animation-delay-6000"></div>
        
        {/* Center/Random - Fuchsia */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-8000"></div>
        
        {/* Top Center - Indigo */}
        <div className="absolute top-20 left-1/3 w-[300px] h-[300px] bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob-reverse animation-delay-10000"></div>
      </div>
      
      <main className="flex-1 flex flex-col relative h-full z-10" role="main">
        
        {/* Floating Minimal Header */}
        <header className="absolute top-0 left-0 right-0 h-24 flex items-center justify-between px-8 z-20" role="banner">
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/20" aria-hidden="true">
                        T
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">TRUVIUM</h1>
                        <p className="text-[10px] text-violet-600 uppercase tracking-[0.2em] font-bold mt-1">Financial Connect</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div 
                  className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-white/50 backdrop-blur-md shadow-sm"
                  role="status"
                  aria-label="System status: Secure"
                >
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Secure</span>
                </div>
                
                <button 
                    onClick={handleLogout}
                    className="p-3 rounded-full hover:bg-white/50 text-slate-400 hover:text-red-500 transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    title="Sign Out"
                    aria-label="Sign Out"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>

        {/* Chat Area - Centered & Spacious */}
        <div 
          className="flex-1 overflow-y-auto px-4 pt-28 pb-68 scroll-smooth" 
          role="log" 
          aria-live="polite" 
          aria-relevant="additions"
          aria-label="Chat history"
        >
          <div className="max-w-4xl mx-auto w-full flex flex-col space-y-2">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isTyping && (
                <div className="flex justify-start w-full mb-8 pl-14 animate-fade-in-up" role="status" aria-label="Truvium is typing...">
                    <TypingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-6 left-0 right-0 z-100 flex flex-col items-center gap-2 pointer-events-none">
            
            {/* Suggestions Pills - Full Width & Safe Centering */}
            {suggestions.length > 0 && (
                <div 
                  className="w-full px-4 overflow-x-auto no-scrollbar pb-2 pointer-events-auto"
                  role="group"
                  aria-label="Suggested responses"
                >
                    {/* w-max + mx-auto ensures centering if fits, left-align if overflow */}
                    <div className="flex gap-3 w-max mx-auto px-4 py-2">
                        {suggestions.map((s, i) => (
                            <button 
                                key={i} 
                                onClick={() => setInputValue(s)}
                                className="flex-shrink-0 whitespace-nowrap px-6 py-2 rounded-2xl bg-white/80 border border-white/60 hover:bg-violet-600 hover:text-white hover:border-violet-500 text-sm font-medium text-slate-600 transition-all flex items-center gap-2 backdrop-blur-md shadow-sm hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-violet-400"
                                aria-label={`Send suggestion: ${s}`}
                            >
                                <Sparkles size={14} className="opacity-70" aria-hidden="true" />
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Input Pill - Constrained Width */}
            <div className="w-full max-w-3xl px-4 pointer-events-auto">
                <div 
                  className={`glass-input rounded-[32px] p-2 pl-3 flex items-center gap-2 transition-all w-full duration-300 ${isListening ? 'ring-4 ring-violet-200 border-violet-300' : ''}`}
                  role="form"
                  aria-label="Message form"
                >
                    
                     {/* Voice */}
                    <button 
                        onClick={toggleVoiceInput}
                        className={`p-3.5 rounded-full transition-all duration-300 flex-shrink-0 border border-transparent focus:outline-none focus:ring-2 focus:ring-violet-400 ${
                            isListening 
                            ? 'bg-violet-600 text-white animate-pulse shadow-lg' 
                            : 'text-slate-500 hover:bg-white/60 hover:text-violet-600 hover:shadow-md'
                        }`}
                        title={isListening ? "Stop Listening" : "Start Voice Input"}
                        aria-label={isListening ? "Stop Voice Input" : "Start Voice Input"}
                        aria-pressed={isListening}
                    >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    
                    <div className="flex-1 py-2 px-2">
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={isListening ? "Listening..." : "Type your message..."}
                            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-500 resize-none max-h-32 overflow-y-auto text-[15px] font-medium leading-relaxed"
                            rows={1}
                            style={{ minHeight: '24px' }}
                            aria-label="Type your message"
                        />
                    </div>

                    <div className="flex items-center gap-2 pr-1">
                        {inputValue.trim().length > 0 && (
                            <button 
                                onClick={handleRefine}
                                disabled={isRefining}
                                className={`p-3 rounded-full transition-all flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-violet-400 ${isRefining ? 'text-violet-600 bg-violet-100 rotate-180' : 'text-slate-400 hover:text-violet-600 hover:bg-white/50'}`}
                                title="Refine with AI"
                                aria-label="Refine message text with AI"
                            >
                                <Wand2 size={18} />
                            </button>
                        )}

                        <button 
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className={`p-3.5 rounded-full transition-all duration-300 flex-shrink-0 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-violet-400 ${
                                inputValue.trim() 
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-violet-500/30 hover:scale-105 active:scale-95' 
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            }`}
                            aria-label="Send message"
                        >
                            <Send size={18} className={inputValue.trim() ? 'ml-0.5' : ''} />
                        </button>
                    </div>
                </div>
            </div>
                
        </div>
      </main>
    </div>
  );
}

export default App;