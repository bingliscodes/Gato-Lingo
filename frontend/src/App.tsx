// src/app.tsx
import {
  Routes,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router";
import HomePage from "./pages/HomePage";
import RootLayout from "./pages/RootLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage, { DashboardLayout } from "./pages/DashboardPage";
import CreateExamPage from "./pages/CreateExamPage";
import ConversationInterfacePage from "./pages/ConversationInterfacePage";
import ExamScorePage from "./pages/ExamScorePage";
import VocabularyListsPage from "./pages/VocabularyListsPage";
import ExamsPage from "./pages/ExamsPage";
import AssignedExams from "./components/dashboard/student-dashboard/assigned-exams/AssignedExams";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="exams" element={<ExamsPage />} />
        <Route
          path="exams/assigned"
          element={<AssignedExams mode={"assigned"} />}
        />
        <Route
          path="exams/completed"
          element={<AssignedExams mode={"completed"} />}
        />
        <Route path="exams/createExam" element={<CreateExamPage />} />
        <Route path="exams/scores/:examId" element={<ExamScorePage />} />
        <Route
          path="exam/session/:sessionId"
          element={<ConversationInterfacePage />}
        />
        <Route path="vocabulary" element={<VocabularyListsPage />} />
      </Route>
    </Route>,
  ),
);
export default function App() {
  return <RouterProvider router={router} />;
}
