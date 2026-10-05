import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getSurah } from "../content";
import type { AnswerResult, Question, VerseKey } from "../content/types";
import { playAudioFile } from "../lib/audio-player";
import { chooseCorrectFeedback } from "../lib/correct-feedback";
import { useAppState } from "../state/AppState";
import { AudioButton } from "./AudioButton";
import { ArrowIcon } from "./Icons";
import { NarrationButton } from "./NarrationButton";
import { QuranText } from "./QuranText";

interface PlayerProps {
  question: Question;
  onComplete: (result: AnswerResult) => void;
  isLastQuestion?: boolean;
}

let previousCorrectFeedback: string | null = null;

function Feedback({ success, secondTry = false }: { success: boolean; secondTry?: boolean }) {
  const { progress } = useAppState();
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (!success || !progress.audioEnabled || hasPlayed.current) return;
    hasPlayed.current = true;
    const file = chooseCorrectFeedback(previousCorrectFeedback);
    previousCorrectFeedback = file;
    void playAudioFile(file).catch(() => undefined);
  }, [progress.audioEnabled, success]);

  return (
    <div className={`feedback ${success ? "feedback--success" : "feedback--try"}`} role="status">
      {success && <span className="mini-confetti" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i key={index} />)}</span>}
      <span aria-hidden="true">{success ? "★" : "☾"}</span>
      <div>
        <strong>{success ? (secondTry ? "You found it!" : "Mā shā’ Allāh!") : "Almost there!"}</strong>
        <p>{success ? (secondTry ? "Good trying. Let’s remember this one." : "Wonderful remembering!") : "Listen carefully and try once more."}</p>
      </div>
    </div>
  );
}

const AUTO_ADVANCE_MS = 3_000;

