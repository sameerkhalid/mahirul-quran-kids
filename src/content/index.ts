import surah93Data from "./surahs/93.json";
import surah94Data from "./surahs/94.json";
import surah95Data from "./surahs/95.json";
import surah96Data from "./surahs/96.json";
import surah97Data from "./surahs/97.json";
import surah98Data from "./surahs/98.json";
import surah99Data from "./surahs/99.json";
import surah100Data from "./surahs/100.json";
import surah101Data from "./surahs/101.json";
import surah102Data from "./surahs/102.json";
import surah103Data from "./surahs/103.json";
import surah104Data from "./surahs/104.json";
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
import questions93Data from "./questions/93.json";
import questions94Data from "./questions/94.json";
import questions95Data from "./questions/95.json";
import questions96Data from "./questions/96.json";
import questions97Data from "./questions/97.json";
import questions98Data from "./questions/98.json";
import questions99Data from "./questions/99.json";
import questions100Data from "./questions/100.json";
import questions101Data from "./questions/101.json";
import questions102Data from "./questions/102.json";
import questions103Data from "./questions/103.json";
import questions104Data from "./questions/104.json";
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
  surah93Data,
  surah94Data,
  surah95Data,
  surah96Data,
  surah97Data,
  surah98Data,
  surah99Data,
  surah100Data,
  surah101Data,
  surah102Data,
  surah103Data,
  surah104Data,
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
  ...questions93Data,
  ...questions94Data,
  ...questions95Data,
  ...questions96Data,
  ...questions97Data,
  ...questions98Data,
  ...questions99Data,
  ...questions100Data,
  ...questions101Data,
  ...questions102Data,
  ...questions103Data,
  ...questions104Data,
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
