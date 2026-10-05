import { describe, expect, it } from "vitest";
import { chooseCorrectFeedback, correctFeedbackFiles } from "./correct-feedback";

describe("correct answer feedback", () => {
  it("selects one of the available recordings", () => {
    expect(correctFeedbackFiles).toContain(chooseCorrectFeedback(null, () => 0.5));
  });

  it("does not immediately repeat the previous recording", () => {
    const previous = correctFeedbackFiles[0];
    expect(chooseCorrectFeedback(previous, () => 0)).not.toBe(previous);
    expect(chooseCorrectFeedback(previous, () => 0.999)).not.toBe(previous);
  });
});
