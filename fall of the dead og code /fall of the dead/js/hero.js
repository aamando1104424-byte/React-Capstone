// Hero
// Aldric: his stats, the four things he can do on his turn, and the rules for
// his own health. Every run starts him back in the gutter as a Peasant.

const user = {
    title: "Peasant",
    name: "Aldric the Drunk",
    life: 100,
    maxLife: 100,
    attack: 10,
    heal: 30,
    potions: 1,
    weapon: null,     // Filled in by startGame from the rank he is on.
    armour: null,
    xp: 0,            // Shown on the page as Favor.
    level: 1,
    faith: 0,
    skills: [],       // Active skills, in the order he learned them.
    blessings: [],    // Passive ones.
    wound: null,      // { element, turns } while something is still bleeding him.
    bulwark: 0,       // Attacks Bulwark will still stop.
    fury: 0,          // Hits left carrying the Fury bonus.
    miracleUsed: false,
    secondWindUsed: false,

    totalAttack: function() {
        return this.attack + this.weapon.attack;
    },

    has: function(id) {
        return this.skills.includes(id) || this.blessings.includes(id);
    },

    blockChance: function() {
        let chance = this.armour.block;
        if (this.has("vigil")) {
            chance = chance + vigilBlock;
        }
        return chance;
    },

    prayerChance: function() {
        let chance = currentRank().prayer;
        if (this.has("confession")) {
            chance = chance + confessionPrayer;
        }
        return chance;
    },

    gainFaith: function(amount) {
        this.faith = Math.min(maxFaith, this.faith + amount);
        // Announce the combo the turn it becomes available, and only that turn.
        if (this.faith >= comboCost && comboWasReady === false && gameOver === false) {
            comboWasReady = true;
            const line = this.level < prayerLevel ? "His grip steadies. The combo is ready." : "The prayer is already on his lips.";
            logLine(tag("holy", "Faith") + line, "ready");
            playSound("ready");
        }
    },

    spendFaith: function(amount) {
        this.faith = this.faith - amount;
        comboWasReady = this.faith >= comboCost;
    },

    gainXP: function(amount) {
        if (this.level >= ranks.length) {
            return;   // Saint is the top rank. There is nothing left to earn.
        }
        this.xp = this.xp + amount;
        if (this.xp >= xpPerLevel) {
            this.xp = this.xp - xpPerLevel;
            this.level = this.level + 1;
            this.attack = this.attack + attackPerLevel;
            this.heal = this.heal + healPerLevel;
            this.maxLife = this.maxLife + lifePerLevel;
            // A rank up is a blessing: full life, and whatever was eating him stops.
            this.life = this.maxLife;
            this.wound = null;
            rankUp();
        }
    },

    userAttack: function() {
        const attack = this.totalAttack();
        const damage = rollDamage(attack - damageSpread, attack + damageSpread);
        strike(damage, this.weapon.element, "{hero} " + pick(this.weapon.verbs) + " {foe}");
        if (this.has("bloodletting") && roll() <= bloodlettingChance) {
            startBleed(true);
        }
        this.gainFaith(faithPerTurn);
        this.gainXP(xpAttack);
        endTurn();
    },

    pray: function() {
        if (roll() <= this.prayerChance()) {
            const amount = healHero(this.heal);
            logLine(tag("holy", "Answered") + fill(pick(prayerAnswered)) + " " + num("heal", "+" + amount + " life") + ".", "");
            playSound("holy");
        } else {
            logLine(fill(pick(this.level >= ranks.length ? saintPrayerFails : prayerFails)), "miss");
            playSound("pray");
        }
        // Confession closes the wound whether the prayer lands or not.
        if (this.has("confession") && this.wound !== null) {
            this.wound = null;
            logLine(tag("heal", "Confession") + fill("{hero} says it all out loud, and the wound closes."), "");
        }
        this.gainFaith(faithPerTurn);
        endTurn();
    },

    usePotion: function() {
        if (this.potions <= 0) {
            return;
        }
        this.potions = this.potions - 1;
        const amount = healHero(this.heal);
        let text = fill(pick(potionLines)) + " " + num("heal", "+" + amount + " life") + ".";
        if (this.wound !== null) {
            this.wound = null;
            text = text + " The wound goes quiet with it.";
        }
        logLine(tag("heal", "Potion") + text, "");
        playSound("potion");
        playSound("heal");
        endTurn();
    },

    // Three quick hits below Knight. From Knight on it becomes the Saint Michael
    // prayer: the same three hits at double damage, spaced out so the lines of
    // the prayer land between them, which is why the rest of this one is timers.
    comboAttack: function() {
        if (this.faith < comboCost) {
            return;
        }
        this.spendFaith(comboCost);

        if (this.level < prayerLevel) {
            const damage = this.totalAttack();
            for (let i = 1; i <= comboHits; i++) {
                strike(damage, this.weapon.element, "{hero} " + pick(this.weapon.verbs) + " {foe}", tag("combo", "Combo " + i + "/" + comboHits));
                checkDemonDeath();
            }
            this.gainXP(xpCombo);
            endTurn();
            return;
        }

        clearComboTimers();
        praying = true;
        updateButtons();
        logSpeech(prayerSpeech[0]);
        playSound("holy");

        for (let i = 1; i <= comboHits; i++) {
            const timer = setTimeout(function() {
                strike(user.totalAttack() * comboMultiplier, "holy", "{hero} " + pick(user.weapon.verbs) + " {foe}", tag("combo", "Combo " + i + "/" + comboHits), true);
                logSpeech(prayerSpeech[i]);
                checkDemonDeath();
                updateUI();
            }, i * comboDelay);
            comboTimers.push(timer);
        }

        const finisher = setTimeout(function() {
            logSpeech(prayerSpeech[comboHits + 1]);
            user.gainXP(xpCombo);
            endTurn();
        }, (comboHits + 1) * comboDelay);
        comboTimers.push(finisher);

        const amen = setTimeout(function() {
            logSpeech("Amen.");
            praying = false;
            updateUI();
            offerChoice();
        }, (comboHits + 1) * comboDelay + amenPause);
        comboTimers.push(amen);
    }
};

