// Main
// Startup. Everything above this file only defines things; this is what runs.
// The order matters: the board and the ladder are built once, then startGame
// deals the first wave.

document.getElementById("choiceDialog").addEventListener("cancel", function(event) {
    // A rank up has to be answered, so Escape must not close the choice.
    event.preventDefault();
});

buildLadder();
loadMuted();
loadSounds();
startEmbers();
showBoard(loadScores(), 0);
startGame();

// One dot per rank under the title. updateUI fills them in as Aldric climbs.
function buildLadder() {
    const steps = document.getElementById("ladderSteps");
    for (let i = 0; i < ranks.length; i++) {
        const step = document.createElement("span");
        step.className = "step";
        step.title = ranks[i].title;
        steps.appendChild(step);
    }
    document.getElementById("ladderStart").textContent = ranks[0].title;
    document.getElementById("ladderEnd").textContent = ranks[ranks.length - 1].title;
}
