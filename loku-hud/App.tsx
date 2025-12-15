
import React, { useState, useEffect } from 'react';
import { Heart, Shield, Utensils, Droplets, Footprints, Settings, X, Play, Pause, Car, Plane, Anchor, Bike, SquareMousePointer, BriefcaseMedical, Zap, Power, ArrowLeft, ArrowRight, PersonStanding, TriangleAlert, Clapperboard, Lock, Unlock } from 'lucide-react';
import StatusRing from './components/StatusRing';
import VehicleHud from './components/VehicleHud';
import InfoHud from './components/InfoHud';
import VoiceHud from './components/VoiceHud';
import { HudStatus, VehicleStatus, LocationInfo, LokuThemeResponse } from './types';


declare global {
  interface Window {
    invokeNative?: unknown;
  }
}

const DEFAULT_STATUS: HudStatus = {
  health: 100,
  armor: 30,
  hunger: 40,
  thirst: 90,
  stamina: 100,
  stress: 0,
  oxygen: 100,
  stance: 100,
  voiceRange: 2, // 2 = Normal
  isTalking: false,
};

const DEFAULT_VEHICLE: VehicleStatus = {
  inVehicle: true,
  type: 'car',
  speed: 0,
  altitude: 100,
  rpm: 0,
  gear: 1,
  fuel: 65,
  engineHealth: 900,
  seatbelt: false, // Default unbuckled
  locked: false,
  lightsOn: false,
  turnSignalLeft: false,
  turnSignalRight: false,
  isElectric: false,
  engineOn: true, // Default engine on
};

const DEFAULT_LOCATION: LocationInfo = {
  street: 'Vinewood Blvd',
  zone: 'Downtown',
  heading: 'N',
  headingValue: 0,
  time: '12:00',
};

