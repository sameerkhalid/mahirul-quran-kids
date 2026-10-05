export function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="quiz-progress" aria-label={`Question ${current} of ${total}`}>
      <div className="quiz-progress__label"><span>Question {current}</span><span>{total}</span></div>
      <div className="quiz-progress__track"><span style={{ width: `${(current / total) * 100}%` }} /></div>
    </div>
  );
}
