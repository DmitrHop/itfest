import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { queryRAG, SourceDocument } from '../services/ragService';
import { Send, User, Zap, MapPin, Database, Wifi, Brain, GraduationCap, Sparkles } from 'lucide-react';

// Extended ChatMessage with sources
interface ExtendedChatMessage extends ChatMessage {
  sources?: SourceDocument[];
  isRAG?: boolean;
}

// Quick action questions
const QUICK_QUESTIONS = [
  { icon: "🎯", text: "IT университеты в Алматы" },
  { icon: "🏥", text: "Медицинские ВУЗы" },
  { icon: "💰", text: "Бюджетные программы" },
  { icon: "⭐", text: "Топ-5 университетов" },
];

const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Сәлем! 👋 Мен **AIgerim** — сенің жеке профориентологың!

🎓 Мен саған көмектесемін:
• Идеалды университетті таңдауға
• Қызығушылықтарыңа сәйкес мамандықты табуға  
• ЕНТ балдарыңмен түсу мүмкіндігін бағалауға
• ЖОО-ларды салыстыруға

Расскажи о себе: какие у тебя баллы ЕНТ, что интересует? 💬`,
      timestamp: new Date(),
      isRAG: false
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [useRAG, setUseRAG] = useState(true);
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

    const userMsg: ExtendedChatMessage = {
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
      let responseText = '';
      let sources: SourceDocument[] = [];
      let usedRAG = false;

      if (useRAG) {
        try {
          const ragResponse = await queryRAG(text);
          responseText = ragResponse.answer;
          sources = ragResponse.sources || [];
          usedRAG = true;
        } catch (ragError) {
          console.warn('RAG API failed, falling back to Gemini:', ragError);
        }
      }

      if (!usedRAG) {
        const history = messages.map(m => ({ role: m.role, text: m.text }));
        responseText = await sendMessageToGemini(text, history);
      }

      const botMsg: ExtendedChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
        sources: sources,
        isRAG: usedRAG
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
      const errorMsg: ExtendedChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: '😔 Произошла ошибка. Попробуйте ещё раз.',
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

  // Markdown formatting
  const formatMessage = (text: string) => {
    const lines = text.split('\n');
    let html = '';
    let inList = false;

    lines.forEach((line) => {
      if (line.trim() === '') {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<div class="h-2"></div>';
        return;
      }

      if (/^[📊🎯🔄📝💪✅🏛️📋⚠️💬🎓]/.test(line.trim())) {
        if (inList) { html += '</ul>'; inList = false; }
        let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html += `<div class="font-semibold text-slate-800 mt-3 mb-1">${processed}</div>`;
        return;
      }

      if (/^\d+\.\s/.test(line.trim())) {
        if (inList) { html += '</ul>'; inList = false; }
        let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html += `<div class="font-semibold text-slate-800 mt-3 mb-1">${processed}</div>`;
        return;
      }

      if (/^[\-•\*]\s/.test(line.trim())) {
        if (!inList) { html += '<ul class="list-none space-y-1 ml-2">'; inList = true; }
        let content = line.replace(/^[\s\-•\*]+/, '').trim();
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html += `<li class="flex items-start gap-2"><span class="text-slate-400">•</span><span>${content}</span></li>`;
        return;
      }

      if (inList) { html += '</ul>'; inList = false; }
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html += `<div>${processed}</div>`;
    });

    if (inList) html += '</ul>';
    return html;
  };

  // Source card - minimalist
  const SourceCard = ({ source }: { source: SourceDocument }) => (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-slate-800 text-sm truncate">{source.name}</h4>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <MapPin className="w-3 h-3" />
            <span>{source.city}</span>
            <span className="text-slate-300">|</span>
            <span>{source.category}</span>
          </div>
        </div>
        <div className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded font-medium border border-cyan-100">
          {Math.round(source.relevance_score * 100)}%
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-cyan-50/50 p-2 rounded-lg border border-cyan-100">
              <Brain className="text-kz-blue w-5 h-5" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-slate-800 font-semibold text-lg flex items-center gap-2">
              AIgerim
            </h2>
            <p className="text-slate-400 text-xs">Персональный профориентолог</p>
          </div>
          <button
            onClick={() => setUseRAG(!useRAG)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${useRAG
              ? 'bg-kz-blue text-white shadow-sm shadow-cyan-200'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
          >
            {useRAG ? <Database className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            {useRAG ? 'RAG' : 'AI'}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="min-h-full flex flex-col justify-end p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[90%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-kz-blue' : 'bg-slate-100' // Use Brand Blue for user
                    }`}>
                    {msg.role === 'user'
                      ? <User className="w-4 h-4 text-white" />
                      : <Brain className="w-4 h-4 text-kz-blue" /> // Brand blue icon
                    }
                  </div>
                  <div className={`p-4 rounded-xl text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-kz-blue text-white rounded-tr-sm shadow-sm shadow-cyan-100' // Brand Blue bubble
                    : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100 shadow-sm'
                    }`}>
                    <div
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                      className="whitespace-pre-wrap"
                    />
                    {msg.role === 'model' && msg.isRAG && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-kz-blue/80">
                        <Database className="w-3 h-3" />
                        <span>Из базы данных</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="ml-11 mt-2">
                  <div className="text-xs text-slate-500 mb-2 font-medium">
                    Источники ({msg.sources.length}):
                  </div>
                  <div className="grid gap-2">
                    {msg.sources.slice(0, 3).map((source, idx) => (
                      <SourceCard key={idx} source={source} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[90%] gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-slate-400 animate-pulse" />
                </div>
                <div className="bg-white p-4 rounded-xl rounded-tl-sm border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions - Anchored above Input */}
      {showQuickActions && !loading && messages.length <= 1 && (
        <div className="px-4 pb-1 bg-slate-50 border-t border-slate-100/50">
          <p className="text-slate-500 text-xs mb-2 flex items-center gap-1.5 pt-2">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Быстрые вопросы:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q.text)}
                className="bg-white hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-md text-xs font-medium transition-all border border-slate-200 hover:border-slate-300 flex items-center gap-2"
              >
                <span className="grayscale opacity-60">{q.icon}</span>
                <span>{q.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Задайте вопрос про университеты..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm placeholder:text-slate-400 transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-kz-blue hover:bg-cyan-600 text-white px-4 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-cyan-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-slate-400 text-xs mt-3">
          {useRAG ? '🔍 RAG • 26 вузов' : '✨ AI Mode'} • DataHub KZ
        </p>
      </div>
    </div>
  );
};

export default AiAssistant;