// Enemy
// Whatever is in front of Aldric right now. There is only ever one, so instead
// of building a new object every wave, setupWave copies the next demon's data
// into this one and resets the parts that carry over.

const zombie = {
    name: "Zombie",
    epithet: "a dead baker",
    nick: "the baker",
    type: "Tank",
    element: "rot",
    life: 100,
    maxLife: 100,
    attack: 8,
    weak: [],
    resist: [],
    bleeds: true,
    boss: false,
    phase: 1,
    stun: 0,
    windup: false,
    calm: 0,          // Turns before a boss may wind up again.
    turns: 0,
    arrives: "",
    attacks: [],
    effects: { burn: 0, burnDamage: 0, bleed: 0, bleedDamage: 0, holy: 0, holyDamage: 0 },

    takeTurn: function() {
        if (this.stun > 0) {
            this.stun = this.stun - 1;
            const text = this.windup ? "{Foe} reels, and the blow never comes." : "{Foe} reels and loses its turn.";
            this.windup = false;
            logLine(tag("steel", "Stunned") + fill(text), "");
            return;
        }

        let damage = rollDamage(this.attack - damageSpread, this.attack + damageSpread);
        if (this.phase === 2) {
            damage = Math.round(damage * phaseTwoAttack);
        }
        let text = pick(this.phase === 2 ? this.attacksTwo : this.attacks);
        let heavy = false;

        if (this.windup) {
            this.windup = false;
            this.calm = windupRest;
            heavy = true;
            damage = damage * heavyMultiplier;
            text = this.heavy;
        } else if (this.boss && this.turns > 0 && this.calm <= 0 && roll() <= windupChance) {
            // A boss telegraphs its big hit, which gives you one turn to answer it.
            this.windup = true;
            this.turns = this.turns + 1;
            logLine(tag("wave", "Warning") + fill(this.windupText) + " <strong>Heavy blow next turn.</strong>", "warning");
            playSound("windup");
            return;
        }

        this.turns = this.turns + 1;
        this.calm = Math.max(0, this.calm - 1);

        // Bulwark stops anything. Armour cannot stop a wound up blow.
        if (user.bulwark > 0) {
            user.bulwark = user.bulwark - 1;
            const left = user.bulwark > 0 ? " It holds for one more." : " The wall comes down.";
            logLine(tag("block", "Bulwark") + fill("{Foe} hits nothing but iron.") + left, "");
            playSound("block");
            floatText(heroBox(), "Blocked", "steel");
            return;
        }

        if (heavy === false && roll() <= user.blockChance()) {
            logLine(tag("block", "Blocked") + fill("{Foe}'s blow skids off {hero}'s {armour}."), "");
            playSound("block");
            floatText(heroBox(), "Blocked", "steel");
            if (user.has("riposte")) {
                strike(user.totalAttack(), user.weapon.element, "{hero} turns it and cuts back at {foe}", tag("steel", "Riposte"));
            }
            return;
        }

        hurtHero(damage, this.element, tag(this.element, heavy ? "Heavy" : this.element) + fill(text), heavy);

        if (user.life > 0 && user.wound === null && roll() <= woundChance) {
            user.wound = { element: this.element, turns: woundLength };
            logLine(tag(this.element, woundNames[this.element]) + woundStarts[this.element] + " (" + woundLength + " turns)", "");
        }
    }
};

// Only the life it actually had counts toward the score. Overkill is free.
function hitZombie(damage) {
    let counted = damage;
    if (counted > zombie.life) {
        counted = zombie.life;
    }
    if (counted < 0) {
        counted = 0;
    }
    runDamage = runDamage + counted;
    zombie.life = zombie.life - damage;
    checkBossPhase();
}

function checkBossPhase() {
    if (zombie.boss && zombie.phase === 1 && zombie.life > 0 && zombie.life <= zombie.maxLife / 2) {
        zombie.phase = 2;
        logLine(tag("wave", "Phase 2") + zombie.phaseTwo, "boss-line");
        playSound("phaseTwo");
        shakeBox(enemyBox(), true);
        flashScreen("red");
    }
}

// Damage over time. All three scale off Aldric's attack, so they stay worth
// casting at every rank. quiet is for Bloodletting, which fires often enough
// that the "no blood" line would fill the log.
function startBleed(quiet) {
    if (zombie.life <= 0) {
        return;
    }
    if (zombie.bleeds === false) {
        if (quiet !== true) {
            logLine(tag("block", "No Blood") + fill("{Foe} has no blood left to lose."), "miss");
        }
        return;
    }
    zombie.effects.bleed = bleedTurns;
    zombie.effects.bleedDamage = Math.round(user.totalAttack() * bleedPower);
    logLine(tag("blood", "Bleeding") + fill("{Foe} is opened up and bleeding."), "");
}

