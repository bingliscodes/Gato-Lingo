import { Routes, Route } from "react-router";

import HomePage from "./pages/HomePage";
import RootLayout from "./pages/RootLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}

export default App;
