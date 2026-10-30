// Relics
// What Brother Ansel sells off his handcart between waves. Every one is
// passive and is checked by the rules in engine.js through hasRelic(). Most of
// them are almost certainly fake. They work anyway. "element" only sets the
// colour the card is drawn in.

import * as C from "./config.js";

export const shopkeeper = {
    name: "Brother Ansel",
    title: "The Pardoner's Cart",
    arrives: "A pardoner pushes a handcart of relics through the smoke, ringing a little bell.",
    lines: [
        "Every one of these is genuine, sir knight. Mostly.",
        "Bones of the blessed, half price for the damned.",
        "Gold is no use to a dead man. Spend it while you are only half dead."
    ],
    leaves: "The pardoner bows, takes up his cart, and is gone before the next one comes."
};

export const relics = {
    whetstone: {
        name: "Whetstone",
        rarity: "common",
        element: "steel",
        text: "+" + C.whetstoneAttack + " attack for the rest of the run.",
        flavor: "Said to have sharpened the sword of Saint George. Every pardoner has one."
    },
    pilgrimBadge: {
        name: "Pilgrim's Badge",
        rarity: "common",
        element: "heal",
        text: "+" + C.badgeLife + " max life, and heal that much now.",
        flavor: "A tin scallop shell from Compostela, or near enough."
    },
    rosary: {
        name: "Bone Rosary",
        rarity: "common",
        element: "holy",
        text: "Start every wave with +" + C.rosaryFaith + " Faith.",
        flavor: "Fifty-nine beads, each one carved from a different martyr."
    },
    varrowRed: {
        name: "Bottle of Varrow Red",
        rarity: "common",
        element: "blood",
        text: "Potions heal " + Math.round((C.wineHeal - 1) * 100) + "% more.",
        flavor: "Blessed by a bishop, apparently. It tastes like the Crooked Man's cellar."
    },
    miserPurse: {
        name: "Miser's Purse",
        rarity: "common",
        element: "crit",
        text: "Kills drop " + Math.round((C.miserGold - 1) * 100) + "% more gold.",
        flavor: "Taken off a moneylender. He has no further use for it."
    },
    crackedShield: {
        name: "Cracked Shield",
        rarity: "uncommon",
        element: "steel",
        text: "Your armour blocks " + C.shieldBlock + " more hit in 10.",
        flavor: "Carried at Varrow bridge. The crack is where it saved a life."
    },
    lampOil: {
        name: "Flask of Lamp Oil",
        rarity: "uncommon",
        element: "fire",
        text: "Your ordinary hits have a " + C.lampOilChance + " in 10 chance to set it burning.",
        flavor: "Oil from the lamp that never went out in Saint Anselm's crypt."
    },
    executionerHood: {
        name: "Executioner's Hood",
        rarity: "uncommon",
        element: "blood",
        text: "Hits on anything under " + Math.round(C.executeUnder * 100) + "% life do " + C.executeMultiplier + "x.",
        flavor: "Black wool, still warm from the last head that wore it."
    },
    saintsBlood: {
        name: "Vial of Saint's Blood",
        rarity: "uncommon",
        element: "heal",
        text: "Every kill heals you " + Math.round(C.saintsBloodHeal * 100) + "% of your life.",
        flavor: "It liquefies on feast days. Today, as it happens, is a feast day."
    },
    blessedSalt: {
        name: "Blessed Salt",
        rarity: "rare",
        element: "holy",
        text: "Hitting a weakness does " + C.saltMultiplier + "x instead of 2x.",
        flavor: "From the pans at Saint Remy. The dead hate it more than they hate the living."
    },
    thornCrown: {
        name: "Crown of Thorns",
        rarity: "rare",
        element: "blood",
        text: "Whatever hits you takes " + Math.round(C.thornsReflect * 100) + "% of the damage back.",
        flavor: "A thorn from the true crown, woven into a lot of false ones."
    },
    leatherJerkin: {
        name: "Boiled Leather Jerkin",
        rarity: "common",
        element: "blood",
        resist: { blood: C.relicResist },
        text: "Resist " + Math.round(C.relicResist * 100) + "% of blood damage.",
        flavor: "Stiff as a board and twice as ugly. Teeth slide off it."
    },
    pomander: {
        name: "Pomander of Myrrh",
        rarity: "common",
        element: "rot",
        resist: { rot: C.relicResist },
        text: "Resist " + Math.round(C.relicResist * 100) + "% of rot damage.",
        flavor: "A silver ball of spices on a chain. You cannot catch what you cannot smell."
    },
    wolfskin: {
        name: "Wolfskin Mantle",
        rarity: "common",
        element: "frost",
        resist: { frost: C.relicResist },
        text: "Resist " + Math.round(C.relicResist * 100) + "% of frost damage.",
        flavor: "The wolf did not need it any more. The hound that killed it did not either."
    },
    salamanderCharm: {
        name: "Salamander Charm",
        rarity: "uncommon",
        element: "fire",
        resist: { fire: C.relicResist },
        text: "Resist " + Math.round(C.relicResist * 100) + "% of fire damage.",
        flavor: "A dried lizard in a glass bead. It is warm to the touch, and the fire knows it."
    },
    benedictMedal: {
        name: "Saint Benedict's Medal",
        rarity: "uncommon",
        element: "shadow",
        resist: { shadow: C.relicResist },
        text: "Resist " + Math.round(C.relicResist * 100) + "% of shadow damage.",
        flavor: "Vade retro, it says on the back. Begone. Sometimes they listen."
    },
    plagueMask: {
        name: "Plague Doctor's Mask",
        rarity: "rare",
        element: "rot",
        text: "You can no longer be wounded.",
        flavor: "Packed with lavender and myrrh. The doctor who wore it lived to be ninety."
    },
    gamblerDie: {
        name: "Loaded Die",
        rarity: "rare",
        element: "crit",
        text: "Your hits crit " + C.gamblerCrit + " times in 10 instead of 1.",
        flavor: "One of the dice the soldiers threw at Calvary. It always comes up six."
    }
};
