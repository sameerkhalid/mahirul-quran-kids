import { ayahsByKey, questionBank, surahsByNumber } from "../content";
import type { ActiveSession, Question, QuestionBankEntry, QuestionType, VerseKey } from "../content/types";
import { createSeededRandom, pickOne, shuffle } from "./random";

export function getAdaptiveQuestionCount(selectedSurahCount: number, availableQuestionCount = Number.POSITIVE_INFINITY): number {
  const recommended = selectedSurahCount <= 2
    ? 5
    : selectedSurahCount <= 5
      ? 10
      : selectedSurahCount <= 10
        ? 15
        : Math.ceil((selectedSurahCount + 1) / 5) * 5;
  if (!Number.isFinite(availableQuestionCount)) return recommended;
  if (availableQuestionCount < 5) return availableQuestionCount;
  const roundedAvailable = Math.floor(availableQuestionCount / 5) * 5;
  return Math.min(recommended, roundedAvailable);
}

function materialize(
  entry: QuestionBankEntry,
  selectedSurahs: number[],
  random: () => number
): Question {
  if (entry.type === "choose-next-ayah") {
    const excluded = new Set([entry.data.promptAyahKey, entry.data.correctAyahKey]);
    const fallbackDistractors = selectedSurahs
      .flatMap((number) => surahsByNumber.get(number)?.ayahs ?? [])
      .map((ayah) => ayah.verseKey)
      .filter((key) => !excluded.has(key));
    const distractors = entry.data.distractorAyahKeys ?? shuffle(fallbackDistractors, random).slice(0, 2);
    const uniqueDistractors = [...new Set(distractors.filter((key) => !excluded.has(key)))].slice(0, 2);
    if (uniqueDistractors.length < 2) throw new Error(`${entry.id} needs at least two valid distractors`);
    return {
      id: entry.id,
      type: entry.type,
      promptAyahKey: entry.data.promptAyahKey,
      correctAyahKey: entry.data.correctAyahKey,
      optionAyahKeys: shuffle([entry.data.correctAyahKey, ...uniqueDistractors], random)
    };
  }

  if (entry.type === "identify-surah") {
    const otherOptions = shuffle(selectedSurahs.filter((number) => number !== entry.data.correctSurahNumber), random).slice(0, 2);
    return {
      id: entry.id,
      type: entry.type,
      ayahKey: entry.data.ayahKey,
      correctSurahNumber: entry.data.correctSurahNumber,
      optionSurahNumbers: shuffle([entry.data.correctSurahNumber, ...otherOptions], random)
    };
  }

  if (entry.type === "arrange-ayahs") {
    let initialOrder = shuffle(entry.data.correctOrder, random);
    if (initialOrder.every((key, index) => key === entry.data.correctOrder[index])) {
      initialOrder = [...initialOrder.slice(1), initialOrder[0]!] as VerseKey[];
    }
    return { id: entry.id, type: entry.type, correctOrder: entry.data.correctOrder, initialOrder };
  }

  return {
    id: entry.id,
    type: entry.type,
    promptAyahKey: entry.data.promptAyahKey,
    answerAyahKey: entry.data.answerAyahKey
  };
}

export function getEligibleEntries(selectedSurahs: number[]): QuestionBankEntry[] {
  const selected = new Set(selectedSurahs);
  return questionBank.filter((entry) => {
    if (!entry.enabled || !entry.surahNumbers.every((number) => selected.has(number))) return false;
    if (entry.type === "identify-surah" && selectedSurahs.length < 2) return false;
    return true;
  });
}

export function generateSession(selectedSurahs: number[], seed = Date.now()): ActiveSession {
  if (selectedSurahs.length === 0) throw new Error("Select at least one surah");
  const random = createSeededRandom(seed);
  const eligible = getEligibleEntries(selectedSurahs);
  const types = [...new Set(eligible.map((entry) => entry.type))] as QuestionType[];
  const chosen: QuestionBankEntry[] = [];
  const includeMeanings = selectedSurahs.length >= 3;
  const sessionSize = getAdaptiveQuestionCount(selectedSurahs.length, eligible.length + (includeMeanings ? 1 : 0));
  const entryTarget = sessionSize - (includeMeanings ? 1 : 0);

  const addEntry = (entry: QuestionBankEntry | undefined) => {
    if (entry && chosen.length < entryTarget && !chosen.some((item) => item.id === entry.id)) chosen.push(entry);
  };

  // Give every selected surah representation before filling the rest of the session.
  for (const surahNumber of shuffle(selectedSurahs, random)) {
    const candidates = eligible.filter((entry) => entry.surahNumbers.includes(surahNumber) && !chosen.some((item) => item.id === entry.id));
    addEntry(candidates.length ? pickOne(candidates, random) : undefined);
  }

  for (const type of shuffle(types, random)) {
    if (!chosen.some((entry) => entry.type === type)) {
      addEntry(pickOne(eligible.filter((entry) => entry.type === type), random));
    }
  }

  const remaining = shuffle(eligible.filter((entry) => !chosen.some((chosenEntry) => chosenEntry.id === entry.id)), random);
  chosen.push(...remaining.slice(0, Math.max(0, entryTarget - chosen.length)));

  if (chosen.length < entryTarget) throw new Error("Not enough eligible questions for a session");

  const questions: Question[] = chosen.slice(0, entryTarget).map((entry) =>
    materialize(entry, selectedSurahs, random)
  );
  if (includeMeanings) {
    const meaningSurahs = shuffle(selectedSurahs, random).slice(0, 3);
    questions.push({
      id: `meanings-${[...meaningSurahs].sort((a, b) => a - b).join("-")}`,
      type: "match-surah-meanings",
      surahNumbers: meaningSurahs,
      meaningOrder: shuffle(meaningSurahs, random)
    });
  }
  const shuffledQuestions = shuffle(questions, random);

  for (const question of shuffledQuestions) {
    const keys = question.type === "choose-next-ayah"
      ? [question.promptAyahKey, ...question.optionAyahKeys]
      : question.type === "identify-surah"
        ? [question.ayahKey]
        : question.type === "arrange-ayahs"
          ? question.correctOrder
          : question.type === "recite-next"
            ? [question.promptAyahKey, question.answerAyahKey]
            : [];
    keys.forEach((key) => {
      if (!ayahsByKey.has(key)) throw new Error(`Question ${question.id} references missing ${key}`);
    });
  }

  return {
    id: `${seed}-${selectedSurahs.join("-")}`,
    seed,
    selectedSurahs,
    questions: shuffledQuestions,
    currentIndex: 0,
    answers: [],
    startedAt: new Date().toISOString()
  };
}
