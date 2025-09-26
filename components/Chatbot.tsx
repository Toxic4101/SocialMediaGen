import React, { useState, useEffect, useRef } from 'react';
import { Product, ChatMessage } from '../types';
// FIX: Switched from apiService to geminiService to use the Gemini API directly.
import * as geminiService from '../services/geminiService';

interface ChatbotProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  // FIX: Added props to handle AI errors and cooldown state from parent.
  onAiError: (error: Error) => void;
  isAiOnCooldown: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ product, isOpen, onClose, onAiError, isAiOnCooldown }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && product) {
      setMessages([
        { sender: 'AI', text: `Hi there! I'm the AI assistant for "${product.name}". How can I help you today?` }
      ]);
    } else {
      setMessages([]);
      setInput('');
    }
  }, [isOpen, product]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen || !product) return null;

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { sender: 'USER', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // FIX: Use geminiService for chatbot responses.
      const responseText = await geminiService.getChatbotResponse(product, newMessages);
      const aiMessage: ChatMessage = { sender: 'AI', text: responseText };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
        // FIX: Propagate AI errors to the central handler.
        onAiError(error as Error);
        const errorMessage: ChatMessage = { sender: 'AI', text: "Sorry, I'm having trouble connecting right now. Please try again in a moment." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex items-end justify-center sm:items-center" onClick={onClose}>
      <div 
        className="bg-base-200 rounded-t-lg sm:rounded-lg shadow-2xl w-full max-w-lg flex flex-col h-[80vh] sm:h-[70vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="bg-base-300 p-4 rounded-t-lg flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="font-bold text-primary">AI Support</h3>
            <p className="text-xs text-gray-400 truncate">Asking about: {product.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-base-100 font-bold text-2xl leading-none">&times;</button>
        </header>
        
        <div className="flex-grow p-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex mb-4 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.sender === 'USER' ? 'bg-secondary text-white' : 'bg-base-300'}`}>
                {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
               <div className="rounded-lg px-4 py-2 max-w-[80%] bg-base-300">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                  </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-4 border-t border-base-300 flex-shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isAiOnCooldown ? "AI is on cooldown..." : "Ask a question..."}
              className="w-full bg-base-300 border border-base-100 rounded-md px-3 py-2 text-base-content focus:ring-2 focus:ring-primary focus:outline-none"
              // FIX: Disable input when AI is on cooldown.
              disabled={isLoading || isAiOnCooldown}
            />
            <button 
              onClick={handleSend}
              // FIX: Disable button when AI is on cooldown.
              disabled={isLoading || input.trim() === '' || isAiOnCooldown}
              className="bg-primary text-primary-content px-4 py-2 rounded-md font-semibold hover:bg-primary-focus transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Chatbot;