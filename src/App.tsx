import { useState } from 'react';
import { GuestEnvelopeCover } from './features/session/GuestEnvelopeCover';
import { GuestLoginPage } from './features/session/GuestLoginPage';

function App() {
  const [opened, setOpened] = useState(false);

  return opened ? <GuestLoginPage /> : <GuestEnvelopeCover onOpen={() => setOpened(true)} />;
}

export default App;
