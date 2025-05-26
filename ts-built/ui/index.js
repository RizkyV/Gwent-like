import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
const App = () => (_jsx("div", { children: _jsx("h1", { children: "Gwent-like Game UI" }) }));
const root = createRoot(document.getElementById('root'));
root.render(_jsx(App, {}));
