// Engine
// Every rule in the game: Aldric, the demon in front of him, the order a turn
// happens in, and climbing the ranks. All of it works on the one `game` object
// below. Nothing in here touches the page. React reads `game` and re-renders
// whenever refresh() is called; the moments that should feel like something
// go out through fx.js; sounds go straight to audio.js.
//
// A turn: Aldric acts, then everything still burning ticks, then the demon
// answers, then his wound bites. Damage from both sides funnels through strike
// and hurtHero so bonuses, weaknesses and the log all stay in one place.
//
// Aldric carries one weapon per element and picks which to swing. The demon
// has two kinds of attack and picks whichever he resists least; it decides a
// turn ahead, so its card can show what is coming.

import * as C from "./config.js";
import {
    ranks, demons, bosses, prayerSpeech, prayerAnswered, prayerFails, saintPrayerFails,
    potionLines, killLines, woundNames, woundStarts, woundEnds, elementSounds, altAttacks
} from "./content.js";
import { skills } from "./skills.js";
import { relics, shopkeeper } from "./relics.js";
import { weapons, elementOrder, bossDrops } from "./weapons.js";
import { perks, perkCount } from "./perks.js";
import { playSound } from "./audio.js";
import { floatText, shakeBox, flashScreen, freeze, emberBurst } from "./fx.js";

// --- State ---

export const game = {
    user: {
        title: "Peasant",
        name: "Aldric the Drunk",
        life: C.startLife,
        maxLife: C.startLife,
        attack: C.startAttack,
        heal: C.startHeal,
        potions: C.startPotions,
        weapons: { steel: ranks[0].weapon },   // Element to weapon id, one of each at most.
        armour: ranks[0].armour,
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
        gold: 0,
        relics: []        // Bought from the pardoner, in the order he bought them.
    },

    // Whatever is in front of Aldric right now. There is only ever one, so
    // setupWave copies the next demon's data into this object every wave.
    zombie: {
        name: "", epithet: "", nick: "", type: "", element: "rot", alt: "blood",
        life: 1, maxLife: 1, attack: 1,
        weak: [], resist: [], bleeds: true, boss: false,
        perks: [],        // Ids from perks.js.
        ward: false,      // Warded and not yet broken.
        hide: 0,          // Taken off every direct hit by Thick Hide.
        intent: null,     // { kind: "attack" | "windup" | "heavy", element } for its next turn.
        phase: 1, stun: 0, windup: false,
        calm: 0,          // Turns before a boss may wind up again.
        turns: 0,
        attacks: [], attacksTwo: [], arrives: "", sound: "",
        windupText: "", heavy: "", phaseTwo: "", dies: "",
        effects: { burn: 0, burnDamage: 0, bleed: 0, bleedDamage: 0, holy: 0, holyDamage: 0 }
    },

    wave: 1,
    kills: 0,
    bossKills: 0,
    runDamage: 0,
    gameOver: false,
    praying: false,       // The Saint Michael prayer is mid-sentence.
    choosing: false,      // A rank up is being shown or answered.
    pendingChoices: [],   // Levels still owed a skill, in case two land at once.
    comboWasReady: false,
    ceremony: null,       // { level, id } while the light is coming down.
    choiceLevel: null,    // The rank whose two skills are on screen.
    scoreOpen: false,     // The run is over and the name form is showing.
    shopPending: false,   // The cart is due; the next demon waits until he leaves.
    shop: null,           // { stock: [{ id, price, sold }], line } while the cart is open.
    runId: 0,
    log: []               // { id, kind, parts }, rendered by BattleLog.
};

const user = game.user;
const zombie = game.zombie;

// --- Instant mode ---
// The bot that balances the game plays thousands of turns. With this on, the
// Saint Michael prayer and the rank up ceremony happen at once instead of on
// timers, so a whole run can be played in a loop.

let instant = false;

export function setInstant(on) {
    instant = on;
}

// --- Store, for React ---

const listeners = new Set();
let version = 0;

export function subscribe(listener) {
    listeners.add(listener);
    return function() {
        listeners.delete(listener);
    };
}

export function getVersion() {
    return version;
}

function refresh() {
    version = version + 1;
    for (const listener of listeners) {
        listener();
    }
}

// --- The log ---
// A line is a list of parts: plain strings, plus small objects for the bits
// that get their own colour. RichText.jsx draws them.

const logLimit = 250;
let nextLogId = 1;

export function tag(kind, label) {
    return { t: "tag", kind: kind, label: label };
}

export function num(kind, value) {
    return { t: "num", kind: kind, value: String(value) };
}

function strong(text) {
    return { t: "strong", text: text };
}

function item(text) {
    return { t: "item", text: text };
}

function logLine(parts, kind) {
    const flat = [].concat(parts).flat(Infinity).filter(function(part) {
        return part !== "" && part !== null && part !== undefined;
    });
    game.log.push({ id: nextLogId, kind: kind, parts: flat });
    nextLogId = nextLogId + 1;
    if (game.log.length > logLimit) {
        game.log.splice(0, game.log.length - logLimit);
    }
}

function logSpeech(line) {
    logLine(line, "speech");
}

function logRank(rank) {
    const kind = user.level === ranks.length ? "rankup saint" : "rankup";
    logLine([strong("Rank " + user.level + ": " + rank.title), rank.message], kind);
}

function logWave() {
    const label = zombie.boss ? "Boss" : "Wave " + game.wave;
    const kind = zombie.boss ? "wave boss-line" : "wave";
    logLine([tag("wave", label), strong(zombie.name), fill(zombie.arrives)], kind);
}

// --- Dice ---

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
    const plain = text
        .replaceAll("{foe}", short)
        .replaceAll("{Foe}", capital)
        .replaceAll("{armour}", user.armour.name)
        .replaceAll("{weapon}", weapons[user.weapons.steel].name);
    return plain.split(/(\{hero\}|\{name\})/).map(function(piece) {
        if (piece === "{hero}") {
            return { t: "hero", text: "Aldric" };
        }
        if (piece === "{name}") {
            return { t: "foe", text: zombie.name };
        }
        return piece;
    });
}

// --- Aldric ---

export function currentRank() {
    return ranks[user.level - 1];
}

export function weaponIn(element) {
    const id = user.weapons[element];
    return id === undefined ? null : weapons[id];
}

