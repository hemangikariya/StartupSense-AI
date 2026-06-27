import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { 
  Bot, User, Send, Loader2, Plus, Trash2, Edit2, 
  Download, Check, X, Sparkles
} from 'lucide-react';
import { API_URL } from '../context/AuthContext';

export const MentorChat = () => {
  const { analysis, loading: analysisLoading, error, activeIdeaId, reload } = useActiveAnalysis();
  const [sessions, setSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [renameTitle, setRenameTitle] = useState('');
  const chatEndRef = useRef(null);

  const fetchSessions = async () => {
    if (!activeIdeaId) return;
    try {
      const res = await axios.get(`${API_URL}/mentor/history?idea_id=${activeIdeaId}`);
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to load chat history sessions", err);
    }
  };

  useEffect(() => {
    fetchSessions();
    setActiveChatId(null);
    setMessages([]);
    const handleIdeaChange = () => {
      fetchSessions();
      setActiveChatId(null);
      setMessages([]);
    };
    window.addEventListener('activeIdeaChanged', handleIdeaChange);
    return () => window.removeEventListener('activeIdeaChanged', handleIdeaChange);
  }, [activeIdeaId]);

  useEffect(() => {
    if (activeChatId) {
      const fetchMessages = async () => {
        setLoadingHistory(true);
        try {
          const res = await axios.get(`${API_URL}/mentor/history/${activeChatId}`);
          setMessages(res.data);
        } catch (err) {
          console.error("Failed to load chat messages", err);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e, customMsg = null) => {
    if (e) e.preventDefault();
    const userMsg = (customMsg || question).trim();
    if (!userMsg || !activeIdeaId) return;

    if (!customMsg) setQuestion('');
    setSending(true);

    const tempMsg = { 
      question: userMsg, 
      answer: 'Thinking...', 
      created_at: new Date().toISOString() 
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      let url = `${API_URL}/mentor/chat/ask/${activeIdeaId}?question=${encodeURIComponent(userMsg)}`;
      if (activeChatId) {
        url += `&chat_id=${activeChatId}`;
      }
      const res = await axios.post(url);
      
      if (!activeChatId && res.data.chat_id) {
        setActiveChatId(res.data.chat_id);
        fetchSessions();
      } else {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.question === userMsg && msg.answer === 'Thinking...' 
              ? { ...msg, answer: res.data.answer, created_at: res.data.created_at } 
              : msg
          )
        );
      }
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

  const handleRename = async (chatId, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      await axios.put(`${API_URL}/mentor/history/${chatId}/rename`, { title: newTitle });
      setSessions((prev) =>
        prev.map((s) => (s.chat_id === chatId ? { ...s, chat_title: newTitle } : s))
      );
      setEditingChatId(null);
    } catch (err) {
      console.error("Failed to rename chat", err);
    }
  };

  const handleDelete = async (chatId) => {
    if (!window.confirm("Are you sure you want to delete this chat session?")) return;
    try {
      await axios.delete(`${API_URL}/mentor/history/${chatId}`);
      setSessions((prev) => prev.filter((s) => s.chat_id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  };

  const handleExport = async () => {
    if (!activeChatId) return;
    try {
      const res = await axios.post(`${API_URL}/mentor/history/export`, { chat_id: activeChatId });
      const blob = new Blob([res.data.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mentor_chat_${activeChatId}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export chat", err);
    }
  };

  const groupChats = (chats) => {
    const groups = { today: [], yesterday: [], older: [] };
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    chats.forEach((chat) => {
      const chatDate = new Date(chat.created_at);
      if (chatDate.toDateString() === today.toDateString()) {
        groups.today.push(chat);
      } else if (chatDate.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(chat);
      } else {
        groups.older.push(chat);
      }
    });
    return groups;
  };

  const groupedSessions = groupChats(sessions);

  const suggestedPrompts = [
    {
      label: "Improve SWOT weaknesses",
      text: "Based on my SWOT analysis, how can I address my main weaknesses and mitigate key threats?"
    },
    {
      label: "Evaluate competitive moat",
      text: "Analyze my competitive moat and how I can differentiate against other tools in my segment."
    },
    {
      label: "Suggest MVP milestones",
      text: "Under strict timeline and resource constraints, what MVP milestones should I target first?"
    },
    {
      label: "Refine revenue model",
      text: "Recommend a pricing structure (SaaS, transactional, freemium) that best fits my business description."
    }
  ];

  const renderSessionItem = (s) => {
    const isSelected = activeChatId === s.chat_id;
    const isEditing = editingChatId === s.chat_id;

    if (isEditing) {
      return (
        <div key={s.chat_id} className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-sky-500">
          <input
            type="text"
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename(s.chat_id, renameTitle);
              if (e.key === 'Escape') setEditingChatId(null);
            }}
            autoFocus
            className="flex-grow bg-transparent text-xs text-white focus:outline-none w-full"
          />
          <button onClick={() => handleRename(s.chat_id, renameTitle)} className="text-emerald-400 hover:text-emerald-300">
            <Check className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setEditingChatId(null)} className="text-rose-450 hover:text-rose-350">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div
        key={s.chat_id}
        className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition select-none ${
          isSelected
            ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
      >
        <span onClick={() => setActiveChatId(s.chat_id)} className="truncate flex-grow pr-2 py-0.5">
          {s.chat_title || "Untitled Chat"}
        </span>
        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              setEditingChatId(s.chat_id);
              setRenameTitle(s.chat_title || "Untitled Chat");
            }}
            className="p-0.5 text-slate-400 hover:text-sky-400 transition"
            title="Rename Chat"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={() => handleDelete(s.chat_id)}
            className="p-0.5 text-slate-400 hover:text-rose-450 transition"
            title="Delete Chat"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
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
    <div className="p-6 max-w-6xl mx-auto space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          AI Mentor Coach <Bot className="h-7 w-7 text-sky-500 animate-bounce" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          A contextual strategic coach trained on your SWOT, competitors, and risk profile.
        </p>
      </div>

      {/* Main ChatGPT Interface Container */}
      <div className="flex-grow flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md overflow-hidden min-h-0">
        
        {/* Sidebar - Chat History */}
        <div className="w-64 bg-slate-950 text-slate-100 flex flex-col shrink-0 border-r border-slate-800">
          
          {/* New Chat Button */}
          <div className="p-3 border-b border-slate-800">
            <button
              onClick={() => {
                setActiveChatId(null);
                setMessages([]);
              }}
              className="w-full py-2 px-3 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold transition"
            >
              <Plus className="h-4 w-4" /> New Chat
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-grow overflow-y-auto p-3 space-y-4">
            
            {/* Today */}
            {groupedSessions.today.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-2">Today</span>
                {groupedSessions.today.map((s) => renderSessionItem(s))}
              </div>
            )}

            {/* Yesterday */}
            {groupedSessions.yesterday.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-2">Yesterday</span>
                {groupedSessions.yesterday.map((s) => renderSessionItem(s))}
              </div>
            )}

            {/* Older */}
            {groupedSessions.older.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-2">Older</span>
                {groupedSessions.older.map((s) => renderSessionItem(s))}
              </div>
            )}

            {sessions.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs">
                No past chat history.
              </div>
            )}
          </div>
        </div>

        {/* Right side - Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-0 relative">
          
          {/* Active Chat Header */}
          {activeChatId && (
            <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 shrink-0">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                Active Session: {sessions.find(s => s.chat_id === activeChatId)?.chat_title || "Current Conversation"}
              </span>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                title="Export Transcript"
              >
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6 min-h-0">
            {loadingHistory ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
              </div>
            ) : messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div key={idx} className="space-y-3">
                  {/* User Query */}
                  <div className="flex items-start gap-3 justify-end">
                    <div className="flex flex-col items-end gap-1">
                      <div className="bg-sky-500 text-slate-950 p-4 rounded-2xl rounded-tr-none max-w-md text-sm font-semibold shadow-sm">
                        {msg.question || msg.message}
                      </div>
                      <span className="text-slate-400 text-[10px] px-1">
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                      <User className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/20">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col gap-1 items-start">
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl rounded-tl-none max-w-md text-sm text-slate-700 dark:text-slate-200 leading-relaxed shadow-sm whitespace-pre-wrap">
                        {msg.answer || msg.response}
                      </div>
                      <span className="text-slate-400 text-[10px] px-1">
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty State - Suggested Prompts
              <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-6">
                <div className="h-16 w-16 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-sky-500/10">
                  <Sparkles className="h-8 w-8 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Welcome to AI Mentor Coach</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Ask me about SWOTS, revenue modeling, competitive strategy, product market validation, or scale planning.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                  {suggestedPrompts.map((p, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleSend(e, p.text)}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 hover:bg-sky-50/20 dark:hover:bg-sky-950/20 rounded-xl text-left transition text-xs shadow-sm flex flex-col justify-between h-24 text-slate-700 dark:text-slate-350"
                    >
                      <span className="font-semibold">{p.label}</span>
                      <span className="text-slate-400 text-[10px] mt-1 line-clamp-2">{p.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Panel */}
          <form onSubmit={(e) => handleSend(e)} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-3 shrink-0">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask Startup Mentor..."
              disabled={sending}
              className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition shadow-inner text-slate-800 dark:text-slate-150"
            />
            <button
              type="submit"
              disabled={sending || !question.trim()}
              className="px-5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl flex items-center justify-center transition shadow-md font-semibold text-sm gap-1.5"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send <Send className="h-3.5 w-3.5" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
