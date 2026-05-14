import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (!showDashboard) {
    return <LandingPage onEnter={() => setShowDashboard(true)} />;
  }

  return <Dashboard onBack={() => setShowDashboard(false)} />;
}

export default App;