// What a swing with the weapon of that element hits for, before the dice.
export function attackWith(element) {
    const weapon = weaponIn(element);
    return user.attack + (weapon === null ? 0 : weapon.attack);
}

function bestWeaponAttack() {
    let best = 0;
    for (const element in user.weapons) {
        best = Math.max(best, weapons[user.weapons[element]].attack);
    }
    return best;
}

// Skills scale off the weapon in their element. Without one, they get half
// of his best weapon, so a skill is never useless, just better with backing.
export function skillPower(element) {
    const weapon = weaponIn(element);
    if (weapon !== null) {
        return user.attack + weapon.attack;
    }
    return user.attack + Math.floor(bestWeaponAttack() / 2);
}

// The weapon he carries that hurts this demon most.
export function bestElement() {
    let best = "steel";
    let bestDamage = -1;
    for (const element of elementOrder) {
        if (weaponIn(element) !== null) {
            const damage = attackWith(element) * elementMultiplier(element);
            if (damage > bestDamage) {
                best = element;
                bestDamage = damage;
            }
        }
    }
    return best;
}

// How much of a kind of damage he shrugs off: armour, relics, blessings.
export function heroResist(element) {
    let resist = user.armour.resist[element] || 0;
    for (const id of user.relics) {
        if (relics[id].resist && relics[id].resist[element]) {
            resist = resist + relics[id].resist[element];
        }
    }
    if (element === "rot" && has("hardLiver")) {
        resist = resist + C.hardLiverRot;
    }
    if (has("vigil")) {
        resist = resist + C.vigilResist;
    }
    return Math.min(C.resistCap, resist);
}

export function hasPerk(id) {
    return zombie.perks.includes(id);
}

export function has(id) {
    return user.skills.includes(id) || user.blessings.includes(id);
}

export function hasRelic(id) {
    return user.relics.includes(id);
}

function blockChance() {
    let chance = user.armour.block;
    if (has("vigil")) {
        chance = chance + C.vigilBlock;
    }
    if (hasRelic("crackedShield")) {
        chance = chance + C.shieldBlock;
    }
    return chance;
}

export function prayerChance() {
    let chance = currentRank().prayer;
    if (has("confession")) {
        chance = chance + C.confessionPrayer;
    }
    return chance;
}

export function getScore() {
    return game.runDamage + game.kills * C.pointsPerKill + game.bossKills * C.pointsPerBoss;
}

function gainFaith(amount) {
    user.faith = Math.min(C.maxFaith, user.faith + amount);
    // Announce the combo the turn it becomes available, and only that turn.
    if (user.faith >= C.comboCost && game.comboWasReady === false && game.gameOver === false) {
        game.comboWasReady = true;
        const line = user.level < C.prayerLevel ? "His grip steadies. The combo is ready." : "The prayer is already on his lips.";
        logLine([tag("holy", "Faith"), line], "ready");
        playSound("ready");
    }
}

function spendFaith(amount) {
    user.faith = user.faith - amount;
    game.comboWasReady = user.faith >= C.comboCost;
}

// Each rank costs more Favor than the last.
export function xpNeeded() {
    return C.xpPerLevel + (user.level - 1) * C.xpPerLevelGrowth;
}

export function woundDamage() {
    let damage = Math.round(user.maxLife * C.woundShare);
    if (has("hardLiver")) {
        damage = Math.round(damage / 2);
    }
    return damage;
}

function gainXP(amount) {
    if (user.level >= ranks.length) {
        return;   // Saint is the top rank. There is nothing left to earn.
    }
    user.xp = user.xp + amount;
    if (user.xp >= xpNeeded()) {
        user.xp = user.xp - xpNeeded();
        user.level = user.level + 1;
        user.attack = user.attack + C.attackPerLevel;
        user.heal = user.heal + C.healPerLevel;
        user.maxLife = user.maxLife + C.lifePerLevel;
        // A rank up is a blessing: full life, and whatever was eating him stops.
        user.life = user.maxLife;
        user.wound = null;
        rankUp();
    }
}

// Healing is capped at full life, and returns what was actually restored so the
// log can print the real number instead of the number that was asked for.
function healHero(amount) {
    const before = user.life;
    user.life = Math.min(user.maxLife, user.life + amount);
    const healed = user.life - before;
    floatText("hero", "+" + healed, "heal");
    return healed;
}

function hurtHero(damage, element, parts, heavy) {
    user.life = user.life - damage;
    const big = heavy === true || damage >= user.maxLife / 4;
    logLine([parts, " for ", num(element, damage), big ? "!" : "."], big ? "big" : "");
    floatText("hero", "-" + damage, element, big);
    shakeBox("hero", big);
    playSound(elementSounds[element]);
    playSound(big ? "bigHurt" : "hurt");
    playSound("ouch", big ? 1 : 0.7);
    if (big) {
        flashScreen("red");
    }
    if (hasRelic("thornCrown") && zombie.life > 0) {
        const back = Math.max(1, Math.round(damage * C.thornsReflect));
        hitZombie(back);
        logLine([tag("blood", "Thorns"), fill("The crown bites back. {Foe} takes "), num("blood", back), "."], "");
        floatText("enemy", back, "blood");
    }
    checkSecondWind();
}

function checkSecondWind() {
    if (has("secondWind") && user.secondWindUsed === false && user.life > 0 && user.life < user.maxLife * C.secondWindAt) {
        user.secondWindUsed = true;
        const amount = healHero(Math.round(user.maxLife * C.secondWindHeal));
        logLine([tag("heal", "Second Wind"), fill("{hero} refuses to go down. "), num("heal", "+" + amount + " life"), "."], "");
        playSound("heal");
    }
}

// A wound bites once a turn until it runs out. Potions, Last Rites, Confession
// and ranking up all clear it early.
function tickWound() {
    if (user.wound === null || user.life <= 0) {
        return;
    }
    const damage = woundDamage();
    const element = user.wound.element;
    user.wound.turns = user.wound.turns - 1;
    user.life = user.life - damage;

    let rest;
    if (user.wound.turns > 1) {
        rest = user.wound.turns + " turns left.";
    } else if (user.wound.turns === 1) {
        rest = "1 turn left.";
    } else {
        rest = woundEnds[element];
        user.wound = null;
    }
    logLine([tag(element, woundNames[element]), fill("{hero} loses "), num(element, damage), " life. ", rest], "");
    floatText("hero", "-" + damage, element);
    checkSecondWind();
}

