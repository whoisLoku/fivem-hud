import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatusRingProps {
  value: number; // 0 to 100
  icon: LucideIcon;
  color: string;
}

const StatusRing: React.FC<StatusRingProps> = ({ 
  value, 
  icon: Icon, 
  color
}) => {
  return (
    <div 
      className="relative w-full h-8 bg-gray-900/80 border-r-2 border-white/10 flex items-center overflow-hidden group transition-all duration-300"
      style={{ 
        boxShadow: value > 0 ? `0 0 15px -5px ${color}60` : 'none', // Outer glow container
        borderColor: value > 0 ? `${color}40` : 'rgba(255,255,255,0.1)'
      }}
    >
      {/* Background Track */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Main Fill Bar */}
      <div 
        className="absolute inset-y-0 left-0 transition-all duration-300 ease-out flex items-center justify-end overflow-hidden"
        style={{ 
          width: `${value}%`, 
          backgroundColor: `${color}20`, // Low opacity fill
          borderRight: `2px solid ${color}`, // Sharp leading edge
          boxShadow: `inset 0 0 10px ${color}40, 1px 0 10px ${color}80` // Inner and forward glow
        }}
      >
        {/* Scanline effect inside bar */}
        <div className="w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] opacity-30" />
      </div>

      {/* Icon Section (Embedded) */}
      <div className="relative z-10 w-10 h-full flex items-center justify-center">
        <Icon 
          size={14} 
          style={{ 
            color: value > 10 ? color : '#555',
            filter: value > 10 ? `drop-shadow(0 0 5px ${color})` : 'none'
          }} 
        />
      </div>

      {/* Text Value */}
      <div className="relative z-10 flex-1 px-2 flex items-center justify-between">
         <span 
          className="text-[9px] font-mono font-bold tracking-widest transition-colors"
          style={{ 
            color: value > 10 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
            textShadow: value > 10 ? `0 0 10px ${color}` : 'none'
          }}
         >
          {Math.round(value)}%
         </span>
      </div>
    </div>
  );
};

export default StatusRing;