import React, { useState } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ChatBot: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: t('chat_greeting'), sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;

    setMessages(prev => [...prev, { id: Date.now(), text: inputValue, sender: 'user' }]);
    setInputValue('');

    // Simulate bot thinking
    setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: t('chat_auto_reply'), sender: 'bot' }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button — animated assistant robot */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label={t('chat_title')}
        className={`group fixed bottom-6 end-6 z-50 grid place-items-center w-16 h-16 rounded-full ring-4 ring-white/70 shadow-xl shadow-brand-900/35 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white transition-transform hover:scale-110 active:scale-95 ${isOpen ? 'hidden' : ''}`}
      >
        {/* attention pulse */}
        <span className="absolute inset-0 rounded-full bg-brand-500 opacity-40 animate-ping" />
        {/* online dot */}
        <span className="absolute -top-0.5 -end-0.5 w-3.5 h-3.5 rounded-full bg-green-400 ring-2 ring-white" />
        {/* robot */}
        <span className="robo-bob relative">
          <svg viewBox="0 0 48 48" className="w-12 h-12 drop-shadow-sm" fill="none">
            {/* antenna */}
            <line x1="24" y1="6.5" x2="24" y2="11" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
            <circle className="robo-antenna" cx="24" cy="5" r="2.6" fill="#F8C15D" />
            {/* head */}
            <rect x="9" y="11" width="30" height="24" rx="8" fill="#fff" />
            {/* side headphones */}
            <rect x="4.5" y="18" width="4.5" height="10" rx="2.25" fill="#F8C15D" />
            <rect x="39" y="18" width="4.5" height="10" rx="2.25" fill="#F8C15D" />
            {/* eyes (blink) */}
            <g className="robo-eyes" fill="#801212">
              <circle cx="18" cy="22" r="3" />
              <circle cx="30" cy="22" r="3" />
            </g>
            {/* eye shine */}
            <circle cx="19.1" cy="20.9" r="0.9" fill="#fff" />
            <circle cx="31.1" cy="20.9" r="0.9" fill="#fff" />
            {/* smile */}
            <path d="M18.5 28c1.8 1.8 9.2 1.8 11 0" stroke="#801212" strokeWidth="2" strokeLinecap="round" />
            {/* cheeks */}
            <circle cx="14.5" cy="27" r="1.5" fill="#F8C15D" opacity="0.85" />
            <circle cx="33.5" cy="27" r="1.5" fill="#F8C15D" opacity="0.85" />
          </svg>
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 end-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-brand-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                    <Bot className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">{t('chat_title')}</h3>
                    <p className="text-xs text-brand-100">{t('chat_online')}</p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label={t('ord_cancel')} className="hover:bg-brand-700 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 h-80 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-ee-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-es-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('chat_placeholder')}
              aria-label={t('chat_placeholder')}
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
                onClick={handleSend}
                aria-label={t('ord_apply')}
                className="bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700 transition-colors flex items-center justify-center"
            >
              <Send className="w-5 h-5 rtl:-scale-x-100" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
