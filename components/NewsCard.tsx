import React from 'react';
import { NewsData } from '../types';
import { HexIcon, DataBlockDecoration } from './Decorations';

interface NewsCardProps {
  data: NewsData;
}

export const NewsCard: React.FC<NewsCardProps> = ({ data }) => {
  return (
    <div className="group relative flex flex-col h-full transition-all duration-500 hover:translate-y-[-4px]">
      
      {/* Card Background & Border Shape */}
      <div 
        className="absolute inset-0 bg-black/90 border border-[#1a3a1a] group-hover:border-[#00ff41] transition-colors duration-500 shadow-[0_0_15px_rgba(0,0,0,0.8)] group-hover:shadow-[0_0_20px_rgba(0,255,65,0.15)]"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)' }}
      ></div>

      {/* Decorative Corner Pieces - Complex SVG */}
      <div className="absolute top-0 left-0 w-6 h-6 z-20 text-[#00ff41]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
             <path d="M2 10V2H10" strokeWidth="2"/>
             <rect x="2" y="2" width="4" height="4" fill="currentColor"/>
          </svg>
      </div>
      <div className="absolute top-0 right-0 w-6 h-6 z-20 text-[#00ff41]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
             <path d="M22 10V2H14" strokeWidth="2"/>
             <rect x="18" y="2" width="4" height="4" fill="currentColor"/>
          </svg>
      </div>
      
      {/* Top Status Bar */}
      <div className="relative z-10 h-9 bg-[#051005] border-b border-[#1a3a1a] flex items-center justify-between px-3 select-none">
        <div className="flex items-center space-x-2 text-[10px] text-[#00ff41]/60">
          <HexIcon className="w-4 h-4 text-[#00ff41]" />
          <span className="tracking-widest">NET.ID: {data.id.slice(0,6)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <DataBlockDecoration className="w-16 h-3 text-[#00ff41]" />
        </div>
      </div>

      {/* Visual Area */}
      <div className="relative w-full h-64 bg-[#020502] border-b border-[#1a3a1a] group-hover:border-[#00ff41]/50 overflow-hidden z-10">
        
        {/* Grid overlay on image */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[length:30px_30px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 p-2">
            <svg className="w-8 h-8 text-[#00ff41]/20 animate-spin-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                <circle cx="50" cy="50" r="40" strokeDasharray="20 20"/>
            </svg>
        </div>
        
        {/* SVG Container */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
           <div 
             className="w-full h-full opacity-80 group-hover:opacity-100 transition-all duration-500 filter saturate-0 group-hover:saturate-100 contrast-125 drop-shadow-[0_0_5px_rgba(0,255,65,0.3)]"
             dangerouslySetInnerHTML={{ __html: data.svgCode }}
           />
        </div>
        
        {/* Image HUD Overlay */}
        <div className="absolute bottom-2 left-3 z-20 flex items-center space-x-2">
           <span className="text-[9px] text-cyan-400 font-bold tracking-widest bg-black/70 px-2 py-0.5 border border-cyan-900/50 flex items-center gap-1">
             <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
             视觉数据 V2.4
           </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 p-5 flex flex-col flex-grow bg-gradient-to-b from-transparent to-[#051005]/50">
        
        {/* Timestamp */}
        <div className="flex justify-between items-end mb-3 border-b border-[#1a3a1a] pb-2 border-dashed">
            <span className="text-cyan-500/80 text-xs tracking-wider font-mono flex items-center">
               <span className="mr-1 text-[10px] opacity-50">TS:</span>
               [CN {data.timestamp.toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit', timeZone: 'Asia/Shanghai'})}]
            </span>
            <span className="text-[9px] text-[#00ff41]/40 uppercase border border-[#1a3a1a] px-1 rounded bg-black">PRIORITY: ALPHA</span>
        </div>

        {/* Headline */}
        <h2 className="text-xl md:text-2xl font-bold text-[#e2e8f0] mb-3 leading-tight group-hover:text-[#00ff41] transition-colors font-orbitron tracking-wide shadow-black drop-shadow-md">
            {data.headline}
        </h2>

        {/* Summary */}
        <p className="text-[#94a3b8] text-sm md:text-base leading-7 flex-grow group-hover:text-[#bbf7d0] transition-colors text-justify border-l-2 border-[#1a3a1a] pl-3 group-hover:border-[#00ff41]/50">
            {data.summary}
        </p>

        {/* Footer / Sources */}
        <div className="mt-5 pt-3 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] text-[#00ff41]/50 uppercase mr-1 flex items-center">
                <span className="inline-block w-2 h-2 border border-[#00ff41]/50 mr-1"></span>
                源节点:
            </span>
            {data.sources.slice(0, 2).map((source, idx) => (
                <a 
                    key={idx}
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-cyan-400 hover:text-black hover:bg-cyan-400 transition-all duration-300 px-2 py-0.5 border border-cyan-800 hover:border-cyan-400 truncate max-w-[120px] clip-path-slant relative group/link"
                >
                    <span className="absolute inset-0 bg-cyan-400/10 scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left"></span>
                    {source.title || "加密链接"}
                </a>
            ))}
        </div>
      </div>
      
      {/* Bottom Right Cutout Decoration */}
      <div className="absolute bottom-[2px] right-[2px] w-[22px] h-[22px] flex items-center justify-center bg-[#0a1a0a] border-t border-l border-[#1a3a1a] clip-path-corner">
          <div className="w-1.5 h-1.5 bg-[#00ff41]/30"></div>
      </div>
    </div>
  );
};