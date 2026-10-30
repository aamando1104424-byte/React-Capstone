import { useLayoutEffect, useRef } from "react";
import { useGame } from "../game/hooks.js";
import RichText from "./RichText.jsx";

// Each line keeps its key, so only the new ones animate in.
export default function BattleLog() {
    const game = useGame();
    const box = useRef(null);
    const last = game.log.length > 0 ? game.log[game.log.length - 1].id : 0;

    useLayoutEffect(function() {
        box.current.scrollTop = box.current.scrollHeight;
    }, [last]);

    return (
        <section className="log-panel">
            <h2>Battle Log</h2>
            <div className="log" id="log" ref={box}>
                {game.log.map(function(line) {
                    return (
                        <p key={line.id} className={line.kind}>
                            <RichText parts={line.parts} />
                        </p>
                    );
                })}
            </div>
        </section>
    );
}
