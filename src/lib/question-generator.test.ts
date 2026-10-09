import { describe, expect, it } from "vitest";
import { generateSession, getAdaptiveQuestionCount, getEligibleEntries } from "./question-generator";

describe("question generator", () => {
  it("creates the same questions for the same seed", () => {
    const first = generateSession([112, 113, 114], 12345);
    const second = generateSession([112, 113, 114], 12345);
    expect(first.questions).toEqual(second.questions);
  });

  it("creates five unique questions", () => {
    const session = generateSession([112], 7);
    expect(session.questions).toHaveLength(5);
    expect(new Set(session.questions.map((question) => question.id)).size).toBe(5);
  });

  it("adapts session length without menu choices", () => {
    expect(getAdaptiveQuestionCount(1, 20)).toBe(5);
    expect(getAdaptiveQuestionCount(3, 30)).toBe(10);
    expect(getAdaptiveQuestionCount(10, 100)).toBe(15);
    expect(generateSession([112, 113, 114], 8).questions).toHaveLength(10);
    expect(generateSession([105, 106, 107, 108, 109, 110, 111, 112, 113, 114], 8).questions).toHaveLength(15);
    expect(generateSession(Array.from({ length: 22 }, (_, index) => 93 + index), 8).questions).toHaveLength(25);
  });

  it("covers every selected surah in a large session", () => {
    const selected = Array.from({ length: 22 }, (_, index) => 93 + index);
    const session = generateSession(selected, 21);
    const covered = new Set<number>();
    session.questions.forEach((question) => {
      if (question.type === "choose-next-ayah" || question.type === "recite-next") covered.add(Number(question.promptAyahKey.split(":")[0]));
      else if (question.type === "identify-surah") covered.add(question.correctSurahNumber);
      else if (question.type === "arrange-ayahs") covered.add(Number(question.correctOrder[0].split(":")[0]));
      else question.surahNumbers.forEach((number) => covered.add(number));
    });
    expect([...covered].sort((a, b) => a - b)).toEqual(selected);
  });

  it("omits identify-surah when only one surah is selected", () => {
    expect(getEligibleEntries([112]).some((entry) => entry.type === "identify-surah")).toBe(false);
    expect(generateSession([112], 9).questions.some((question) => question.type === "identify-surah")).toBe(false);
  });

  it("includes every eligible type in a mixed session", () => {
    const types = new Set(generateSession([112, 113, 114], 42).questions.map((question) => question.type));
    expect(types).toEqual(new Set(["choose-next-ayah", "identify-surah", "arrange-ayahs", "recite-next", "match-surah-meanings"]));
  });

  it("limits identify-surah choices to three in a large range", () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const identify = generateSession([105, 106, 107, 108, 109, 110, 111, 112, 113, 114], seed).questions.find((question) => question.type === "identify-surah");
      expect(identify?.optionSurahNumbers).toHaveLength(3);
    }
  });

  it("never starts an arrange question already solved", () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const questions = generateSession([112, 113, 114], seed).questions;
      questions.filter((question) => question.type === "arrange-ayahs").forEach((question) => {
        expect(question.initialOrder).not.toEqual(question.correctOrder);
      });
    }
  });
});
