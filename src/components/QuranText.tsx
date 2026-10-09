import { getAyah } from "../content";
import type { VerseKey } from "../content/types";

function arabicDigits(value: number): string {
  return String(value).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]!);
}

export function QuranText({ verseKey, showMarker = true, marker = "numbered", size = "regular" }: {
  verseKey: VerseKey;
  showMarker?: boolean;
  marker?: "numbered" | "empty";
  size?: "small" | "regular" | "large";
}) {
  const ayah = getAyah(verseKey);
  return (
    <span className={`quran-text quran-text--${size}`} lang="ar" dir="rtl">
      {ayah.textQpcHafs}
      {showMarker && marker === "numbered" && <span className="ayah-marker" aria-label={`Ayah ${ayah.ayahNumber}`}> {arabicDigits(ayah.ayahNumber)}</span>}
      {showMarker && marker === "empty" && <span className="ayah-marker" aria-hidden="true"> ۝</span>}
    </span>
  );
}
