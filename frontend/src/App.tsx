// src/app.tsx
import { Routes, Route } from "react-router";

import HomePage from "./pages/HomePage";
import RootLayout from "./pages/RootLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CreateExamPage from "./pages/CreateExamPage";
import ConversationInterfacePage from "./pages/ConversationInterfacePage";
import ExamScorePage from "./pages/ExamScorePage";
import VocabularyListsPage from "./pages/VocabularyListsPage";
import ExamsPage from "./pages/ExamsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/exams" element={<ExamsPage />} />
        <Route
          path="/dashboard/exams/createExam"
          element={<CreateExamPage />}
        />
        <Route path="/dashboard/scores/:examId" element={<ExamScorePage />} />
        <Route path="/dashboard/exam" element={<ConversationInterfacePage />} />
        <Route path="/dashboard/vocabulary" element={<VocabularyListsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
