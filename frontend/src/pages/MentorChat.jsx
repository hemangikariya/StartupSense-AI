import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

export const MentorChat = () => {
  const { analysis, loading: analysisLoading, error, activeIdeaId, reload } = useActiveAnalysis();
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const chatEndRef = useRef(null);

  const fetchHistory = async () => {
    if (!activeIdeaId) return;
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API_URL}/mentor/chat/history/${activeIdeaId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load chat history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const handleIdeaChange = () => fetchHistory();
    window.addEventListener('activeIdeaChanged', handleIdeaChange);
    return () => window.removeEventListener('activeIdeaChanged', handleIdeaChange);
  }, [activeIdeaId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!question.trim() || !activeIdeaId) return;

    const userMsg = question;
    setQuestion('');
    setSending(true);

    // optimistically add question
    const tempMsg = { question: userMsg, answer: 'Thinking...' };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await axios.post(`${API_URL}/mentor/chat/ask/${activeIdeaId}?question=${encodeURIComponent(userMsg)}`);
      
      // Update with final answer
      setMessages((prev) => 
        prev.map((msg) => 
          msg.question === userMsg && msg.answer === 'Thinking...' 
            ? { ...msg, answer: res.data.answer } 
            : msg
        )
      );
    } catch (err) {
      console.error("Failed to get mentor response", err);
      setMessages((prev) => 
        prev.map((msg) => 
          msg.question === userMsg && msg.answer === 'Thinking...' 
            ? { ...msg, answer: 'Sorry, I failed to connect to the AI model. Please verify API configuration.' } 
            : msg
        )
      );
    } finally {
      setSending(false);
    }
  };

  if (analysisLoading) {
    return <div className="p-8"><div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></div>;
  }
  if (error === 'NOT_ANALYZED') {
    return <EmptyState type="NOT_ANALYZED" activeIdeaId={activeIdeaId} onValidateComplete={reload} />;
  }
  if (!activeIdeaId || !analysis) {
    return <EmptyState type="NO_STARTUPS" />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          AI Mentor Coach <Bot className="h-7 w-7 text-sky-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          A contextual strategic coach trained on your SWOT, competitors, and risk profile.
        </p>
      </div>

      {/* Chat Messages Panel */}
      <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-y-auto space-y-6">
        {loadingHistory ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 text-sky-500 animate-spin" />
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg, idx) => (
            <div key={idx} className="space-y-4">
              {/* Question */}
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-sky-500 text-slate-950 p-4 rounded-2xl rounded-tr-none max-w-md text-sm font-semibold shadow-sm">
                  {msg.question}
                </div>
                <div className="h-8 w-8 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                  <User className="h-4.5 w-4.5 animate-pulse" />
                </div>
              </div>
              {/* Answer */}
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl rounded-tl-none max-w-md text-sm text-slate-700 dark:text-slate-200 leading-relaxed shadow-sm">
                  {msg.answer}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 space-y-2">
            <Bot className="h-12 w-12 text-slate-300 dark:text-slate-750 animate-pulse" />
            <p className="text-sm font-semibold">How can I help you scale today?</p>
            <p className="text-xs">Ask me about your competitive moat, risk mitigations, or MVP milestones.</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input panel */}
      <form onSubmit={handleSend} className="flex gap-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask AI Coach..."
          disabled={sending}
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={sending || !question.trim()}
          className="h-14 w-14 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-slate-950 flex items-center justify-center shrink-0 transition shadow-lg shadow-sky-500/15"
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </form>
    </div>
  );
};
