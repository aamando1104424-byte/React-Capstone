// Content
// The writing and the data tables: what the game says, who Aldric becomes, and
// what comes for him. Nothing here does any work, so the rules can change
// without touching the story and the story can change without touching the rules.

// The Saint Michael prayer, one line per hit of the combo.
export const prayerSpeech = [
    "Saint Michael the Archangel, defend us in battle.",
    "In their many eyes, they shall weep.",
    "In their many limbs, they shall crawl.",
    "In their demonic tongue, they shall beg.",
    "In their many forms, they shall fall."
];

export const prayerAnswered = [
    "{hero} prays, and the warmth comes back into his hands.",
    "{hero} prays. For a moment the street goes quiet.",
    "{hero} says the words and means them this time."
];

export const prayerFails = [
    "{hero} prays. Nothing answers.",
    "{hero} mumbles the old words. They sound hollow.",
    "{hero} prays, and thinks about the bottle instead."
];

// A saint who gets no answer is a different kind of moment.
export const saintPrayerFails = [
    "{hero} prays. Heaven is busy.",
    "{hero} prays, and gets silence for it. Even saints get tested."
];

export const potionLines = [
    "{hero} drinks the abbey's bitter tonic.",
    "{hero} pulls the cork with his teeth and drinks."
];

export const killLines = [
    "{hero} cuts {foe} down.",
    "{Foe} goes still in the mud.",
    "{hero} puts {foe} back in the ground.",
    "{Foe} comes apart at the seams.",
    "{hero} kicks what is left of {foe} into the ditch.",
    "One down. More will take its place, until they take him."
];

// A wound reads differently depending on what caused it.
export const woundNames = { rot: "Rot", blood: "Bleeding", fire: "Burning", frost: "Frostbite", shadow: "Dread" };

export const woundStarts = {
    rot: "The bite turns black at the edges.",
    blood: "The cut will not close.",
    fire: "His sleeve is still burning.",
    frost: "The cold gets into his bones.",
    shadow: "Something follows him now, just behind his shoulder."
};

export const woundEnds = {
    rot: "The rot runs its course.",
    blood: "The bleeding finally stops.",
    fire: "He beats out the last of the flames.",
    frost: "Feeling comes back into his hands.",
    shadow: "The dread lifts."
};

// What a demon says with its second kind of attack. The first kind uses its
// own lines in the tables below.
export const altAttacks = {
    rot: ["{Foe} retches grave-rot over {hero}", "{Foe} smears something black and wet into {hero}'s cuts"],
    blood: ["{Foe} rakes {hero} open with its claws", "{Foe} bites a mouthful out of {hero}"],
    fire: ["{Foe} spits burning bile at {hero}", "{Foe} drags {hero} through a burning doorway"],
    frost: ["{Foe} breathes grave-cold into {hero}'s face", "{Foe} grips {hero} with hands like river ice"],
    shadow: ["{Foe} whispers the name of {hero}'s son, and it cuts", "{Foe} folds into the dark and comes out of {hero}'s shadow"]
};

export const elementSounds = { steel: "hit", holy: "holy", fire: "fire", blood: "blood", rot: "rot", frost: "frost", shadow: "shadow" };

