import { createRoot, Root } from "react-dom/client";
import { useEffect } from "react";

import "./style.scss";
import GameController from "./game-controller";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import i18n from '../i18n';
import { BrowserRouter, Outlet, Route, Routes, useParams } from "react-router-dom";

/**
 * TODO:
 * move stickyimagepreview from card to game controller

 * build visual card templates - on board / in hand view - right click full card view
 * If action is engine initiated - do not block 
 * Determine whether players are controllable by the UI - Only allow the active player to do things.

 * UI Multi targeting
 * Mulligan
 * Move away from the drag and drop library and just do it ourselves
*/

const App = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/Gwent-like" element={<GameController />} />
          <Route path="/Gwent-like/:lang" element={<LocaleRouteWrapper />}>
            <Route index element={<GameController />} />
            <Route path="deck" element={<></>} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
};

const LocaleRouteWrapper = () => {
  const { lang } = useParams<{ lang?: string }>();
  useEffect(() => {
    if (lang) i18n.changeLanguage(lang);
  }, [lang]);
  return <Outlet />;
};

const rootElement = document.getElementById('root')!;

// Use a global variable to store the root instance
declare global {
  interface Window { __GWENT_ROOT__: Root | undefined }
}

if (!window.__GWENT_ROOT__) {
  window.__GWENT_ROOT__ = createRoot(rootElement);
}

window.__GWENT_ROOT__.render(
  <DndProvider backend={HTML5Backend}>
    <App />
  </DndProvider>
);