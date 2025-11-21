import React, { useState, useEffect, useCallback } from 'react';
import { fetchLatestAINews } from './services/geminiService';
import { sendTelegramMessage } from './services/telegramService';
import { saveNewsItem, getAllNewsHistory } from './services/dbService';
import { NewsData, LoadingState } from './types';
import { NewsCard } from './components/NewsCard';
import { Timer } from './components/Timer';
import { TechSpinner, CornerBracket, SyncIcon, AlertIcon } from './components/Decorations';

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 Minutes

const App: React.FC = () => {
  const [history, setHistory] = useState<NewsData[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ status: 'idle', message: '' });
  const [resetTimerTrigger, setResetTimerTrigger] = useState(0);
  const [dbInitialized, setDbInitialized] = useState(false);

  // 1. Load History from DB on Mount
  useEffect(() => {
    const initData = async () => {
      try {
        const savedHistory = await getAllNewsHistory();
        if (savedHistory.length > 0) {
          setHistory(savedHistory);
        }
        setDbInitialized(true);
      } catch (e) {
        console.error("DB Init Failed", e);
        setDbInitialized(true); // Proceed anyway
      }
    };
    initData();
  }, []);

  // 2. Main Data Loading Logic
  const loadData = useCallback(async () => {
    setLoading({ status: 'searching', message: '正在启动神经搜索协议...' });
    
    try {
      // Use *all* history headlines for deduplication context, not just what's in state if strictly limited
      // But state 'history' is now the full DB record, so it is perfect.
      const existingHeadlines = history.map(item => item.headline);
      
      const newData = await fetchLatestAINews(
        (msg) => setLoading(prev => ({ ...prev, message: msg })),
        existingHeadlines
      );
      
      // Save to Database
      await saveNewsItem(newData);

      // Update State
      setHistory(prev => [newData, ...prev]);
      
      setLoading({ status: 'complete', message: '' });
      setResetTimerTrigger(prev => prev + 1); 

      // Send notification to Telegram (Non-blocking)
      sendTelegramMessage(newData).catch(err => console.error("TG Push Failed", err));

    } catch (error) {
      console.error(error);
      setLoading({ status: 'error', message: '网络连接中断或 API 限制' });
    }
  }, [history]);

  // 3. Initial Fetch (Only after DB is ready and if DB was empty)
  useEffect(() => {
    if (dbInitialized && history.length === 0 && loading.status === 'idle') {
      loadData();
    }
  }, [dbInitialized, history.length, loading.status, loadData]);

  return (
    <div className="min-h-screen bg-black text-[#00ff41] relative overflow-x-hidden font-mono selection:bg-[#00ff41] selection:text-black">
        
        {/* Background Decorations */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            {/* Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
            {/* Radial Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,40,0,0.2),transparent_80%)]"></div>
            {/* Big Corner Brackets */}
            <CornerBracket className="absolute top-8 left-8 w-32 h-32 text-[#00ff41]/10" />
            <CornerBracket className="absolute top-8 right-8 w-32 h-32 text-[#00ff41]/10" flip={true} />
            {/* Bottom decorative line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff41]/30 to-transparent"></div>
        </div>

        {/* Header */}
        <header className="bg-black/80 backdrop-blur-md border-b border-[#1a3a1a] sticky top-0 z-50 shadow-[0_5px_20px_rgba(0,0,0,0.8)]">
            {/* Animated Scan Line under header */}
            <div className="absolute bottom-0 left-0 h-[1px] bg-cyan-500/50 w-full animate-scan-x"></div>

            <div className="max-w-[1800px] mx-auto px-4 md:px-8 h-24 flex items-center justify-between relative">
                {/* Logo Area */}
                <div className="flex items-center gap-5 group cursor-default">
                    <div className="relative w-12 h-12 flex items-center justify-center bg-[#001000] border border-[#00ff41] group-hover:bg-[#00ff41]/10 transition-all duration-500 shadow-[0_0_10px_rgba(0,255,65,0.2)]">
                        <TechSpinner className="absolute inset-0 w-full h-full text-[#00ff41] group-hover:animate-spin-slow" />
                        <span className="font-orbitron font-bold text-xl text-white relative z-10">AI</span>
                        {/* Glitch blocks */}
                        <div className="absolute -top-1 -right-1 w-2 h-1 bg-cyan-500"></div>
                        <div className="absolute -bottom-1 -left-1 w-2 h-1 bg-cyan-500"></div>
                    </div>
                    
                    <div className="flex flex-col">
                        <h1 className="font-orbitron font-bold text-3xl tracking-[0.1em] text-white leading-none group-hover:text-cyan-400 transition-colors">
                            AI新闻<span className="text-[#00ff41]">.数据库</span>
                        </h1>
                        <div className="flex items-center space-x-3 mt-1.5">
                            <span className="text-[10px] text-[#00ff41]/60 tracking-widest border border-[#00ff41]/30 px-1">DB.V.1.0</span>
                            <div className="flex items-center space-x-1">
                                <span className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] text-cyan-500/80 tracking-widest">LIVE ARCHIVE</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center gap-8">
                    <div className="hidden lg:flex flex-col items-end text-right border-r border-[#1a3a1a] pr-8 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1a3a1a]"></div>
                        <span className="text-[10px] text-[#00ff41]/50 uppercase tracking-wider mb-1">自动扫描倒计时</span>
                        <div className="text-[#00ff41] font-bold">
                             <Timer 
                                duration={REFRESH_INTERVAL} 
                                onComplete={loadData} 
                                resetTrigger={resetTimerTrigger}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={() => loadData()}
                        disabled={loading.status === 'searching' || loading.status === 'generating_art'}
                        className="relative group overflow-hidden px-8 py-3 bg-[#0a1a0a] border border-[#00ff41] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(0,255,65,0.2)] transition-all"
                    >
                        {/* Button background animation */}
                        <div className="absolute inset-0 w-0 bg-[#00ff41] transition-all duration-300 ease-out group-hover:w-full opacity-10"></div>
                        
                        <span className="relative flex items-center font-bold tracking-wider text-sm text-[#00ff41] group-hover:text-white transition-colors">
                            {loading.status === 'searching' || loading.status === 'generating_art' ? (
                               <span className="flex items-center">
                                   <SyncIcon className="w-4 h-4 mr-3 text-cyan-400" />
                                   扫描执行中...
                               </span>
                            ) : (
                                <>
                                    <SyncIcon className="w-4 h-4 mr-3 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
                                    立即刷新
                                </>
                            )}
                        </span>
                        {/* Button corners */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>
                    </button>
                </div>
            </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1800px] mx-auto p-6 md:p-10 relative z-10">
            
            {/* Initial Loading State (Only if history is truly empty AND we are fetching) */}
            {history.length === 0 && loading.status !== 'idle' && loading.status !== 'complete' && (
                 <div className="flex flex-col items-center justify-center h-[60vh] text-center relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <TechSpinner className="w-[500px] h-[500px] text-[#00ff41]" />
                    </div>
                    <div className="relative z-10 bg-black/50 p-10 border border-[#1a3a1a] backdrop-blur-sm max-w-2xl">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 animate-ping bg-[#00ff41]/20 rounded-full"></div>
                                <TechSpinner className="w-16 h-16 text-[#00ff41]" />
                            </div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-orbitron text-white mb-4 animate-pulse">{loading.message}</h2>
                        <div className="w-full bg-[#1a3a1a] h-1 mt-6 overflow-hidden">
                            <div className="h-full bg-[#00ff41] animate-progress-bar"></div>
                        </div>
                        <p className="text-[#00ff41]/60 font-mono text-sm mt-4">
                            正在建立与 Gemini 2.5 节点的加密连接...<br/>
                            正在解析全球数据流...
                        </p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {loading.status === 'error' && (
                 <div className="fixed bottom-10 right-10 z-50 bg-red-900/90 border border-red-500 text-white px-6 py-4 flex items-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                     <AlertIcon className="w-8 h-8 mr-4 animate-bounce" />
                     <div>
                         <h3 className="font-bold">连接失败</h3>
                         <p className="text-sm text-red-200">{loading.message}</p>
                     </div>
                </div>
            )}

            {/* Status Bar when updating in background */}
            {history.length > 0 && (loading.status === 'searching' || loading.status === 'generating_art') && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 border border-[#00ff41] px-8 py-4 flex items-center shadow-[0_0_30px_rgba(0,255,65,0.2)] clip-path-custom min-w-[300px] justify-center backdrop-blur-md">
                     <TechSpinner className="w-5 h-5 text-[#00ff41] mr-4" />
                     <span className="text-[#00ff41] tracking-widest font-bold text-sm animate-pulse">{loading.message}</span>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {history.map((item) => (
                    <NewsCard key={item.id} data={item} />
                ))}
            </div>
            
            {/* Footer */}
            <div className="mt-24 border-t border-[#1a3a1a] pt-10 flex flex-col md:flex-row justify-between items-center text-[#00ff41]/40">
                <div className="text-xs uppercase tracking-[0.2em] mb-4 md:mb-0 flex items-center gap-4">
                    <span>系统状态: 在线</span>
                    <span>|</span>
                    <span>数据库: {history.length} 条记录</span>
                    <span>|</span>
                    <span>延迟: 12ms</span>
                </div>
                <div className="flex items-center gap-2">
                      <span className="text-[10px]">SECURE CONNECTION</span>
                      <div className="flex space-x-1">
                        <div className="h-1 w-1 bg-[#00ff41]"></div>
                        <div className="h-1 w-1 bg-[#00ff41]"></div>
                        <div className="h-1 w-1 bg-[#00ff41]"></div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
};

export default App;