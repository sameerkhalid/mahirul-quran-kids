import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { audioManifestSchema, questionBankSchema, surahSchema } from "../src/content/schema.ts";
import type { Ayah, QuestionBankEntry, Surah, VerseKey } from "../src/content/types.ts";

const errors: string[] = [];

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(resolve(path), "utf8"));
  } catch (error) {
    errors.push(`${path}: ${error instanceof Error ? error.message : "could not read JSON"}`);
    return null;
  }
}

function formatIssues(path: string, issues: { path: PropertyKey[]; message: string }[]): void {
  issues.forEach((issue) => errors.push(`${path}${issue.path.length ? ` → ${issue.path.join(".")}` : ""}: ${issue.message}`));
}

const surahFiles = Array.from({ length: 10 }, (_, index) => 105 + index).map((number) => `src/content/surahs/${number}.json`);
const questionFiles = [...Array.from({ length: 10 }, (_, index) => String(105 + index)), "cross-surah"].map((name) => `src/content/questions/${name}.json`);
const surahs: Surah[] = [];
const questionBank: QuestionBankEntry[] = [];

for (const file of surahFiles) {
  const result = surahSchema.safeParse(readJson(file));
  if (result.success) surahs.push(result.data as Surah);
  else formatIssues(file, result.error.issues);
}

for (const file of questionFiles) {
  const result = questionBankSchema.safeParse(readJson(file));
  if (result.success) questionBank.push(...result.data as QuestionBankEntry[]);
  else formatIssues(file, result.error.issues);
}

const audioResult = audioManifestSchema.safeParse(readJson("src/content/audio-manifest.json"));
const audioManifest = audioResult.success ? audioResult.data as Record<VerseKey, string> : {};
if (!audioResult.success) formatIssues("src/content/audio-manifest.json", audioResult.error.issues);

const ayahsByKey = new Map<VerseKey, Ayah>();
for (const surah of surahs) {
  surah.ayahs.forEach((ayah, index) => {
    const expectedNumber = index + 1;
    const expectedKey = `${surah.number}:${expectedNumber}`;
    if (ayah.surahNumber !== surah.number || ayah.ayahNumber !== expectedNumber || ayah.verseKey !== expectedKey) {
      errors.push(`src/content/surahs/${surah.number}.json: expected ayah ${expectedKey} at position ${expectedNumber}`);
    }
    ayahsByKey.set(ayah.verseKey, ayah);
    const audioPath = audioManifest[ayah.verseKey];
    if (!audioPath) errors.push(`src/content/audio-manifest.json: missing audio for ${ayah.verseKey}`);
    else if (!existsSync(resolve("public", audioPath))) errors.push(`src/content/audio-manifest.json: ${ayah.verseKey} points to missing public/${audioPath}`);
  });
}

const seenQuestionIds = new Set<string>();
const requireAyah = (key: VerseKey, id: string) => {
  if (!ayahsByKey.has(key)) errors.push(`${id}: unknown verse key ${key}`);
};

for (const entry of questionBank) {
  if (seenQuestionIds.has(entry.id)) errors.push(`${entry.id}: duplicate question ID`);
  seenQuestionIds.add(entry.id);
  const keys: VerseKey[] = [];

  if (entry.type === "choose-next-ayah") {
    keys.push(entry.data.promptAyahKey, entry.data.correctAyahKey, ...(entry.data.distractorAyahKeys ?? []));
    const prompt = ayahsByKey.get(entry.data.promptAyahKey);
    const answer = ayahsByKey.get(entry.data.correctAyahKey);
    if (prompt && answer && (prompt.surahNumber !== answer.surahNumber || answer.ayahNumber !== prompt.ayahNumber + 1)) errors.push(`${entry.id}: correctAyahKey must immediately follow promptAyahKey`);
    if (new Set(entry.data.distractorAyahKeys ?? []).size !== (entry.data.distractorAyahKeys ?? []).length) errors.push(`${entry.id}: distractorAyahKeys contains duplicates`);
  } else if (entry.type === "identify-surah") {
    keys.push(entry.data.ayahKey);
    const ayah = ayahsByKey.get(entry.data.ayahKey);
    if (ayah && ayah.surahNumber !== entry.data.correctSurahNumber) errors.push(`${entry.id}: correctSurahNumber does not match ${entry.data.ayahKey}`);
  } else if (entry.type === "arrange-ayahs") {
    keys.push(...entry.data.correctOrder);
    const ayahs = entry.data.correctOrder.map((key) => ayahsByKey.get(key)).filter((ayah): ayah is Ayah => Boolean(ayah));
    for (let index = 1; index < ayahs.length; index += 1) {
      if (ayahs[index]!.surahNumber !== ayahs[0]!.surahNumber || ayahs[index]!.ayahNumber !== ayahs[index - 1]!.ayahNumber + 1) {
        errors.push(`${entry.id}: arrange ayahs must be consecutive and from one surah`);
        break;
      }
    }
  } else {
    keys.push(entry.data.promptAyahKey, entry.data.answerAyahKey);
    const prompt = ayahsByKey.get(entry.data.promptAyahKey);
    const answer = ayahsByKey.get(entry.data.answerAyahKey);
    if (prompt && answer && (prompt.surahNumber !== answer.surahNumber || answer.ayahNumber !== prompt.ayahNumber + 1)) errors.push(`${entry.id}: answerAyahKey must immediately follow promptAyahKey`);
  }

  keys.forEach((key) => requireAyah(key, entry.id));
  const referencedSurahs = new Set(keys.map((key) => Number(key.split(":")[0])));
  referencedSurahs.forEach((number) => {
    if (!entry.surahNumbers.includes(number)) errors.push(`${entry.id}: surahNumbers is missing ${number}`);
  });
}

if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Content is valid: ${surahs.length} surahs, ${ayahsByKey.size} ayahs, ${questionBank.length} questions.`);
