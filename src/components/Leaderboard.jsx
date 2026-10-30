import { useEffect, useState } from "react";
import { useGame } from "../game/hooks.js";
import { getScore, closeScoreForm } from "../game/engine.js";
import { loadScores, saveScore, watchScores } from "../game/leaderboard.js";
import { boardSize, pointsPerKill, pointsPerBoss } from "../game/config.js";

// The top ten runs from every player, and the form to sign the roll when a
// run ends. Other people's runs appear the moment they are saved, without
// a refresh.
export default function Leaderboard() {
    const game = useGame();
    const [scores, setScores] = useState([]);
    const [status, setStatus] = useState("loading");   // loading, ready or error
    const [savedId, setSavedId] = useState(null);       // The row to pick out.
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    // The message belongs to the run it was written for, so a new run clears it.
    const [message, setMessage] = useState({ runId: 0, text: "" });

    function refresh() {
        return loadScores().then(function(list) {
            setScores(list);
            setStatus("ready");
        }).catch(function(err) {
            console.log(err);
            setStatus("error");
        });
    }

    // Supabase pushes every new run as it is saved, so the board only re-reads
    // when something changed. Coming back to the tab re-reads it too, in case
    // the connection dropped while the tab was asleep.
    useEffect(function() {
        refresh();
        const stopWatching = watchScores(refresh);
        function onVisible() {
            if (document.hidden === false) {
                refresh();
            }
        }
        document.addEventListener("visibilitychange", onVisible);
        return function() {
            stopWatching();
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, []);

    async function submit(event) {
        event.preventDefault();
        const runId = game.runId;
        const trimmed = name.trim();
        if (trimmed === "") {
            setMessage({ runId: runId, text: "Put a name down first." });
            return;
        }

        setSaving(true);
        setMessage({ runId: runId, text: "" });
        try {
            const result = await saveScore({
                name: trimmed,
                rank: game.user.title,
                score: getScore(),
                kills: game.kills,
                wave: game.wave
            });
            setScores(result.scores);
            setStatus("ready");
            setSavedId(result.savedId);
            setName("");
            const place = result.scores.findIndex(function(entry) {
                return entry.id === result.savedId;
            }) + 1;
            if (place === 0) {
                setMessage({ runId: runId, text: "Not enough. The roll only keeps " + boardSize + " names." });
            } else {
                setMessage({ runId: runId, text: "Your name is on the roll at #" + place + "." });
            }
            if (runId === game.runId) {
                closeScoreForm();
            }
        } catch (err) {
            console.log(err);
            setMessage({ runId: runId, text: "The roll could not be reached. Try again." });
        }
        setSaving(false);
    }

    return (
        <section className="board" id="board">
            <h2>Leaderboard</h2>

            {game.scoreOpen && (
                <form id="scoreForm" onSubmit={submit}>
                    <p>The run is over. Sign the roll of the fallen. Final score: <span id="finalScore">{getScore()}</span></p>
                    <label htmlFor="playerName">Name</label>
                    <input
                        type="text"
                        id="playerName"
                        maxLength={16}
                        autoComplete="off"
                        required
                        autoFocus
                        disabled={saving}
                        value={name}
                        onChange={function(event) {
                            setName(event.target.value);
                        }}
                    />
                    <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Score"}</button>
                </form>
            )}
            <p id="saveMsg">{message.runId === game.runId ? message.text : ""}</p>

            {/* Names are rendered as text, so whatever a player types lands on
                the board as text even if they typed a tag. */}
            <div className="table-wrap" id="boardTable" hidden={scores.length === 0}>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Rank</th>
                            <th>Score</th>
                            <th>Kills</th>
                        </tr>
                    </thead>
                    <tbody id="boardRows">
                        {scores.map(function(entry, i) {
                            return (
                                <tr key={entry.id} className={entry.id === savedId ? "new" : undefined}>
                                    <td>{i + 1}</td>
                                    <td>{entry.name}</td>
                                    <td>{entry.rank}</td>
                                    <td>{entry.score}</td>
                                    <td>{entry.kills}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {status === "loading" && scores.length === 0 && <p id="boardEmpty">Unrolling the scroll...</p>}
            {status === "ready" && scores.length === 0 && <p id="boardEmpty">no scores? make your mark!</p>}
            {status === "error" && (
                <p id="boardEmpty">
                    The roll could not be reached.{" "}
                    <button type="button" className="link-btn" onClick={refresh}>Try again</button>
                </p>
            )}

            <p className="hint">Score: damage dealt, plus {pointsPerKill} for each kill and {pointsPerBoss} for each boss.</p>
        </section>
    );
}
