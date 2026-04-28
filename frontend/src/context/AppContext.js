import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext();

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

export function AppProvider({ children }) {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [target, setTarget] = useState('');
  const [group, setGroup] = useState('');
  const [results, setResults] = useState(null);
  const [fixedResults, setFixedResults] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [aiExplanation, setAiExplanation] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const recordToHistory = useCallback((data) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      fileName: file?.name || 'Unknown',
      target,
      group,
      fairnessScore: data?.fairness_score ?? null,
      status: data?.fairness_score >= 90 ? 'Fair' : 'Biased',
      rows: data?.rows ?? null,
    };
    setHistory((prev) => [entry, ...prev].slice(0, 50));
  }, [file, target, group]);

  const resetAnalysis = useCallback(() => {
    setResults(null);
    setFixedResults(null);
    setExplanation('');
    setAiExplanation('');
    setError('');
    setTarget('');
    setGroup('');
  }, []);

  const resetFix = useCallback(() => {
    setFixedResults(null);
    setAiExplanation('');
  }, []);

  const resetAll = useCallback(() => {
    setFile(null);
    setColumns([]);
    setMetadata({});
    resetAnalysis();
  }, [resetAnalysis]);

  const value = {
    file, setFile,
    columns, setColumns,
    metadata, setMetadata,
    target, setTarget,
    group, setGroup,
    results, setResults,
    fixedResults, setFixedResults,
    explanation, setExplanation,
    aiExplanation, setAiExplanation,
    history, setHistory,
    loading, setLoading,
    error, setError,
    recordToHistory,
    resetAnalysis,
    resetFix,
    resetAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
