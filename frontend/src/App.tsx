import { Routes, Route } from "react-router";

import HomePage from "./pages/HomePage";
import RootLayout from "./pages/RootLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CreateExamPage from "./pages/CreateExamPage";
import ConversationInterfacePage from "./pages/ConversationInterfacePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/createExam" element={<CreateExamPage />} />
        <Route path="/dashboard/exam" element={<ConversationInterfacePage />} />
      </Route>
    </Routes>
  );
}

export default App;
