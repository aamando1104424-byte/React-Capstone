import { useEffect, useRef } from "react";
import * as C from "../game/config.js";
import { ranks, demons, bosses } from "../game/content.js";
import { skills } from "../game/skills.js";
import { relics, shopkeeper } from "../game/relics.js";
import { weapons } from "../game/weapons.js";
import { perks } from "../game/perks.js";

// The How to Play screen. Every number in it is read from config.js and the
// content tables, so the explanation cannot disagree with the game the way a
// hand written help page eventually would.
export default function HelpDialog({ open, onClose }) {
    const dialog = useRef(null);

    useEffect(function() {
        const el = dialog.current;
        if (open && el.open === false) {
            el.showModal();
        } else if (open === false && el.open) {
            el.close();
        }
    }, [open]);

    return (
        <dialog id="helpDialog" ref={dialog} aria-labelledby="helpTitle" onClose={onClose}>
            <h2 id="helpTitle">How to Play</h2>
            <div id="helpBody">{open && <HelpBody />}</div>
            <button onClick={onClose}>Close</button>
        </dialog>
    );
}

function pct(x) {
    return Math.round(x * 100) + "%";
}

function HelpBody() {
    const shopWeapons = Object.values(weapons).filter(function(weapon) {
        return weapon.tier !== undefined;
    });
    return (
        <>
            <h3>The idea</h3>
            <p>
                Aldric starts drunk in a gutter with a pitchfork and climbs {ranks.length} ranks back to sainthood,
                fighting one demon at a time. The waves never stop, and they get worse. How far you get is your score.
                A sword alone will not get you far: you need a way to deal every kind of damage.
            </p>

            <h3>Your turn</h3>
            <p>
                The number keys press the buttons: 1 to 4 swing your steel, fire, holy and blood weapons, 5 prays,
                6 drinks, 7 is the combo, and 8 on are your skills.
            </p>
            <ul>
                <li>
                    <b>Weapons</b>: you carry one weapon of each kind, each with its own button. A swing hits for your
                    attack plus the weapon's, give or take {pct(C.damageSpread)}, and gains {C.faithPerTurn} Faith.
                    The button tells you when the demon is weak to it or resists it. Every hit has
                    a {C.critChance} in 10 chance to crit for {C.critMultiplier}x.
                </li>
                <li>
                    <b>Pray</b>: a chance to heal {C.startHeal} life (it grows {C.healPerLevel} a rank). The chance
                    starts at {ranks[0].prayer} in 10 and reaches {ranks[ranks.length - 1].prayer} in 10 as a Saint.
                </li>
                <li>
                    <b>Potion</b>: heals the same, every time, and clears a wound. Demons do not drop them: you start
                    with {C.startPotions}, and the rest are bought from {shopkeeper.name}'s cart. You can carry {C.maxPotions}.
                </li>
                <li>
                    <b>Combo</b>: costs {C.comboCost} Faith for {C.comboHits} quick hits with whichever weapon hurts
                    the demon most. From Knight on it becomes Saint Michael's prayer: {C.comboHits} holy hits
                    at {C.comboMultiplier}x.
                </li>
            </ul>

            <h3>Faith</h3>
            <p>
                Anything you do in a turn gives {C.faithPerTurn} Faith, up to {C.maxFaith}. Skills and combos spend
                it. Damage skills scale off the weapon you carry in their element, so a good fire weapon makes Holy
                Fire better too.
            </p>

            <h3>Weakness and resistance</h3>
            <p>
                A hit on a weakness does {C.weakMultiplier}x. A resisted hit does only {pct(C.resistMultiplier)}, so
                swinging the wrong weapon is close to wasting the turn. Bloodless demons cannot bleed.
            </p>
            <ul>
                {demons.concat(bosses).map(function(demon) {
                    return (
                        <li key={demon.name}>
                            <b>{demon.name}</b>: weak to {demon.weak.join(" and ")}
                            {demon.resist.length > 0 ? ", resists " + demon.resist.join(" and ") : ""}
                            {demon.bleeds === false ? ", no blood" : ""}. Attacks with {demon.element} or {demon.alt}.
                        </li>
                    );
                })}
            </ul>

            <h3>How demons fight</h3>
            <p>
                Every demon has two kinds of attack and uses whichever you resist least (the second kind hits
                at {pct(C.altPower)}). Its card shows what it will do next and how hard. From wave {C.perkWaves[0][0]} demons
                carry perks, the way you carry relics: {C.perkWaves.map(function(step) {
                    return step[1] + " from wave " + step[0];
                }).join(", ")}, and a boss gets one more from wave {C.bossPerkFrom}. Perks that make them resist
                something only start at wave {C.resistPerkFrom}.
            </p>
            <ul>
                {Object.entries(perks).map(function([id, perk]) {
                    return (
                        <li key={id}>
                            <b>{perk.name}</b>: {perk.text}
                        </li>
                    );
                })}
            </ul>
            <p>
                No ordinary hit can take more than {pct(C.maxHitShare)} of your life, and no heavy blow more
                than {pct(C.maxHeavyShare)}, so nothing kills you in one blow from full.
            </p>

            <h3>Resisting damage</h3>
            <p>
                Your armour, some relics and two blessings let you shrug off part of a kind of damage, up
                to {pct(C.resistCap)}. Your card lists what you resist. The demons will aim for whatever you do not.
            </p>

            <h3>Wounds</h3>
            <p>
                A demon's hit has a {C.woundChance} in 10 chance to leave a wound of its element: {pct(C.woundShare)} of
                your life a turn for {C.woundLength} turns. A potion, Last Rites, or Confession clears it.
            </p>

            <h3>Bosses</h3>
            <p>
                Every {C.bossEvery} waves something worse turns up with {C.bossLife.join("x, ")}x life in turn. At half
                life it hits {pct(C.phaseTwoAttack - 1)} harder. It warns you one turn before a heavy blow, which lands
                for {C.heavyMultiplier}x and goes straight through armour. Stun it, use Bulwark, or take it on the chin.
                A boss is worth {C.pointsPerBoss} score, and leaves its weapon behind.
            </p>

            <h3>Ranks</h3>
            <p>
                Favor comes mostly from kills ({C.xpKill} each, three times that for a boss), plus a little for every
                swing. The first rank takes {C.xpPerLevel}, and each one after takes {C.xpPerLevelGrowth} more. A rank
                gives +{C.attackPerLevel} attack, +{C.lifePerLevel} max life, +{C.healPerLevel} healing, a full heal,
                and a choice of two skills.
            </p>
            <ul>
                {ranks.map(function(rank, i) {
                    const gear = [];
                    if (rank.weapon) {
                        gear.push(weapons[rank.weapon].name + " +" + weapons[rank.weapon].attack + " " + weapons[rank.weapon].element);
                    }
                    if (rank.armour) {
                        gear.push(rank.armour.name + " " + rank.armour.block + " in 10");
                    }
                    return (
                        <li key={rank.title}>
                            <b>{i + 1}. {rank.title}</b>: prayers {rank.prayer} in 10
                            {gear.length > 0 ? ", " + gear.join(", ") : ""}
                        </li>
                    );
                })}
            </ul>

            <h3>Skills</h3>
            <ul>
                {Object.entries(skills).map(function([id, skill]) {
                    return (
                        <li key={id}>
                            <b>{skill.name}</b> ({skill.kind === "skill" ? skill.cost + " Faith" : "blessing"}): {skill.text}
                        </li>
                    );
                })}
            </ul>

            <h3>The cart</h3>
            <p>
                Every kill drops {C.goldPerKill} gold plus {C.goldPerWave} for each wave, and a boss drops another
                {" "}{C.goldPerBoss}. {shopkeeper.name} turns up after wave {C.firstShop}, then right before and right
                after every boss. He sells up to {C.weaponSlots} weapons, always putting first whatever the next boss is
                weak to, plus {C.shopSlots} relics and potions. Heavier weapons appear at
                rank {C.weaponTiers.join(" and ")}. Every relic you own makes the next one {pct(C.relicPriceGrowth)} dearer,
                and potions cost {C.potionPrice} gold plus {C.potionPricePerWave} a wave.
            </p>
            <ul>
                {shopWeapons.map(function(weapon) {
                    return (
                        <li key={weapon.name}>
                            <b>{weapon.name}</b> (rank {weapon.tier}, {weapon.price} gold): +{weapon.attack} {weapon.element}
                            {weapon.burn ? ", sets it burning " + weapon.burn + " in 10" : ""}
                            {weapon.bleed ? ", makes it bleed " + weapon.bleed + " in 10" : ""}
                        </li>
                    );
                })}
            </ul>
            <ul>
                {Object.entries(relics).map(function([id, relic]) {
                    return (
                        <li key={id}>
                            <b>{relic.name}</b> ({relic.rarity}): {relic.text}
                        </li>
                    );
                })}
            </ul>

            <h3>Score</h3>
            <p>
                Every point of damage is a point, a kill is {C.pointsPerKill} and a boss is another {C.pointsPerBoss}.
                The top {C.boardSize} runs from every player are kept on the shared board.
            </p>
        </>
    );
}
