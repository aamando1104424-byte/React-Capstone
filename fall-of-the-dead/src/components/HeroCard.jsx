import { useGame } from "../game/hooks.js";
import { getScore, xpNeeded, heroResist, weaponIn } from "../game/engine.js";
import { maxFaith } from "../game/config.js";
import { elementOrder } from "../game/weapons.js";
import { ranks, woundNames } from "../game/content.js";
import { skills } from "../game/skills.js";
import { relics } from "../game/relics.js";
import FxBox from "./FxBox.jsx";
import CardFx from "./CardFx.jsx";
import Bar, { Pips } from "./Bar.jsx";
import { HeroPortrait } from "./Portrait.jsx";
import { Tag } from "./RichText.jsx";

// What a wound looks like on his card.
const woundModes = { fire: "burn", blood: "bleed", rot: "rot", frost: "frost", shadow: "shadow" };

// Aldric's card: his portrait, his stats, his blessings and relics. The
// buttons he presses live in ActionBar.
export default function HeroCard() {
    const game = useGame();
    const user = game.user;

    const modes = [];
    let className = "box card hero-card";
    if (user.wound !== null) {
        modes.push(woundModes[user.wound.element]);
        className = className + " fx-" + woundModes[user.wound.element];
    }
    if (user.fury > 0) {
        modes.push("fury");
        className = className + " fx-fury";
    }
    if (game.praying) {
        modes.push("holy");
        className = className + " fx-holy";
    }
    if (user.bulwark > 0) {
        className = className + " fx-bulwark";
    }
    if (user.life > 0 && user.life <= user.maxLife * 0.25) {
        className = className + " fx-low";
    }
    if (game.gameOver) {
        className = className + " fallen";
    }

    return (
        <FxBox id="userBox" target="hero" className={className}>
            <div className="card-top">
                <HeroPortrait level={user.level} maxLevel={ranks.length} />
                <div className="nameplate">
                    <p className="card-label"><span id="rankLabel">Rank {user.level} of {ranks.length}</span></p>
                    <h2 id="userTitle">{user.title}</h2>
                    <p className="who" id="userName">{user.name}</p>
                </div>
            </div>

            <div className="meter">
                <Bar id="userBar" className="hero-bar" value={user.life} max={user.maxLife} />
                <span className="meter-text" id="userLife">{user.life} / {user.maxLife}</span>
            </div>
            <div className="faith-row">
                <span className="faith-label">Faith</span>
                <Pips count={user.faith} max={maxFaith} className="pips" id="faithPips" label={user.faith + " of " + maxFaith + " Faith"} />
            </div>
            <div className="favor-row" title="Favor: fills to rank up">
                <div className="favor-track">
                    <div className="favor-fill" style={{ width: (user.level >= ranks.length ? 100 : (user.xp / xpNeeded()) * 100) + "%" }}></div>
                </div>
                <span id="userFavor">{user.level >= ranks.length ? "MAX" : user.xp + "/" + xpNeeded()}</span>
            </div>

            <div className="stats">
                <p><span className="stat-label">Score</span> <span id="userScore">{getScore()}</span></p>
                <p><span className="stat-label">Gold</span> <span id="userGold" className="gold">{user.gold}</span></p>
                {elementOrder.map(function(element) {
                    const weapon = weaponIn(element);
                    return (
                        <p key={element} className={"wide weapon-line " + element + (weapon === null ? " none" : "")}>
                            <span className="stat-label">{element}</span>{" "}
                            <span>{weapon === null ? "none" : weapon.name + " (+" + weapon.attack + ")"}</span>
                        </p>
                    );
                })}
                <p className="wide"><span className="stat-label">Armour</span> <span id="userArmour">{user.armour.name}{user.armour.block > 0 ? " (" + user.armour.block + " in 10)" : ""}</span></p>
            </div>

            <p className="traits resists">
                {["rot", "blood", "fire", "frost", "shadow"].map(function(element) {
                    const resist = heroResist(element);
                    return resist > 0 ? <Tag key={element} kind={element}>Resist {element} {Math.round(resist * 100)}%</Tag> : null;
                })}
            </p>

            <p className="traits">
                {user.wound !== null && <Tag kind={user.wound.element}>{woundNames[user.wound.element]} {user.wound.turns}</Tag>}
                {user.bulwark > 0 && <Tag kind="block">Bulwark {user.bulwark}</Tag>}
                {user.fury > 0 && <Tag kind="crit">Fury {user.fury}</Tag>}
                <Tag kind="heal">Potions {user.potions}</Tag>
            </p>

            <div className="blessings" id="blessingList">
                {user.blessings.map(function(id) {
                    return <span key={id} className="chip" title={skills[id].text}>{skills[id].name}</span>;
                })}
                {user.relics.map(function(id) {
                    return <span key={id} className={"chip relic " + relics[id].element} title={relics[id].text}>{relics[id].name}</span>;
                })}
            </div>

            {user.bulwark > 0 && <div className="bulwark-dome" aria-hidden="true"></div>}
            <CardFx target="hero" modes={modes} />
        </FxBox>
    );
}
