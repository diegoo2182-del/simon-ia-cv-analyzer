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
