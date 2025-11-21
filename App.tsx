import React, { useState, useEffect, useCallback } from 'react';
import { fetchLatestAINews } from './services/geminiService';
import { NewsData, LoadingState } from './types';
import { NewsCard } from './components/NewsCard';
import { Timer } from './components/Timer';

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 Minutes

const App: React.FC = () => {
  // Changed to array to hold history
  const [history, setHistory] = useState<NewsData[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ status: 'idle', message: '' });
  const [resetTimerTrigger, setResetTimerTrigger] = useState(0);

  const loadData = useCallback(async () => {
    // Don't block UI if we already have content, just show loading indicator somewhere
    setLoading({ status: 'searching', message: '正在连接全球资讯网络...' });
    
    try {
      // Pass existing headlines to avoid duplicates
      const existingHeadlines = history.map(item => item.headline);
      
      const newData = await fetchLatestAINews(
        (msg) => setLoading(prev => ({ ...prev, message: msg })),
        existingHeadlines
      );
      
      // Prepend new data to history
      setHistory(prev => [newData, ...prev]);
      
      setLoading({ status: 'complete', message: '' });
      setResetTimerTrigger(prev => prev + 1); 
    } catch (error) {
      setLoading({ status: 'error', message: '连接中断，正在重试...' });
      // Retry logic handled by user or next interval, 
      // minimal auto-retry to prevent loops if API key is bad
    }
  }, [history]); // Depend on history so we always have the latest list for deduplication

  // Initial Load
  useEffect(() => {
    // Only load if history is empty on mount
    if (history.length === 0) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#050914] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-white">
        {/* Header */}
        <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-xl tracking-tight text-white leading-none">AI<span className="text-cyan-500">新视界</span></h1>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">全球实时智能简报</span>
                    </div>
                </div>
                
                <div className="flex items-center space-x-4 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
                    <div className="hidden sm:block">
                        <Timer 
                            duration={REFRESH_INTERVAL} 
                            onComplete={loadData} 
                            resetTrigger={resetTimerTrigger}
                        />
                    </div>
                    <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
                    <button 
                        onClick={() => loadData()}
                        disabled={loading.status === 'searching' || loading.status === 'generating_art'}
                        className="text-cyan-500 hover:text-cyan-400 text-sm font-medium transition-colors disabled:opacity-50 flex items-center text-xs"
                    >
                        <svg className={`w-4 h-4 mr-1.5 ${loading.status === 'searching' || loading.status === 'generating_art' ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {loading.status === 'searching' || loading.status === 'generating_art' ? '更新中...' : '立即刷新'}
                    </button>
                </div>
            </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-6 relative min-h-[calc(100vh-80px)]">
            
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Status Indicator for ongoing updates when history exists */}
            {history.length > 0 && (loading.status === 'searching' || loading.status === 'generating_art') && (
                <div className="mb-6 flex justify-center animate-pulse relative z-10">
                     <span className="px-4 py-1 bg-cyan-900/30 text-cyan-400 text-xs rounded-full border border-cyan-500/30 flex items-center">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-bounce"></div>
                        {loading.message}
                     </span>
                </div>
            )}

            {/* Initial Loading State (Empty History) */}
            {history.length === 0 && loading.status !== 'complete' && loading.status !== 'idle' && (
                 <div className="flex flex-col items-center justify-center min-h-[60vh] relative z-10">
                    <div className="relative w-24 h-24 mb-8">
                         <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
                         <div className="absolute inset-3 border-r-2 border-purple-500 rounded-full animate-spin animation-delay-200"></div>
                    </div>
                    <h2 className="text-2xl font-light text-white tracking-widest animate-pulse">{loading.message}</h2>
                </div>
            )}

            {/* Grid Layout for 3x3 display */}
            {/* grid-cols-1 (mobile), grid-cols-2 (tablet), grid-cols-3 (desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {history.map((item) => (
                    <NewsCard key={item.id} data={item} />
                ))}
            </div>
            
            {/* Footer */}
            {history.length > 0 && (
                <div className="mt-12 text-center py-6 border-t border-slate-800/50 relative z-10">
                    <p className="text-slate-600 text-xs font-mono">
                        AI 模型: Gemini 2.5 Flash | 数据源: Google Search Grounding
                    </p>
                </div>
            )}
        </main>
    </div>
  );
};

export default App;