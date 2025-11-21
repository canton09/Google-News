import React from 'react';
import { NewsData } from '../types';

interface NewsCardProps {
  data: NewsData;
}

export const NewsCard: React.FC<NewsCardProps> = ({ data }) => {
  return (
    <div className="group bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-500 flex flex-col h-full">
      {/* Visual Area - Square aspect ratio to match 1024x1024 */}
      <div className="relative w-full aspect-square bg-[#0B1120] overflow-hidden border-b border-slate-800">
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-slate-900/80 z-10"></div>
        
        {/* SVG Container */}
        <div className="absolute inset-0 p-4 flex items-center justify-center transition-transform duration-700 group-hover:scale-105 z-0">
           <div 
             className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]"
             dangerouslySetInnerHTML={{ __html: data.svgCode }}
           />
        </div>

        <div className="absolute bottom-3 right-3 z-20 opacity-50 group-hover:opacity-100 transition-opacity">
           <span className="text-[10px] text-cyan-400 font-mono px-2 py-1 bg-slate-950/50 rounded border border-cyan-900">GEN-AI ART</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-grow relative">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
                <span className="text-xs text-cyan-500 font-bold tracking-wider">AI 动态</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
                {data.timestamp.toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})}
            </span>
        </div>

        <h2 className="text-xl font-bold text-slate-100 mb-4 leading-snug line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {data.headline}
        </h2>

        <p className="text-slate-400 text-sm leading-relaxed font-light mb-6 flex-grow line-clamp-4">
            {data.summary}
        </p>

        {/* Footer / Sources */}
        <div className="mt-auto pt-4 border-t border-slate-800/50">
            <div className="flex flex-wrap gap-2">
                {data.sources.slice(0, 2).map((source, idx) => (
                    <a 
                        key={idx}
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors truncate max-w-[120px] flex items-center"
                    >
                        <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        {source.title || "来源链接"}
                    </a>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};