export const correctFeedbackFiles = [
  "narration/correct/correct-01.mp3",
  "narration/correct/correct-02.mp3",
  "narration/correct/correct-03.mp3",
  "narration/correct/correct-04.mp3",
  "narration/correct/correct-05.mp3",
  "narration/correct/correct-06.mp3",
  "narration/correct/correct-07.mp3",
] as const;

export function chooseCorrectFeedback(
  previous: string | null,
  random: () => number = Math.random,
): string {
  const choices = previous
    ? correctFeedbackFiles.filter((file) => file !== previous)
    : correctFeedbackFiles;
  const index = Math.min(Math.floor(random() * choices.length), choices.length - 1);
  return choices[index];
}
