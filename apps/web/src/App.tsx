import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Flame, Swords, Users, BarChart3 } from "lucide-react";
import { AppShell } from "@arc/ui";
import { useAuth } from "./lib/auth-context.js";
import { LoginPage } from "./pages/LoginPage.js";
import { TodayPage } from "./pages/TodayPage.js";
import { ArcPage } from "./pages/ArcPage.js";
import { PairPage } from "./pages/PairPage.js";
import { HistoryPage } from "./pages/HistoryPage.js";

const tabs = [
  { key: "/", label: "Today", icon: <Flame size={20} /> },
  { key: "/arc", label: "Arc", icon: <Swords size={20} /> },
  { key: "/pair", label: "Pair", icon: <Users size={20} /> },
  { key: "/history", label: "History", icon: <BarChart3 size={20} /> },
];

export function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-arc-bg">
        <div className="animate-pulse font-title text-2xl text-arc-muted">
          ARC TRACKER
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppShell
      tabs={tabs}
      activeTab={location.pathname}
      onTabChange={(key) => navigate(key)}
    >
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/arc" element={<ArcPage />} />
        <Route path="/pair" element={<PairPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </AppShell>
  );
}
