import { Link, Navigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { StarIcon } from "../components/Icons";
import { getSurah } from "../content";
import { loadResult } from "../lib/storage";
import { useAppState } from "../state/AppState";

export function ResultsPage() {
  const { lastResult } = useAppState();
  const result = lastResult ?? loadResult();
  if (!result) return <Navigate to="/" replace />;
  const message = result.score === result.total ? "A sky full of stars!" : result.score >= 3 ? "Wonderful remembering!" : "Every try helps you grow!";

  return (
    <PageShell>
      <section className="results-page">
        <div className="celebration" aria-hidden="true"><span>✦</span><span>★</span><span>☾</span><span>★</span><span>✦</span></div>
        <p className="eyebrow">Quiz complete</p>
        <h1>{message}</h1>
        <div className="score-orb"><strong>{result.score}</strong><span>out of {result.total}</span></div>
        <div className="result-stars" aria-label={`${result.score} stars out of ${result.total}`}>
          {Array.from({ length: result.total }, (_, index) => <StarIcon key={index} size={38} className={index < result.score ? "star-earned" : "star-empty"} />)}
        </div>
        <p>You practised {result.selectedSurahs.map((number) => getSurah(number).nameEnglish).join(", ")}.</p>
        {result.score < result.total && <div className="practice-note"><span>☾</span><p><strong>{result.total - result.score} to practise</strong><br />They’ll come back in another quiz.</p></div>}
        <div className="result-actions">
          <Link className="primary-button" to="/setup">Play again <span>→</span></Link>
          <Link className="secondary-button" to="/">Back home</Link>
        </div>
      </section>
    </PageShell>
  );
}
