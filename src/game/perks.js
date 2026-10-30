// Perks
// What the demons carry. Hell hands them out the way the pardoner hands out
// relics: each demon past the first walks in with one or more, picked at
// random, and more of them the deeper the run goes. Every number is in
// config.js. A perk with "resist" adds that element to the demon's
// resistances, unless the demon is weak to it.

import * as C from "./config.js";

export const perks = {
    ironSkin: {
        name: "Iron Skin",
        resist: "steel",
        text: "Resists steel.",
        flavor: "Its hide has gone hard as a door."
    },
    salamander: {
        name: "Salamander Hide",
        resist: "fire",
        text: "Resists fire.",
        flavor: "It has crawled through a burning house and liked it."
    },
    unholy: {
        name: "Unholy Ward",
        resist: "holy",
        text: "Resists holy.",
        flavor: "Someone carved the old words into it backwards."
    },
    driedOut: {
        name: "Dried Out",
        resist: "blood",
        noBleed: true,
        text: "Resists blood, and cannot bleed.",
        flavor: "There is nothing left in it to spill."
    },
    vampiric: {
        name: "Vampiric",
        text: "Heals " + Math.round(C.vampiricHeal * 100) + "% of the damage it deals.",
        flavor: "It drinks while it fights."
    },
    regenerating: {
        name: "Regenerating",
        text: "Heals " + Math.round(C.regenHeal * 100) + "% of its life every turn.",
        flavor: "The cuts close while you watch."
    },
    venomous: {
        name: "Venomous",
        text: "Its hits wound " + C.venomWoundChance + " times in 10 instead of " + C.woundChance + ".",
        flavor: "Black spit, and teeth like needles."
    },
    frenzied: {
        name: "Frenzied",
        text: "Hits " + Math.round((C.frenzyMultiplier - 1) * 100) + "% harder once it is under half life.",
        flavor: "Hurting it only makes it angrier."
    },
    hexer: {
        name: "Hexer",
        text: "Every hit it lands drains " + C.hexFaith + " Faith.",
        flavor: "It mutters while it claws, and the prayers go out of your head."
    },
    swift: {
        name: "Swift",
        text: C.swiftChance + " in 10 chance to strike a second time for half damage.",
        flavor: "It is behind you before the first blow lands."
    },
    warded: {
        name: "Warded",
        text: "The first hit against it does nothing.",
        flavor: "A black sigil on its chest flares and cracks."
    },
    piercing: {
        name: "Armour-Piercing",
        text: "Your armour cannot block it.",
        flavor: "It goes for the joints."
    },
    thickHide: {
        name: "Thick Hide",
        text: "Every direct hit on it does " + C.hideBase + " less, plus 1 more every " + C.hidePerWaves + " waves.",
        flavor: "Layers of old fat and older scars."
    }
};

// How many a demon gets on a given wave. Bosses get one extra once the run
// is past the first boss.
export function perkCount(wave, boss) {
    let count = 0;
    for (const [from, n] of C.perkWaves) {
        if (wave >= from) {
            count = n;
        }
    }
    return count + (boss && wave >= C.bossPerkFrom ? 1 : 0);
}
