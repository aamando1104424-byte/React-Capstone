import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./App.jsx";
import { startGame } from "./game/engine.js";
import { loadSounds, loadMuted } from "./game/audio.js";

// The first wave is dealt before anything renders, so the page never shows an
// empty card. Sounds start downloading now and are decoded on the first click.
loadMuted();
loadSounds();
startGame();

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);
