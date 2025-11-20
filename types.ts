export interface SolarData {
  azimuth: number;
  elevation: number;
  declination: number;
  description: string;
}

export interface GeminiAnalysis {
  loading: boolean;
  text: string | null;
  error: string | null;
}

export interface EarthState {
  rotationY: number; // 0 to 2PI, represents time of day
  sunDeclination: number; // -23.5 to 23.5 degrees converted to radians
  date: Date;
}
