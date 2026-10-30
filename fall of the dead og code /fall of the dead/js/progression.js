// Progression
// Climbing the ten ranks, and starting over at the bottom.
// A rank up is deliberately loud: the page changes colour, the ceremony plays,
// and the run stops until a skill is chosen.

function currentRank() {
    return ranks[user.level - 1];
}

// Aldric has just levelled up. Title, name, and any gear this rank brings.
function rankUp() {
    const rank = currentRank();
    const lastRank = ranks[user.level - 2];
    user.title = rank.title;
    user.name = rank.name;
    logRank(rank);
    playSound("rankUp");

    if (rank.weapon) {
        user.weapon = rank.weapon;
        logLine(tag("loot", "Loot") + "New weapon: <span class='item'>" + rank.weapon.name + "</span> (+" + rank.weapon.attack + " attack).", "");
    }
    if (rank.armour) {
        user.armour = rank.armour;
        logLine(tag("loot", "Loot") + "New armour: <span class='item'>" + rank.armour.name + "</span> (blocks " + rank.armour.block + " in 10).", "");
    }
    if (rank.prayer > lastRank.prayer) {
        logLine(tag("holy", "Prayer") + "His prayers carry further now. They land " + num("holy", rank.prayer + " in 10") + ".", "");
    }
    if (user.level === prayerLevel) {
        logLine(tag("holy", "Remembered") + "He remembers the prayer to Saint Michael. His combo is the prayer now.", "");
    }
    if (rank.choices) {
        pendingChoices.push(user.level);
    }
}

// Held back until the prayer has finished and any earlier choice is settled,
// so two rank ups in one combo still get a ceremony each.
function offerChoice() {
    if (gameOver || praying || choosing || pendingChoices.length === 0) {
        return;
    }
    choosing = true;
    updateButtons();
    const rank = ranks[pendingChoices[0] - 1];
    showCeremony(rank, pendingChoices[0]);
}

function chooseSkill(slot) {
    if (choosing === false) {
        return;
    }
    const level = pendingChoices.shift();
    learnSkill(ranks[level - 1].choices[slot]);
    choosing = false;
    closeChoice();
    updateUI();
    offerChoice();
}

function learnSkill(id) {
    const skill = skills[id];
    if (skill.kind === "skill") {
        user.skills.push(id);
        logLine(tag("loot", "Learned") + "<span class='item'>" + skill.name + "</span>. " + skill.text, "");
    } else {
        user.blessings.push(id);
        logLine(tag("holy", "Blessing") + "<span class='item'>" + skill.name + "</span>. " + skill.text, "");
    }
    playSound("choose");
    renderSkillButtons();
}

// Wipes everything a run accumulates. Anything added to the hero or to the run
// state has to be reset here, or it leaks into the next run.
function startGame() {
    const start = ranks[0];

    clearComboTimers();
    praying = false;
    choosing = false;
    pendingChoices = [];
    comboWasReady = false;
    closeChoice();
    hideCeremony();

    user.title = start.title;
    user.name = start.name;
    user.weapon = start.weapon;
    user.armour = start.armour;
    user.maxLife = startLife;
    user.life = startLife;
    user.attack = startAttack;
    user.heal = startHeal;
    user.potions = startPotions;
    user.xp = 0;
    user.level = 1;
    user.faith = 0;
    user.skills = [];
    user.blessings = [];
    user.wound = null;
    user.bulwark = 0;
    user.fury = 0;
    user.miracleUsed = false;
    user.secondWindUsed = false;

    wave = 1;
    gameOver = false;
    kills = 0;
    bossKills = 0;
    runDamage = 0;

    document.getElementById("scoreForm").hidden = true;
    document.getElementById("saveMsg").textContent = "";
    document.getElementById("log").innerHTML = "";

    renderSkillButtons();
    logRank(start);
    setupWave();
    updateUI();
}
