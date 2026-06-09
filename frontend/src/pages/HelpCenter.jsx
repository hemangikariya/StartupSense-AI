import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import { HelpCircle, Loader2, CheckCircle2, MessageSquarePlus } from 'lucide-react';

export const HelpCenter = () => {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/support/tickets`);
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setSuccess(false);

    try {
      await axios.post(`${API_URL}/support/tickets`, {
        subject,
        description,
        priority: 'Medium'
      });
      setSubject('');
      setDescription('');
      setSuccess(true);
      fetchTickets();
    } catch (err) {
      console.error("Ticket generation failed", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Help Center & Support <HelpCircle className="h-7 w-7 text-sky-500 animate-pulse" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Open technical assistance tickets to receive dashboard adjustments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Ticket */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquarePlus className="h-4.5 w-4.5 text-sky-500" /> Open New Ticket
          </h3>
          
          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Ticket created successfully! Our team will respond shortly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. Export formatting issue"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description Detail</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Briefly describe the barrier you are encountering."
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-sky-500/15"
            >
              {creating ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : 'Submit Support Ticket'}
            </button>
          </form>
        </div>

        {/* Existing tickets */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Your Tickets</h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 text-sky-500 animate-spin" />
            </div>
          ) : tickets.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {tickets.map((t) => (
                <div key={t.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{t.subject}</h4>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      t.status === 'open' 
                        ? 'bg-sky-500/10 text-sky-500' 
                        : t.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                  <p className="text-[10px] text-slate-400 mt-2">ID: #{t.id} • {new Date(t.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic text-center py-6">No support tickets found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