// --- His four actions ---

function spread(value) {
    return Math.max(1, Math.round(value * C.damageSpread));
}

function heroAttack(element) {
    const weapon = weaponIn(element);
    const attack = attackWith(element);
    const damage = rollDamage(attack - spread(attack), attack + spread(attack));
    strike(damage, element, "{hero} " + pick(weapon.verbs) + " {foe}");
    if (weapon.burn && roll() <= weapon.burn) {
        startBurn();
    }
    if (weapon.bleed && roll() <= weapon.bleed) {
        startBleed(true);
    }
    if (has("bloodletting") && roll() <= C.bloodlettingChance) {
        startBleed(true);
    }
    if (hasRelic("lampOil") && roll() <= C.lampOilChance) {
        startBurn();
    }
    gainFaith(C.faithPerTurn);
    gainXP(C.xpAttack);
    endTurn();
}

function heroPray() {
    if (roll() <= prayerChance()) {
        const amount = healHero(user.heal);
        logLine([tag("holy", "Answered"), fill(pick(prayerAnswered)), " ", num("heal", "+" + amount + " life"), "."], "");
        playSound("holy");
        playSound("heal");
    } else {
        logLine(fill(pick(user.level >= ranks.length ? saintPrayerFails : prayerFails)), "miss");
        playSound("pray");
        playSound("whisper", 0.6);
    }
    // Confession closes the wound whether the prayer lands or not.
    if (has("confession") && user.wound !== null) {
        user.wound = null;
        logLine([tag("heal", "Confession"), fill("{hero} says it all out loud, and the wound closes.")], "");
    }
    gainFaith(C.faithPerTurn);
    endTurn();
}

function heroPotion() {
    if (user.potions <= 0) {
        return;
    }
    user.potions = user.potions - 1;
    const heal = hasRelic("varrowRed") ? Math.round(user.heal * C.wineHeal) : user.heal;
    const amount = healHero(heal);
    const parts = [fill(pick(potionLines)), " ", num("heal", "+" + amount + " life"), "."];
    if (user.wound !== null) {
        user.wound = null;
        parts.push(" The wound goes quiet with it.");
    }
    logLine([tag("heal", "Potion"), parts], "");
    playSound("potion");
    playSound("heal");
    endTurn();
}

// Three quick hits below Knight. From Knight on it becomes the Saint Michael
// prayer: the same three hits at double damage, spaced out so the lines of
// the prayer land between them, which is why the rest of this one is timers.
let comboTimers = [];

function heroCombo() {
    if (user.faith < C.comboCost) {
        return;
    }
    spendFaith(C.comboCost);

    if (user.level < C.prayerLevel) {
        for (let i = 1; i <= C.comboHits; i++) {
            // Each swing picks the best weapon again, in case a new demon walked in.
            const element = bestElement();
            strike(attackWith(element), element, "{hero} " + pick(weaponIn(element).verbs) + " {foe}", tag("combo", "Combo " + i + "/" + C.comboHits));
            checkDemonDeath();
            if (game.shopPending) {
                break;   // It died and the cart is coming. The rest of the swings go nowhere.
            }
        }
        gainXP(C.xpCombo);
        endTurn();
        return;
    }

    clearComboTimers();
    game.praying = true;
    logSpeech(prayerSpeech[0]);
    playSound("holy");

    if (instant) {
        for (let i = 1; i <= C.comboHits; i++) {
            strike(skillPower("holy") * C.comboMultiplier, "holy", "{hero} strikes {foe}", tag("combo", "Combo " + i + "/" + C.comboHits), true);
            checkDemonDeath();
        }
        gainXP(C.xpCombo);
        game.praying = false;
        endTurn();
        return;
    }
    refresh();

    for (let i = 1; i <= C.comboHits; i++) {
        const timer = setTimeout(function() {
            const holy = weaponIn("holy");
            const verb = holy === null ? "strikes" : pick(holy.verbs);
            strike(skillPower("holy") * C.comboMultiplier, "holy", "{hero} " + verb + " {foe}", tag("combo", "Combo " + i + "/" + C.comboHits), true);
            logSpeech(prayerSpeech[i]);
            checkDemonDeath();
            refresh();
        }, i * C.comboDelay);
        comboTimers.push(timer);
    }

    const finisher = setTimeout(function() {
        logSpeech(prayerSpeech[C.comboHits + 1]);
        gainXP(C.xpCombo);
        endTurn();
    }, (C.comboHits + 1) * C.comboDelay);
    comboTimers.push(finisher);

    const amen = setTimeout(function() {
        logSpeech("Amen.");
        game.praying = false;
        refresh();
        offerChoice();
    }, (C.comboHits + 1) * C.comboDelay + C.amenPause);
    comboTimers.push(amen);
}

function clearComboTimers() {
    for (const timer of comboTimers) {
        clearTimeout(timer);
    }
    comboTimers = [];
}

// What each active skill does when its button is pressed.
const skillEffects = {
    shieldBash: function() {
        strike(skillPower("steel"), "steel", "{hero} smashes a battered shield into {foe}");
        if (zombie.life > 0) {
            zombie.stun = 1;
            logLine([tag("steel", "Stunned"), fill("{Foe} staggers back.")], "");
            playSound("stun");
            playSound("stagger");
        }
    },
    rend: function() {
        strike(skillPower("blood"), "blood", "{hero} tears a long cut across {foe}");
        startBleed();
    },
    holyFire: function() {
        strike(skillPower("fire") * C.holyFirePower, "fire", "{hero} smashes a burning lamp over {foe}");
        startBurn();
    },
    smite: function() {
        strike(skillPower("holy") * C.smitePower, "holy", "{hero} says the blessing and brings his blade down on {foe}");
    },
    bulwark: function() {
        user.bulwark = C.bulwarkBlocks;
        logLine([tag("block", "Bulwark"), fill("{hero} sets his feet and gets everything behind the shield.")], "");
        playSound("block");
        playSound("chains");
    },
    lastRites: function() {
        const amount = healHero(Math.round(user.maxLife * C.lastRitesHeal));
        user.wound = null;
        logLine([tag("heal", "Last Rites"), fill("{hero} says the rites over himself. "), num("heal", "+" + amount + " life"), "."], "");
        playSound("heal");
    },
    judgment: function() {
        const finish = zombie.life <= zombie.maxLife * C.judgmentUnder;
        const power = finish ? C.judgmentFinish : C.judgmentPower;
        // Judgment finds the crack: whatever element it is weakest to.
        let element = "holy";
        for (const option of elementOrder) {
            if (elementMultiplier(option) > elementMultiplier(element)) {
                element = option;
            }
        }
        strike(skillPower(element) * power, element, finish ? "{hero} passes judgment on {foe}, and it was already dying" : "{hero} passes judgment on {foe}");
    },
    consecrate: function() {
        startHolyGround();
        logLine([tag("holy", "Holy Ground"), fill("{hero} pours holy water in a ring around {foe}. The ground starts to smoke.")], "");
        playSound("holy");
    }
};

