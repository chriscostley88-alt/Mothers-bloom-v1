
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { getAIChatResponseStream } from '../services/geminiService';
import { UserIcon, BotIcon, SendIcon } from './icons';
import type { Chat } from '@google/genai';


const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await getAIChatResponseStream(input, chatRef);
      
      let newBotMessage: ChatMessage = { role: 'model', text: '' };
      setMessages(prev => [...prev, newBotMessage]);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        newBotMessage.text += chunkText;
        setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1] = { ...newBotMessage };
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
       const errorMessage: ChatMessage = { role: 'model', text: "I'm sorry, I encountered an error. Please try again." };
       setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg text-blue-800">
          <p className="font-semibold">Medical Disclaimer</p>
          <p className="text-sm">
            I am an AI assistant and not a medical professional. The information I provide is for educational purposes only. Always consult with a qualified healthcare provider for any medical advice, diagnosis, or treatment.
          </p>
        </div>
        
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
                <BotIcon className="w-5 h-5 text-white" />
              </div>
            )}
            <div className={`p-3 rounded-2xl max-w-sm md:max-w-md break-words ${msg.role === 'user' ? 'bg-pink-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('*') ? 'font-bold mt-2' : ''}>{line.replace(/^\*/, '')}</p>
                ))}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
              <BotIcon className="w-5 h-5 text-white" />
            </div>
            <div className="p-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none">
              <div className="flex items-center space-x-1">
                  <span className="h-2 w-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-pink-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about pregnancy, baby care..."
            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 disabled:bg-pink-300 transition-colors"
            disabled={isLoading || !input.trim()}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;
