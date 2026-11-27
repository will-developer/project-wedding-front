import { GuestAccessExperience } from './features/session/GuestAccessExperience';
import { AdminLoginPage } from './features/admin/AdminLoginPage';

function App() {
  if (window.location.pathname.replace(/\/+$/, '') === '/admin') {
    return <AdminLoginPage />;
  }

  return <GuestAccessExperience />;
}

export default App;
