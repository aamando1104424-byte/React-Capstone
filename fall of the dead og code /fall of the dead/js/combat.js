// Combat
// The state of the run in progress, the dice, and the order a turn happens in.
// Aldric acts, then everything still burning ticks, then the demon answers,
// then his wound bites. Damage from both sides funnels through strike and
// hurtHero so that bonuses, weaknesses and the log all stay in one place.

let gameOver = false;
let wave = 1;
let kills = 0;
let bossKills = 0;
let runDamage = 0;

let comboTimers = [];
let praying = false;      // The Saint Michael prayer is mid-sentence.
let choosing = false;     // A rank up choice is on screen.
let pendingChoices = [];  // Levels still owed a skill, in case two land at once.
let comboWasReady = false;

// Every chance in the game is a roll out of 10.
function roll() {
    return Math.floor(Math.random() * 10) + 1;
}

function rollDamage(min, max) {
    if (min < 1) {
        min = 1;
    }
    if (max < min) {
        max = min;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// Swaps the placeholders in a line of flavour text for the names in play.
// The demon is called by its nickname about half the time and "it" the rest,
// which is what keeps the log from reading like a spreadsheet.
function fill(text) {
    let short = zombie.nick;
    if (roll() <= 5) {
        short = "it";
    }
    const capital = short.charAt(0).toUpperCase() + short.slice(1);
    return text
        .replaceAll("{hero}", "<span class='hero'>Aldric</span>")
        .replaceAll("{foe}", short)
        .replaceAll("{Foe}", capital)
        .replaceAll("{name}", "<span class='foe'>" + zombie.name + "</span>")
        .replaceAll("{armour}", user.armour.name)
        .replaceAll("{weapon}", user.weapon.name);
}

function elementMultiplier(element) {
    if (zombie.weak.includes(element)) {
        return weakMultiplier;
    }
    if (zombie.resist.includes(element)) {
        return resistMultiplier;
    }
    return 1;
}

// Every hit Aldric lands comes through here. The tags built up along the way
// are what the log shows, so the player can read why a number was that big.
function strike(damage, element, text, prefix, big) {
    let tags = prefix ? prefix : "";
    if (element !== "steel") {
        tags = tags + tag(element, element);
    }

    if (user.fury > 0) {
        damage = damage * furyMultiplier;
        user.fury = user.fury - 1;
        tags = tags + tag("crit", "Fury");
    }
    if (user.has("martyr") && user.life < user.maxLife / 2) {
        damage = damage * martyrMultiplier;
        tags = tags + tag("blood", "Martyr");
    }

    const crit = roll() <= critChance;
    if (crit) {
        damage = damage * critMultiplier;
        tags = tags + tag("crit", "Crit");
    }

    const multiplier = elementMultiplier(element);
    if (multiplier > 1) {
        tags = tags + tag(element, "Weak x" + weakMultiplier);
    } else if (multiplier < 1) {
        tags = tags + tag("block", "Resisted");
    }

    damage = Math.max(1, Math.round(damage * multiplier));
    hitZombie(damage);
    logLine(tags + fill(text) + " for " + num(element, damage) + (crit ? "!" : "."), crit || big ? "big" : "");
    floatText(enemyBox(), damage, element, crit);
    shakeBox(enemyBox(), crit);
    playSound(crit ? "crit" : elementSounds[element]);
    if (crit) {
        freeze(critFreeze);
    }
    return damage;
}

// Called at the end of everything Aldric does.
function endTurn() {
    checkDemonDeath();
    if (gameOver === false) {
        demonTurn();
    }
    updateUI();
    offerChoice();
}

function demonTurn() {
    tickDemonEffects();
    if (checkDemonDeath() === false) {
        zombie.takeTurn();
        checkDemonDeath();
    }
    tickWound();
    checkHeroDeath();
}

// Returns true if the demon died and the next one has already walked in.
function checkDemonDeath() {
    if (zombie.life > 0) {
        return false;
    }
    zombie.life = 0;
    kills = kills + 1;
    playSound("kill");

    if (zombie.boss) {
        bossKills = bossKills + 1;
        logLine(tag("kill", "Boss Down") + zombie.dies + " " + num("crit", "+" + pointsPerBoss + " score"), "kill boss-line");
        flashScreen("gold");
    } else {
        logLine(tag("kill", "Kill") + fill(pick(killLines)), "kill");
    }

    if (user.has("zeal")) {
        user.gainFaith(zealFaith);
        logLine(tag("holy", "Zeal") + fill("Killing steadies {hero}. ") + num("holy", "+" + zealFaith + " Faith") + ".", "");
    }
    if (user.has("fury")) {
        user.fury = furyHits;
        logLine(tag("crit", "Fury") + fill("{hero} has his blood up. The next " + furyHits + " hits land harder."), "");
    }

    user.secondWindUsed = false;
    spawnNextDemon();
    return true;
}

function checkHeroDeath() {
    if (user.life > 0 || gameOver === true) {
        return;
    }

    if (user.has("miracle") && user.miracleUsed === false) {
        user.miracleUsed = true;
        user.life = Math.round(user.maxLife * miracleLife);
        user.wound = null;
        logLine(tag("holy", "Miracle") + fill("The bells of Varrow ring on their own. {hero} gets back up with ") + num("heal", user.life + " life") + ".", "big");
        playSound("holy");
        flashScreen("gold");
        return;
    }

    user.life = 0;
    gameOver = true;
    clearComboTimers();
    praying = false;
    logLine(fill("{hero}, you feel the blood leaving your body. Your arms go heavy and your thoughts go slow. You will not see tomorrow, but maybe the end of it is a mercy. For now, you can rest."), "");
    if (user.level >= ranks.length) {
        logLine("Saint Aldric fell on wave " + wave + ". There is nothing left to forgive.", "verdict");
    } else {
        logLine("Aldric died a " + user.title + " on wave " + wave + ". His penance is not finished.", "verdict");
    }
    playSound("death");
    flashScreen("red");
    updateButtons();
    showScoreForm();
}

function clearComboTimers() {
    for (let i = 0; i < comboTimers.length; i++) {
        clearTimeout(comboTimers[i]);
    }
    comboTimers = [];
}

// The action buttons in index.html call these four by name. They are kept
// separate from the methods above so the markup does not have to reach into
// the objects, and so every action has one obvious entry point.

// The buttons are disabled at these moments anyway. Checking here as well means
// no action can slip through while the prayer is still going or a rank up is
// waiting to be answered.
function canAct() {
    return gameOver === false && praying === false && choosing === false;
}

function userAttack() {
    if (canAct()) {
        user.userAttack();
    }
}

function pray() {
    if (canAct()) {
        user.pray();
    }
}

function usePotion() {
    if (canAct()) {
        user.usePotion();
    }
}

function comboAttack() {
    if (canAct()) {
        user.comboAttack();
    }
}

// Skill buttons are built at runtime, so they pass their own id in here.
function useSkill(id) {
    const skill = skills[id];
    if (canAct() === false || user.faith < skill.cost) {
        return;
    }
    user.spendFaith(skill.cost);
    skill.use();
    user.gainXP(xpSkill);
    endTurn();
}
