
export interface Program {
  id: string;
  name: string;
  degree: 'Bachelor' | 'Master' | 'PhD';
  price: number; // KZT
  minScore: number; // ENT score
  grants: number; // Number of available grants
  subjects?: [string, string]; // Optional for mock data mapping
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  city: string;
  rating: number; // 1-100
  image: string;
  description: string;
  type: 'National' | 'State' | 'Private' | 'International';
  founded: number;
  students: number;
  programs: Program[];
  coordinates: { lat: number; lng: number };
  employmentRate: number; // %
  dormitory: boolean;
  militaryDept: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

export type ViewState = 'HOME' | 'CATALOG' | 'DETAILS' | 'COMPARE' | 'AI_CHAT';

export interface ComparisonMetric {
  key: keyof University | 'avgPrice';
  label: string;
  format: (val: any) => string;
  higherIsBetter?: boolean; // True if higher number is better (Rating), False if lower is better (Price)
  disableRelative?: boolean; // Skip relative calculation for years, static data
}

// --- New Types for Advanced Features ---

export interface FilterState {
  city: string[];
  type: string[];
  minPrice: number;
  maxPrice: number;
  hasDormitory: boolean;
  hasMilitary: boolean;
  minRating: number;
}

export interface EntSubject {
  id: string;
  name: string;
  icon: string;
}

export interface GrantPrediction {
  university: University;
  program: Program;
  chance: 'High' | 'Medium' | 'Low';
  probability: number;
  scoreGap: number; // How much higher/lower than passing score
}
