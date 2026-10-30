import { useState } from "react";
import { useGame } from "../game/hooks.js";
import { startGame } from "../game/engine.js";
import { ranks } from "../game/content.js";
import { isMuted, setMuted } from "../game/audio.js";

// Title, the ladder of ranks (one dot each, filled in as Aldric climbs), and
// the run controls.
export default function Header({ onHelp }) {
    const game = useGame();
    const level = game.user.level;
    const [muted, setMutedState] = useState(isMuted);

    function toggleSound() {
        setMuted(!muted);
        setMutedState(!muted);
    }

    return (
        <header className="game-header">
            <div className="title-block">
                <h1>The Fall of the Dead</h1>
                <p className="subtitle">Ten ranks from the gutter to sainthood. Most men die on the first.</p>
            </div>

            <div className="ladder">
                <p className="ladder-label" id="ladderLabel">Rank {level} of {ranks.length}: {game.user.title}</p>
                <div className="ladder-track">
                    <span id="ladderStart">{ranks[0].title}</span>
                    <div className="steps" id="ladderSteps" aria-hidden="true">
                        {ranks.map(function(rank, i) {
                            let className = "step";
                            if (i + 1 < level) {
                                className = "step done";
                            } else if (i + 1 === level) {
                                className = "step current";
                            }
                            return <span key={rank.title} className={className} title={rank.title}></span>;
                        })}
                    </div>
                    <span id="ladderEnd">{ranks[ranks.length - 1].title}</span>
                </div>
            </div>

            <div className="hud-counters">
                <p className="counter"><span className="counter-label">Wave</span> <b>{game.wave}</b></p>
                <p className="counter"><span className="counter-label">Kills</span> <b>{game.kills}</b></p>
                <p className="counter gold"><span className="counter-label">Gold</span> <b>{game.user.gold}</b></p>
            </div>

            <div className="select">
                <button onClick={startGame}>New Run</button>
                <button onClick={onHelp}>How to Play</button>
                <button id="soundBtn" onClick={toggleSound} aria-pressed={!muted}>
                    {muted ? "Sound: Off" : "Sound: On"}
                </button>
            </div>
        </header>
    );
}
