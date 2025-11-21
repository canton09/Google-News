import React from 'react';

// 旋转的科技感加载圈/雷达
export const TechSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor">
    <circle cx="50" cy="50" r="45" strokeWidth="1" opacity="0.2" />
    <path d="M50 5 A 45 45 0 0 1 95 50" strokeWidth="2" className="animate-spin origin-center" style={{animationDuration: '2s'}} strokeLinecap="round" />
    <path d="M50 95 A 45 45 0 0 1 5 50" strokeWidth="2" className="animate-spin origin-center" style={{animationDuration: '2s'}} strokeLinecap="round" />
    <circle cx="50" cy="50" r="35" strokeWidth="1" strokeDasharray="4 4" className="animate-spin-reverse origin-center" style={{animationDuration: '4s'}} opacity="0.5" />
    <circle cx="50" cy="50" r="25" strokeWidth="4" strokeDasharray="20 60" opacity="0.3" className="animate-spin origin-center" style={{animationDuration: '3s'}}/>
    <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.1" />
    <circle cx="50" cy="50" r="2" fill="currentColor" />
  </svg>
);

// 六边形节点图标
export const HexIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
    <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="4" strokeWidth="1" opacity="0.5" />
    <circle cx="12" cy="12" r="2" fill="currentColor" className="animate-pulse"/>
    <path d="M12 2V5 M12 19V22 M21 7L18.5 8.5 M5.5 8.5L3 7 M21 17L18.5 15.5 M5.5 15.5L3 17" strokeWidth="1" opacity="0.3"/>
  </svg>
);

// 复杂的数据流背景块
export const DataBlockDecoration: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 20" className={className} fill="currentColor">
     {[...Array(10)].map((_, i) => (
         <rect key={i} x={i * 10} y="0" width="6" height="4" opacity={Math.random() * 0.5 + 0.2}>
             <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${Math.random() * 2 + 1}s`} repeatCount="indefinite" />
         </rect>
     ))}
     <path d="M0 10 H100" stroke="currentColor" strokeWidth="1" opacity="0.3" />
     {[...Array(5)].map((_, i) => (
         <rect key={`b-${i}`} x={i * 20 + 5} y="14" width="10" height="2" opacity="0.4" />
     ))}
  </svg>
);

// 屏幕角落的装饰支架
export const CornerBracket: React.FC<{ className?: string, flip?: boolean }> = ({ className, flip }) => (
    <svg viewBox="0 0 50 50" className={className} style={{ transform: flip ? 'scaleX(-1)' : 'none' }} fill="none" stroke="currentColor">
        <path d="M0 0 H20 L30 10 H50" strokeWidth="1" opacity="0.5" />
        <path d="M0 0 V20 L10 30 V50" strokeWidth="1" opacity="0.5" />
        <path d="M5 5 H15 L20 10" strokeWidth="2" />
        <path d="M5 5 V15 L10 20" strokeWidth="2" />
        <rect x="35" y="5" width="10" height="2" fill="currentColor" opacity="0.8" />
        <rect x="5" y="35" width="2" height="10" fill="currentColor" opacity="0.8" />
    </svg>
);

// 警告/错误图标
export const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
        <path d="M12 2L2 22H22L12 2Z" strokeWidth="1.5" />
        <path d="M12 8V16" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="19" r="1" fill="currentColor" />
        <path d="M5 18L7 14M19 18L17 14" strokeWidth="1" opacity="0.5" />
    </svg>
);

// 刷新/同步图标
export const SyncIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
        <path d="M12 4V2M12 20v2M4 12H2M22 12h-2" strokeWidth="1" opacity="0.3" />
        <path d="M17 7l-1.4 1.4" strokeWidth="1" opacity="0.3" />
        <path d="M12 5a7 7 0 0 1 7 7" strokeWidth="2" strokeLinecap="round" className="origin-center animate-spin" style={{animationDuration: '3s'}} />
        <path d="M12 19a7 7 0 0 1-7-7" strokeWidth="2" strokeLinecap="round" className="origin-center animate-spin" style={{animationDuration: '3s'}} />
        <circle cx="12" cy="12" r="2" strokeWidth="1" />
    </svg>
);
