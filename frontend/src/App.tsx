import { Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import RootLayout from "./pages/RootLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
  );
}

export default App;
