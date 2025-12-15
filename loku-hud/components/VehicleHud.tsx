
import React from 'react';
import { VehicleStatus, LokuThemeResponse } from '../types';
import { Lock, Unlock, Lightbulb, TriangleAlert, Zap, Wrench, ArrowUpFromLine, ArrowLeft, ArrowRight, Anchor, Gauge, Power } from 'lucide-react';

// Custom Seatbelt Icon SVG
const SeatbeltIcon = ({ size = 14, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 18v-2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
    <path d="M10 2v14" />
    <path d="M14 2v14" />
    <line x1="4" y1="22" x2="20" y2="22" />
  </svg>
);

// Custom Engine Block Icon
const EngineBlockIcon = ({ size = 14, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12.79A2 2 0 0 0 19 11h-1v-2a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 1.79C3 13.9 3.55 16.3 6 17v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2c2.45-.7 3-3.1 3-4.21Z" />
    <path d="M15 7V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2" />
    <path d="M12 13v2" />
    <path d="M9 13v2" />
    <path d="M15 13v2" />
  </svg>
);

interface VehicleHudProps {
  vehicle: VehicleStatus;
  theme?: LokuThemeResponse | null;
  heading?: string;
}

const VehicleHud: React.FC<VehicleHudProps> = ({ vehicle }) => {
  if (!vehicle.inVehicle) return null;

  const rpmPercent = vehicle.rpm * 100;
  // Normalize engine health (0-1000) to percentage
  const enginePercent = Math.max(0, Math.min(100, vehicle.engineHealth / 10));

  // Determine unit label
  const unitLabel = vehicle.type === 'boat' ? 'KNOTS' : 'KMH';
  const isAir = vehicle.type === 'heli' || vehicle.type === 'plane';
  const isBike = vehicle.type === 'bike';

  return (
    <div className="flex flex-col items-end select-none font-sans text-white">
      
      {/* 1. STATUS ICONS BAR (Top) - Warning Only Logic */}
      <div className="flex items-center gap-2 mb-2 pr-1">
        
        {/* Turn Signal Left - Lighter stroke, sharper glow */}
        <div className={`transition-all duration-200 ${vehicle.turnSignalLeft ? 'text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.8)] animate-pulse' : 'text-white/10'}`}>
            <ArrowLeft size={18} strokeWidth={vehicle.turnSignalLeft ? 2.5 : 2} />
        </div>

        {/* Engine Off Warning - Only if Engine is OFF */}
        {!vehicle.engineOn && (
             <div className="p-1.5 rounded bg-red-500/20 border border-red-500/50 text-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                 <EngineBlockIcon size={16} />
            </div>
        )}

        
        {/* Lights - Only show if ON */}
        {vehicle.lightsOn && (
            <div className="p-1.5 rounded bg-blue-500/20 border border-blue-500/50 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.4)]">
                <Lightbulb size={14} />
            </div>
        )}
        
        {/* Door Lock - VISIBLE STATE TOGGLE */}
        {!isBike && (
            <div className={`p-1.5 rounded border transition-all duration-300 ${
                vehicle.locked 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
            }`}>
                {vehicle.locked ? <Lock size={14} /> : <Unlock size={14} />}
            </div>
        )}
        
        {/* Check Engine - Only if damaged & Not Electric */}
        {!vehicle.isElectric && vehicle.engineHealth < 400 && (
            <div className="p-1.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-500 animate-pulse">
                <TriangleAlert size={14} />
            </div>
        )}

        {/* Turn Signal Right - Lighter stroke, sharper glow */}
        <div className={`transition-all duration-200 ${vehicle.turnSignalRight ? 'text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.8)] animate-pulse' : 'text-white/10'}`}>
            <ArrowRight size={18} strokeWidth={vehicle.turnSignalRight ? 2.5 : 2} />
        </div>
      </div>

      {/* 2. MAIN DASH LAYOUT */}
      <div className="flex gap-4 items-end">

        {/* --- ALTITUDE SIMPLIFIED (Heli/Plane Only) --- */}
        {isAir && (
            <div className="flex flex-col items-end justify-end mr-2 mb-1">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-cyan-400 font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                        {Math.floor(vehicle.altitude)}
                    </span>
                    <span className="text-[9px] font-bold text-cyan-500/70 tracking-widest">ALT</span>
                </div>
                {/* Simple Horizontal Bar for Reference (0-1000 range approx) */}
                <div className="w-16 h-1 bg-black/40 border border-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                        className="h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, vehicle.altitude / 10))}%` }} 
                    />
                </div>
            </div>
        )}

        <div className="relative">
            
            {/* A. Speed & Gear Block */}
            <div className="flex items-end gap-3 mb-1 justify-end">
                {/* Gear Indicator */}
                {!isBike && (
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-black/80 border border-white/20 rounded">
                        <span className="text-2xl font-black text-white">
                            {vehicle.gear === 0 ? 'R' : vehicle.gear}
                        </span>
                        <span className="text-[8px] text-white/40 font-mono">GEAR</span>
                    </div>
                )}

                {/* Speed Display */}
                <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-1">
                        <span className="text-6xl font-black text-white tracking-tighter drop-shadow-xl">
                            {Math.floor(vehicle.speed)}
                        </span>
                        <span className="text-sm font-bold text-emerald-400 mb-2">{unitLabel}</span>
                    </div>
                </div>
            </div>

            {/* B. RPM Bar */}
            <div className="w-64 h-3 bg-black/60 rounded-sm overflow-hidden border border-white/10 flex gap-[2px] p-[2px]">
                {Array.from({ length: 24 }).map((_, i) => {
                    const active = rpmPercent >= (i + 1) * (100/24);
                    let bgClass = 'bg-white/10';
                    if (active) {
                        if (i < 10) bgClass = 'bg-emerald-400 shadow-[0_0_5px_#34d399]';
                        else if (i < 16) bgClass = 'bg-blue-400 shadow-[0_0_5px_#60a5fa]';
                        else if (i < 20) bgClass = 'bg-purple-400 shadow-[0_0_5px_#c084fc]';
                        else bgClass = 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse';
                    }
                    
                    return (
                        <div 
                            key={i} 
                            className={`h-full flex-1 rounded-[1px] ${bgClass} transition-colors duration-100`} 
                        />
                    );
                })}
            </div>

            {/* C. Stats Grid (Fuel & Engine Health) */}
            {!isBike && (
                <div className={`grid gap-2 mt-2 w-64 ${vehicle.isElectric ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    
                    {/* Fuel / Battery */}
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[9px] font-mono text-white/60">
                            <div className="flex items-center gap-1">
                                {vehicle.isElectric 
                                    ? <><Zap size={10} className="text-cyan-400" /> BATT</>
                                    : vehicle.type === 'boat' 
                                        ? <><Anchor size={10} /> FUEL</>
                                        : <><Gauge size={10} /> FUEL</>
                                }
                            </div>
                            <span className={vehicle.isElectric ? 'text-cyan-400' : ''}>{Math.floor(vehicle.fuel)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/40 border border-white/10 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${
                                    vehicle.isElectric 
                                        ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]' 
                                        : vehicle.fuel < 20 ? 'bg-red-500 animate-pulse' : 'bg-white'
                                }`} 
                                style={{ width: `${vehicle.fuel}%` }}
                            />
                        </div>
                    </div>

                    {/* Engine Health - HIDE IF ELECTRIC */}
                    {!vehicle.isElectric && (
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-[9px] font-mono text-white/60">
                                <div className="flex items-center gap-1"><Wrench size={10} /> ENG</div>
                                <span className={enginePercent < 40 ? 'text-red-400' : ''}>{Math.floor(enginePercent)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/40 border border-white/10 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${enginePercent < 40 ? 'bg-red-500' : enginePercent < 80 ? 'bg-amber-400' : 'bg-emerald-400'}`} 
                                    style={{ width: `${enginePercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default VehicleHud;
