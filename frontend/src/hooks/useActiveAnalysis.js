import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

export const useActiveAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIdeaId, setActiveIdeaId] = useState(localStorage.getItem('activeIdeaId'));

  const fetchAnalysis = async (ideaId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/analysis/${ideaId}`);
      setAnalysis(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("NOT_ANALYZED");
      } else {
        setError(err.response?.data?.detail || "Failed to load analysis metrics.");
      }
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleIdeaChange = () => {
      const currentId = localStorage.getItem('activeIdeaId');
      setActiveIdeaId(currentId);
      if (currentId) {
        fetchAnalysis(currentId);
      } else {
        setLoading(false);
      }
    };

    window.addEventListener('activeIdeaChanged', handleIdeaChange);
    
    // Initial load
    if (activeIdeaId) {
      fetchAnalysis(activeIdeaId);
    } else {
      setLoading(false);
    }

    return () => window.removeEventListener('activeIdeaChanged', handleIdeaChange);
  }, [activeIdeaId]);

  const reload = () => {
    const currentId = localStorage.getItem('activeIdeaId');
    if (currentId) {
      fetchAnalysis(currentId);
    }
  };

  return { analysis, loading, error, activeIdeaId, reload };
};