// The ten ranks, in order. "message" is the story beat when Aldric arrives,
// "choices" are the two skills he picks between, and weapon and armour only
// appear on the ranks where his gear actually changes.
export const ranks = [
    {
        title: "Peasant",
        name: "Aldric the Drunk",
        prayer: 3,
        message: "Aldric wakes in the gutter outside the Crooked Man with cheap wine still on his breath. Someone is screaming down the street. He finds a pitchfork in the mud and uses it to stand up.",
        weapon: "pitchfork",
        armour: { name: "Rags", block: 0, resist: {} }
    },
    {
        title: "Penitent",
        name: "Aldric the Penitent",
        prayer: 3,
        message: "He pours the last of the wine into the mud. In the chapel on Tanner's Row he kneels and tries to remember the words. The dead watchman by the door has no more use for his coat.",
        armour: { name: "Watchman's Coat", block: 1, resist: { blood: 0.15 } },
        choices: ["confession", "hardLiver"]
    },
    {
        title: "Pilgrim",
        name: "Aldric the Pilgrim",
        prayer: 4,
        message: "He takes the pilgrim road north toward the abbey. A soldier lies in the ditch with his sword still in his hand, and Aldric has to break two fingers to get it loose.",
        weapon: "soldierSword",
        choices: ["shieldBash", "rend"]
    },
    {
        title: "Squire",
        name: "Aldric the Squire",
        prayer: 4,
        message: "Old Sir Hugh watches him hold a ford on his own and takes him on as a squire. Hugh knew him before the drink. He never brings it up.",
        choices: ["bloodletting", "zeal"]
    },
    {
        title: "Knight",
        name: "Sir Aldric",
        prayer: 5,
        message: "At the river he wades in to his chest and feels along the bottom until his hand closes on his own sword. The Abbot lays it on his shoulder. Rise, Sir Aldric.",
        weapon: "longsword",
        armour: { name: "River-Rusted Mail", block: 2, resist: { blood: 0.2, rot: 0.1 } },
        choices: ["holyFire", "smite"]
    },
    {
        title: "Templar",
        name: "Sir Aldric, Templar",
        prayer: 5,
        message: "The Templars open their gate to him. A few of the older brothers turn their backs when he walks past them.",
        choices: ["fury", "vigil"]
    },
    {
        title: "Commander",
        name: "Commander Aldric",
        prayer: 6,
        message: "The men who spat at him in the square ride at his back now. The quartermaster hands him a bastard sword and says nothing at all about the past.",
        weapon: "bastardSword",
        choices: ["bulwark", "lastRites"]
    },
    {
        title: "Marshal",
        name: "Marshal Aldric",
        prayer: 6,
        message: "The army of the north marches under his banner. The king's smiths fit him for plate and will not take his money.",
        armour: { name: "Plate Armour", block: 3, resist: { blood: 0.3, rot: 0.15, fire: 0.1 } },
        choices: ["riposte", "secondWind"]
    },
    {
        title: "Grand Master",
        name: "Grand Master Aldric",
        prayer: 7,
        message: "The old Grand Master dies holding Varrow bridge. The Order picks Aldric to lead it, the same man who threw his sword in a river.",
        choices: ["judgment", "consecrate"]
    },
    {
        title: "Saint",
        name: "Saint Aldric",
        prayer: 7,
        message: "The bells of Varrow ring for him, and this time there are men on the ropes. For God's strongest warrior, the devil sends his strongest demons.",
        weapon: "michaelSword",
        armour: { name: "Blessed Plate", block: 4, resist: { blood: 0.3, rot: 0.15, fire: 0.15, shadow: 0.25 } },
        choices: ["miracle", "martyr"]
    }
];