// --- Damage ---

export function elementMultiplier(element) {
    if (zombie.weak.includes(element)) {
        return hasRelic("blessedSalt") ? C.saltMultiplier : C.weakMultiplier;
    }
    if (zombie.resist.includes(element)) {
        return C.resistMultiplier;
    }
    return 1;
}

// Every hit Aldric lands comes through here. The tags built up along the way
// are what the log shows, so the player can read why a number was that big.
function strike(damage, element, text, prefix, big) {
    if (game.shopPending || zombie.life <= 0) {
        return 0;   // Nothing is standing there until the cart has gone.
    }
    if (zombie.ward) {
        zombie.ward = false;
        logLine([tag("block", "Warded"), fill("The sigil on {foe} flares and takes the whole blow, then cracks.")], "miss");
        floatText("enemy", "Warded", "steel");
        playSound("block");
        return 0;
    }
    const tags = prefix ? [prefix] : [];
    if (element !== "steel") {
        tags.push(tag(element, element));
    }

    if (user.fury > 0) {
        damage = damage * C.furyMultiplier;
        user.fury = user.fury - 1;
        tags.push(tag("crit", "Fury"));
    }
    if (has("martyr") && user.life < user.maxLife / 2) {
        damage = damage * C.martyrMultiplier;
        tags.push(tag("blood", "Martyr"));
    }

    if (hasRelic("executionerHood") && zombie.life <= zombie.maxLife * C.executeUnder) {
        damage = damage * C.executeMultiplier;
        tags.push(tag("blood", "Execute"));
    }

    const crit = roll() <= (hasRelic("gamblerDie") ? C.gamblerCrit : C.critChance);
    if (crit) {
        damage = damage * C.critMultiplier;
        tags.push(tag("crit", "Crit"));
    }

    const multiplier = elementMultiplier(element);
    if (multiplier > 1) {
        tags.push(tag(element, "Weak x" + multiplier));
    } else if (multiplier < 1) {
        tags.push(tag("block", "Resisted"));
    }

    damage = Math.max(1, Math.round(damage * multiplier) - zombie.hide);
    hitZombie(damage);
    logLine([tags, fill(text), " for ", num(element, damage), crit ? "!" : "."], crit || big ? "big" : "");
    floatText("enemy", damage, element, crit);
    shakeBox("enemy", crit);
    playSound(crit ? "crit" : elementSounds[element]);
    if (crit || roll() <= 4) {
        playSound("demonHurt", crit ? 1 : 0.6);
    }
    if (crit) {
        freeze(C.critFreeze);
    }
    return damage;
}

// Only the life it actually had counts toward the score. Overkill is free.
function hitZombie(damage) {
    const counted = Math.max(0, Math.min(damage, zombie.life));
    game.runDamage = game.runDamage + counted;
    zombie.life = zombie.life - damage;
    checkBossPhase();
}

function checkBossPhase() {
    if (zombie.boss && zombie.phase === 1 && zombie.life > 0 && zombie.life <= zombie.maxLife / 2) {
        zombie.phase = 2;
        logLine([tag("wave", "Phase 2"), zombie.phaseTwo], "boss-line");
        playSound("phaseTwo");
        shakeBox("enemy", true);
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
            logLine([tag("block", "No Blood"), fill("{Foe} has no blood left to lose.")], "miss");
        }
        return;
    }
    zombie.effects.bleed = C.bleedTurns;
    zombie.effects.bleedDamage = Math.round(skillPower("blood") * C.bleedPower);
    logLine([tag("blood", "Bleeding"), fill("{Foe} is opened up and bleeding.")], "");
    playSound("gore");
}

function startBurn() {
    if (zombie.life <= 0) {
        return;
    }
    zombie.effects.burn = C.burnTurns;
    zombie.effects.burnDamage = Math.round(skillPower("fire") * C.burnPower);
    logLine([tag("fire", "Burning"), fill("{Foe} catches and burns.")], "");
    playSound("ignite");
}

function startHolyGround() {
    zombie.effects.holy = C.holyGroundTurns;
    zombie.effects.holyDamage = Math.round(skillPower("holy") * C.holyGroundPower);
}

// Everything still burning, bleeding or standing on holy ground bites at the
// start of the demon's turn, and still counts against its weaknesses.
function tickDemonEffects() {
    const effects = zombie.effects;

    if (effects.burn > 0 && zombie.life > 0) {
        effects.burn = effects.burn - 1;
        const damage = Math.max(1, Math.round(effects.burnDamage * elementMultiplier("fire")));
        hitZombie(damage);
        logLine([tag("fire", "Burning"), fill("{Foe} burns for "), num("fire", damage), "."], "");
        floatText("enemy", damage, "fire");
        playSound("fire", 0.5);
    }

    if (effects.bleed > 0 && zombie.life > 0) {
        effects.bleed = effects.bleed - 1;
        const damage = Math.max(1, Math.round(effects.bleedDamage * elementMultiplier("blood")));
        hitZombie(damage);
        logLine([tag("blood", "Bleeding"), fill("{Foe} bleeds for "), num("blood", damage), "."], "");
        floatText("enemy", damage, "blood");
        playSound("bleed", 0.5);
        playSound("gore", 0.5);
    }

    if (effects.holy > 0 && zombie.life > 0) {
        effects.holy = effects.holy - 1;
        const damage = Math.max(1, Math.round(effects.holyDamage * elementMultiplier("holy")));
        hitZombie(damage);
        const healed = healHero(Math.round(user.maxLife * C.holyGroundHeal));
        logLine([tag("holy", "Holy Ground"), fill("The ground burns {foe} for "), num("holy", damage), fill(" and steadies {hero} for "), num("heal", "+" + healed), "."], "");
        floatText("enemy", damage, "holy");
    }

    if (hasPerk("regenerating") && zombie.life > 0 && zombie.life < zombie.maxLife) {
        const healed = Math.min(zombie.maxLife - zombie.life, Math.max(1, Math.round(zombie.maxLife * C.regenHeal)));
        zombie.life = zombie.life + healed;
        logLine([tag("rot", "Regenerating"), fill("{Foe}'s wounds close up. "), num("heal", "+" + healed), "."], "");
        floatText("enemy", "+" + healed, "heal");
    }
}

