import { getAyah } from "../content";
import type { VerseKey } from "../content/types";

function arabicDigits(value: number): string {
  return String(value).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]!);
}

export function QuranText({ verseKey, showMarker = true, size = "regular" }: {
  verseKey: VerseKey;
  showMarker?: boolean;
  size?: "small" | "regular" | "large";
}) {
  const ayah = getAyah(verseKey);
  return (
    <span className={`quran-text quran-text--${size}`} lang="ar" dir="rtl">
      {ayah.textQpcHafs}
      {showMarker && <span className="ayah-marker" aria-label={`Ayah ${ayah.ayahNumber}`}> {arabicDigits(ayah.ayahNumber)}</span>}
    </span>
  );
}
