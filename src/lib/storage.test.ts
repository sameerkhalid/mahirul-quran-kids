import { beforeEach, describe, expect, it } from "vitest";
import { applySessionResults, defaultProgress, loadProgress, saveProgress } from "./storage";

describe("progress storage", () => {
  beforeEach(() => localStorage.clear());

  it("falls back when saved data is malformed", () => {
    localStorage.setItem("mahirul-quran:progress:v1", "not json");
    expect(loadProgress()).toEqual(defaultProgress);
  });

  it("round trips valid progress", () => {
    const progress = { ...defaultProgress, totalStars: 4 };
    saveProgress(progress);
    expect(loadProgress()).toEqual(progress);
  });

  it("records stars and practice questions", () => {
    const progress = applySessionResults(defaultProgress, [
      { questionId: "right", attempts: 1, firstAttemptCorrect: true },
      { questionId: "retry", attempts: 2, firstAttemptCorrect: false }
    ]);
    expect(progress.totalStars).toBe(1);
    expect(progress.sessionsCompleted).toBe(1);
    expect(progress.practiceQuestionIds).toEqual(["retry"]);
  });
});
