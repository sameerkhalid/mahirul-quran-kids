import { progressSchema } from "../content/schema";
import type { ActiveSession, AnswerResult, ProgressV1, SessionResult } from "../content/types";

const PROGRESS_KEY = "mahirul-quran:progress:v1";
const SESSION_KEY = "mahirul-quran:active-session:v1";
const RESULT_KEY = "mahirul-quran:last-result:v1";

export const defaultProgress: ProgressV1 = {
  schemaVersion: 1,
  sessionsCompleted: 0,
  totalStars: 0,
  attemptsByQuestion: {},
  practiceQuestionIds: [],
  lastSelectedSurahs: [112, 113, 114],
  audioEnabled: true
};

function safelyRead<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

export function loadProgress(): ProgressV1 {
  const result = progressSchema.safeParse(safelyRead(PROGRESS_KEY));
  return result.success ? result.data : defaultProgress;
}

export function saveProgress(progress: ProgressV1): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function loadSession(): ActiveSession | null {
  return safelyRead<ActiveSession>(SESSION_KEY);
}

export function saveSession(session: ActiveSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function saveResult(result: SessionResult): void {
  localStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function loadResult(): SessionResult | null {
  return safelyRead<SessionResult>(RESULT_KEY);
}

export function applySessionResults(progress: ProgressV1, answers: AnswerResult[]): ProgressV1 {
  const attemptsByQuestion = { ...progress.attemptsByQuestion };
  const practice = new Set(progress.practiceQuestionIds);

  for (const answer of answers) {
    const current = attemptsByQuestion[answer.questionId] ?? { attempts: 0, firstAttemptCorrect: 0 };
    attemptsByQuestion[answer.questionId] = {
      attempts: current.attempts + 1,
      firstAttemptCorrect: current.firstAttemptCorrect + (answer.firstAttemptCorrect ? 1 : 0)
    };
    if (answer.firstAttemptCorrect) practice.delete(answer.questionId);
    else practice.add(answer.questionId);
  }

  return {
    ...progress,
    sessionsCompleted: progress.sessionsCompleted + 1,
    totalStars: progress.totalStars + answers.filter((answer) => answer.firstAttemptCorrect).length,
    attemptsByQuestion,
    practiceQuestionIds: [...practice]
  };
}

export function resetAllProgress(): ProgressV1 {
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(RESULT_KEY);
  return defaultProgress;
}
