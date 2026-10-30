// Leaderboard
// The scoreboard the project is built around. The top ten runs are kept in
// localStorage, so they survive a refresh and belong to whoever is at the
// keyboard rather than to a server.

function getScore() {
    return runDamage + kills * pointsPerKill + bossKills * pointsPerBoss;
}

function showScoreForm() {
    document.getElementById("finalScore").textContent = getScore();
    document.getElementById("scoreForm").hidden = false;
    document.getElementById("playerName").focus();
}

// Anything could be under that key: nothing yet, or something another page
// wrote, or half a string. Nothing here is allowed to throw.
function loadScores() {
    try {
        const saved = JSON.parse(localStorage.getItem(boardKey));
        if (Array.isArray(saved)) {
            return saved;
        }
    } catch (err) {
        console.log(err);
    }
    return [];
}

function saveScore(event) {
    event.preventDefault();   // The form must not reload the page.

    const name = document.getElementById("playerName").value.trim();
    if (name === "") {
        document.getElementById("saveMsg").textContent = "Put a name down first.";
        return;
    }

    const entry = {
        name: name,
        rank: user.title,
        score: getScore(),
        kills: kills
    };

    let scores = loadScores();
    scores.push(entry);
    scores.sort(function(a, b) {
        return b.score - a.score;
    });
    scores = scores.slice(0, boardSize);

    try {
        localStorage.setItem(boardKey, JSON.stringify(scores));
    } catch (err) {
        console.log(err);
    }

    // indexOf is -1 when the run was cut by the slice, which makes place 0.
    const place = scores.indexOf(entry) + 1;
    document.getElementById("scoreForm").hidden = true;
    if (place === 0) {
        document.getElementById("saveMsg").textContent = "Not enough. The roll only keeps " + boardSize + " names.";
    } else {
        document.getElementById("saveMsg").textContent = "Your name is on the roll at #" + place + ".";
    }
    showBoard(scores, place);
}

// newPlace is the row to highlight, or 0 for none.
function showBoard(scores, newPlace) {
    const rows = document.getElementById("boardRows");
    rows.innerHTML = "";

    for (let i = 0; i < scores.length; i++) {
        const row = document.createElement("tr");
        if (i + 1 === newPlace) {
            row.className = "new";
        }
        addCell(row, i + 1);
        addCell(row, scores[i].name);
        addCell(row, scores[i].rank);
        addCell(row, scores[i].score);
        addCell(row, scores[i].kills);
        rows.appendChild(row);
    }

    document.getElementById("boardTable").hidden = scores.length === 0;
    document.getElementById("boardEmpty").hidden = scores.length > 0;
}

// textContent, not innerHTML: the name is whatever the player typed, and it
// should land on the board as text even if they typed a tag.
function addCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
}
