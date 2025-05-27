import { createRoot } from 'react-dom/client';
import { runGame } from '../cli/main';
import Hand from './hand';
// Example hands for demonstration
const friendlyHand = [
  { name: "Card One", power: 5, type: ["warrior"], category: "unit", provisionCost: 5 },
  { name: "Card Two", power: 4, type: ["mage"], category: "unit", provisionCost: 6 }
];

const enemyHand = [
  { name: "Card Three", power: 6, type: ["warrior"], category: "unit", provisionCost: 7 },
  { name: "Card Four", power: 3, type: ["archer"], category: "unit", provisionCost: 4 }
];

const App = () => (
  <div style={{ background: "#181818", minHeight: "100vh", padding: "24px" }}>
    <h1 style={{ color: "#fff" }}>Gwent-like Game UI</h1>
    <Hand cards={friendlyHand} title="Friendly Hand" />
    <Hand cards={enemyHand} title="Enemy Hand" />
  </div>
);

const root = createRoot(document.getElementById('root')!);

root.render(<App />);
runGame();
