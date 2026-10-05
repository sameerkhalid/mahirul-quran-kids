export type VerseKey = `${number}:${number}`;
export type QuestionType =
  | "choose-next-ayah"
  | "identify-surah"
  | "arrange-ayahs"
  | "recite-next"
  | "match-surah-meanings";

export interface Ayah {
  verseKey: VerseKey;
  surahNumber: number;
  ayahNumber: number;
  textQpcHafs: string;
}

export interface Surah {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  meaningEnglish: string;
  ayahs: Ayah[];
}

interface QuestionBankBase {
  id: string;
  enabled: boolean;
  surahNumbers: number[];
  difficulty: 1 | 2 | 3;
  source: "generated" | "curated";
  note?: string;
}

export type QuestionBankEntry =
  | (QuestionBankBase & {
      type: "choose-next-ayah";
      data: {
        promptAyahKey: VerseKey;
        correctAyahKey: VerseKey;
        distractorAyahKeys?: VerseKey[];
      };
    })
  | (QuestionBankBase & {
      type: "identify-surah";
      data: { ayahKey: VerseKey; correctSurahNumber: number };
    })
  | (QuestionBankBase & {
      type: "arrange-ayahs";
      data: { correctOrder: VerseKey[] };
    })
  | (QuestionBankBase & {
      type: "recite-next";
      data: { promptAyahKey: VerseKey; answerAyahKey: VerseKey };
    });

export type Question =
  | {
      id: string;
      type: "choose-next-ayah";
      promptAyahKey: VerseKey;
      optionAyahKeys: VerseKey[];
      correctAyahKey: VerseKey;
    }
  | {
      id: string;
      type: "identify-surah";
      ayahKey: VerseKey;
      optionSurahNumbers: number[];
      correctSurahNumber: number;
    }
  | {
      id: string;
      type: "arrange-ayahs";
      correctOrder: VerseKey[];
      initialOrder: VerseKey[];
    }
  | {
      id: string;
      type: "recite-next";
      promptAyahKey: VerseKey;
      answerAyahKey: VerseKey;
    }
  | {
      id: string;
      type: "match-surah-meanings";
      surahNumbers: number[];
      meaningOrder: number[];
    };

export interface AnswerResult {
  questionId: string;
  firstAttemptCorrect: boolean;
  attempts: number;
  selfAssessed?: boolean;
}

export interface ActiveSession {
  id: string;
  seed: number;
  selectedSurahs: number[];
  questions: Question[];
  currentIndex: number;
  answers: AnswerResult[];
  startedAt: string;
}

export interface SessionResult {
  id: string;
  score: number;
  total: number;
  selectedSurahs: number[];
  answers: AnswerResult[];
  completedAt: string;
}

export interface QuestionProgress {
  attempts: number;
  firstAttemptCorrect: number;
}

export interface ProgressV1 {
  schemaVersion: 1;
  sessionsCompleted: number;
  totalStars: number;
  attemptsByQuestion: Record<string, QuestionProgress>;
  practiceQuestionIds: string[];
  lastSelectedSurahs: number[];
  audioEnabled: boolean;
}
