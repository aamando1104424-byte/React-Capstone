// Balance bot
// Plays the real engine headless, many runs in a row, and prints how far the
// runs got. Three players: "smart" uses every weapon, skill and relic the way a
// decent player would; "casual" buys whatever it can afford and swings the
// weapon the hotbar marks as best; "naive" only ever swings the sword and
// drinks potions. If the game is balanced, smart players get a long fair
// fight, casual ones a decent one, and naive ones die early.
//
//   node tools/balance.mjs            300 runs of each
//   node tools/balance.mjs 1000 casual

import * as E from "../src/game/engine.js";
import * as C from "../src/game/config.js";
import { ranks } from "../src/game/content.js";
import { skills } from "../src/game/skills.js";
import { relics } from "../src/game/relics.js";
import { weapons, elementOrder } from "../src/game/weapons.js";

const game = E.game;
const user = game.user;
const zombie = game.zombie;
E.setInstant(true);

const runs = Number(process.argv[2] || 300);
const only = process.argv[3];

// Skills a decent player reaches for, best first.
const skillTaste = [
    "smite", "holyFire", "lastRites", "judgment", "rend", "shieldBash", "bulwark", "consecrate",
    "secondWind", "zeal", "confession", "riposte", "bloodletting", "fury", "vigil", "hardLiver", "miracle", "martyr"
];

function chooseSkill(style) {
    const choices = ranks[game.choiceLevel - 1].choices;
    let slot = 0;
    if (style === "naive" || Math.random() < 0.25) {
        slot = Math.floor(Math.random() * 2);
    } else {
        slot = skillTaste.indexOf(choices[0]) <= skillTaste.indexOf(choices[1]) ? 0 : 1;
    }
    E.chooseSkill(slot);
}

// What the next few demons will hit with, so the bot shops for it.
function shop(style) {
    const stock = game.shop.stock;
    function buy(i) {
        E.buyItem(i);
    }
    if (style === "casual") {
        while (user.potions < 2 && user.gold >= E.potionPrice()) {
            E.buyPotion();
        }
        // Half the time a casual player notices the cart's hint about the boss.
        const order = stock.map(function(offer, i) {
            return i;
        }).sort(function(a, b) {
            if (Math.random() < 0.5) {
                return (stock[b].hint ? 1 : 0) - (stock[a].hint ? 1 : 0);
            }
            return Math.random() - 0.5;
        });
        for (const i of order) {
            if (stock[i].sold === false && user.gold >= stock[i].price) {
                buy(i);
            }
        }
        E.leaveShop();
        return;
    }
    if (style === "naive") {
        while (user.potions < 3 && user.gold >= E.potionPrice() && user.potions < C.maxPotions) {
            E.buyPotion();
        }
        E.leaveShop();
        return;
    }
    // One potion in hand first, then any weapon that fills an empty slot.
    while (user.potions < 1 && user.gold >= E.potionPrice()) {
        E.buyPotion();
    }
    stock.forEach(function(offer, i) {
        if (offer.type === "weapon" && E.weaponIn(weapons[offer.id].element) === null && user.gold >= offer.price) {
            buy(i);
        }
    });
    while (user.potions < 2 && user.gold >= E.potionPrice()) {
        E.buyPotion();
    }
    // Score every offer and buy the best ones it can afford.
    const scored = stock.map(function(offer, i) {
        let value = 0;
        if (offer.type === "weapon") {
            const weapon = weapons[offer.id];
            const current = E.weaponIn(weapon.element);
            value = current === null ? 100 : 30 + (weapon.attack - current.attack) * 6;
        } else {
            const relic = relics[offer.id];
            value = relic.resist ? 55 : 45;
            if (offer.id === "blessedSalt" || offer.id === "whetstone" || offer.id === "pilgrimBadge") {
                value = 60;
            }
        }
        return { i: i, value: value / offer.price };
    }).sort(function(a, b) {
        return b.value - a.value;
    });
    for (const { i } of scored) {
        if (stock[i].sold === false && user.gold >= stock[i].price) {
            buy(i);
        }
    }
    while (user.potions < 4 && user.gold >= E.potionPrice() + 20) {
        E.buyPotion();
    }
    E.leaveShop();
}

