// UI
// Everything that writes to the page: the battle log, the two cards, the action
// buttons and the rank up ceremony. The rules never touch the DOM themselves,
// they call in here, which is why the game can be run headless by a test.

// --- Battle log ---

// insertAdjacentHTML appends without rebuilding the lines already there, so only
// the new line animates in.
function logLine(text, kind) {
    const log = document.getElementById("log");
    log.insertAdjacentHTML("beforeend", "<p class='" + kind + "'>" + text + "</p>");
    log.scrollTop = log.scrollHeight;
}

function logSpeech(line) {
    logLine(line, "speech");
}

function logRank(rank) {
    let kind = "rankup";
    if (user.level === ranks.length) {
        kind = "rankup saint";
    }
    logLine("<strong>Rank " + user.level + ": " + rank.title + "</strong>" + rank.message, kind);
}

function logWave() {
    const label = zombie.boss ? "Boss" : "Wave " + wave;
    const kind = zombie.boss ? "wave boss-line" : "wave";
    logLine(tag("wave", label) + "<strong>" + zombie.name + "</strong>" + fill(zombie.arrives), kind);
}

// A coloured label. The kind is an element or an event, and style.css gives each
// one its own colour for every rank palette.
function tag(kind, label) {
    return "<span class='tag " + kind + "'>" + label + "</span> ";
}

function num(kind, value) {
    return "<b class='num " + kind + "'>" + value + "</b>";
}

// --- The two cards ---

function updateUI() {
    document.getElementById("rankLabel").textContent = "Rank " + user.level + " of " + ranks.length;
    document.getElementById("userTitle").textContent = user.title;
    document.getElementById("userName").textContent = user.name;
    document.getElementById("userLife").textContent = user.life + "/" + user.maxLife;
    setBar("userBar", user.life, user.maxLife);
    document.getElementById("userScore").textContent = getScore();
    document.getElementById("userWeapon").textContent = user.weapon.name + " (+" + user.weapon.attack + ")";
    document.getElementById("userArmour").textContent = user.armour.name + (user.armour.block > 0 ? " (" + user.armour.block + " in 10)" : "");

    if (user.level >= ranks.length) {
        document.getElementById("userFavor").textContent = "MAX";
    } else {
        document.getElementById("userFavor").textContent = user.xp + "/" + xpPerLevel;
    }

    if (user.wound === null) {
        document.getElementById("userWound").textContent = "None";
    } else {
        document.getElementById("userWound").textContent = woundNames[user.wound.element] + " (" + user.wound.turns + ")";
    }

    renderFaith();
    renderBlessings();

    // The whole page gets lighter as he climbs. style.css has a palette for
    // every value of data-rank, so this one line repaints everything.
    document.body.dataset.rank = user.level;
    document.getElementById("ladderLabel").textContent = "Rank " + user.level + " of " + ranks.length + ": " + user.title;
    const steps = document.getElementById("ladderSteps").children;
    for (let i = 0; i < steps.length; i++) {
        if (i + 1 < user.level) {
            steps[i].className = "step done";
        } else if (i + 1 === user.level) {
            steps[i].className = "step current";
        } else {
            steps[i].className = "step";
        }
    }

    document.getElementById("waveLabel").textContent = zombie.boss ? "Wave " + wave + " - Boss" : "Wave " + wave;
    document.getElementById("zombieType").textContent = zombie.type;
    document.getElementById("zombieName").textContent = zombie.name;
    document.getElementById("zombieEpithet").textContent = zombie.epithet;
    document.getElementById("zombieLife").textContent = zombie.life + "/" + zombie.maxLife;
    setBar("zombieBar", zombie.life, zombie.maxLife);
    enemyBox().classList.toggle("boss", zombie.boss === true);
    enemyBox().classList.toggle("phase-two", zombie.phase === 2);

    let traits = "";
    for (const element of zombie.weak) {
        traits = traits + tag(element, "Weak " + element);
    }
    for (const element of zombie.resist) {
        traits = traits + tag("block", "Resists " + element);
    }
    if (zombie.bleeds === false) {
        traits = traits + tag("block", "No blood");
    }
    document.getElementById("zombieTraits").innerHTML = traits;

    let effects = "";
    if (zombie.effects.burn > 0) {
        effects = effects + tag("fire", "Burning " + zombie.effects.burn);
    }
    if (zombie.effects.bleed > 0) {
        effects = effects + tag("blood", "Bleeding " + zombie.effects.bleed);
    }
    if (zombie.effects.holy > 0) {
        effects = effects + tag("holy", "Holy ground " + zombie.effects.holy);
    }
    if (zombie.stun > 0) {
        effects = effects + tag("steel", "Stunned");
    }
    if (user.bulwark > 0) {
        effects = effects + tag("block", "Your bulwark " + user.bulwark);
    }
    if (user.fury > 0) {
        effects = effects + tag("crit", "Fury " + user.fury);
    }
    document.getElementById("zombieEffects").innerHTML = effects;
    document.getElementById("zombieIntent").hidden = zombie.windup === false;

    updateButtons();
}

// Two layers: the fill moves at once, the lag trails it so you can see how much
// the last hit took off.
function setBar(id, value, max) {
    const percent = Math.max(0, Math.min(100, (value / max) * 100));
    const bar = document.getElementById(id);
    bar.querySelector(".bar-fill").style.width = percent + "%";
    bar.querySelector(".bar-lag").style.width = percent + "%";
}

