import { createRoot } from 'react-dom/client';

const App = () => (
  <div>
    <h1>Gwent-like Game UI</h1>
  </div>
);

const root = createRoot(document.getElementById('root')!);
root.render(<App />);