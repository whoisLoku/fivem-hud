import React from 'react';
import { LocationInfo, LokuThemeResponse } from '../types';

interface InfoHudProps {
  location: LocationInfo;
  serverId?: number;
  theme?: LokuThemeResponse | null;
}

const InfoHud: React.FC<InfoHudProps> = ({ location }) => {
  const heading = location.headingValue || 0;

  // Create direction ticks (N, NE, ... 360)
  const ticks = [];
  for (let i = 0; i < 360; i += 15) {
    let label = '';

    if (i === 0) label = 'N';
    else if (i === 45) label = 'NE';
    else if (i === 90) label = 'E';
    else if (i === 135) label = 'SE';
    else if (i === 180) label = 'S';
    else if (i === 225) label = 'SW';
    else if (i === 270) label = 'W';
    else if (i === 315) label = 'NW';
    else label = i.toString();

    ticks.push({ degree: i, label });
  }

  const pixelsPerDegree = 5;

  // Calculate visible ticks
  const visibleTicks = ticks
    .map((t) => {
      let diff = t.degree - heading;

      if (diff < -180) diff += 360;
      if (diff > 180) diff -= 360;

      return { ...t, diff };
    })
    .filter((t) => Math.abs(t.diff) < 45);

  return (
    <div className="flex flex-col items-center select-none font-sans pt-4">

      {/* Top direction pointer */}
      <div className="mb-[-6px] z-20">
        <div className="w-2.5 h-2.5 bg-white rotate-[-45deg] shadow-[0_0_10px_rgba(255,255,255,1),0_0_20px_rgba(255,255,255,0.5)]" />
      </div>

      {/* --- RULER --- */}
      <div className="relative w-[400px] h-12 overflow-hidden flex justify-center items-center">

        {/* Fade masks */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[rgba(0,0,0,0.01)] via-transparent to-transparent z-10"
          style={{ maskImage: 'linear-gradient(to right, black, transparent)' }}
        />

        {/* Compass ticks */}
        <div className="absolute w-full h-full top-0">
          {visibleTicks.map((tick) => (
            <div
              key={tick.degree}
              className="absolute top-2 transform -translate-x-1/2 flex flex-col items-center transition-transform duration-100 ease-linear"
              style={{
                left: `calc(50% + ${tick.diff * pixelsPerDegree}px)`,
                opacity: 1 - Math.abs(tick.diff) / 45,
              }}
            >
              <span
                className={`text-[13px] font-bold tracking-widest 
                  ${
                    isNaN(Number(tick.label))
                      ? 'text-white text-base drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                      : 'text-white/50'
                  }`}
              >
                {tick.label}
              </span>

              <div
                className={`w-0.5 mt-1 rounded-full 
                  ${
                    isNaN(Number(tick.label))
                      ? 'h-2 bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]'
                      : 'h-1.5 bg-white/30'
                  }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* --- LOCATION TEXT --- */}
      <div className="flex flex-col items-center mt-[-4px]">
        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
          {location.zone}
        </span>

        <span className="text-sm font-bold text-white tracking-tight drop-shadow-md">
          {location.street}
        </span>
      </div>
    </div>
  );
};

export default InfoHud;