// --- The demon's turn ---

// Picks whichever of its two kinds of attack Aldric is worse at taking. Its
// second kind hits a little softer, so it only switches when that pays.
function demonElement() {
    const main = 1 - heroResist(zombie.element);
    const alt = (1 - heroResist(zombie.alt)) * C.altPower;
    return alt > main ? zombie.alt : zombie.element;
}

// Decides the demon's next turn, so the card can show it coming.
function planIntent() {
    if (zombie.life <= 0) {
        zombie.intent = null;
    } else if (zombie.windup) {
        zombie.intent = { kind: "heavy", element: demonElement() };
    } else if (zombie.boss && zombie.turns > 0 && zombie.calm <= 0 && roll() <= C.windupChance) {
        zombie.intent = { kind: "windup", element: demonElement() };
    } else {
        zombie.intent = { kind: "attack", element: demonElement() };
    }
}

// What a blow does once everything is counted. A single hit can never take
// more than a set share of his life, so nothing one-shots him from full.
function demonDamage(element, heavy, base) {
    let damage = base;
    if (zombie.phase === 2) {
        damage = damage * C.phaseTwoAttack;
    }
    if (heavy) {
        damage = damage * C.heavyMultiplier;
    }
    if (hasPerk("frenzied") && zombie.life < zombie.maxLife / 2) {
        damage = damage * C.frenzyMultiplier;
    }
    if (element !== zombie.element) {
        damage = damage * C.altPower;
    }
    damage = damage * (1 - heroResist(element));
    const cap = user.maxLife * (heavy ? C.maxHeavyShare : C.maxHitShare);
    return Math.max(1, Math.round(Math.min(damage, cap)));
}

// What the card shows: the next move, and the range it will land in.
export function intentPreview() {
    const intent = zombie.intent;
    if (intent === null || zombie.life <= 0) {
        return null;
    }
    const heavy = intent.kind === "heavy";
    const spreadBy = spread(zombie.attack);
    return {
        kind: intent.kind,
        element: intent.element,
        min: demonDamage(intent.element, heavy, zombie.attack - spreadBy),
        max: demonDamage(intent.element, heavy, zombie.attack + spreadBy)
    };
}

function zombieTurn() {
    const intent = zombie.intent === null ? { kind: "attack", element: zombie.element } : zombie.intent;

    if (zombie.stun > 0) {
        zombie.stun = zombie.stun - 1;
        const text = zombie.windup ? "{Foe} reels, and the blow never comes." : "{Foe} reels and loses its turn.";
        zombie.windup = false;
        logLine([tag("steel", "Stunned"), fill(text)], "");
        return;
    }

    if (intent.kind === "windup") {
        // A boss telegraphs its big hit, which gives you one turn to answer it.
        zombie.windup = true;
        zombie.turns = zombie.turns + 1;
        logLine([tag("wave", "Warning"), fill(zombie.windupText), " ", strong("Heavy blow next turn.")], "warning");
        playSound("windup");
        return;
    }

    const heavy = intent.kind === "heavy";
    if (heavy) {
        zombie.windup = false;
        zombie.calm = C.windupRest;
    }
    zombie.turns = zombie.turns + 1;
    zombie.calm = Math.max(0, zombie.calm - 1);

    demonBlow(intent.element, heavy, 1);
    if (heavy === false && user.life > 0 && hasPerk("swift") && roll() <= C.swiftChance) {
        logLine([tag("crit", "Swift"), fill("{Foe} is already coming again.")], "");
        demonBlow(intent.element, false, 0.5);
    }
}

function demonBlow(element, heavy, share) {
    const base = rollDamage(zombie.attack - spread(zombie.attack), zombie.attack + spread(zombie.attack));
    const damage = Math.max(1, Math.round(demonDamage(element, heavy, base) * share));
    let text;
    if (heavy) {
        text = zombie.heavy;
    } else if (element === zombie.element) {
        text = pick(zombie.phase === 2 ? zombie.attacksTwo : zombie.attacks);
    } else {
        text = pick(altAttacks[element]);
    }

    // Bulwark stops anything. Armour cannot stop a wound up blow, or a demon
    // that goes for the joints.
    if (user.bulwark > 0) {
        user.bulwark = user.bulwark - 1;
        const left = user.bulwark > 0 ? " It holds for one more." : " The wall comes down.";
        logLine([tag("block", "Bulwark"), fill("{Foe} hits nothing but iron."), left], "");
        playSound("block");
        floatText("hero", "Blocked", "steel");
        return;
    }

    if (heavy === false && hasPerk("piercing") === false && roll() <= blockChance()) {
        logLine([tag("block", "Blocked"), fill("{Foe}'s blow skids off {hero}'s {armour}.")], "");
        playSound("block");
        floatText("hero", "Blocked", "steel");
        if (has("riposte")) {
            const best = bestElement();
            strike(attackWith(best), best, "{hero} turns it and cuts back at {foe}", tag("steel", "Riposte"));
        }
        return;
    }

    hurtHero(damage, element, [tag(element, heavy ? "Heavy" : element), fill(text)], heavy);

    if (hasPerk("vampiric") && zombie.life > 0) {
        const healed = Math.min(zombie.maxLife - zombie.life, Math.round(damage * C.vampiricHeal));
        if (healed > 0) {
            zombie.life = zombie.life + healed;
            logLine([tag("blood", "Vampiric"), fill("{Foe} drinks. "), num("heal", "+" + healed), "."], "");
            floatText("enemy", "+" + healed, "heal");
        }
    }
    if (hasPerk("hexer") && user.faith > 0) {
        spendFaith(Math.min(user.faith, C.hexFaith));
        logLine([tag("shadow", "Hexed"), fill("{Foe} mutters, and the prayer goes out of {hero}'s head. "), num("shadow", "-" + C.hexFaith + " Faith"), "."], "");
    }

    const woundChance = hasPerk("venomous") ? C.venomWoundChance : C.woundChance;
    if (user.life > 0 && user.wound === null && hasRelic("plagueMask") === false && roll() <= woundChance) {
        user.wound = { element: element, turns: C.woundLength };
        logLine([tag(element, woundNames[element]), woundStarts[element], " (" + C.woundLength + " turns)"], "");
        playSound(element === "fire" ? "ignite" : "gore", 0.8);
    }
}

