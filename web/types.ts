
export interface Program {
  id: string;
  name: string;
  code?: string; // e.g., "5B010900", "BM086"
  degree: 'Bachelor' | 'Master' | 'PhD' | 'Residency' | 'Internship';
  price: number; // KZT
  minScore: number; // ENT passing score for grants
  grants: number; // Number of available grants
  duration?: number; // Years (default 4)
  subjects?: [string, string]; // ENT profile subjects
  ruralQuotaScore?: number; // Rural quota passing score
}

export interface SubjectCombination {
  subjects: [string, string]; // e.g., ["Математика", "Физика"]
  programCount: number;
  programs: string[]; // List of program names
}

export interface AdmissionRequirements {
  entThreshold: number; // General ENT threshold (e.g., 65, 70)
  historyMin: number; // History of Kazakhstan minimum
  profileMin: number; // Profile subjects minimum (each)
  mathLiteracyMin: number; // Mathematical literacy minimum
  readingLiteracyMin: number; // Reading literacy minimum
  alternativeTests?: { // For NU-like universities
    nuet?: number;
    sat?: number;
    act?: number;
    ielts?: { overall: number; writing: number; other: number };
    ibDiploma?: number;
    aLevel?: string; // e.g., "ABB"
  };
  usesEnt: boolean; // Whether university uses ENT system
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  city: string;
  rating: number; // 1-100
  image: string;
  description: string;
  type: 'National' | 'State' | 'Private' | 'International' | 'Autonomous';
  founded: number;
  students: number;
  programs: Program[];
  coordinates: { lat: number; lng: number };
  employmentRate: number; // %
  dormitory: boolean;
  militaryDept: boolean;
  // New fields
  admissionRequirements?: AdmissionRequirements;
  subjectCombinations?: SubjectCombination[];
  totalPrograms?: { bachelor?: number; master?: number; phd?: number; residency?: number };
  teachingLanguages?: string[];
  grantsPerYear?: number;
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
