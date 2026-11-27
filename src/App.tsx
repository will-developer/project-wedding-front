import { GuestAccessExperience } from './features/session/GuestAccessExperience';
import { AdminAccessExperience } from './features/admin/AdminAccessExperience';

function App() {
  if (window.location.pathname.replace(/\/+$/, '') === '/admin') {
    return <AdminAccessExperience />;
  }

  return <GuestAccessExperience />;
}

export default App;
