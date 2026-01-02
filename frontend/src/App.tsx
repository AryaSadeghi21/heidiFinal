import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { EmptyState } from './components/EmptyState';
import { BottomBar } from './components/BottomBar';
import { FooterWarning } from './components/FooterWarning';
import TaskList from './components/TaskList';
import AgentsView from './components/AgentsView';
import { AnalysisResult } from './lib/api';

export function App() {
  const [activeTab, setActiveTab] = useState('note');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const handleAnalysisUpdate = () => {
      const result = (window as any).analysisResult;

      if (result) {
        setAnalysisResult(result);
        setLoading(false);  // analysis arrived → stop the wheel
      }
    };

    const interval = setInterval(handleAnalysisUpdate, 1000);
    return () => clearInterval(interval);
  }, []);

  // Optional: force visible 20s minimum wheel 
  const startAnalysis = () => {
    setLoading(true);
    (window as any).analysisResult = null;
  };

  return (
    <div className="flex h-screen bg-[#FAF9F7] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header onAnalyze={startAnalysis} />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'note' ? (
            <div className="h-full" />
          ) : activeTab === 'agents' ? (
            <AgentsView result={analysisResult} loading={loading} />
          ) : (
            <>
              <EmptyState />
              <BottomBar />
            </>
          )}
        </div>
        <FooterWarning />
      </div>

      <TaskList analysisResult={analysisResult} />
    </div>
  );
}
