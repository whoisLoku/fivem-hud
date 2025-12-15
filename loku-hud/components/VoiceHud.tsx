
import React from 'react';
import { Mic } from 'lucide-react';

interface VoiceHudProps {
  range: number; // 1, 2, 3
  isTalking: boolean;
}

const VoiceHud: React.FC<VoiceHudProps> = ({ range, isTalking }) => {
  
  // Dots configuration
  // Range 1 (Whisper): 1 dot active
  // Range 2 (Normal): 2 dots active
  // Range 3 (Shout): 3 dots active
  
  // Base color
const colorClass = isTalking 
  ? (range === 3 
      ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
      : range === 1 
        ? 'bg-orange-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
        : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
    )
  : 'bg-white/40';


  return (
    <div className="flex flex-col items-center gap-1">
      {/* Visual Dots */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 border border-white/5 transition-all duration-300">
        {[1, 2, 3].map((dotIndex) => {
            const isActive = range >= dotIndex;
            return (
                <div 
                    key={dotIndex}
                    className={`
                        w-2 h-2 rounded-full transition-all duration-300 ease-out
                        ${isActive ? colorClass : 'bg-white/10 scale-75'}
                        ${isActive && isTalking ? 'animate-pulse scale-110' : ''}
                    `}
                />
            );
        })}
      </div>
    
    </div>
  );
};

export default VoiceHud;
