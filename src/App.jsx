import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import Tournaments from './pages/Tournaments';
import Lineup from './pages/Lineup';
import Tracker from './pages/Tracker';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';
import MyProfile from './pages/MyProfile';
import Notifications from './pages/Notifications';

const PAGES = {
  dashboard: Dashboard,
  players: Players,
  tournaments: Tournaments,
  lineup: Lineup,
  tracker: Tracker,
  admin: AdminPanel,
  myprofile: MyProfile,
  notifications: Notifications,
};

function AppContent() {
  const { activePage, players } = useApp();
  const { isAdmin, user } = useAuth();

  // Check if current user has a player profile
  const myPlayerProfile = players.find(p => p.user_id === user?.id);
  const needsOnboarding = !isAdmin && !myPlayerProfile;

  // If they need onboarding, force them to the profile creation screen without sidebar
  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-void hex-pattern flex items-center justify-center p-4">
        <div className="w-full">
          <MyProfile isOnboarding={true} />
        </div>
      </div>
    );
  }

  // Non-admin users can access dashboard, tracker, their own profile, and read-only views of players, tournaments, lineup
  // Admin pages (admin panel) require admin role
  const adminOnlyPages = ['admin'];
  const effectivePage = (!isAdmin && adminOnlyPages.includes(activePage))
    ? 'dashboard'
    : activePage;

  const Page = PAGES[effectivePage] || Dashboard;

  return (
    <Layout>
      <Page />
    </Layout>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-display">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm tracking-wide">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