const App: React.FC = () => {
  const [status, setStatus] = useState<HudStatus>(DEFAULT_STATUS);
  const [vehicle, setVehicle] = useState<VehicleStatus>(DEFAULT_VEHICLE);
  const [location, setLocation] = useState<LocationInfo>(DEFAULT_LOCATION);
  const [visible, setVisible] = useState(true);

  // Other States
  const [isSprinting, setIsSprinting] = useState(false); // Manual sprint toggle for testing
  const [isCinematic, setIsCinematic] = useState(false); // Cinematic mode state
  const [showDebug, setShowDebug] = useState(true);
  const [customTheme, setCustomTheme] = useState<LokuThemeResponse | null>(null);

  // FiveM NUI Message Listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data.action === 'updateStatus') setStatus(prev => ({ ...prev, ...data.payload }));
      if (data.action === 'updateVehicle') setVehicle(prev => ({ ...prev, ...data.payload }));

     // if (data.action === 'updateLocation') setLocation(prev => ({ ...prev, ...data.payload }));

      if (data.action === 'updateLocation') {
        const payload = data.payload; // <- payload burada
        setLocation(prev => ({
          ...prev,
          street: payload.street,
          zone: payload.zone,
          headingValue: payload.headingValue
        }));
      }
      
      if (data.action === 'toggleHud') setVisible(data.visible);
      if (data.action === 'toggleCinematic') setIsCinematic(data.value);
      
      // Voice Updates
      if (data.action === 'updateVoice') {
          setStatus(prev => ({ 
              ...prev, 
              voiceRange: data.payload.range || prev.voiceRange,
              isTalking: data.payload.talking !== undefined ? data.payload.talking : prev.isTalking
          }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // in vehicle?
const [inVehicle, setInVehicle] = useState(false);


useEffect(() => {
  window.addEventListener('message', (e) => {
    if (e.data.type === 'vehicleStatus') {
      setStatus(prev => ({ ...prev, inVehicle: e.data.inVehicle }));
    }
  });
}, []);





  const colors = {
    health: customTheme?.colors.health || '#ef4444', 
    armor: customTheme?.colors.armor || '#3b82f6', 
    hunger: customTheme?.colors.hunger || '#eab308', 
    thirst: customTheme?.colors.thirst || '#0ea5e9', 
    stamina: '#ffffff', // Pure White
    stress: customTheme?.colors.stress || '#a855f7', 
    stance: customTheme?.colors.stance || '#10b981', 
  };

  if (!visible) return null;

  return (
    // Background is transparent to let index.html image (preview) or game (prod) show through
    <div className="relative w-full h-screen overflow-hidden text-white font-sans selection:bg-transparent bg-transparent">
      
      {/* CINEMATIC BARS OVERLAY */}
      {/* Top Bar */}
      <div 
        className={`fixed top-0 left-0 w-full bg-black z-[100] transition-all duration-700 ease-in-out ${isCinematic ? 'h-32' : 'h-0'}`} 
      />
      {/* Bottom Bar */}
      <div 
        className={`fixed bottom-0 left-0 w-full bg-black z-[100] transition-all duration-700 ease-in-out ${isCinematic ? 'h-32' : 'h-0'}`} 
      />

      {/* Main HUD Container - Fades out in Cinematic Mode */}
      <div className={`w-full h-full transition-opacity duration-500 ${isCinematic ? 'opacity-0' : 'opacity-100'}`}>
        


        {/* TOP CENTER: Compass */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-30">
            <InfoHud location={location} theme={customTheme} />
        </div>

        {/* --- LEFT BOTTOM AREA: MAP & STATUS --- */}
        

        {/* 2. VOICE HUD (Dynamic Positioning) */}
        {/* Logic: If stamina < 98 (active/regenerating), move voice UP to avoid overlap. Else stay bottom. */}
        <div 
            className={`absolute left-1/2 transform -translate-x-1/2 z-30 transition-all duration-300 ease-out ${status.stamina > 0 ? 'bottom-16' : 'bottom-4'}`}
        >
            <VoiceHud range={status.voiceRange} isTalking={status.isTalking} />
        </div>

        {/* 3. STATUS BARS (Under Minimap) */}
        <div className={`absolute z-20 w-64 flex flex-col gap-1.5 transition-all duration-300
            ${status.inVehicle ? 'left-8 bottom-60' : 'left-8 bottom-4'}`}
        >

          {/* Health: Always Show */}
          <StatusRing value={status.health} icon={Heart} color={colors.health} />

          {/* Armor: Always Show if > 0 */}
          {status.armor > 0 && (
            <StatusRing value={status.armor} icon={Shield} color={colors.armor} />
          )}

          {/* Hunger/Thirst: Show ONLY if below 50% (or debug on) */}
          <div className="grid grid-cols-2 gap-2">
            {(showDebug || status.hunger < 50) && (
              <StatusRing value={status.hunger} icon={Utensils} color={colors.hunger} />
            )}
            {(showDebug || status.thirst < 50) && (
              <StatusRing value={status.thirst} icon={Droplets} color={colors.thirst} />
            )}
          </div>

          {/* Stance: Always show or threshold */}
          {/*(showDebug || status.stance < 90) && (
              <StatusRing value={status.stance} icon={Footprints} color={colors.stance} />
          )*/}
        </div>



        {/* CENTER BOTTOM: Stamina Bar (Pure White) */}
        {status.stamina > 2 && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-fade-in-up">
            {/* White Glow Bar */}
            <div className="w-96 h-1 bg-white/20 rounded-full overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.7)]">
                <div 
                className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,1)] transition-all duration-300 ease-out"
                style={{ width: `${100 - status.stamina}%` }}
                />
            </div>
            </div>
        )}

        {/* BOTTOM RIGHT: Vehicle HUD */}
        <div className="absolute bottom-6 right-12 z-20">
            <VehicleHud vehicle={vehicle} theme={customTheme} heading={location.heading} />
        </div>
      </div>


    </div>
  );
};

export default App;