// Healing is capped at full life, and returns what was actually restored so the
// log can print the real number instead of the number that was asked for.
function healHero(amount) {
    const before = user.life;
    user.life = Math.min(user.maxLife, user.life + amount);
    const healed = user.life - before;
    floatText(heroBox(), "+" + healed, "heal");
    return healed;
}

function hurtHero(damage, element, text, heavy) {
    user.life = user.life - damage;
    const big = heavy === true || damage >= user.maxLife / 4;
    logLine(text + " for " + num(element, damage) + (big ? "!" : "."), big ? "big" : "");
    floatText(heroBox(), "-" + damage, element, big);
    shakeBox(heroBox(), big);
    playSound(elementSounds[element]);
    playSound(big ? "bigHurt" : "hurt");
    if (big) {
        flashScreen("red");
    }
    checkSecondWind();
}

function checkSecondWind() {
    if (user.has("secondWind") && user.secondWindUsed === false && user.life > 0 && user.life < user.maxLife * secondWindAt) {
        user.secondWindUsed = true;
        const amount = healHero(Math.round(user.maxLife * secondWindHeal));
        logLine(tag("heal", "Second Wind") + fill("{hero} refuses to go down. ") + num("heal", "+" + amount + " life") + ".", "");
        playSound("heal");
    }
}

// A wound bites once a turn until it runs out. Potions, Last Rites, Confession
// and ranking up all clear it early.
function tickWound() {
    if (user.wound === null || user.life <= 0) {
        return;
    }
    let damage = woundDamage;
    if (user.has("hardLiver")) {
        damage = Math.round(damage / 2);
    }
    const element = user.wound.element;
    user.wound.turns = user.wound.turns - 1;
    user.life = user.life - damage;

    let text = tag(element, woundNames[element]) + fill("{hero} loses ") + num(element, damage) + " life. ";
    if (user.wound.turns > 1) {
        text = text + user.wound.turns + " turns left.";
    } else if (user.wound.turns === 1) {
        text = text + "1 turn left.";
    } else {
        text = text + woundEnds[element];
        user.wound = null;
    }
    logLine(text, "");
    floatText(heroBox(), "-" + damage, element);
    checkSecondWind();
}