function act(style) {
    const preview = E.intentPreview();
    const danger = preview === null ? 0 : preview.max + (user.wound ? E.woundDamage() : 0);
    // Can it be finished before it finishes him? Then keep swinging.
    const best = E.bestElement();
    const swing = E.attackWith(best) * E.elementMultiplier(best);
    const killable = zombie.life <= swing * 0.9 || (zombie.life <= swing * 1.8 && user.life > danger * 1.5);
    const low = killable === false && user.life <= Math.max(user.maxLife * 0.35, danger * 1.2);

    if (style === "casual") {
        if (low && user.potions > 0) {
            return E.drinkPotion();
        }
        if (user.faith >= C.comboCost) {
            return E.combo();
        }
        const usable = user.skills.filter(function(id) {
            return user.faith >= skills[id].cost;
        });
        if (usable.length > 0 && Math.random() < 0.3) {
            return E.castSkill(usable[Math.floor(Math.random() * usable.length)]);
        }
        return E.attack(E.bestElement());
    }
    if (style === "naive") {
        if (low && user.potions > 0) {
            return E.drinkPotion();
        }
        if (low && user.life < user.maxLife * 0.2) {
            return E.pray();
        }
        if (user.faith >= C.comboCost) {
            return E.combo();
        }
        return E.attack("steel");
    }

    const owns = function(id) {
        return user.skills.includes(id) && user.faith >= skills[id].cost;
    };

    if (low) {
        if (owns("lastRites")) {
            return E.castSkill("lastRites");
        }
        if (user.potions > 0) {
            return E.drinkPotion();
        }
        if (owns("bulwark") && user.bulwark === 0) {
            return E.castSkill("bulwark");
        }
        if (E.prayerChance() >= 4 && user.faith < C.comboCost) {
            return E.pray();
        }
    }
    if (preview && preview.kind === "heavy") {
        if (owns("shieldBash")) {
            return E.castSkill("shieldBash");
        }
        if (owns("bulwark") && user.bulwark === 0) {
            return E.castSkill("bulwark");
        }
    }

    // Otherwise, whatever does the most damage this turn, counting the burn
    // and bleed that will tick after it.
    const options = [];
    options.push({ value: E.attackWith(best) * E.elementMultiplier(best), run: function() { E.attack(best); } });
    if (user.faith >= C.comboCost) {
        const combo = user.level >= C.prayerLevel
            ? E.skillPower("holy") * C.comboMultiplier * 3 * E.elementMultiplier("holy")
            : E.attackWith(best) * 3 * E.elementMultiplier(best);
        options.push({ value: combo / 1.6, run: E.combo });
    }
    const skillValue = {
        smite: E.skillPower("holy") * C.smitePower * E.elementMultiplier("holy"),
        holyFire: E.skillPower("fire") * (C.holyFirePower + (zombie.effects.burn > 0 ? 0 : C.burnPower * 3)) * E.elementMultiplier("fire"),
        rend: E.skillPower("blood") * (1 + (zombie.bleeds && zombie.effects.bleed === 0 ? C.bleedPower * 3 : 0)) * E.elementMultiplier("blood"),
        judgment: E.skillPower("holy") * (zombie.life <= zombie.maxLife * C.judgmentUnder ? C.judgmentFinish : C.judgmentPower) * 1.5,
        consecrate: zombie.effects.holy > 0 ? 0 : E.skillPower("holy") * 4 * E.elementMultiplier("holy") * 0.8,
        shieldBash: E.skillPower("steel") * E.elementMultiplier("steel") * 1.4
    };
    for (const id in skillValue) {
        if (owns(id)) {
            // Faith is worth about a swing a point.
            options.push({ value: skillValue[id] / (skills[id].cost * 0.45), run: function() { E.castSkill(id); } });
        }
    }
    options.sort(function(a, b) {
        return b.value - a.value;
    });
    options[0].run();
}

// Watches every hit Aldric takes, to catch anything close to a one-shot.
function playRun(style) {
    E.startGame();
    let worstHit = 0;
    let steps = 0;
    let lastLife = user.life;
    while (game.gameOver === false && steps < 20000) {
        steps = steps + 1;
        if (game.choiceLevel !== null) {
            chooseSkill(style);
        } else if (game.shop !== null) {
            shop(style);
        } else {
            lastLife = user.life;
            const maxBefore = user.maxLife;
            act(style);
            worstHit = Math.max(worstHit, (lastLife - user.life) / maxBefore);
        }
    }
    return { wave: game.wave, level: user.level, score: E.getScore(), worstHit: worstHit, steps: steps, weapons: Object.keys(user.weapons).length };
}

function percentile(list, p) {
    const sorted = list.slice().sort(function(a, b) {
        return a - b;
    });
    return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

for (const style of ["smart", "casual", "naive"]) {
    if (only && only !== style) {
        continue;
    }
    const results = [];
    for (let i = 0; i < runs; i++) {
        results.push(playRun(style));
    }
    const waves = results.map(function(r) { return r.wave; });
    const levels = results.map(function(r) { return r.level; });
    const worst = results.map(function(r) { return r.worstHit; });
    const byWave = {};
    for (const w of waves) {
        const bucket = Math.min(30, Math.floor((w - 1) / 5) * 5 + 1);
        byWave[bucket] = (byWave[bucket] || 0) + 1;
    }
    console.log("\n" + style.toUpperCase() + " (" + runs + " runs)");
    console.log("  wave reached  median " + percentile(waves, 0.5) + "   p10 " + percentile(waves, 0.1) + "   p90 " + percentile(waves, 0.9) + "   best " + Math.max(...waves));
    console.log("  rank reached  median " + percentile(levels, 0.5) + "   Saint " + Math.round(levels.filter(function(l) { return l === ranks.length; }).length / runs * 100) + "%");
    console.log("  past boss 1 " + Math.round(waves.filter(function(w) { return w > 5; }).length / runs * 100) + "%   past boss 2 " + Math.round(waves.filter(function(w) { return w > 10; }).length / runs * 100) + "%   past boss 3 " + Math.round(waves.filter(function(w) { return w > 15; }).length / runs * 100) + "%   past wave 20 " + Math.round(waves.filter(function(w) { return w > 20; }).length / runs * 100) + "%");
    console.log("  weapons owned at death  avg " + (results.reduce(function(a, r) { return a + r.weapons; }, 0) / runs).toFixed(1));
    console.log("  worst single turn  " + Math.round(Math.max(...worst) * 100) + "% of max life (p99 " + Math.round(percentile(worst, 0.99) * 100) + "%)");
    console.log("  deaths by wave     " + Object.entries(byWave).map(function([k, v]) { return k + "-" + (Number(k) + 4) + ": " + v; }).join("  "));
}
