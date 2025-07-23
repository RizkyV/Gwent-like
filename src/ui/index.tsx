import { createRoot, Root } from "react-dom/client";
import { useEffect } from "react";

import "./style.scss";
import GameController from "./game-controller";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import i18n from '../i18n';
import { BrowserRouter, Route, Routes } from "react-router-dom";

/**
 * TODO:
 * If no legal targets - just play without triggering the effect
 * get card controller should return the player that is currently playing the card - if applicable
 * If action is engine initiated - do not block 
 * move stickyimagepreview from card to game controller
 * Determine whether players are controllable by the UI - Only allow the active player to do things.
 * UI Multi targeting
 * Mulligan
 * Move away from the drag and drop library and just do it ourselves
*/

const App = () => {
  useUrlLocale(); // Initialize locale from URL parameters

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/Gwent-like" element={<GameController />} />
          <Route path="/Gwent-like/deck" element={<></>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

function useUrlLocale() {
  useEffect(() => {
    const pathname = window.location.pathname;
    const parts = pathname.split("/");
    const lang = parts[2];
    if (lang) i18n.changeLanguage(lang);
  }, [window.location.search]);
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