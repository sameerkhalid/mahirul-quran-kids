import { Link } from "react-router-dom";
import { PageShell } from "../components/PageShell";

export function CreditsPage() {
  return (
    <PageShell compact>
      <article className="credits-page">
        <p className="eyebrow">With gratitude</p>
        <h1>Sources & credits</h1>
        <section><h2>Qur’an text</h2><p>Uthmanic Hafs text is based on resources from the King Fahd Glorious Qur’an Printing Complex. The webfont is provided by Quran Foundation. Qur’anic content should always be checked carefully before publishing changes.</p></section>
        <section><h2>Recitation</h2><p>Recitation by Sheikh Ibrahim Al-Akhdar. Verse audio for the local prototype is sourced from EveryAyah.</p></section>
        <section><h2>Question narration</h2><p>English question prompts are generated from the macOS Flo voice and bundled for consistent offline playback.</p></section>
        <section><h2>Privacy</h2><p>This app has no accounts, advertising, or analytics. Progress stays in this browser on this device.</p></section>
        <Link className="secondary-button full-button" to="/grown-ups">Back to settings</Link>
      </article>
    </PageShell>
  );
}
