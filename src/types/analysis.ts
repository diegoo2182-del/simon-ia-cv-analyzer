export type Seniority = 'Junior' | 'Semi-Senior' | 'Senior' | 'Lead' | 'Principal';

export type Recommendation = 'ADVANCE' | 'CONSIDER' | 'REJECT';

export interface JobRequirements {
  description: string;
  requiredSkills: string[];
  seniority: Seniority;
}

export interface CategoryScores {
  skills: number;
  experience: number;
  seniority: number;
  culturaFit: number;
}

export interface SkillsBreakdown {
  hardSkills: string[];
  softSkills: string[];
  tools: string[];
  languages: string[];
  detectedSeniority: string;
}

export interface ExecutiveSummary {
  summary: string;
  highlights: string[];
}

export type GapSeverity = 'high' | 'medium' | 'low';
export type GapCategory = 'skills' | 'experience' | 'seniority' | 'stability' | 'other';

export interface GapItem {
  description: string;
  severity: GapSeverity;
  category: GapCategory;
}

export interface GapsAnalysis {
  items: GapItem[];
  overallRisk: GapSeverity;
}

export interface InterviewQuestions {
  technical: string[];
  behavioral: string[];
  situational: string[];
}

export interface InterviewQuestionsResponse {
  success: boolean;
  questions?: InterviewQuestions;
  error?: string;
}

export interface CandidateFeedback {
  strengths: string[];
  improvements: string[];
  recommendedSkills: string[];
  cvTips: string[];
}

export interface CandidateFeedbackResponse {
  success: boolean;
  feedback?: CandidateFeedback;
  error?: string;
}

export interface AnalysisResult {
  profileSummary: string;
  executiveSummary: ExecutiveSummary;
  detectedSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  gaps: string[];
  gapsAnalysis: GapsAnalysis;
  compatibilityScore: number;
  categoryScores: CategoryScores;
  skillsBreakdown: SkillsBreakdown;
  recommendation: Recommendation;
  recommendationReason: string;
}

export interface RankedCandidate {
  fileName: string;
  result: AnalysisResult;
}

export interface RankingResponse {
  success: boolean;
  candidates?: RankedCandidate[];
  error?: string;
}

export interface AnalyzeRequest {
  cvText: string;
  jobRequirements: JobRequirements;
}

export interface AnalyzeResponse {
  success: boolean;
  result?: AnalysisResult;
  error?: string;
}
