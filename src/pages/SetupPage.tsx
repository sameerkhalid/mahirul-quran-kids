import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { surahs } from "../content";
import { PageShell } from "../components/PageShell";
import { getAdaptiveQuestionCount, getEligibleEntries } from "../lib/question-generator";
import { useAppState } from "../state/AppState";

export function SetupPage() {
  const { progress, startSession, setAudioEnabled } = useAppState();
  const [selected, setSelected] = useState<number[]>(progress.lastSelectedSurahs.filter((number) => surahs.some((surah) => surah.number === number)));
  const [rangeStart, setRangeStart] = useState(Math.min(...(progress.lastSelectedSurahs.length ? progress.lastSelectedSurahs : [112])));
  const [rangeEnd, setRangeEnd] = useState(Math.max(...(progress.lastSelectedSurahs.length ? progress.lastSelectedSurahs : [114])));
  const navigate = useNavigate();
  const availableQuestions = getEligibleEntries(selected).length + (selected.length >= 3 ? 1 : 0);
  const questionCount = selected.length ? getAdaptiveQuestionCount(selected.length, availableQuestions) : 0;

  const toggle = (number: number) => {
    setSelected((current) => current.includes(number) ? current.filter((item) => item !== number) : [...current, number].sort());
  };
  const start = () => {
    if (selected.length === 0) return;
    startSession(selected);
    navigate("/quiz");
  };
  const selectRange = (start: number, end: number) => {
    const lower = Math.min(start, end);
    const upper = Math.max(start, end);
    setRangeStart(lower);
    setRangeEnd(upper);
    setSelected(surahs.filter((surah) => surah.number >= lower && surah.number <= upper).map((surah) => surah.number));
  };

  return (
    <PageShell compact>
      <section className="setup-page">
        <p className="eyebrow">Grown-up setup</p>
        <h1>Choose today’s surahs</h1>
        <p className="page-intro">Pick one or more. The quiz length will gently adapt to your selection.</p>

        <div className="range-picker">
          <div className="range-picker__heading"><div><strong>Select a range</strong><small>Every surah between From and To will be included.</small></div><span>{selected.length} selected</span></div>
          <div className="range-fields">
            <label>From
              <select value={rangeStart} onChange={(event) => {
                const value = Number(event.target.value);
                setRangeStart(value);
                selectRange(value, rangeEnd);
              }}>{surahs.map((surah) => <option key={surah.number} value={surah.number}>{surah.number}. {surah.nameEnglish}</option>)}</select>
            </label>
            <span aria-hidden="true">→</span>
            <label>To
              <select value={rangeEnd} onChange={(event) => {
                const value = Number(event.target.value);
                setRangeEnd(value);
                selectRange(rangeStart, value);
              }}>{surahs.map((surah) => <option key={surah.number} value={surah.number}>{surah.number}. {surah.nameEnglish}</option>)}</select>
            </label>
          </div>
          <div className="range-presets" aria-label="Quick ranges">
            <button type="button" onClick={() => selectRange(112, 114)}>Last 3</button>
            <button type="button" onClick={() => selectRange(110, 114)}>Last 5</button>
            <button type="button" onClick={() => selectRange(105, 114)}>Last 10</button>
          </div>
        </div>

        <div className="custom-selection-heading"><div><strong>Or choose individually</strong><small>Tap any card to make a custom group.</small></div><button type="button" onClick={() => setSelected([])}>Clear</button></div>
        <div className="surah-selector surah-selector--expanded">
          {surahs.map((surah) => {
            const checked = selected.includes(surah.number);
            return (
              <button key={surah.number} type="button" className={`surah-card ${checked ? "surah-card--selected" : ""}`} onClick={() => toggle(surah.number)} aria-pressed={checked}>
                <span className="surah-check" aria-hidden="true">{checked ? "✓" : ""}</span>
                <span className="surah-number">{surah.number}</span>
                <span className="surah-arabic" lang="ar" dir="rtl">{surah.nameArabic}</span>
                <strong>{surah.nameEnglish}</strong>
                <small>{surah.meaningEnglish} · {surah.ayahs.length} ayahs</small>
              </button>
            );
          })}
        </div>

        <label className="setting-row">
          <span><strong>Quiz audio</strong><small>Narrate questions and show ayah listen buttons</small></span>
          <input type="checkbox" checked={progress.audioEnabled} onChange={(event) => setAudioEnabled(event.target.checked)} />
        </label>

        <div className="session-summary"><span aria-hidden="true">★</span><div><strong>{questionCount || "—"} questions</strong><small>{questionCount ? `About ${questionCount} minutes · balanced across your surahs` : "Choose a surah to see the session length"}</small></div></div>
        {selected.length === 0 && <p className="selection-warning" role="status">Choose at least one surah to begin.</p>}
        <button className="primary-button full-button" type="button" disabled={selected.length === 0} onClick={start}>Let’s begin <span aria-hidden="true">→</span></button>
      </section>
    </PageShell>
  );
}
