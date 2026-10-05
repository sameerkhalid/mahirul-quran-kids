import { z } from "zod";

const verseKey = z.string().regex(/^\d{1,3}:\d{1,3}$/, "Use a verse key such as 112:1");

export const surahSchema = z.object({
  number: z.number().int().min(1).max(114),
  nameArabic: z.string().min(1),
  nameEnglish: z.string().min(1),
  meaningEnglish: z.string().min(1),
  ayahs: z.array(
    z.object({
      verseKey,
      surahNumber: z.number().int().min(1).max(114),
      ayahNumber: z.number().int().positive(),
      textQpcHafs: z.string().min(1)
    })
  ).min(1)
});

const base = {
  id: z.string().regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
  enabled: z.boolean(),
  surahNumbers: z.array(z.number().int().min(1).max(114)).min(1),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  source: z.enum(["generated", "curated"]),
  note: z.string().optional()
};

export const questionBankEntrySchema = z.discriminatedUnion("type", [
  z.object({
    ...base,
    type: z.literal("choose-next-ayah"),
    data: z.object({
      promptAyahKey: verseKey,
      correctAyahKey: verseKey,
      distractorAyahKeys: z.array(verseKey).optional()
    })
  }),
  z.object({
    ...base,
    type: z.literal("identify-surah"),
    data: z.object({ ayahKey: verseKey, correctSurahNumber: z.number().int().min(1).max(114) })
  }),
  z.object({
    ...base,
    type: z.literal("arrange-ayahs"),
    data: z.object({ correctOrder: z.array(verseKey).min(3).max(4) })
  }),
  z.object({
    ...base,
    type: z.literal("recite-next"),
    data: z.object({ promptAyahKey: verseKey, answerAyahKey: verseKey })
  })
]);

export const questionBankSchema = z.array(questionBankEntrySchema);

export const audioManifestSchema = z.record(verseKey, z.string().regex(/^audio\/.+\.mp3$/));

export const progressSchema = z.object({
  schemaVersion: z.literal(1),
  sessionsCompleted: z.number().int().nonnegative(),
  totalStars: z.number().int().nonnegative(),
  attemptsByQuestion: z.record(z.string(), z.object({
    attempts: z.number().int().nonnegative(),
    firstAttemptCorrect: z.number().int().nonnegative()
  })),
  practiceQuestionIds: z.array(z.string()),
  lastSelectedSurahs: z.array(z.number().int().min(1).max(114)),
  audioEnabled: z.boolean()
});
