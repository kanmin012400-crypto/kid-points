import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import HomePage from './pages/home/HomePage';
import DisplayModePage from './pages/home/DisplayModePage';
import RecordPage from './pages/record/RecordPage';
import GiftsPage from './pages/gifts/GiftsPage';
import StatsPage from './pages/stats/StatsPage';
import SettingsPage from './pages/settings/SettingsPage';
import HabitManagementPage from './pages/settings/HabitManagementPage';
import GiftManagementPage from './pages/settings/GiftManagementPage';

function Navigation() {
  const location = useLocation();
  const isDisplayMode = location.pathname === '/display';

  if (isDisplayMode) {
    return <DisplayModePage />;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FF]">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-40 safe-area-top">
        <nav className="max-w-4xl mx-auto flex items-center justify-around h-14 sm:h-16 pb-safe">
          <NavLink to="/" icon="🏠" label="首页" />
          <NavLink to="/record" icon="📝" label="记录" />
          <NavLink to="/gifts" icon="🎁" label="商城" />
          <NavLink to="/stats" icon="📊" label="统计" />
          <NavLink to="/settings" icon="⚙️" label="设置" />
        </nav>
      </header>

      {/* 页面内容 */}
      <main className="pb-20 sm:pb-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/record" element={<RecordPage />} />
          <Route path="/gifts" element={<GiftsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/habits" element={<HabitManagementPage />} />
          <Route path="/settings/gifts" element={<GiftManagementPage />} />
          <Route path="/display" element={<DisplayModePage />} />
        </Routes>
      </main>
    </div>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: string; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 ${
        isActive ? 'text-[#7C6FFF]' : 'text-gray-400'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FF]">
        <div className="text-center">
          <div className="text-6xl mb-4">⭐</div>
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/*"
        element={
          <AppProvider>
            <Navigation />
          </AppProvider>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/kid-points">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
