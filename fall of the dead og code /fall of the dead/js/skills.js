// Skills
// The eighteen rewards, two offered at each rank up. A "skill" costs Faith and
// gets its own button; a "blessing" is passive and is checked by the rules in
// hero.js and combat.js through user.has(). "element" only sets the colour the
// button and the choice card are drawn in.

const skills = {
    confession: {
        name: "Confession",
        kind: "blessing",
        element: "holy",
        text: "Prayers land 1 more time in 10, and every prayer closes your wound.",
        flavor: "He tells the priest all of it. It takes most of the night."
    },
    hardLiver: {
        name: "Hard Liver",
        kind: "blessing",
        element: "rot",
        text: "Wounds do half damage to you.",
        flavor: "Three years of bad wine. Poison has to get in line."
    },
    shieldBash: {
        name: "Shield Bash",
        kind: "skill",
        cost: 2,
        element: "steel",
        text: "Hit for your attack and stun it. It loses its next move, even a wound up blow.",
        flavor: "Learned in a tavern, not a tourney.",
        use: function() {
            strike(user.totalAttack(), "steel", "{hero} smashes a battered shield into {foe}");
            if (zombie.life > 0) {
                zombie.stun = 1;
                logLine(tag("steel", "Stunned") + fill("{Foe} staggers back."), "");
                playSound("stun");
            }
        }
    },
    rend: {
        name: "Rend",
        kind: "skill",
        cost: 2,
        element: "steel",
        text: "Hit for your attack and leave it bleeding for " + bleedTurns + " turns. Bloodless things do not bleed.",
        flavor: "Aim for the soft parts and pull.",
        use: function() {
            strike(user.totalAttack(), "steel", "{hero} tears a long cut across {foe}");
            startBleed();
        }
    },
    bloodletting: {
        name: "Bloodletting",
        kind: "blessing",
        element: "blood",
        text: "Your ordinary hits have a 3 in 10 chance to leave it bleeding.",
        flavor: "Hugh shows him where the big veins run."
    },
    zeal: {
        name: "Zeal",
        kind: "blessing",
        element: "holy",
        text: "Every kill gives you 2 Faith.",
        flavor: "Each one he puts down makes the next prayer come easier."
    },
    holyFire: {
        name: "Holy Fire",
        kind: "skill",
        cost: 3,
        element: "fire",
        text: "Hit for 1.8x your attack in fire and set it burning for 3 turns.",
        flavor: "Lamp oil, a rag, and a blessing over the top.",
        use: function() {
            strike(user.totalAttack() * holyFirePower, "fire", "{hero} smashes a burning lamp over {foe}");
            startBurn();
        }
    },
    smite: {
        name: "Smite",
        kind: "skill",
        cost: 3,
        element: "holy",
        text: "Hit for 3.5x your attack in holy damage.",
        flavor: "The Abbot's blessing, all of it at once.",
        use: function() {
            strike(user.totalAttack() * smitePower, "holy", "{hero} says the blessing and brings his blade down on {foe}");
        }
    },
    fury: {
        name: "Fury",
        kind: "blessing",
        element: "crit",
        text: "After every kill your next 3 hits do 50% more.",
        flavor: "Somewhere in the third year he stopped getting tired."
    },
    vigil: {
        name: "Vigil",
        kind: "blessing",
        element: "steel",
        text: "Your armour blocks 1 more hit in 10.",
        flavor: "He sleeps in his mail now, when he sleeps."
    },
    bulwark: {
        name: "Bulwark",
        kind: "skill",
        cost: 3,
        element: "steel",
        text: "The next 2 attacks on you do nothing at all, heavy blows included.",
        flavor: "Plant your feet and let them break on you.",
        use: function() {
            user.bulwark = bulwarkBlocks;
            logLine(tag("block", "Bulwark") + fill("{hero} sets his feet and gets everything behind the shield."), "");
            playSound("block");
        }
    },
    lastRites: {
        name: "Last Rites",
        kind: "skill",
        cost: 3,
        element: "heal",
        text: "Heal 40% of your life and close your wound.",
        flavor: "He has said them over enough men to know them cold.",
        use: function() {
            const amount = healHero(Math.round(user.maxLife * lastRitesHeal));
            user.wound = null;
            logLine(tag("heal", "Last Rites") + fill("{hero} says the rites over himself. ") + num("heal", "+" + amount + " life") + ".", "");
            playSound("heal");
        }
    },
    riposte: {
        name: "Riposte",
        kind: "blessing",
        element: "steel",
        text: "When your armour blocks a hit you cut straight back for your attack.",
        flavor: "Every opening is an invitation."
    },
    secondWind: {
        name: "Second Wind",
        kind: "blessing",
        element: "heal",
        text: "Once a wave, when you drop under a quarter life, you heal 40%.",
        flavor: "Not yet, he thinks. Not here."
    },
    judgment: {
        name: "Judgment",
        kind: "skill",
        cost: 4,
        element: "holy",
        text: "Hit for 2.5x your attack in holy damage, or 5x if it is already under 40% life.",
        flavor: "The Order's last word on the matter.",
        use: function() {
            const finish = zombie.life <= zombie.maxLife * judgmentUnder;
            const power = finish ? judgmentFinish : judgmentPower;
            strike(user.totalAttack() * power, "holy", finish ? "{hero} passes judgment on {foe}, and it was already dying" : "{hero} passes judgment on {foe}");
        }
    },
    consecrate: {
        name: "Consecrate",
        kind: "skill",
        cost: 4,
        element: "holy",
        text: "For 4 turns the ground burns it for your attack and heals you 8% each turn.",
        flavor: "He pours the holy water in a circle and stands in the middle of it.",
        use: function() {
            startHolyGround();
            logLine(tag("holy", "Holy Ground") + fill("{hero} pours holy water in a ring around {foe}. The ground starts to smoke."), "");
            playSound("holy");
        }
    },
    miracle: {
        name: "Miracle",
        kind: "blessing",
        element: "holy",
        text: "Once a run, when you die, you get back up with half your life.",
        flavor: "The bells ring on their own, and he opens his eyes."
    },
    martyr: {
        name: "Martyrdom",
        kind: "blessing",
        element: "blood",
        text: "While you are under half life, everything you do lands for double.",
        flavor: "He stopped being frightened of dying a long time ago."
    }
};