// --- Waves ---

// Potions are no longer handed out between waves. The pardoner's cart is the
// only place to get more.
function spawnNextDemon() {
    game.wave = game.wave + 1;
    setupWave();
}

// Picks who walks in for this wave and scales them to it.
function setupWave() {
    const wave = game.wave;
    const boss = wave % C.bossEvery === 0;
    let demon;
    let secondTime = false;

    if (boss) {
        // The bosses take turns in order, then come back for a rematch.
        const bossNumber = Math.floor(wave / C.bossEvery) - 1;
        demon = bosses[bossNumber % bosses.length];
        secondTime = bossNumber >= bosses.length;
    } else {
        // The waves between bosses walk down the demons list in order.
        const step = wave - Math.floor(wave / C.bossEvery);
        demon = demons[(step - 1) % demons.length];
    }

    zombie.name = demon.name;
    zombie.epithet = demon.epithet;
    zombie.nick = demon.nick;
    zombie.type = demon.type;
    zombie.element = demon.element;
    zombie.alt = demon.alt;
    // Copies, because the perks below add to them.
    zombie.weak = demon.weak.slice();
    zombie.resist = demon.resist.slice();
    zombie.bleeds = demon.bleeds;
    zombie.attacks = demon.attacks;
    zombie.attacksTwo = demon.attacksTwo ? demon.attacksTwo : demon.attacks;
    zombie.arrives = secondTime && demon.again ? demon.again : demon.arrives;
    zombie.sound = demon.sound;
    zombie.boss = boss;
    zombie.windupText = demon.windupText;
    zombie.heavy = demon.heavy;
    zombie.phaseTwo = demon.phaseTwo;
    zombie.dies = demon.dies;

    const deep = Math.max(0, wave - C.growthFrom);
    let life = (C.baseDemonLife + (wave - 1) * C.lifePerWave) * Math.pow(C.lifeGrowth, deep);
    let attack = (C.baseDemonAttack + (wave - 1) * C.attackPerWave) * Math.pow(C.attackGrowth, deep);
    if (boss) {
        const bossNumber = Math.floor(wave / C.bossEvery) - 1;
        life = Math.round(life * C.bossLife[Math.min(bossNumber, C.bossLife.length - 1)]);
        attack = Math.round(attack * C.bossAttack[Math.min(bossNumber, C.bossAttack.length - 1)]);
    }
    zombie.maxLife = Math.round(life);
    zombie.life = Math.round(life);
    zombie.attack = Math.round(attack);
    zombie.phase = 1;
    zombie.stun = 0;
    zombie.windup = false;
    zombie.calm = 0;
    zombie.turns = 0;
    zombie.effects = { burn: 0, burnDamage: 0, bleed: 0, bleedDamage: 0, holy: 0, holyDamage: 0 };

    zombie.perks = rollPerks(perkCount(wave, boss));
    for (const id of zombie.perks) {
        const perk = perks[id];
        if (perk.resist) {
            zombie.resist.push(perk.resist);
        }
        if (perk.noBleed) {
            zombie.bleeds = false;
        }
    }
    zombie.ward = hasPerk("warded");
    zombie.hide = hasPerk("thickHide") ? C.hideBase + Math.floor(wave / C.hidePerWaves) : 0;
    planIntent();

    logWave();
    if (zombie.perks.length > 0) {
        logLine([tag("wave", "Perks"), zombie.perks.map(function(id) {
            return perks[id].name;
        }).join(", "), "."], "");
    }
    playSound(demon.sound);
    playSound("drum");
    if (boss) {
        flashScreen("red");
        playSound("bossRoar");
    }
    if (hasRelic("rosary")) {
        gainFaith(C.rosaryFaith);
        logLine([tag("holy", "Rosary"), fill("{hero} tells the beads before it reaches him. "), num("holy", "+" + C.rosaryFaith + " Faith"), "."], "");
    }
}

// --- Turn order ---

// Picks perks at random. A resist perk is skipped if the demon is weak to that
// element or resists it already, so a perk never cancels out a weakness, and
// none are handed out in the first few waves.
function rollPerks(count) {
    // Resist perks wait until he has had a chance to buy other weapons.
    const resistAllowed = game.wave >= C.resistPerkFrom;
    const options = Object.keys(perks).filter(function(id) {
        const element = perks[id].resist;
        if (element === undefined) {
            return true;
        }
        return resistAllowed && zombie.weak.includes(element) === false && zombie.resist.includes(element) === false;
    });
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    return options.slice(0, count);
}

// Called at the end of everything Aldric does.
function endTurn() {
    checkDemonDeath();
    if (game.gameOver === false && game.shopPending === false) {
        demonTurn();
    }
    refresh();
    offerChoice();
}

function demonTurn() {
    tickDemonEffects();
    if (checkDemonDeath() === false) {
        zombieTurn();
        if (checkDemonDeath() === false) {
            planIntent();
        }
    }
    tickWound();
    checkHeroDeath();
}