function startBurn() {
    if (zombie.life <= 0) {
        return;
    }
    zombie.effects.burn = burnTurns;
    zombie.effects.burnDamage = Math.round(user.totalAttack() * burnPower);
    logLine(tag("fire", "Burning") + fill("{Foe} catches and burns."), "");
}

function startHolyGround() {
    zombie.effects.holy = holyGroundTurns;
    zombie.effects.holyDamage = Math.round(user.totalAttack() * holyGroundPower);
}

// Everything still burning, bleeding or standing on holy ground bites at the
// start of the demon's turn, and still counts against its weaknesses.
function tickDemonEffects() {
    const effects = zombie.effects;

    if (effects.burn > 0 && zombie.life > 0) {
        effects.burn = effects.burn - 1;
        const damage = Math.max(1, Math.round(effects.burnDamage * elementMultiplier("fire")));
        hitZombie(damage);
        logLine(tag("fire", "Burning") + fill("{Foe} burns for ") + num("fire", damage) + ".", "");
        floatText(enemyBox(), damage, "fire");
        playSound("fire", 0.5);
    }

    if (effects.bleed > 0 && zombie.life > 0) {
        effects.bleed = effects.bleed - 1;
        const damage = Math.max(1, Math.round(effects.bleedDamage * elementMultiplier("blood")));
        hitZombie(damage);
        logLine(tag("blood", "Bleeding") + fill("{Foe} bleeds for ") + num("blood", damage) + ".", "");
        floatText(enemyBox(), damage, "blood");
        playSound("bleed", 0.5);
    }

    if (effects.holy > 0 && zombie.life > 0) {
        effects.holy = effects.holy - 1;
        const damage = Math.max(1, Math.round(effects.holyDamage * elementMultiplier("holy")));
        hitZombie(damage);
        const healed = healHero(Math.round(user.maxLife * holyGroundHeal));
        logLine(tag("holy", "Holy Ground") + fill("The ground burns {foe} for ") + num("holy", damage) + " and steadies {hero} for " + num("heal", "+" + healed) + ".", "");
        floatText(enemyBox(), damage, "holy");
    }
}

function spawnNextDemon() {
    wave = wave + 1;
    user.potions = Math.min(maxPotions, user.potions + 1);
    setupWave();
}

// Picks who walks in for this wave and scales them to it.
function setupWave() {
    const boss = wave % bossEvery === 0;
    let demon;
    let secondTime = false;

    if (boss) {
        // The two bosses alternate, so the third boss is Corvin again.
        const bossNumber = Math.floor(wave / bossEvery) - 1;
        demon = bosses[bossNumber % bosses.length];
        secondTime = bossNumber >= bosses.length;
    } else {
        // The waves between bosses walk down the demons list in order.
        const step = wave - Math.floor(wave / bossEvery);
        demon = demons[(step - 1) % demons.length];
    }

    zombie.name = demon.name;
    zombie.epithet = demon.epithet;
    zombie.nick = demon.nick;
    zombie.type = demon.type;
    zombie.element = demon.element;
    zombie.weak = demon.weak;
    zombie.resist = demon.resist;
    zombie.bleeds = demon.bleeds;
    zombie.attacks = demon.attacks;
    zombie.attacksTwo = demon.attacksTwo ? demon.attacksTwo : demon.attacks;
    zombie.arrives = secondTime && demon.again ? demon.again : demon.arrives;
    zombie.sound = demon.sound;
    zombie.boss = boss === true;
    zombie.windupText = demon.windupText;
    zombie.heavy = demon.heavy;
    zombie.phaseTwo = demon.phaseTwo;
    zombie.dies = demon.dies;

    let life = baseDemonLife + (wave - 1) * lifePerWave;
    let attack = baseDemonAttack + (wave - 1) * attackPerWave;
    if (boss) {
        life = Math.round(life * bossLife);
        attack = Math.round(attack * bossAttack);
    }
    zombie.maxLife = life;
    zombie.life = life;
    zombie.attack = attack;
    zombie.phase = 1;
    zombie.stun = 0;
    zombie.windup = false;
    zombie.calm = 0;
    zombie.turns = 0;
    zombie.effects = { burn: 0, burnDamage: 0, bleed: 0, bleedDamage: 0, holy: 0, holyDamage: 0 };

    logWave();
    playSound(demon.sound);
    if (boss) {
        flashScreen("red");
    }
}
