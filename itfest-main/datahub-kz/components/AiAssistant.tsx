import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { Send, Bot, User, Loader2, Sparkles, GraduationCap, MessageCircle, Zap } from 'lucide-react';

// Quick action questions
const QUICK_QUESTIONS = [
  { icon: "🎯", text: "Подбери IT университет" },
  { icon: "🏥", text: "Где учиться на врача?" },
  { icon: "💰", text: "Бюджетные варианты" },
  { icon: "📊", text: "Сравни топ ВУЗы" },
];

const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Сәлем! 👋 Меня зовут **Айгерім** — я твой персональный профориентолог.

🎓 Я помогу тебе:
• Выбрать идеальный университет
• Подобрать специальность по интересам
• Оценить шансы поступления по баллам ЕНТ
• Сравнить ВУЗы и программы

Расскажи о себе: какие у тебя баллы ЕНТ, что интересует, в каком городе хочешь учиться? 💬`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setShowQuickActions(false);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await sendMessageToGemini(text, history);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: '😔 Извините, произошла ошибка. Попробуйте ещё раз.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
  };

  // Simple markdown-like formatting
  const formatMessage = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        // Bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Handle bullet points
        if (line.startsWith('•') || line.startsWith('-')) {
          return `<div class="ml-4">${line}</div>`;
        }
        return line;
      })
      .join('<br/>');
  };

  return (
    <div className="flex flex-col h-[650px] bg-gradient-to-b from-slate-50 to-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              <GraduationCap className="text-white w-7 h-7" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              Айгерім
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </h2>
            <p className="text-purple-100 text-sm">Профориентолог • Онлайн</p>
          </div>
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-white text-xs font-medium">AI</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  : 'bg-gradient-to-br from-pink-500 to-rose-500'
                }`}>
                {msg.role === 'user'
                  ? <User className="w-5 h-5 text-white" />
                  : <GraduationCap className="w-5 h-5 text-white" />
                }
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm'
                  : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100'
                }`}>
                <div
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                  className="whitespace-pre-wrap"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-slate-500 text-sm">Айгерім думает...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {showQuickActions && !loading && messages.length <= 1 && (
          <div className="pt-2">
            <p className="text-slate-400 text-xs mb-3 flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              Быстрые вопросы:
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickQuestion(q.text)}
                  className="bg-gradient-to-r from-slate-100 to-slate-50 hover:from-indigo-50 hover:to-purple-50 text-slate-700 px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md border border-slate-200 hover:border-indigo-200"
                >
                  {q.icon} {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Спросите про университеты, баллы ЕНТ, специальности..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm placeholder:text-slate-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-slate-400 text-xs mt-3">
          Powered by Gemini AI • DataHub KZ
        </p>
      </div>
    </div>
  );
};

export default AiAssistant;