// Returns true if the demon died. The next one walks straight in, unless the
// pardoner's cart is due, in which case it waits until he has gone.
function checkDemonDeath() {
    if (game.shopPending) {
        return true;
    }
    if (zombie.life > 0) {
        return false;
    }
    zombie.life = 0;
    game.kills = game.kills + 1;
    playSound("kill");

    if (zombie.boss) {
        game.bossKills = game.bossKills + 1;
        logLine([tag("kill", "Boss Down"), zombie.dies, " ", num("crit", "+" + C.pointsPerBoss + " score")], "kill boss-line");
        flashScreen("gold");
        const drop = bossDrops[zombie.name];
        if (drop && equipWeapon(drop)) {
            logLine([tag("loot", "Spoils"), "He takes ", item(weapons[drop].name), " (+" + weapons[drop].attack + " " + weapons[drop].element + ")."], "");
            playSound("relic");
        }
    } else {
        logLine([tag("kill", "Kill"), fill(pick(killLines))], "kill");
    }

    if (has("zeal")) {
        gainFaith(C.zealFaith);
        logLine([tag("holy", "Zeal"), fill("Killing steadies {hero}. "), num("holy", "+" + C.zealFaith + " Faith"), "."], "");
    }
    if (has("fury")) {
        user.fury = C.furyHits;
        logLine([tag("crit", "Fury"), fill("{hero} has his blood up. The next " + C.furyHits + " hits land harder.")], "");
    }

    let gold = C.goldPerKill + game.wave * C.goldPerWave;
    if (zombie.boss) {
        gold = gold + C.goldPerBoss;
    }
    if (hasRelic("miserPurse")) {
        gold = Math.round(gold * C.miserGold);
    }
    user.gold = user.gold + gold;
    playSound("coins");
    floatText("hero", "+" + gold + "g", "loot");
    logLine([tag("loot", "Gold"), fill("{hero} goes through what is left. "), num("loot", "+" + gold + " gold"), "."], "");

    if (hasRelic("saintsBlood")) {
        const amount = healHero(Math.round(user.maxLife * C.saintsBloodHeal));
        logLine([tag("heal", "Saint's Blood"), "The vial warms in his hand. ", num("heal", "+" + amount + " life"), "."], "");
    }

    user.secondWindUsed = false;
    // Most Favor comes from kills, so finishing a demon quickly is never
    // worse for his rank than dragging the fight out.
    gainXP(zombie.boss ? C.xpKill * 3 : C.xpKill);
    // The cart turns up once early, then right before every boss and right after.
    if (zombie.boss || (game.wave + 1) % C.bossEvery === 0 || game.wave === C.firstShop) {
        game.shopPending = true;
    } else {
        spawnNextDemon();
    }
    return true;
}

function checkHeroDeath() {
    if (user.life > 0 || game.gameOver === true) {
        return;
    }

    if (has("miracle") && user.miracleUsed === false) {
        user.miracleUsed = true;
        user.life = Math.round(user.maxLife * C.miracleLife);
        user.wound = null;
        logLine([tag("holy", "Miracle"), fill("The bells of Varrow ring on their own. {hero} gets back up with "), num("heal", user.life + " life"), "."], "big");
        playSound("holy");
        playSound("rankUp");
        flashScreen("gold");
        return;
    }

    user.life = 0;
    game.gameOver = true;
    game.praying = false;
    game.scoreOpen = true;
    clearComboTimers();
    logLine(fill("{hero}, you feel the blood leaving your body. Your arms go heavy and your thoughts go slow. You will not see tomorrow, but maybe the end of it is a mercy. For now, you can rest."), "");
    if (user.level >= ranks.length) {
        logLine("Saint Aldric fell on wave " + game.wave + ". There is nothing left to forgive.", "verdict");
    } else {
        logLine("Aldric died a " + user.title + " on wave " + game.wave + ". His penance is not finished.", "verdict");
    }
    playSound("death");
    flashScreen("red");
    refresh();
}

// --- Ranks ---

// Aldric has just levelled up. Title, name, and any gear this rank brings.
function rankUp() {
    const rank = currentRank();
    const lastRank = ranks[user.level - 2];
    user.title = rank.title;
    user.name = rank.name;
    logRank(rank);
    playSound("rankUp");

    if (rank.weapon && equipWeapon(rank.weapon)) {
        const weapon = weapons[rank.weapon];
        logLine([tag("loot", "Loot"), "New weapon: ", item(weapon.name), " (+" + weapon.attack + " " + weapon.element + ")."], "");
    }
    if (rank.armour) {
        user.armour = rank.armour;
        logLine([tag("loot", "Loot"), "New armour: ", item(rank.armour.name), " (blocks " + rank.armour.block + " in 10)."], "");
    }
    if (C.weaponTiers.includes(user.level)) {
        logLine([tag("loot", "Cart"), shopkeeper.name + " will have heavier weapons on the cart now."], "");
    }
    if (rank.prayer > lastRank.prayer) {
        logLine([tag("holy", "Prayer"), "His prayers carry further now. They land ", num("holy", rank.prayer + " in 10"), "."], "");
    }
    if (user.level === C.prayerLevel) {
        logLine([tag("holy", "Remembered"), "He remembers the prayer to Saint Michael. His combo is the prayer now."], "");
    }
    if (rank.choices) {
        game.pendingChoices.push(user.level);
    }
}

// Held back until the prayer has finished and any earlier choice is settled,
// so two rank ups in one combo still get a ceremony each. The ceremony plays
// for a moment, then hands over to the choice of two skills.
let ceremonyTimer = null;
let ceremonyCount = 0;

function offerChoice() {
    if (game.gameOver || game.praying || game.choosing || game.shop !== null) {
        return;
    }
    if (game.pendingChoices.length === 0) {
        if (game.shopPending) {
            openShop();
        }
        return;
    }
    const level = game.pendingChoices[0];
    game.choosing = true;
    if (instant) {
        game.choiceLevel = level;
        return;
    }
    ceremonyCount = ceremonyCount + 1;
    game.ceremony = { level: level, id: ceremonyCount };
    flashScreen("gold");
    emberBurst();
    clearTimeout(ceremonyTimer);
    ceremonyTimer = setTimeout(function() {
        game.ceremony = null;
        game.choiceLevel = level;
        refresh();
    }, C.ceremonyTime);
    refresh();
}

function learnSkill(id) {
    const skill = skills[id];
    if (skill.kind === "skill") {
        user.skills.push(id);
        logLine([tag("loot", "Learned"), item(skill.name), ". " + skill.text], "");
    } else {
        user.blessings.push(id);
        logLine([tag("holy", "Blessing"), item(skill.name), ". " + skill.text], "");
    }
    playSound("choose");
}

// --- The pardoner's cart ---
// It opens once any rank up is settled, with a few relics Aldric does not own
// yet. The next demon only walks in when he leaves.