function renderFaith() {
    let pips = "";
    for (let i = 1; i <= maxFaith; i++) {
        pips = pips + "<span class='pip" + (i <= user.faith ? " on" : "") + "'></span>";
    }
    const box = document.getElementById("faithPips");
    box.innerHTML = pips;
    box.setAttribute("aria-label", user.faith + " of " + maxFaith + " Faith");
}

function renderBlessings() {
    const box = document.getElementById("blessingList");
    box.innerHTML = "";
    for (const id of user.blessings) {
        const skill = skills[id];
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = skill.name;
        chip.title = skill.text;
        box.appendChild(chip);
    }
}

// --- Action buttons ---

// Skills get a button each, coloured by what they do. The old ones are cleared
// first so this can be called after every change without stacking duplicates.
function renderSkillButtons() {
    const actions = document.getElementById("actions");
    const old = actions.querySelectorAll(".skill-btn");
    for (const button of old) {
        button.remove();
    }
    for (const id of user.skills) {
        const skill = skills[id];
        const button = document.createElement("button");
        button.className = "act skill-btn " + skill.element;
        button.id = "skill-" + id;
        button.onclick = function() {
            useSkill(id);
        };
        actions.appendChild(button);
    }
    updateButtons();
}

// The buttons are not fixed labels: the attack button is named after the weapon
// in his hand, and the combo becomes the prayer at Knight.
function updateButtons() {
    const off = gameOver || praying || choosing;

    const attackBtn = document.getElementById("attackBtn");
    attackBtn.textContent = user.weapon.swing;
    attackBtn.dataset.tier = user.level;
    attackBtn.disabled = off;

    const prayBtn = document.getElementById("prayBtn");
    prayBtn.textContent = "Pray (" + user.prayerChance() + " in 10)";
    prayBtn.disabled = off;

    const potionBtn = document.getElementById("potionBtn");
    potionBtn.textContent = "Potion (" + user.potions + ")";
    potionBtn.disabled = off || user.potions <= 0;

    const comboBtn = document.getElementById("comboBtn");
    comboBtn.innerHTML = (user.level < prayerLevel ? "Combo " : "Saint Michael ") + faithCost(comboCost);
    comboBtn.classList.toggle("prayer", user.level >= prayerLevel);
    comboBtn.disabled = off || user.faith < comboCost;

    for (const id of user.skills) {
        const skill = skills[id];
        const button = document.getElementById("skill-" + id);
        button.innerHTML = skill.name + " " + faithCost(skill.cost);
        button.setAttribute("aria-label", skill.name + ", costs " + skill.cost + " Faith. " + skill.text);
        button.disabled = off || user.faith < skill.cost;
    }
}

// Draws the price of a skill as Faith pips instead of a number.
function faithCost(cost) {
    let pips = "<span class='cost'>";
    for (let i = 0; i < cost; i++) {
        pips = pips + "<span class='pip on'></span>";
    }
    return pips + "</span>";
}

// --- Rank up ceremony ---

// The ceremony hands over to the choice dialog on a timer. It is kept here so
// that starting a new run part way through can cancel it, instead of leaving a
// dialog from the old run to open over the new one.
let ceremonyTimer = null;

function showCeremony(rank, level) {
    const ceremony = document.getElementById("ceremony");
    document.getElementById("ceremonyNumber").textContent = level;
    document.getElementById("ceremonyTitle").textContent = rank.title;
    document.getElementById("ceremonyName").textContent = rank.name;
    ceremony.hidden = false;
    ceremony.className = "ceremony";
    void ceremony.offsetWidth;   // Forces the animation to start from the top.
    ceremony.className = "ceremony playing";
    flashScreen("gold");
    emberBurst();
    clearTimeout(ceremonyTimer);
    ceremonyTimer = setTimeout(function() {
        hideCeremony();
        showChoice(rank, level);
    }, ceremonyTime);
}

function hideCeremony() {
    clearTimeout(ceremonyTimer);
    ceremonyTimer = null;
    const ceremony = document.getElementById("ceremony");
    ceremony.hidden = true;
    ceremony.className = "ceremony";
}

function showChoice(rank, level) {
    if (choosing === false) {
        return;   // The run was restarted before the ceremony finished.
    }
    document.getElementById("choiceTitle").textContent = "Rank " + level + ": " + rank.title;
    for (let i = 0; i < rank.choices.length; i++) {
        const skill = skills[rank.choices[i]];
        const card = document.getElementById("choice" + i);
        card.className = "choice-card " + (skill.element ? skill.element : "holy");
        card.querySelector(".card-kind").textContent = skill.kind === "skill" ? "Skill - " + skill.cost + " Faith" : "Blessing - always on";
        card.querySelector(".card-name").textContent = skill.name;
        card.querySelector(".card-text").textContent = skill.text;
        card.querySelector(".card-flavor").textContent = skill.flavor;
    }
    const dialog = document.getElementById("choiceDialog");
    if (dialog.showModal) {
        dialog.showModal();
    }
}

function closeChoice() {
    const dialog = document.getElementById("choiceDialog");
    if (dialog.open) {
        dialog.close();
    }
}

// --- Prologue ---

// The first click of the page. Browsers refuse to play sound before one, so the
// audio context is built here rather than on load.
function closePrologue() {
    document.getElementById("prologue").hidden = true;
    document.getElementById("game").hidden = false;
    startAudio();
    playSound(zombie.sound);
    document.getElementById("attackBtn").focus();
}
