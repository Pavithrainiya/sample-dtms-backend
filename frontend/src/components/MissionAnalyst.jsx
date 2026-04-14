import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import { Sparkles, X, Send, Bot, MessageSquare, Loader2 } from 'lucide-react';

export default function MissionAnalyst() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Operational Mission Analyst active. I have access to your full mission records and DTMS briefings. How can I assist you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollTo({ top: messagesEndRef.current?.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/tasks/ai-analyst/', { query: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'System Error: Unable to reach mission intelligence. Ensure your API key is valid.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-500 transition-all hover:scale-110 z-50 group"
      >
        {isOpen ? <X size={24}/> : <Sparkles size={24} className="group-hover:animate-pulse"/>}
        <div className="absolute -top-12 right-0 bg-white text-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
           Mission Intelligence
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[500px] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-fade-in shadow-indigo-500/10">
          {/* Header */}
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Bot size={22}/>
               </div>
               <div>
                  <h3 className="font-black text-sm tracking-tight">Mission Analyst</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Link</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={messagesEndRef}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-500/20' 
                    : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-2">
                   <Loader2 size={16} className="animate-spin text-indigo-500"/>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyzing briefing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="relative">
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask about your missions..."
                className="w-full bg-white border border-slate-200 py-3 pl-4 pr-12 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm transition-all"
              />
              <button 
                type="submit" 
                disabled={!query.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-30"
              >
                <Send size={20}/>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

