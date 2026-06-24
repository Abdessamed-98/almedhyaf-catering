import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
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
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label={t('chat_title')}
        className={`fixed bottom-6 end-6 z-50 p-4 rounded-full shadow-lg transition-transform hover:scale-110 ${isOpen ? 'hidden' : 'bg-brand-600 text-white'}`}
      >
        <MessageSquare className="w-8 h-8" />
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
