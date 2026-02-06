// src/app.tsx
import { Routes, Route } from "react-router";

import HomePage from "./pages/HomePage";
import RootLayout from "./pages/RootLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage, { DashboardLayout } from "./pages/DashboardPage";
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
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="exams" element={<ExamsPage />} />
          <Route path="exams/createExam" element={<CreateExamPage />} />
          <Route path="scores/:examId" element={<ExamScorePage />} />
          <Route path="exam" element={<ConversationInterfacePage />} />
          <Route path="vocabulary" element={<VocabularyListsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
