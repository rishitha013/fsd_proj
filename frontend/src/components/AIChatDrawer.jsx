import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { sendChatMessage } from '../services/api';

const AIChatDrawer = ({ applicationId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Greetings. I am LoanLens Assistant. Ask me about model drivers, SHAP feature weights, or hypothetical parameter adjustments.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await sendChatMessage({
        application_id: applicationId,
        message: userMsg,
      });
      setMessages((prev) => [...prev, { role: 'assistant', text: res.data.response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Error connecting to Gemini API. Ensure GEMINI_API_KEY is configured in backend/.env.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-3 rounded-full shadow-xl shadow-emerald-950/60 flex items-center space-x-2 transition-transform hover:scale-105 z-40 border border-emerald-400/40"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm">Ask LoanLens AI</span>
      </button>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-[#0b1120] border-l border-slate-800 shadow-2xl z-50 flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100">LoanLens Intelligence</h3>
                <p className="text-[11px] text-slate-400">Grounded in SHAP explanations</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed max-w-[82%] whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'bg-slate-900 text-slate-200 border border-slate-800'
                  }`}
                >
                  {m.text}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-xs text-slate-400">
                <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Evaluating risk factors...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950/80">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this loan decision..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 px-3.5 py-2 rounded-lg text-xs font-bold"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatDrawer;