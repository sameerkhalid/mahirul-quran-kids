import { Link } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useAppState } from "../state/AppState";

export function GrownupsPage() {
  const { progress, setAudioEnabled, resetProgress } = useAppState();
  return (
    <PageShell compact>
      <section className="settings-page">
        <p className="eyebrow">For grown-ups</p>
        <h1>Settings & progress</h1>
        <div className="settings-card">
          <label className="setting-row">
            <span><strong>Quiz audio</strong><small>Narrate questions and show ayah listen buttons</small></span>
            <input type="checkbox" checked={progress.audioEnabled} onChange={(event) => setAudioEnabled(event.target.checked)} />
          </label>
        </div>
        <div className="settings-card stats-list">
          <div><span>Quizzes finished</span><strong>{progress.sessionsCompleted}</strong></div>
          <div><span>Stars collected</span><strong>{progress.totalStars}</strong></div>
          <div><span>Questions to practise</span><strong>{progress.practiceQuestionIds.length}</strong></div>
        </div>
        <div className="settings-card info-links">
          <Link to="/credits">Sources and credits <span>→</span></Link>
        </div>
        <button className="text-button danger-button" type="button" onClick={() => {
          if (window.confirm("Reset all quiz progress on this device?")) resetProgress();
        }}>Reset progress on this device</button>
        <Link className="secondary-button full-button" to="/">Back home</Link>
      </section>
    </PageShell>
  );
}