function openShop() {
    const unowned = Object.keys(relics).filter(function(id) {
        return hasRelic(id) === false;
    });
    // Shuffle, then take the first few.
    for (let i = unowned.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [unowned[i], unowned[j]] = [unowned[j], unowned[i]];
    }
    const stock = unowned.slice(0, C.shopSlots).map(function(id) {
        const price = Math.round(C.relicPrices[relics[id].rarity] * (1 + C.relicPriceGrowth * user.relics.length));
        return { type: "relic", id: id, price: price, sold: false };
    });
    // Weapons: only ones the cart carries at his rank, and only upgrades.
    const arms = Object.keys(weapons).filter(function(id) {
        const weapon = weapons[id];
        const current = weaponIn(weapon.element);
        return weapon.tier !== undefined && weapon.tier <= user.level && (current === null || weapon.attack > current.attack);
    });
    for (let i = arms.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arms[i], arms[j]] = [arms[j], arms[i]];
    }
    // Ansel has heard what is coming. Whatever the next boss is weak to goes
    // to the front of the cart.
    const nextBoss = bosses[(Math.ceil((game.wave + 1) / C.bossEvery) - 1) % bosses.length];
    arms.sort(function(a, b) {
        return (nextBoss.weak.includes(weapons[b].element) ? 1 : 0) - (nextBoss.weak.includes(weapons[a].element) ? 1 : 0);
    });
    const armsStock = arms.slice(0, C.weaponSlots).map(function(id) {
        // hint names the boss, when this weapon is what it is weak to.
        const hint = nextBoss.weak.includes(weapons[id].element) ? nextBoss.name : null;
        return { type: "weapon", id: id, price: weapons[id].price, sold: false, hint: hint };
    });
    stock.unshift(...armsStock);
    game.shop = { stock: stock, line: pick(shopkeeper.lines) };
    logLine([tag("loot", "Cart"), shopkeeper.arrives], "wave");
    playSound("cart");
    refresh();
}

// Puts a weapon in its element's slot if it beats what is there. Returns
// whether it did.
function equipWeapon(id) {
    const weapon = weapons[id];
    const current = weaponIn(weapon.element);
    if (current !== null && current.attack >= weapon.attack) {
        return false;
    }
    user.weapons[weapon.element] = id;
    return true;
}

export function buyItem(slot) {
    if (game.shop === null) {
        return;
    }
    const offer = game.shop.stock[slot];
    if (offer === undefined || offer.sold || user.gold < offer.price) {
        return;
    }
    user.gold = user.gold - offer.price;
    offer.sold = true;

    if (offer.type === "weapon") {
        const weapon = weapons[offer.id];
        equipWeapon(offer.id);
        logLine([tag("loot", "Weapon"), item(weapon.name), " (+" + weapon.attack + " " + weapon.element + ")."], "");
        playSound("coins");
        playSound("block");
        refresh();
        return;
    }

    const relic = relics[offer.id];
    user.relics.push(offer.id);

    // Most relics are checked when they matter. These two change him at once.
    if (offer.id === "whetstone") {
        user.attack = user.attack + C.whetstoneAttack;
    }
    if (offer.id === "pilgrimBadge") {
        user.maxLife = user.maxLife + C.badgeLife;
        healHero(C.badgeLife);
    }

    logLine([tag("loot", "Relic"), item(relic.name), ". " + relic.text], "");
    playSound("coins");
    playSound("relic");
    refresh();
}

export function potionPrice() {
    return C.potionPrice + game.wave * C.potionPricePerWave;
}

export function buyPotion() {
    if (game.shop === null || user.gold < potionPrice() || user.potions >= C.maxPotions) {
        return;
    }
    user.gold = user.gold - potionPrice();
    user.potions = user.potions + 1;
    playSound("coins");
    playSound("potion");
    refresh();
}

export function leaveShop() {
    if (game.shop === null) {
        return;
    }
    game.shop = null;
    game.shopPending = false;
    logLine(shopkeeper.leaves, "miss");
    playSound("cartLeave");
    spawnNextDemon();
    refresh();
    offerChoice();
}

// --- Actions the page calls ---
// The buttons are disabled at the moments these refuse, but checking here as
// well means nothing can slip through while the prayer is still going or a
// rank up is waiting to be answered.

export function canAct() {
    return game.gameOver === false && game.praying === false && game.choosing === false && game.shop === null;
}

export function attack(element) {
    if (canAct() && weaponIn(element) !== null) {
        heroAttack(element);
    }
}

export function pray() {
    if (canAct()) {
        heroPray();
    }
}

export function drinkPotion() {
    if (canAct()) {
        heroPotion();
    }
}

export function combo() {
    if (canAct()) {
        heroCombo();
    }
}

export function castSkill(id) {
    const skill = skills[id];
    if (canAct() === false || user.faith < skill.cost) {
        return;
    }
    spendFaith(skill.cost);
    skillEffects[id]();
    gainXP(C.xpSkill);
    endTurn();
}

export function chooseSkill(slot) {
    if (game.choosing === false || game.choiceLevel === null) {
        return;
    }
    const level = game.pendingChoices.shift();
    learnSkill(ranks[level - 1].choices[slot]);
    game.choosing = false;
    game.choiceLevel = null;
    refresh();
    offerChoice();
}

export function closeScoreForm() {
    game.scoreOpen = false;
    refresh();
}

// Wipes everything a run accumulates. Anything added to the hero or to the run
// state has to be reset here, or it leaks into the next run.
export function startGame() {
    const start = ranks[0];

    clearComboTimers();
    clearTimeout(ceremonyTimer);
    game.praying = false;
    game.choosing = false;
    game.pendingChoices = [];
    game.comboWasReady = false;
    game.ceremony = null;
    game.choiceLevel = null;

    user.title = start.title;
    user.name = start.name;
    user.weapons = { steel: start.weapon };
    user.armour = start.armour;
    user.maxLife = C.startLife;
    user.life = C.startLife;
    user.attack = C.startAttack;
    user.heal = C.startHeal;
    user.potions = C.startPotions;
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
    user.gold = 0;
    user.relics = [];

    game.shopPending = false;
    game.shop = null;
    game.wave = 1;
    game.gameOver = false;
    game.kills = 0;
    game.bossKills = 0;
    game.runDamage = 0;
    game.scoreOpen = false;
    game.runId = game.runId + 1;
    game.log = [];

    logRank(start);
    setupWave();
    refresh();
}
