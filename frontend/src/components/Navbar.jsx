import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';
import { Sun, Moon, Briefcase, RefreshCw } from 'lucide-react';

export const Navbar = () => {
  const { theme, toggleTheme, user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState('');

  const fetchIdeas = async () => {
    try {
      const res = await axios.get(`${API_URL}/ideas`);
      setIdeas(res.data);
      
      // Select first idea if nothing selected yet
      const savedId = localStorage.getItem('activeIdeaId');
      if (res.data.length > 0) {
        if (savedId && res.data.some((i) => i.id.toString() === savedId)) {
          setSelectedIdeaId(savedId);
        } else {
          setSelectedIdeaId(res.data[0].id.toString());
          localStorage.setItem('activeIdeaId', res.data[0].id.toString());
        }
      }
    } catch (err) {
      console.error("Failed to fetch ideas for switcher", err);
    }
  };

  useEffect(() => {
    fetchIdeas();
    
    // Listen for custom event when new idea is added
    const handleNewIdea = () => fetchIdeas();
    window.addEventListener('ideaAdded', handleNewIdea);
    return () => window.removeEventListener('ideaAdded', handleNewIdea);
  }, []);

  const handleSelectIdea = (id) => {
    setSelectedIdeaId(id);
    localStorage.setItem('activeIdeaId', id);
    // Dispatch custom event so pages know to reload
    window.dispatchEvent(new Event('activeIdeaChanged'));
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/75 dark:bg-slate-950/75 px-6 backdrop-blur-md">
      {/* Search / Context Switcher */}
      <div className="flex items-center gap-3">
        <Briefcase className="h-5 w-5 text-sky-500" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">Active Startup:</span>
        {ideas.length > 0 ? (
          <select
            value={selectedIdeaId}
            onChange={(e) => handleSelectIdea(e.target.value)}
            className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-[200px] md:max-w-[300px] truncate"
          >
            {ideas.map((idea) => (
              <option key={idea.id} value={idea.id}>
                {idea.title}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm font-medium text-slate-400 italic">No startups added yet. Go to New Analysis.</span>
        )}
        <button
          onClick={fetchIdeas}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-sky-500 transition border border-slate-200 dark:border-slate-800"
          title="Refresh List"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
          title={theme === 'dark' ? 'Use Light Mode' : 'Use Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-sky-500/20">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden md:inline">{user?.email}</span>
        </div>
      </div>
    </header>
  );
};