// The ordinary dead, fought in order between bosses. "nick" is what the log
// calls one after it has arrived, so its full name is not in every line.
export const demons = [
    {
        name: "Zombie",
        epithet: "a dead baker",
        nick: "the baker",
        type: "Tank",
        element: "rot",
        alt: "blood",
        weak: ["fire"],
        resist: [],
        bleeds: true,
        sound: "zombie",
        arrives: "It comes out of the baker's doorway with flour still on its hands.",
        attacks: [
            "It gets its teeth into {hero}'s forearm",
            "It grabs {hero} by the collar and will not let go",
            "{Foe} falls on {hero} with its whole rotten weight"
        ]
    },
    {
        name: "Ghoul",
        epithet: "something that climbs",
        nick: "the climber",
        type: "Stalker",
        element: "blood",
        alt: "rot",
        weak: ["fire"],
        resist: [],
        bleeds: true,
        sound: "ghoul",
        arrives: "Something scrabbles along the rooftops and drops into the street on all fours.",
        attacks: [
            "It rakes its nails down {hero}'s back",
            "It darts in low and bites through {hero}'s boot",
            "{Foe} tears a strip off {hero} and swallows it"
        ]
    },
    {
        name: "Revenant",
        epithet: "three days dead and furious",
        nick: "the corpse",
        type: "Berserker",
        element: "blood",
        alt: "shadow",
        weak: ["holy"],
        resist: ["blood"],
        bleeds: true,
        sound: "revenant",
        arrives: "It digs itself out of a fresh grave in the churchyard, still in its burial shirt.",
        attacks: [
            "It swings a gravedigger's spade into {hero}",
            "It howls and throws itself onto {hero}",
            "{Foe} hacks at {hero} with no care for its own arms"
        ]
    },
    {
        name: "Plague Bearer",
        epithet: "walking sickness",
        nick: "the sick thing",
        type: "Blighted",
        element: "rot",
        alt: "blood",
        weak: ["fire"],
        resist: ["blood"],
        bleeds: true,
        sound: "plague",
        arrives: "The smell arrives first. It shuffles out of the pest house, swollen and leaking.",
        attacks: [
            "It coughs black spit into {hero}'s face",
            "It buries a swollen fist in {hero}'s ribs",
            "{Foe} splits open and sprays {hero}"
        ]
    },
    {
        name: "Wraith",
        epithet: "cold and quiet",
        nick: "the shade",
        type: "Phantom",
        element: "frost",
        alt: "shadow",
        weak: ["holy", "fire"],
        resist: ["steel", "blood"],
        bleeds: false,
        sound: "wraith",
        arrives: "Every candle in the chapel goes out at once, and it steps through the wall.",
        attacks: [
            "It pushes a cold hand into {hero}'s chest",
            "It screams, and frost forms in {hero}'s beard",
            "{Foe} passes through {hero} and takes the warmth with it"
        ]
    },
    {
        name: "Hell Hound",
        epithet: "a hound out of hell",
        nick: "the dog",
        type: "Beast",
        element: "fire",
        alt: "blood",
        weak: ["holy", "blood"],
        resist: ["fire"],
        bleeds: true,
        sound: "hound",
        arrives: "It comes over the bridge at a dead run, trailing smoke out of its mouth.",
        attacks: [
            "Fire pours out of its throat across {hero}",
            "Its burning jaws lock onto {hero}'s arm",
            "{Foe} knocks {hero} down and his cloak catches"
        ]
    },
    {
        name: "Bone Colossus",
        epithet: "a hundred dead in one body",
        nick: "the bone heap",
        type: "Juggernaut",
        element: "blood",
        alt: "shadow",
        weak: ["holy"],
        resist: ["steel", "blood"],
        bleeds: false,
        sound: "colossus",
        arrives: "The charnel house wall caves in and it drags itself out of the rubble.",
        attacks: [
            "It stamps down on {hero}",
            "It swings a thighbone the size of a roof beam at {hero}",
            "{Foe} pins {hero} against the wall and leans on him"
        ]
    },
    {
        name: "Abyssal Fiend",
        epithet: "it came up the well",
        nick: "the horror",
        type: "Horror",
        element: "shadow",
        alt: "fire",
        weak: ["steel", "fire"],
        resist: ["holy"],
        bleeds: true,
        sound: "fiend",
        arrives: "The well in the square cracks open and something climbs out with far too many eyes.",
        attacks: [
            "It wraps a wet limb around {hero} and squeezes",
            "It opens every eye at once and {hero}'s nose starts to bleed",
            "{Foe} drags {hero} a few feet toward the well"
        ]
    },
    {
        name: "Drowned Man",
        epithet: "up from the river",
        nick: "the drowned man",
        type: "Lurker",
        element: "frost",
        alt: "rot",
        weak: ["fire"],
        resist: ["blood", "steel"],
        bleeds: false,
        sound: "drowned",
        arrives: "Something walks up out of the river where Aldric threw his sword, with weed in its mouth and its eyes gone white.",
        attacks: [
            "It wraps cold, swollen arms around {hero} and pulls",
            "It coughs a lungful of black river water over {hero}",
            "{Foe} drags {hero} down into the shallows"
        ]
    },
    {
        name: "Hanged Man",
        epithet: "cut down too late",
        nick: "the hanged man",
        type: "Strangler",
        element: "shadow",
        alt: "frost",
        weak: ["fire", "steel"],
        resist: ["blood"],
        bleeds: true,
        sound: "hanged",
        arrives: "The rope on the market gallows creaks, and creaks, and then it is empty.",
        attacks: [
            "It loops its noose around {hero}'s neck and pulls tight",
            "Its broken neck swings round and it bites {hero}",
            "{Foe} hauls {hero} off his feet by the throat"
        ]
    },
    {
        name: "Flagellant",
        epithet: "a penitent with no one left to forgive him",
        nick: "the flagellant",
        type: "Zealot",
        element: "blood",
        alt: "fire",
        weak: ["holy"],
        resist: ["blood", "steel"],
        bleeds: true,
        sound: "flagellant",
        arrives: "A barefoot man comes down the street whipping his own back to ribbons. He is singing a psalm, and he is smiling.",
        attacks: [
            "It lashes {hero} with a scourge full of nails",
            "It weeps on {hero} and the tears burn like vinegar",
            "{Foe} screams the psalm in {hero}'s face and tears at him"
        ]
    },
    {
        name: "Carrion Swarm",
        epithet: "every crow in Varrow",
        nick: "the swarm",
        type: "Swarm",
        element: "rot",
        alt: "blood",
        weak: ["fire"],
        resist: ["steel", "blood"],
        bleeds: false,
        sound: "swarm",
        arrives: "The sky over the churchyard goes black. It is not smoke. It is wings.",
        attacks: [
            "A hundred beaks go for {hero}'s eyes",
            "The swarm pours over {hero} and pecks at every gap in his armour",
            "{Foe} lifts {hero} half off the ground and drops him"
        ]
    },
    {
        name: "Ash Witch",
        epithet: "burned in the square, and not finished",
        nick: "the witch",
        type: "Caster",
        element: "fire",
        alt: "shadow",
        weak: ["holy", "steel"],
        resist: ["fire"],
        bleeds: true,
        sound: "witch",
        arrives: "The pyre in the square has been cold for a year. Tonight the ashes sit up.",
        attacks: [
            "She spits a cinder into {hero}'s eye",
            "She points at {hero}, and his cloak bursts into flame",
            "{Foe} laughs, and the cobbles under {hero} glow red"
        ]
    },
    {
        name: "Headless Templar",
        epithet: "a brother of the Order",
        nick: "the templar",
        type: "Duelist",
        element: "shadow",
        alt: "blood",
        weak: ["holy", "blood"],
        resist: ["steel"],
        bleeds: true,
        sound: "templar",
        arrives: "A templar in full plate rides through the gate with his own head tied to the saddle. The head is still praying.",
        attacks: [
            "It fences {hero} back with perfect, dead form",
            "It strikes exactly where {hero} was taught to guard",
            "The head on the saddle whispers, and {foe} cuts {hero} where he is weakest"
        ]
    },
    {
        name: "Bell-Ringer",
        epithet: "the one pulling the ropes",
        nick: "the ringer",
        type: "Haunt",
        element: "shadow",
        alt: "frost",
        weak: ["steel", "fire"],
        resist: ["holy"],
        bleeds: false,
        sound: "ringer",
        arrives: "The bells of Varrow stop. In the silence, something long and thin climbs down the bell tower head first.",
        attacks: [
            "It rings a bell inside {hero}'s skull",
            "Its long fingers close round {hero} like bell ropes",
            "{Foe} tolls, and {hero}'s ears start to bleed"
        ]
    },
    {
        name: "Pit Wyrm",
        epithet: "it was under the town the whole time",
        nick: "the wyrm",
        type: "Wyrm",
        element: "rot",
        alt: "fire",
        weak: ["holy", "blood"],
        resist: ["fire", "steel"],
        bleeds: true,
        sound: "wyrm",
        arrives: "The plague pits on the edge of town heave. Something long has been feeding down there since the summer.",
        attacks: [
            "It coils around {hero} and squeezes",
            "It vomits a flood of grave dirt over {hero}",
            "{Foe} bites down on {hero} with a mouth full of old teeth"
        ]
    }
];

