import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DashboardLayout from "./pages/DashboardLayout";
import LoadingState from "./components/LoadingState";

const AnalysisWorkspace = lazy(() => import("./features/analysis/AnalysisWorkspace"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const InsightsPage = lazy(() => import("./pages/dashboard/InsightsPage"));
const HistoryPage = lazy(() => import("./pages/dashboard/HistoryPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));

function RouteLoader() {
  return (
    <div className="route-loader">
      <LoadingState title="Preparing workspace" description="Loading the RiskLens surface." />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="analysis" element={<AnalysisWorkspace />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard/analysis" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
