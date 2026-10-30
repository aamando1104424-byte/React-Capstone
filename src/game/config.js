// Config
// Every number the game is balanced with. The How to Play screen is built from
// these at runtime, so the help text can never drift out of date.

// Chances are rolled out of 10.
export const critChance = 1;
export const woundChance = 3;
export const windupChance = 3;
export const bloodlettingChance = 3;

export const critMultiplier = 2;
export const weakMultiplier = 2;
export const resistMultiplier = 0.35;   // Resisted hits barely scratch it.
export const damageSpread = 0.2;        // Every hit rolls within 20% either way.

// Starting stats.
export const startLife = 100;
export const startAttack = 8;
export const startHeal = 30;
export const startPotions = 1;
export const maxPotions = 5;   // Capped, or late waves turn into a potion queue.

// Gained per rank.
export const xpPerLevel = 70;       // Favor for the first rank up,
export const xpPerLevelGrowth = 40; // and this much more for each rank after.
export const attackPerLevel = 4;
export const lifePerLevel = 15;
export const healPerLevel = 5;
export const xpAttack = 8;
export const xpSkill = 8;
export const xpCombo = 12;
export const xpKill = 45;          // Every kill, and a boss is worth this three times over.
export const prayerLevel = 5;   // Knight, where the combo becomes the prayer.

// Faith.
export const maxFaith = 6;
export const faithPerTurn = 1;
export const comboCost = 4;
export const comboHits = 3;
export const comboMultiplier = 1.4;
export const comboDelay = 2200;
export const amenPause = 1200;

// Damage over time, on both sides.
export const woundShare = 0.06;     // A wound takes this share of his max life each turn.
export const woundLength = 3;
export const bleedTurns = 3;
export const bleedPower = 0.5;
export const burnTurns = 3;
export const burnPower = 0.75;
export const holyGroundTurns = 4;
export const holyGroundPower = 1;
export const holyGroundHeal = 0.08;

// Skills and blessings.
export const zealFaith = 2;
export const furyHits = 3;
export const furyMultiplier = 1.5;
export const martyrMultiplier = 2;
export const vigilBlock = 1;
export const confessionPrayer = 1;
export const secondWindAt = 0.25;
export const secondWindHeal = 0.4;
export const miracleLife = 0.5;
export const lastRitesHeal = 0.4;
export const bulwarkBlocks = 2;
export const smitePower = 3;
export const holyFirePower = 1.8;
export const judgmentPower = 2.5;
export const judgmentFinish = 5;
export const judgmentUnder = 0.4;

// Demons. Life and attack climb with the wave number.
export const baseDemonLife = 60;
export const baseDemonAttack = 8;
export const lifePerWave = 22;
export const attackPerWave = 1.9;
export const growthFrom = 15;       // Past this wave, on top of the steady climb, demons grow
export const lifeGrowth = 1.1;      // this much stronger every wave, so the deep waves always
export const attackGrowth = 1.06;   // win in the end, Saint or not.
export const bossEvery = 5;
export const bossLife = [1.3, 1.6, 1.8];   // Per boss in order; the first is a gentler test.
export const bossAttack = [0.85, 1, 1.05];
export const phaseTwoAttack = 1.3;
export const heavyMultiplier = 1.8;
export const windupRest = 2;
export const altPower = 0.85;       // A demon's second kind of attack hits this much as hard.
export const maxHitShare = 0.25;    // No ordinary hit takes more than this share of his life,
export const maxHeavyShare = 0.4;   // and no heavy blow more than this, so nothing one-shots him.

// Demon perks. perkWaves is [from wave, how many]; bosses get one more.
export const perkWaves = [[2, 1], [8, 2], [15, 3]];
export const resistPerkFrom = 6;
export const bossPerkFrom = 10;
export const vampiricHeal = 0.35;
export const regenHeal = 0.025;
export const venomWoundChance = 6;
export const frenzyMultiplier = 1.3;
export const hexFaith = 1;
export const swiftChance = 3;
export const hideBase = 2;
export const hidePerWaves = 4;

// What he can shrug off. Armour, relics and two blessings add up to the cap.
export const resistCap = 0.6;
export const relicResist = 0.35;
export const hardLiverRot = 0.2;
export const vigilResist = 0.1;

// Score and saved data.
export const pointsPerKill = 100;
export const pointsPerBoss = 500;
export const boardSize = 10;
export const muteKey = "fallOfTheDeadMuted";

// Timing, in milliseconds.
export const critFreeze = 110;
export const ceremonyTime = 2100;
export const emberCount = 70;

// Gold and the pardoner's cart.
export const goldPerKill = 20;
export const goldPerWave = 2;       // On top of goldPerKill, times the wave cleared.
export const goldPerBoss = 50;      // A boss pays this on top of the normal kill.
export const shopSlots = 3;
export const firstShop = 2;          // One early visit, so he can buy a first weapon before the bosses.
export const weaponSlots = 2;       // Weapons on the cart, on top of the relics.
export const weaponTiers = [4, 7];  // Ranks where the cart starts carrying heavier weapons.
export const potionPrice = 20;
export const potionPricePerWave = 2;  // Potions cost more the deeper the run goes.
export const relicPrices = { common: 40, uncommon: 70, rare: 110 };
export const relicPriceGrowth = 0.15; // Every relic he owns makes the next one this much dearer.

// Relics.
export const whetstoneAttack = 3;
export const badgeLife = 20;
export const rosaryFaith = 1;
export const wineHeal = 1.5;
export const miserGold = 1.5;
export const shieldBlock = 1;
export const lampOilChance = 3;
export const executeUnder = 0.25;
export const executeMultiplier = 2;
export const saltMultiplier = 3;
export const saintsBloodHeal = 0.15;
export const thornsReflect = 0.3;
export const gamblerCrit = 3;