// Bosses take turns, one every five waves. They have a second set of attacks for
// their second phase, a telegraphed heavy blow, and "again" for the rematch.
export const bosses = [
    {
        name: "Sir Corvin",
        epithet: "your brother in the Order",
        nick: "Corvin",
        type: "Fallen Knight",
        element: "shadow",
        alt: "blood",
        weak: ["holy", "fire"],
        resist: ["steel"],
        bleeds: true,
        sound: "corvin",
        arrives: "A rider comes out of the smoke on a dead horse. Sir Corvin knelt beside Aldric at Mass for eleven years. His eyes have gone black.",
        again: "He rides out of the smoke again. The Order buried him properly. It did not take.",
        attacks: [
            "{Foe} cuts at {hero} with a blackened sword",
            "{Foe} rides {hero} down and turns for another pass",
            "{Foe} slams his shield into {hero}'s chest"
        ],
        attacksTwo: [
            "{Foe} hacks at {hero} like a butcher at a carcass",
            "{Foe} breathes black smoke into {hero}'s face",
            "{Foe} laughs with Corvin's voice and cuts {hero} again"
        ],
        windupText: "{Foe} stands in his stirrups and lifts the black sword over his head.",
        heavy: "{Foe} brings the black sword down on {hero}",
        phaseTwo: "Corvin's helm splits open. There is nothing inside but smoke, and the smoke is laughing.",
        dies: "Corvin falls out of the saddle. For a moment his own face comes back, and he looks grateful. Then there is nothing."
    },
    {
        name: "Belphegor",
        epithet: "prince of sloth",
        nick: "the demon",
        type: "Archdemon",
        element: "fire",
        alt: "shadow",
        weak: ["holy", "blood"],
        resist: ["fire", "steel"],
        bleeds: true,
        sound: "belphegor",
        arrives: "The Crooked Man, where Aldric drank for three years, burns from the inside out. Something walks out of the fire and says: I know you. You were mine.",
        again: "The fire in the square takes a shape Aldric knows. It has come to collect.",
        attacks: [
            "{Foe} breathes burning ash over {hero}",
            "{Foe} rakes {hero} with claws like hot iron",
            "{Foe} laughs, and the ground under {hero} splits and burns"
        ],
        attacksTwo: [
            "{Foe} drives a burning horn through {hero}'s shoulder",
            "{Foe} drags {hero} through the fire by his ankle",
            "{Foe} speaks in his dead wife's voice, and the words burn"
        ],
        windupText: "{Foe} draws a long breath, and the air around it starts to shimmer.",
        heavy: "{Foe} breathes hellfire over {hero}",
        phaseTwo: "Belphegor stops smiling. Its wings come open and every roof on the street catches at once.",
        dies: "It gutters out like a coal in the rain. Behind Aldric, the roof of the Crooked Man falls in."
    },
    {
        name: "Father Osric",
        epithet: "the priest who would not come",
        nick: "Osric",
        type: "Fallen Priest",
        element: "rot",
        alt: "shadow",
        weak: ["fire", "blood"],
        resist: ["holy", "steel"],
        bleeds: true,
        sound: "osric",
        arrives: "The priest who would not come to the graves of Aldric's wife and son comes now, in his vestments, with the plague all over him. He says he is sorry. It is not his voice.",
        again: "Osric climbs back up into the pulpit. The plague is louder in him now than the sermon ever was.",
        attacks: [
            "{Foe} swings a censer of plague smoke into {hero}",
            "{Foe} lays a black, blistered hand on {hero}'s head",
            "{Foe} reads the burial rite at {hero}, and it hurts"
        ],
        attacksTwo: [
            "{Foe} names Aldric's son, and the word cuts like a knife",
            "{Foe} pours rotten holy water over {hero}",
            "{Foe} beats {hero} with the crozier he never carried to the graves"
        ],
        windupText: "{Foe} raises both hands and begins the last rites over {hero}, in Latin, very slowly.",
        heavy: "{Foe} finishes the rite and brings the full weight of it down on {hero}",
        phaseTwo: "Osric's vestments split. Under them he is all plague, and every sore is mouthing the same apology.",
        dies: "Osric goes down on his knees in the mud. For the first time in three years, he says a prayer for the boy and his mother. Then he is still."
    }
];

