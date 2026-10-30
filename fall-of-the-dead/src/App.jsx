import { useEffect, useRef, useState } from "react";
import { useGame, useFx } from "./game/hooks.js";
import { startAudio, playSound, setLoop } from "./game/audio.js";
import Prologue from "./components/Prologue.jsx";
import Header from "./components/Header.jsx";
import HeroCard from "./components/HeroCard.jsx";
import EnemyCard from "./components/EnemyCard.jsx";
import ActionBar from "./components/ActionBar.jsx";
import BattleLog from "./components/BattleLog.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import HelpDialog from "./components/HelpDialog.jsx";
import ShopDialog from "./components/ShopDialog.jsx";
import { Ceremony, ChoiceDialog } from "./components/RankUp.jsx";
import { Embers, Flash } from "./components/Atmosphere.jsx";

export default function App() {
    const game = useGame();
    const level = game.user.level;
    const [started, setStarted] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const attackButton = useRef(null);

    // The whole page gets lighter as he climbs. style.css has a palette for
    // every value of data-rank, so this one attribute repaints everything.
    useEffect(function() {
        document.body.dataset.rank = level;
    }, [level]);

    // A crit holds every animation still for a moment.
    useFx(function(type, ms) {
        if (type === "freeze") {
            document.body.classList.add("frozen");
            setTimeout(function() {
                document.body.classList.remove("frozen");
            }, ms);
        }
    });

    // The sounds that last as long as a state does: fire while either card is
    // burning, his heart once he is down to a quarter of his life.
    const zombieAlive = game.zombie.life > 0;
    const burning = (zombieAlive && game.zombie.effects.burn > 0) || (game.user.wound !== null && game.user.wound.element === "fire");
    const dying = game.gameOver === false && game.user.life <= game.user.maxLife * 0.25;
    useEffect(function() {
        setLoop("crackle", started && burning);
        setLoop("heartbeat", started && dying);
    }, [started, burning, dying]);

    // Every button clicks when it is pressed.
    useEffect(function() {
        function onClick(event) {
            const button = event.target.closest("button");
            if (button !== null && button.disabled === false) {
                playSound("click");
            }
        }
        document.addEventListener("click", onClick);
        return function() {
            document.removeEventListener("click", onClick);
        };
    }, []);

    useEffect(function() {
        if (started) {
            attackButton.current.focus();
        }
    }, [started]);

    function start() {
        setStarted(true);
        startAudio();
        playSound(game.zombie.sound);
    }

    return (
        <>
            <Embers level={level} />
            <div className="vignette" aria-hidden="true"></div>
            <Flash />

            {started === false && <Prologue onStart={start} />}

            {/* style.css lays these panels out differently at each screen size. */}
            <main id="game" hidden={started === false}>
                <Header onHelp={function() { setHelpOpen(true); }} />
                <section className="arena" aria-label="The fight">
                    <HeroCard />
                    <div className="versus" aria-hidden="true">VS</div>
                    <EnemyCard />
                </section>
                <ActionBar attackRef={attackButton} />
                <BattleLog />
                <Leaderboard />
            </main>

            <Ceremony />
            <ChoiceDialog />
            <ShopDialog />
            <HelpDialog open={helpOpen} onClose={function() { setHelpOpen(false); }} />
        </>
    );
}
