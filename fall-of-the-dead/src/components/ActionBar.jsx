import { useEffect } from "react";
import { useGame } from "../game/hooks.js";
import {
    attack, pray, drinkPotion, combo, castSkill, prayerChance, weaponIn, elementMultiplier
} from "../game/engine.js";
import { comboCost, prayerLevel } from "../game/config.js";
import { skills } from "../game/skills.js";
import { elementOrder } from "../game/weapons.js";
import { FaithCost } from "./Bar.jsx";

const keys = "1234567890";

// Every button Aldric can press, laid out like a hotbar. The first four are
// his weapon slots, one per element, always in the same place so the number
// keys never move: 1 steel, 2 fire, 3 holy, 4 blood, then pray, potion,
// combo, and his skills.
export default function ActionBar({ attackRef }) {
    const game = useGame();
    const user = game.user;
    const off = game.gameOver || game.praying || game.choosing || game.shop !== null;
    const isPrayer = user.level >= prayerLevel;
    const facing = game.zombie.life > 0;

    const actions = elementOrder.map(function(element) {
        const weapon = weaponIn(element);
        if (weapon === null) {
            return { id: "slot-" + element, label: "No " + element + " weapon", sub: "Buy one on the cart", disabled: true, className: "weapon empty " + element };
        }
        // Tell the player straight away whether this is the right tool.
        const multiplier = facing ? elementMultiplier(element) : 1;
        let note = "";
        if (multiplier > 1) {
            note = "Weak x" + multiplier;
        } else if (multiplier < 1) {
            note = "Resisted";
        }
        return {
            id: "attack-" + element,
            label: weapon.name,
            sub: "+" + weapon.attack + " " + element,
            note: note,
            noteKind: multiplier > 1 ? "good" : "bad",
            run: function() {
                attack(element);
            },
            disabled: off,
            className: "weapon " + element
        };
    });
    actions.push(
        { id: "pray", label: "Pray", sub: prayerChance() + " in 10", run: pray, disabled: off, className: "pray" },
        { id: "potion", label: "Potion", sub: user.potions + " left", run: drinkPotion, disabled: off || user.potions <= 0, className: "potion heal" },
        {
            id: "combo",
            label: isPrayer ? "Saint Michael" : "Combo",
            cost: comboCost,
            run: combo,
            disabled: off || user.faith < comboCost,
            className: "combo" + (isPrayer ? " prayer" : "")
        }
    );
    for (const id of user.skills) {
        const skill = skills[id];
        actions.push({
            id: "skill-" + id,
            label: skill.name,
            cost: skill.cost,
            title: skill.text,
            run: function() {
                castSkill(id);
            },
            disabled: off || user.faith < skill.cost,
            className: "skill-btn " + skill.element
        });
    }

    // Read fresh on every key press through the closure below.
    useEffect(function() {
        function onKey(event) {
            if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
                return;
            }
            const tag = event.target.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA") {
                return;
            }
            const index = keys.indexOf(event.key);
            if (index >= 0 && index < actions.length && actions[index].disabled === false) {
                event.preventDefault();
                actions[index].run();
            }
        }
        window.addEventListener("keydown", onKey);
        return function() {
            window.removeEventListener("keydown", onKey);
        };
    });

    // Focus goes to the steel slot when the game starts.
    const firstWeapon = actions.findIndex(function(action) {
        return action.disabled === false && action.className.startsWith("weapon");
    });

    return (
        <section className="action-bar" id="actions" aria-label="Actions">
            {actions.map(function(action, i) {
                return (
                    <button
                        key={action.id}
                        id={action.id + "Btn"}
                        ref={i === Math.max(0, firstWeapon) ? attackRef : undefined}
                        className={"act " + action.className}
                        disabled={action.disabled}
                        title={action.title}
                        aria-label={action.title ? action.label + ". " + action.title : undefined}
                        onClick={action.run}
                    >
                        {i < keys.length && <kbd>{keys[i]}</kbd>}
                        {action.note && <span className={"act-note " + action.noteKind}>{action.note}</span>}
                        <span className="act-label">{action.label}</span>
                        {action.cost ? <FaithCost cost={action.cost} /> : <span className="act-sub">{action.sub}</span>}
                    </button>
                );
            })}
        </section>
    );
}
