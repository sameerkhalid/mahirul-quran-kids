import { Link } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { StarIcon } from "../components/Icons";
import { useAppState } from "../state/AppState";

export function HomePage() {
  const { progress, session } = useAppState();
  return (
    <PageShell>
      <section className="hero">
        <div className="hero-moon" aria-hidden="true"><span>★</span></div>
        <p className="eyebrow">A little Qur’an adventure</p>
        <h1>Learn, remember<br />and shine!</h1>
        <p className="hero-copy">Play gentle games with the surahs you know and grow your garden of stars.</p>
        <Link className="primary-button hero-button" to={session ? "/quiz" : "/setup"}>{session ? "Continue quiz" : "Start a quiz"} <span aria-hidden="true">→</span></Link>
      </section>

      <section className="home-grid" aria-label="Your learning progress">
        <article className="progress-card progress-card--stars">
          <div className="progress-card__icon"><StarIcon size={30} /></div>
          <div><strong>{progress.totalStars}</strong><span>Stars collected</span></div>
        </article>
        <article className="progress-card progress-card--sessions">
          <div className="progress-card__icon">☾</div>
          <div><strong>{progress.sessionsCompleted}</strong><span>Quizzes finished</span></div>
        </article>
      </section>

      <section className="grownup-strip">
        <div><span aria-hidden="true">⚙</span><div><strong>For grown-ups</strong><p>Audio, progress and app information</p></div></div>
        <Link to="/grown-ups" aria-label="Open grown-up settings">→</Link>
      </section>
    </PageShell>
  );
}
