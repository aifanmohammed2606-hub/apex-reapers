import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import Tournaments from './pages/Tournaments';
import Lineup from './pages/Lineup';
import Tracker from './pages/Tracker';

const PAGES = {
  dashboard: Dashboard,
  players: Players,
  tournaments: Tournaments,
  lineup: Lineup,
  tracker: Tracker,
};

function AppContent() {
  const { activePage } = useApp();
  const Page = PAGES[activePage] || Dashboard;
  return (
    <Layout>
      <Page />
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
