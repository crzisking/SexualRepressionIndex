
export enum QuizMode {
  HOME = 'HOME',
  NORMAL = 'NORMAL',
  DETAILED = 'DETAILED',
  RESULT = 'RESULT'
}

export interface Question {
  id: string;
  text: string;
  options?: string[]; // Only for Normal mode
  dimension: string;
}

export interface QuizState {
  mode: QuizMode;
  currentQuestionIndex: number;
  answers: Record<string, number>;
  scoreResult?: QuizResult;
}

export interface QuizResult {
  overallScore: number;
  factorScores: Record<string, number>;
  aiRoast: string;
}

export interface RadarData {
  subject: string;
  A: number;
  fullMark: number;
}
