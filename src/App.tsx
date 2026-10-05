import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppStateProvider } from "./state/AppState";
import { CreditsPage } from "./pages/CreditsPage";
import { GrownupsPage } from "./pages/GrownupsPage";
import { HomePage } from "./pages/HomePage";
import { QuizPage } from "./pages/QuizPage";
import { ResultsPage } from "./pages/ResultsPage";
import { SetupPage } from "./pages/SetupPage";

export default function App() {
  return (
    <HashRouter>
      <AppStateProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/grown-ups" element={<GrownupsPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppStateProvider>
    </HashRouter>
  );
}
