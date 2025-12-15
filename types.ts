export interface HudStatus {
  health: number;
  armor: number;
  hunger: number;
  thirst: number;
  stress: number;
  stamina: number;
  oxygen: number;
  stance: number;
  voiceRange: number; // 1 (Whisper), 2 (Normal), 3 (Shout)
  isTalking: boolean;
}

export interface VehicleStatus {
  inVehicle: boolean;
  type: 'car' | 'bike' | 'boat' | 'heli' | 'plane';
  speed: number; // in MPH or KPH
  altitude: number; // for helis/planes
  rpm: number; // 0.0 to 1.0
  gear: number;
  fuel: number; // 0 to 100
  engineHealth: number; // 0 to 1000 usually
  seatbelt: boolean;
  locked: boolean;
  lightsOn: boolean;
  turnSignalLeft: boolean;
  turnSignalRight: boolean;
  isElectric: boolean;
  engineOn: boolean;
}

export interface LocationInfo {
  street: string;
  zone: string;
  heading: string; // Text representation (N, SW)
  headingValue: number; // Degree 0-360 for compass slider
  time: string;
}

export interface HudTheme {
  primaryColor: string; // Hex
  secondaryColor: string; // Hex
  borderRadius: string; // Tailwind class equivalent or px
  opacity: number;
  fontFamily: 'sans' | 'mono';
  iconStyle: 'solid' | 'outline';
}

export interface LokuThemeResponse {
  themeName: string;
  colors: {
    health: string;
    armor: string;
    hunger: string;
    thirst: string;
    stamina: string;
    stress: string;
    stance: string;
  };
  containerStyle: {
    backgroundColor: string;
    borderColor: string;
  };
}