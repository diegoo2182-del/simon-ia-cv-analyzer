import { Seniority } from './analysis';

export interface RawCandidate {
  firstName: string;
  lastName: string;
  position: string;
  city: string;
  state: string;
  country: string;
  rawSalary: string;
}

export interface ParsedSalary {
  annualAmount: number;
  currency: string;
  confidence: 'high' | 'low';
}

export interface CandidateSalaryRow {
  name: string;
  position: string;
  location: string;
  country: string;
  rawSalary: string;
  annualUSD: number | null;
  annualUYU: number | null;
  parseNote: string;
  excludedFromComparison?: boolean;
}

export interface LocationSummary {
  country: string;
  count: number;
  avgUSD: number;
  minUSD: number;
  maxUSD: number;
  avgUYU: number;
}

export interface PositionReport {
  position: string;
  candidates: CandidateSalaryRow[];
  byLocation: LocationSummary[];
  excludedCount: number;
}

export interface ScoredCandidate {
  name: string;
  position: string;
  location: string;
  country: string;
  rawSalary: string;
  monthlyUSD: number | null;
  annualUYU: number | null;
  excludedFromComparison: boolean;
  cvMatched: boolean;
  cvFilename?: string;
  matchConfidence?: number;
  compatibilityScore?: number;
  recommendation?: 'ADVANCE' | 'CONSIDER' | 'REJECT';
  profileSummary?: string;
  matchingSkills?: string[];
  missingSkills?: string[];
  recommendationReason?: string;
}

export interface MatchStats {
  total: number;
  matched: number;
  analyzed: number;
}

export interface ExchangeRates {
  usdToUYU: number;
  arsPerUSD: number;
  rateType: 'MEP';
  fetchedAt: string;
}

export interface SalaryAnalysisResponse {
  success: boolean;
  reports?: PositionReport[];
  rates?: ExchangeRates;
  error?: string;
}

export interface SalaryScoreResponse {
  success: boolean;
  reports?: PositionReport[];
  scoredCandidates?: ScoredCandidate[];
  rates?: ExchangeRates;
  matchStats?: MatchStats;
  error?: string;
}

export interface JDInput {
  description: string;
  seniority: Seniority;
  requiredSkills: string[];
}
