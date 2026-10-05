import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ActiveSession, AnswerResult, ProgressV1, SessionResult } from "../content/types";
import { generateSession } from "../lib/question-generator";
import {
  applySessionResults,
  clearSession,
  loadProgress,
  loadResult,
  loadSession,
  resetAllProgress,
  saveProgress,
  saveResult,
  saveSession
} from "../lib/storage";

interface AppStateValue {
  progress: ProgressV1;
  session: ActiveSession | null;
  lastResult: SessionResult | null;
  startSession: (surahNumbers: number[]) => void;
  answerCurrent: (answer: AnswerResult) => boolean;
  setAudioEnabled: (enabled: boolean) => void;
  resetProgress: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(loadProgress);
  const [session, setSession] = useState(loadSession);
  const [lastResult, setLastResult] = useState(loadResult);

  const value = useMemo<AppStateValue>(() => ({
    progress,
    session,
    lastResult,
    startSession(surahNumbers) {
      const nextProgress = { ...progress, lastSelectedSurahs: surahNumbers };
      const nextSession = generateSession(surahNumbers);
      setProgress(nextProgress);
      saveProgress(nextProgress);
      setSession(nextSession);
      saveSession(nextSession);
    },
    answerCurrent(answer) {
      if (!session) return false;
      const answers = [...session.answers, answer];
      const isComplete = session.currentIndex >= session.questions.length - 1;
      if (isComplete) {
        const result: SessionResult = {
          id: session.id,
          score: answers.filter((item) => item.firstAttemptCorrect).length,
          total: session.questions.length,
          selectedSurahs: session.selectedSurahs,
          answers,
          completedAt: new Date().toISOString()
        };
        const nextProgress = applySessionResults(progress, answers);
        setProgress(nextProgress);
        saveProgress(nextProgress);
        setLastResult(result);
        saveResult(result);
        setSession(null);
        clearSession();
        return true;
      }
      const nextSession = { ...session, answers, currentIndex: session.currentIndex + 1 };
      setSession(nextSession);
      saveSession(nextSession);
      return false;
    },
    setAudioEnabled(enabled) {
      const nextProgress = { ...progress, audioEnabled: enabled };
      setProgress(nextProgress);
      saveProgress(nextProgress);
    },
    resetProgress() {
      const fresh = resetAllProgress();
      setProgress(fresh);
      setSession(null);
      setLastResult(null);
    }
  }), [progress, session, lastResult]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used inside AppStateProvider");
  return context;
}
