import { useGame } from "../game/hooks.js";
import { intentPreview } from "../game/engine.js";
import { perks } from "../game/perks.js";
import FxBox from "./FxBox.jsx";
import CardFx from "./CardFx.jsx";
import Bar from "./Bar.jsx";
import { DemonPortrait } from "./Portrait.jsx";
import { Tag } from "./RichText.jsx";

// Whatever is in front of Aldric this wave. Whatever is burning, bleeding or
// stunning it shows on the card itself, not just in the tags.
export default function EnemyCard() {
    const game = useGame();
    const zombie = game.zombie;
    const effects = zombie.effects;
    const dead = zombie.life <= 0;
    const intent = intentPreview();

    const modes = [];
    let className = "box card enemy-card";
    if (zombie.boss) {
        className = className + " boss";
    }
    if (zombie.phase === 2) {
        className = className + " phase-two";
    }
    if (dead === false) {
        if (effects.burn > 0) {
            modes.push("burn");
            className = className + " fx-burn";
        }
        if (effects.bleed > 0) {
            modes.push("bleed");
            className = className + " fx-bleed";
        }
        if (effects.holy > 0) {
            modes.push("holy");
            className = className + " fx-holy";
        }
        if (zombie.stun > 0) {
            className = className + " fx-stun";
        }
        if (zombie.windup) {
            className = className + " fx-windup";
        }
    } else {
        className = className + " slain";
    }

    return (
        <FxBox id="zombieBox" target="enemy" className={className}>
            <div className="card-top">
                <DemonPortrait element={zombie.element} boss={zombie.boss} phaseTwo={zombie.phase === 2} />
                <div className="nameplate">
                    <p className="card-label">
                        <span id="waveLabel">{zombie.boss ? "Boss - Wave " + game.wave : "Wave " + game.wave}</span>{" "}
                        <span id="zombieType">{zombie.type}</span>
                    </p>
                    <h2 id="zombieName">{zombie.name}</h2>
                    <p className="who" id="zombieEpithet">{zombie.epithet}</p>
                </div>
            </div>

            <div className="meter">
                <Bar id="zombieBar" className="enemy-bar" value={zombie.life} max={zombie.maxLife} />
                <span className="meter-text" id="zombieLife">{zombie.life} / {zombie.maxLife}</span>
            </div>

            <p className="traits" id="zombieTraits">
                {zombie.weak.map(function(element) {
                    return <Tag key={"w" + element} kind={element}>Weak {element}</Tag>;
                })}
                {zombie.resist.map(function(element) {
                    return <Tag key={"r" + element} kind="block">Resists {element}</Tag>;
                })}
                {zombie.bleeds === false && <Tag kind="block">No blood</Tag>}
            </p>

            <p className="traits" id="zombieEffects">
                {effects.burn > 0 && <Tag kind="fire">Burning {effects.burn}</Tag>}
                {effects.bleed > 0 && <Tag kind="blood">Bleeding {effects.bleed}</Tag>}
                {effects.holy > 0 && <Tag kind="holy">Holy ground {effects.holy}</Tag>}
                {zombie.stun > 0 && <Tag kind="steel">Stunned</Tag>}
            </p>

            {zombie.perks.length > 0 && (
                <div className="perks">
                    {zombie.perks.map(function(id) {
                        return <span key={id} className="chip perk" title={perks[id].text + " " + perks[id].flavor}>{perks[id].name}</span>;
                    })}
                </div>
            )}

            {/* What it will do on its next turn. */}
            {intent !== null && (
                <p className={"intent " + intent.kind + " " + intent.element} id="zombieIntent">
                    <span className="intent-label">Next</span>{" "}
                    {intent.kind === "windup" && "Winding up a heavy blow"}
                    {intent.kind === "heavy" && <>Heavy {intent.element} blow, {intent.min}-{intent.max}. Stun it, block it, or brace.</>}
                    {intent.kind === "attack" && <>{intent.element} attack, {intent.min}-{intent.max}</>}
                </p>
            )}

            {zombie.stun > 0 && dead === false && (
                <div className="stun-stars" aria-hidden="true"><i></i><i></i><i></i></div>
            )}
            <CardFx target="enemy" modes={modes} aura={dead ? "" : zombie.element} />
        </FxBox>
    );
}
