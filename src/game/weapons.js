// Weapons
// Aldric carries one weapon per kind of damage: steel, fire, holy and blood.
// Each one gets its own button, so the trick to a demon is hitting it with
// whatever it is weak to. Steel comes with the ranks; the rest are bought from
// the pardoner's cart, or taken off a dead boss. "tier" is what rank the cart
// starts selling it at. burn and bleed are chances out of 10 per hit.

export const elementOrder = ["steel", "fire", "holy", "blood"];

export const weapons = {
    // Handed out by the ranks.
    pitchfork: { name: "Pitchfork", element: "steel", attack: 2, verbs: ["jabs", "stabs", "skewers", "rams the tines into"] },
    soldierSword: { name: "Soldier's Sword", element: "steel", attack: 5, verbs: ["slashes", "cuts", "hacks at", "opens up"] },
    longsword: { name: "Aldric's Longsword", element: "steel", attack: 9, verbs: ["cleaves", "runs through", "cuts down", "opens up"] },
    bastardSword: { name: "Bastard Sword", element: "steel", attack: 13, verbs: ["hews", "splits", "cleaves", "brings the bastard sword down on"] },
    michaelSword: { name: "Sword of Saint Michael", element: "holy", attack: 19, verbs: ["smites", "sears", "burns through", "strikes down"] },

    // Sold off the cart.
    torch: {
        name: "Pitch Torch", element: "fire", attack: 3, tier: 1, price: 45, burn: 2,
        verbs: ["shoves the torch into", "burns", "swings the torch at"],
        flavor: "A stick, a rag, and a pot of pitch. It works better than it should."
    },
    cudgel: {
        name: "Blessed Cudgel", element: "holy", attack: 3, tier: 1, price: 45,
        verbs: ["clubs", "cracks", "brings the cudgel down on"],
        flavor: "An oak club with a psalm carved down the handle."
    },
    cleaver: {
        name: "Butcher's Cleaver", element: "blood", attack: 3, tier: 1, price: 45, bleed: 2,
        verbs: ["chops into", "hacks", "cleaves a chunk out of"],
        flavor: "Off the hook in the baker's neighbour's shop. Still sticky."
    },
    flail: {
        name: "Burning Flail", element: "fire", attack: 8, tier: 4, price: 95, burn: 2,
        verbs: ["lashes", "wraps the burning chain around", "flails at"],
        flavor: "The head is a pot of coals on a chain."
    },
    silverMace: {
        name: "Silvered Mace", element: "holy", attack: 8, tier: 4, price: 95,
        verbs: ["batters", "smashes", "rings the mace off"],
        flavor: "Melted down from the abbey's communion plate. The Abbot pretends not to know."
    },
    flayingKnife: {
        name: "Flaying Knife", element: "blood", attack: 8, tier: 4, price: 95, bleed: 3,
        verbs: ["flays", "carves", "peels a strip off"],
        flavor: "A tanner's knife, curved and very thin."
    },
    brand: {
        name: "Brand of Saint Lawrence", element: "fire", attack: 12, tier: 7, price: 160, burn: 3,
        verbs: ["sears", "brands", "sets the brand against"],
        flavor: "The gridiron he was roasted on, hammered into a blade. It never cools."
    },
    reliquaryMace: {
        name: "Reliquary Mace", element: "holy", attack: 12, tier: 7, price: 160,
        verbs: ["smites", "crushes", "brings the bones of the blessed down on"],
        flavor: "The head is a silver box with a saint's knuckle inside."
    },
    glaive: {
        name: "Serrated Glaive", element: "blood", attack: 12, tier: 7, price: 160, bleed: 3,
        verbs: ["saws into", "rips open", "drags the teeth across"],
        flavor: "Every tooth on it was filed by hand."
    },

    // Taken off the bosses when they fall.
    corvinBlade: { name: "Corvin's Black Sword", element: "steel", attack: 11, verbs: ["cuts", "hacks", "runs through"] },
    brimstoneMaul: { name: "Brimstone Maul", element: "fire", attack: 16, burn: 3, verbs: ["pounds", "crushes", "sets the maul burning into"] },
    crozier: { name: "Osric's Crozier", element: "holy", attack: 15, verbs: ["hooks", "smites", "beats"] }
};

// Which boss leaves which weapon behind.
export const bossDrops = { "Sir Corvin": "corvinBlade", "Belphegor": "brimstoneMaul", "Father Osric": "crozier" };
