import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { Download, FileText, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export const ReportsCenter = () => {
  const { analysis, loading: analysisLoading, error, activeIdeaId, reload } = useActiveAnalysis();
  
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const fetchReports = async () => {
    if (!activeIdeaId) return;
    setLoadingReports(true);
    try {
      const res = await axios.get(`${API_URL}/reports/idea/${activeIdeaId}`);
      setReports(res.data);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const handleIdeaChange = () => fetchReports();
    window.addEventListener('activeIdeaChanged', handleIdeaChange);
    return () => window.removeEventListener('activeIdeaChanged', handleIdeaChange);
  }, [activeIdeaId]);

  const handleGenerateReport = async () => {
    if (!activeIdeaId) return;
    setGenerating(true);
    setGenError('');
    try {
      await axios.post(`${API_URL}/reports/generate/${activeIdeaId}`);
      fetchReports();
    } catch (err) {
      setGenError(err.response?.data?.detail || 'Report generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportId, name) => {
    try {
      const response = await axios.get(`${API_URL}/reports/download/${reportId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${name.replace(/\s+/g, '_')}_Validation_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed", err);
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
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Reports Center <FileText className="h-7 w-7 text-sky-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Export fully branded investor-readiness and SWOT matrices as a clean, corporate PDF.
        </p>
      </div>

      {/* Generator Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="font-bold text-base">Generate Strategic Pitch Dossier</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Builds a multi-page PDF summarizing target segments, SWOT matrix, and competitive sentiments.
          </p>
        </div>
        
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl transition text-sm shadow-lg shadow-sky-500/10 whitespace-nowrap"
        >
          {generating ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" /> Compiling PDF...
            </>
          ) : (
            <>
              Generate PDF Report <Sparkles className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {genError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{genError}</span>
        </div>
      )}

      {/* List reports */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Generated PDFs</h3>
        {loadingReports ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 text-sky-500 animate-spin" />
          </div>
        ) : reports.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {reports.map((rep) => (
              <div key={rep.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Validation_Summary_Report.pdf</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Created at: {new Date(rep.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(rep.id, analysis.summary.substring(0, 15))}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 rounded-lg transition"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic text-center py-6">No reports generated yet. Click generate above.</p>
        )}
      </div>
    </div>
  );
};