function ContinueButton({ onClick, isLastQuestion = false }: { onClick: () => void; isLastQuestion?: boolean }) {
  const onClickRef = useRef(onClick);
  const hasAdvanced = useRef(false);
  onClickRef.current = onClick;

  const advance = useCallback(() => {
    if (hasAdvanced.current) return;
    hasAdvanced.current = true;
    onClickRef.current();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(advance, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [advance]);

  return (
    <button className="primary-button full-button continue-button" type="button" onClick={advance}>
      <span className="continue-button__progress" aria-hidden="true" />
      <span className="continue-button__label">{isLastQuestion ? "See my results" : "Next question"} <ArrowIcon /></span>
    </button>
  );
}

function ChoiceQuestion({ question, onComplete, isLastQuestion }: PlayerProps) {
  if (question.type !== "choose-next-ayah") return null;
  const [attempts, setAttempts] = useState(0);
  const [selected, setSelected] = useState<VerseKey | null>(null);
  const [finished, setFinished] = useState(false);
  const correct = selected === question.correctAyahKey;

  const choose = (key: VerseKey) => {
    if (finished) return;
    const nextAttempts = attempts + 1;
    setSelected(key);
    setAttempts(nextAttempts);
    if (key === question.correctAyahKey || nextAttempts >= 2) setFinished(true);
  };

  return (
    <section className="question-panel">
      <div className="question-heading"><span className="question-icon">→</span><div><p className="eyebrow">What comes next?</p><h1>Choose the next ayah</h1></div><NarrationButton file="narration/choose-next-ayah.mp3" label="Hear the question" /></div>
      <div className="prompt-card"><QuranText verseKey={question.promptAyahKey} size="large" /><AudioButton verseKey={question.promptAyahKey} /></div>
      <div className="choice-list" aria-label="Answer choices">
        {question.optionAyahKeys.map((key) => {
          const isSelected = selected === key;
          const isAnswer = key === question.correctAyahKey;
          const stateClass = finished && isAnswer ? "choice-card--correct" : isSelected && !isAnswer ? "choice-card--wrong" : "";
          return <button key={key} className={`choice-card ${stateClass}`} type="button" onClick={() => choose(key)} disabled={finished || (attempts === 1 && isSelected)}><QuranText verseKey={key} size="regular" /></button>;
        })}
      </div>
      {attempts === 1 && !finished && <Feedback success={false} />}
      {finished && <><Feedback success={correct} secondTry={attempts > 1} /><ContinueButton isLastQuestion={isLastQuestion} onClick={() => onComplete({ questionId: question.id, firstAttemptCorrect: correct && attempts === 1, attempts })} /></>}
    </section>
  );
}

function IdentifyQuestion({ question, onComplete, isLastQuestion }: PlayerProps) {
  if (question.type !== "identify-surah") return null;
  const [attempts, setAttempts] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const correct = selected === question.correctSurahNumber;

  const choose = (number: number) => {
    if (finished) return;
    const nextAttempts = attempts + 1;
    setSelected(number);
    setAttempts(nextAttempts);
    if (number === question.correctSurahNumber || nextAttempts >= 2) setFinished(true);
  };

  return (
    <section className="question-panel">
      <div className="question-heading"><span className="question-icon">?</span><div><p className="eyebrow">Do you know it?</p><h1>Which surah is this?</h1></div><NarrationButton file="narration/identify-surah.mp3" label="Hear the question" /></div>
      <div className="prompt-card"><QuranText verseKey={question.ayahKey} size="large" /><AudioButton verseKey={question.ayahKey} /></div>
      <div className="surah-choice-grid">
        {question.optionSurahNumbers.map((number) => {
          const surah = getSurah(number);
          const isSelected = selected === number;
          const isAnswer = number === question.correctSurahNumber;
          const stateClass = finished && isAnswer ? "choice-card--correct" : isSelected && !isAnswer ? "choice-card--wrong" : "";
          return <button className={`surah-answer ${stateClass}`} key={number} type="button" onClick={() => choose(number)} disabled={finished || (attempts === 1 && isSelected)}><span lang="ar" dir="rtl">{surah.nameArabic}</span><strong>{surah.nameEnglish}</strong></button>;
        })}
      </div>
      {attempts === 1 && !finished && <Feedback success={false} />}
      {finished && <><Feedback success={correct} secondTry={attempts > 1} /><ContinueButton isLastQuestion={isLastQuestion} onClick={() => onComplete({ questionId: question.id, firstAttemptCorrect: correct && attempts === 1, attempts })} /></>}
    </section>
  );
}

function SortableAyah({ verseKey, index, total, move }: { verseKey: VerseKey; index: number; total: number; move: (from: number, to: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: verseKey });
  return (
    <div ref={setNodeRef} className={`sort-card ${isDragging ? "sort-card--dragging" : ""}`} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <button className="drag-handle" type="button" aria-label={`Drag ayah ${index + 1}`} {...attributes} {...listeners}>⠿</button>
      <QuranText verseKey={verseKey} size="small" />
      <div className="sort-controls">
        <button type="button" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label="Move ayah up">↑</button>
        <button type="button" disabled={index === total - 1} onClick={() => move(index, index + 1)} aria-label="Move ayah down">↓</button>
      </div>
    </div>
  );
}

function ArrangeQuestion({ question, onComplete, isLastQuestion }: PlayerProps) {
  if (question.type !== "arrange-ayahs") return null;
  const [items, setItems] = useState(question.initialOrder);
  const [attempts, setAttempts] = useState(0);
  const [finished, setFinished] = useState(false);
  const [correct, setCorrect] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const move = (from: number, to: number) => setItems((current) => arrayMove(current, from, to));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.indexOf(active.id as VerseKey);
    const to = items.indexOf(over.id as VerseKey);
    move(from, to);
  };
  const check = () => {
    const nextAttempts = attempts + 1;
    const isCorrect = items.every((key, index) => key === question.correctOrder[index]);
    setAttempts(nextAttempts);
    setCorrect(isCorrect);
    if (isCorrect || nextAttempts >= 2) {
      setFinished(true);
      if (!isCorrect) setItems(question.correctOrder);
    }
  };

  return (
    <section className="question-panel">
      <div className="question-heading"><span className="question-icon">↕</span><div><p className="eyebrow">Put them in order</p><h1>Arrange the ayahs</h1></div><NarrationButton file="narration/arrange-ayahs.mp3" label="Hear the question" /></div>
      <p className="helper-text">Drag the cards, or use the arrow buttons.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="sort-list">{items.map((key, index) => <SortableAyah key={key} verseKey={key} index={index} total={items.length} move={move} />)}</div>
        </SortableContext>
      </DndContext>
      {!finished && <button className="primary-button full-button" type="button" onClick={check}>Check my order <span aria-hidden="true">★</span></button>}
      {attempts === 1 && !finished && <Feedback success={false} />}
      {finished && <><Feedback success={correct} secondTry={attempts > 1} /><ContinueButton isLastQuestion={isLastQuestion} onClick={() => onComplete({ questionId: question.id, firstAttemptCorrect: correct && attempts === 1, attempts })} /></>}
    </section>
  );
}

function ReciteQuestion({ question, onComplete, isLastQuestion }: PlayerProps) {
  if (question.type !== "recite-next") return null;
  const [revealed, setRevealed] = useState(false);
  const [remembered, setRemembered] = useState(false);
  return (
    <section className="question-panel">
      <div className="question-heading"><span className="question-icon">♬</span><div><p className="eyebrow">Say it out loud</p><h1>Recite what comes next</h1></div><NarrationButton file="narration/recite-next.mp3" label="Hear the question" /></div>
      <div className="prompt-card"><QuranText verseKey={question.promptAyahKey} size="large" /><AudioButton verseKey={question.promptAyahKey} /></div>
      {!revealed ? (
        <div className="recite-wait"><div className="thinking-stars" aria-hidden="true">✦ ☾ ✦</div><p>Take your time. Say the next ayah when you’re ready.</p><button className="primary-button full-button" type="button" onClick={() => setRevealed(true)}>Show me the answer</button></div>
      ) : (
        <div className="reveal-area">
          <p className="eyebrow">The next ayah is</p>
          <div className="answer-reveal"><QuranText verseKey={question.answerAyahKey} size="large" /><AudioButton verseKey={question.answerAyahKey} label="Listen to the answer" /></div>
          <h2>Did you remember it?</h2>
          {!remembered ? <div className="self-check-actions">
            <button className="secondary-button" type="button" onClick={() => onComplete({ questionId: question.id, firstAttemptCorrect: false, attempts: 1, selfAssessed: true })}>Practise this one</button>
            <button className="primary-button" type="button" onClick={() => setRemembered(true)}>I remembered! ★</button>
          </div> : <><Feedback success={true} /><ContinueButton isLastQuestion={isLastQuestion} onClick={() => onComplete({ questionId: question.id, firstAttemptCorrect: true, attempts: 1, selfAssessed: true })} /></>}
        </div>
      )}
    </section>
  );
}

function MatchMeaningsQuestion({ question, onComplete, isLastQuestion }: PlayerProps) {
  if (question.type !== "match-surah-meanings") return null;
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const finished = matched.length === question.surahNumbers.length;

  const chooseMeaning = (meaningSurah: number) => {
    if (selectedSurah === null || finished || matched.includes(meaningSurah)) return;
    if (selectedSurah === meaningSurah) {
      setMatched((current) => [...current, meaningSurah]);
      setSelectedSurah(null);
      setShowTryAgain(false);
    } else {
      setMistakes((current) => current + 1);
      setSelectedSurah(null);
      setShowTryAgain(true);
    }
  };

  return (
    <section className="question-panel">
      <div className="question-heading"><span className="question-icon">↔</span><div><p className="eyebrow">Names and meanings</p><h1>Match the surahs</h1></div><NarrationButton file="narration/match-surah-meanings.mp3" label="Hear the question" /></div>
      <p className="helper-text">Tap a surah name, then tap its meaning.</p>
      <div className="meaning-match-grid">
        <div className="meaning-column" aria-label="Surah names">
          <strong>Surah</strong>
          {question.surahNumbers.map((number) => {
            const surah = getSurah(number);
            const isMatched = matched.includes(number);
            return <button key={number} type="button" className={`${selectedSurah === number ? "meaning-card--selected" : ""} ${isMatched ? "meaning-card--matched" : ""}`} disabled={isMatched || finished} onClick={() => { setSelectedSurah(number); setShowTryAgain(false); }}><span lang="ar" dir="rtl">{surah.nameArabic}</span><small>{surah.nameEnglish}</small></button>;
          })}
        </div>
        <div className="match-lines" aria-hidden="true">
          <span className="match-lines__spacer" />
          {question.surahNumbers.map((number) => <span key={number}>{matched.includes(number) ? "✓" : "· · ·"}</span>)}
        </div>
        <div className="meaning-column" aria-label="Surah meanings">
          <strong>Meaning</strong>
          {question.meaningOrder.map((number) => {
            const isMatched = matched.includes(number);
            return <button key={number} type="button" className={isMatched ? "meaning-card--matched" : ""} disabled={isMatched || finished} onClick={() => chooseMeaning(number)}>{getSurah(number).meaningEnglish}</button>;
          })}
        </div>
      </div>
      {showTryAgain && <Feedback success={false} />}
      {finished && <><Feedback success={true} secondTry={mistakes > 0} /><ContinueButton isLastQuestion={isLastQuestion} onClick={() => onComplete({ questionId: question.id, firstAttemptCorrect: mistakes === 0, attempts: question.surahNumbers.length + mistakes })} /></>}
    </section>
  );
}

export function QuestionPlayer(props: PlayerProps) {
  switch (props.question.type) {
    case "choose-next-ayah": return <ChoiceQuestion {...props} />;
    case "identify-surah": return <IdentifyQuestion {...props} />;
    case "arrange-ayahs": return <ArrangeQuestion {...props} />;
    case "recite-next": return <ReciteQuestion {...props} />;
    case "match-surah-meanings": return <MatchMeaningsQuestion {...props} />;
  }
}
