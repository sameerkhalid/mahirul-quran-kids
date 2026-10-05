import { Navigate, useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { ProgressBar } from "../components/ProgressBar";
import { QuestionPlayer } from "../components/questions";
import { useAppState } from "../state/AppState";

export function QuizPage() {
  const { session, lastResult, answerCurrent } = useAppState();
  const navigate = useNavigate();
  if (!session) return <Navigate to={lastResult ? "/results" : "/setup"} replace />;
  const question = session.questions[session.currentIndex]!;

  return (
    <PageShell compact>
      <div className="quiz-page">
        <ProgressBar current={session.currentIndex + 1} total={session.questions.length} />
        <QuestionPlayer key={question.id} question={question} isLastQuestion={session.currentIndex === session.questions.length - 1} onComplete={(answer) => {
          const complete = answerCurrent(answer);
          if (complete) navigate("/results");
        }} />
      </div>
    </PageShell>
  );
}
