import surah105Data from "./surahs/105.json";
import surah106Data from "./surahs/106.json";
import surah107Data from "./surahs/107.json";
import surah108Data from "./surahs/108.json";
import surah109Data from "./surahs/109.json";
import surah110Data from "./surahs/110.json";
import surah111Data from "./surahs/111.json";
import surah112Data from "./surahs/112.json";
import surah113Data from "./surahs/113.json";
import surah114Data from "./surahs/114.json";
import questions105Data from "./questions/105.json";
import questions106Data from "./questions/106.json";
import questions107Data from "./questions/107.json";
import questions108Data from "./questions/108.json";
import questions109Data from "./questions/109.json";
import questions110Data from "./questions/110.json";
import questions111Data from "./questions/111.json";
import questions112Data from "./questions/112.json";
import questions113Data from "./questions/113.json";
import questions114Data from "./questions/114.json";
import crossSurahData from "./questions/cross-surah.json";
import audioData from "./audio-manifest.json";
import { audioManifestSchema, questionBankSchema, surahSchema } from "./schema";
import type { Ayah, QuestionBankEntry, Surah, VerseKey } from "./types";

export const surahs: Surah[] = [
  surah105Data,
  surah106Data,
  surah107Data,
  surah108Data,
  surah109Data,
  surah110Data,
  surah111Data,
  surah112Data,
  surah113Data,
  surah114Data
].map((data) =>
  surahSchema.parse(data) as Surah
);

export const questionBank: QuestionBankEntry[] = questionBankSchema.parse([
  ...questions105Data,
  ...questions106Data,
  ...questions107Data,
  ...questions108Data,
  ...questions109Data,
  ...questions110Data,
  ...questions111Data,
  ...questions112Data,
  ...questions113Data,
  ...questions114Data,
  ...crossSurahData
]) as QuestionBankEntry[];

export const audioManifest = audioManifestSchema.parse(audioData) as Record<VerseKey, string>;

export const surahsByNumber = new Map(surahs.map((surah) => [surah.number, surah]));
export const ayahsByKey = new Map<VerseKey, Ayah>(
  surahs.flatMap((surah) => surah.ayahs).map((ayah) => [ayah.verseKey, ayah])
);

export function getAyah(verseKey: VerseKey): Ayah {
  const ayah = ayahsByKey.get(verseKey);
  if (!ayah) throw new Error(`Unknown ayah: ${verseKey}`);
  return ayah;
}

export function getSurah(number: number): Surah {
  const surah = surahsByNumber.get(number);
  if (!surah) throw new Error(`Unknown surah: ${number}`);
  return surah;
}