// Sound effects, keyed by the name the game asks for. The files are CC0 and
// credited in sounds/CREDITS.txt. Volumes are set by ear against each other;
// "rate" pitches a file down so one recording can serve two creatures.
export const sounds = {
    hit: { files: ["blade_01", "blade_02", "blade_03"], volume: 1.5 },
    crit: { files: ["impactPunch_heavy_000"], volume: 1.2 },
    hurt: { files: ["impactPunch_medium_000"], volume: 0.6 },
    bigHurt: { files: ["impactPunch_heavy_000"], volume: 1.3, rate: 0.8 },
    holy: { files: ["impactBell_heavy_001", "spell_01"], volume: 0.9 },
    ready: { files: ["impactBell_heavy_004"], volume: 0.6 },
    fire: { files: ["spell_fire_06", "spell_fire_01"], volume: 2.4 },
    bleed: { files: ["impactSoft_heavy_000"], volume: 0.6 },
    block: { files: ["impactPlate_heavy_000", "metal_01", "metal_02", "metal_03"], volume: 1.1 },
    stun: { files: ["impactWood_heavy_000"], volume: 1.4 },
    potion: { files: ["impactGlass_light_002"], volume: 1.1 },
    heal: { files: ["spell_02"], volume: 0.8 },
    pray: { files: ["book_01", "book_02", "book_03"], volume: 1.5 },
    choose: { files: ["book_01"], volume: 1.5, rate: 1.1 },
    kill: { files: ["creature_die_01", "monster_05"], volume: 0.7 },
    windup: { files: ["chain_03"], volume: 1.9 },
    rankUp: { files: ["impactBell_heavy_001"], volume: 1, rate: 0.9 },
    death: { files: ["impactBell_heavy_001"], volume: 1, rate: 0.55 },
    rot: { files: ["eat_02", "spit_01"], volume: 1.1 },
    frost: { files: ["breath"], volume: 2.8 },
    shadow: { files: ["weird_02"], volume: 0.95 },
    blood: { files: ["monster_06"], volume: 0.75 },
    zombie: { files: ["monster_01", "monster_02"], volume: 1.35 },
    ghoul: { files: ["eat_02"], volume: 1.2, rate: 0.7 },
    revenant: { files: ["scream_01"], volume: 1, rate: 1.1 },
    plague: { files: ["cough_03"], volume: 1.1 },
    wraith: { files: ["scream_01"], volume: 1, rate: 0.65 },
    hound: { files: ["howl"], volume: 0.7 },
    colossus: { files: ["troll_02"], volume: 1, rate: 0.7 },
    fiend: { files: ["alien_03"], volume: 1.2 },
    corvin: { files: ["monster_07"], volume: 0.9, rate: 0.85 },
    belphegor: { files: ["creature_roar_03"], volume: 1, rate: 0.8 },
    drowned: { files: ["burble_01"], volume: 1.4, rate: 0.8 },
    hanged: { files: ["chain_03"], volume: 1.6, rate: 0.7 },
    flagellant: { files: ["scream_02"], volume: 0.9, rate: 1.1 },
    swarm: { files: ["bug_01"], volume: 1.2 },
    witch: { files: ["spell_fire_06"], volume: 2.6, rate: 0.75 },
    templar: { files: ["monster_07"], volume: 0.9, rate: 1.15 },
    ringer: { files: ["impactBell_heavy_004"], volume: 1, rate: 0.5 },
    wyrm: { files: ["troll_02"], volume: 1.1, rate: 0.55 },
    osric: { files: ["cough_03"], volume: 1.2, rate: 0.7 },
    phaseTwo: { files: ["creature_roar_03"], volume: 1, rate: 0.65 },

    // Added with the second batch of rubberduck files.
    ouch: { files: ["hurt_01", "hurt_02", "hurt_03", "hurt_04"], volume: 0.7, rate: 0.85 },
    demonHurt: { files: ["creature_hurt_01", "creature_hurt_02", "monster_03"], volume: 0.8 },
    coins: { files: ["item_coins_01", "item_coins_02", "item_coins_03"], volume: 1.2 },
    relic: { files: ["item_gem_01", "item_gem_02"], volume: 1.2 },
    cart: { files: ["item_wood_01"], volume: 1.4, rate: 0.8 },
    cartLeave: { files: ["lock_01"], volume: 1.1, rate: 0.8 },
    ignite: { files: ["spell_fire_02"], volume: 2 },
    gore: { files: ["creature_slime_01", "creature_slime_02"], volume: 0.9 },
    chains: { files: ["chain_01", "chain_02"], volume: 1.3 },
    stagger: { files: ["stones_01"], volume: 1.2 },
    drum: { files: ["impactWood_heavy_000"], volume: 1, rate: 0.5 },
    bossRoar: { files: ["roar_02", "creature_roar_01"], volume: 1, rate: 0.75 },
    whisper: { files: ["grunt_02", "grunt_03", "grunt_04"], volume: 0.5, rate: 0.9 },
    click: { files: ["wood_01"], volume: 0.6, rate: 1.3 }
};
