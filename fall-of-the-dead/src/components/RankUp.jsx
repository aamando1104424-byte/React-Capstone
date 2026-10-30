import { useEffect, useRef } from "react";
import { useGame } from "../game/hooks.js";
import { chooseSkill } from "../game/engine.js";
import { ranks } from "../game/content.js";
import { skills } from "../game/skills.js";

// The light comes down. Keyed on the ceremony id so each rank up remounts it
// and the animation plays from the top.
export function Ceremony() {
    const game = useGame();
    const ceremony = game.ceremony;
    if (ceremony === null) {
        return <div className="ceremony" id="ceremony" hidden aria-hidden="true"></div>;
    }
    const rank = ranks[ceremony.level - 1];
    return (
        <div className="ceremony playing" id="ceremony" key={ceremony.id} aria-hidden="true">
            <div className="beam"></div>
            <p className="ceremony-kicker">Rank <span id="ceremonyNumber">{ceremony.level}</span></p>
            <p className="ceremony-title" id="ceremonyTitle">{rank.title}</p>
            <p className="ceremony-name" id="ceremonyName">{rank.name}</p>
        </div>
    );
}

// Then the choice of two skills. A rank up has to be answered, so Escape
// must not close it.
export function ChoiceDialog() {
    const game = useGame();
    const level = game.choiceLevel;
    const dialog = useRef(null);

    useEffect(function() {
        const el = dialog.current;
        if (level !== null && el.open === false) {
            el.showModal();
        } else if (level === null && el.open) {
            el.close();
        }
    }, [level]);

    const rank = level === null ? null : ranks[level - 1];

    return (
        <dialog
            id="choiceDialog"
            ref={dialog}
            aria-labelledby="choiceTitle"
            onCancel={function(event) {
                event.preventDefault();
            }}
        >
            {rank !== null && (
                <>
                    <p className="choice-kicker">Rank up</p>
                    <h2 id="choiceTitle">Rank {level}: {rank.title}</h2>
                    <p className="choice-sub">Choose one. The other is lost for this run.</p>
                    <div className="cards">
                        {rank.choices.map(function(id, slot) {
                            const skill = skills[id];
                            return (
                                <button
                                    key={id}
                                    id={"choice" + slot}
                                    className={"choice-card " + (skill.element ? skill.element : "holy")}
                                    onClick={function() {
                                        chooseSkill(slot);
                                    }}
                                >
                                    <span className="card-kind">{skill.kind === "skill" ? "Skill - " + skill.cost + " Faith" : "Blessing - always on"}</span>
                                    <span className="card-name">{skill.name}</span>
                                    <span className="card-text">{skill.text}</span>
                                    <span className="card-flavor">{skill.flavor}</span>
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </dialog>
    );
}
