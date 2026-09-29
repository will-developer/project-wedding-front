import { useEffect, useState } from 'react';
import { api } from './lib/api';

function App() {
  const [message, setMessage] = useState('Carregando...');

  useEffect(() => {
    api
      .get<string>('/api/hello-world')
      .then((response) => setMessage(response.data))
      .catch(() => setMessage('erro na comunicação com a Api'));
  }, []);

  return (
    <main>
      <h1>Wedding WebSystem!</h1>
      <p>{message}</p>
    </main>
  );
}

export default App;
