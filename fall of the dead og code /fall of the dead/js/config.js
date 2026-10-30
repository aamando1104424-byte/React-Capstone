// Config
// Every number the game is balanced with. The How to Play screen is built from
// these at runtime, so the help text can never drift out of date.

// Chances are rolled out of 10.
const critChance = 1;
const woundChance = 3;
const windupChance = 3;
const bloodlettingChance = 3;

const critMultiplier = 2;
const weakMultiplier = 2;
const resistMultiplier = 0.5;
const damageSpread = 3;

// Starting stats.
const startLife = 100;
const startAttack = 10;
const startHeal = 30;
const startPotions = 1;
const maxPotions = 6;   // Capped, or late waves turn into a potion queue.

// Gained per rank.
const xpPerLevel = 130;
const attackPerLevel = 5;
const lifePerLevel = 15;
const healPerLevel = 5;
const xpAttack = 20;
const xpSkill = 20;
const xpCombo = 30;
const prayerLevel = 5;   // Knight, where the combo becomes the prayer.

// Faith.
const maxFaith = 6;
const faithPerTurn = 1;
const comboCost = 4;
const comboHits = 3;
const comboMultiplier = 2;
const comboDelay = 2200;
const amenPause = 1200;

// Damage over time, on both sides.
const woundDamage = 10;
const woundLength = 3;
const bleedTurns = 3;
const bleedPower = 0.5;
const burnTurns = 3;
const burnPower = 0.75;
const holyGroundTurns = 4;
const holyGroundPower = 1;
const holyGroundHeal = 0.08;

// Skills and blessings.
const zealFaith = 2;
const furyHits = 3;
const furyMultiplier = 1.5;
const martyrMultiplier = 2;
const vigilBlock = 1;
const confessionPrayer = 1;
const secondWindAt = 0.25;
const secondWindHeal = 0.4;
const miracleLife = 0.5;
const lastRitesHeal = 0.4;
const bulwarkBlocks = 2;
const smitePower = 3.5;
const holyFirePower = 1.8;
const judgmentPower = 2.5;
const judgmentFinish = 5;
const judgmentUnder = 0.4;

// Demons. Life and attack climb with the wave number.
const baseDemonLife = 100;
const baseDemonAttack = 8;
const lifePerWave = 40;
const attackPerWave = 3;
const bossEvery = 5;
const bossLife = 2.2;
const bossAttack = 1.15;
const phaseTwoAttack = 1.3;
const heavyMultiplier = 1.8;
const windupRest = 2;

// Score and saved data.
const pointsPerKill = 100;
const pointsPerBoss = 500;
const boardSize = 10;
const boardKey = "fallOfTheDeadScores";
const muteKey = "fallOfTheDeadMuted";

// Timing, in milliseconds.
const critFreeze = 110;
const ceremonyTime = 2100;
const emberCount = 70;
