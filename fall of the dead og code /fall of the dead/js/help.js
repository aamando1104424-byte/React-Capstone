// Help
// The How to Play screen. Every number in it is read from config.js and the
// content tables when the screen is opened, so the explanation cannot disagree
// with the game the way a hand written help page eventually would.

function openHelp() {
    const body = document.getElementById("helpBody");
    if (body.innerHTML === "") {
        body.innerHTML = buildHelp();
    }
    const dialog = document.getElementById("helpDialog");
    if (dialog.showModal) {
        dialog.showModal();
    }
}

function closeHelp() {
    const dialog = document.getElementById("helpDialog");
    if (dialog.open) {
        dialog.close();
    }
}

function buildHelp() {
    let html = "";

    html += "<h3>The idea</h3><p>Aldric starts drunk in a gutter with a pitchfork and climbs " + ranks.length +
        " ranks back to sainthood, fighting one demon at a time. The waves never stop. How far you get is your score.</p>";

    html += "<h3>Your turn</h3><ul>" +
        "<li><b>" + ranks[0].weapon.swing + " / Attack</b>: hit for your attack give or take " + damageSpread + ", and gain " + faithPerTurn + " Faith. Every hit has a " + critChance + " in 10 chance to crit for " + critMultiplier + "x.</li>" +
        "<li><b>Pray</b>: a chance to heal " + startHeal + " life (it grows " + healPerLevel + " a rank). The chance starts at " + ranks[0].prayer + " in 10 and reaches " + ranks[ranks.length - 1].prayer + " in 10 as a Saint. Praying still gains " + faithPerTurn + " Faith.</li>" +
        "<li><b>Potion</b>: heals the same and clears a wound. You get one more every wave, up to " + maxPotions + ".</li>" +
        "<li><b>Combo</b>: costs " + comboCost + " Faith for " + comboHits + " quick hits. From Knight on it becomes Saint Michael's prayer and each hit lands at " + comboMultiplier + "x.</li>" +
        "</ul>";

    html += "<h3>Faith</h3><p>Anything you do in a turn gives " + faithPerTurn + " Faith, up to " + maxFaith +
        ". Skills and combos spend it, so you are always choosing between a big combo and a skill.</p>";

    html += "<h3>Elements</h3><p>Every demon is weak to something (" + weakMultiplier + "x damage) and some resist things (half damage). Bloodless demons cannot bleed. What each one takes badly:</p><ul>";
    for (const demon of demons.concat(bosses)) {
        html += "<li><b>" + demon.name + "</b>: weak to " + demon.weak.join(" and ") +
            (demon.resist.length > 0 ? ", resists " + demon.resist.join(" and ") : "") +
            (demon.bleeds === false ? ", no blood" : "") + "</li>";
    }
    html += "</ul>";

    html += "<h3>Wounds</h3><p>A demon's hit has a " + woundChance + " in 10 chance to leave a wound: " + woundDamage +
        " life a turn for " + woundLength + " turns. A potion, or Confession, clears it.</p>";

    html += "<h3>Bosses</h3><p>Every " + bossEvery + " waves something worse turns up with " + bossLife +
        "x life and " + bossAttack + "x attack. At half life it gets angrier and hits " + Math.round((phaseTwoAttack - 1) * 100) +
        "% harder. It warns you one turn before a heavy blow, which lands for " + heavyMultiplier +
        "x and goes straight through armour. Stun it, use Bulwark, or take it on the chin. A boss is worth " + pointsPerBoss + " score.</p>";

    html += "<h3>Ranks</h3><p>" + xpPerLevel + " Favor is a rank. Each one gives +" + attackPerLevel + " attack, +" +
        lifePerLevel + " max life, +" + healPerLevel + " healing, a full heal, and a choice of two skills.</p><ul>";
    for (let i = 0; i < ranks.length; i++) {
        const rank = ranks[i];
        let gear = [];
        if (rank.weapon) {
            gear.push(rank.weapon.name + " +" + rank.weapon.attack);
        }
        if (rank.armour) {
            gear.push(rank.armour.name + " " + rank.armour.block + " in 10");
        }
        html += "<li><b>" + (i + 1) + ". " + rank.title + "</b>: prayers " + rank.prayer + " in 10" +
            (gear.length > 0 ? ", " + gear.join(", ") : "") + "</li>";
    }
    html += "</ul>";

    html += "<h3>Skills</h3><ul>";
    for (const id in skills) {
        const skill = skills[id];
        html += "<li><b>" + skill.name + "</b> (" + (skill.kind === "skill" ? skill.cost + " Faith" : "blessing") + "): " + skill.text + "</li>";
    }
    html += "</ul>";

    html += "<h3>Score</h3><p>Every point of damage is a point, a kill is " + pointsPerKill + " and a boss is another " +
        pointsPerBoss + ". The top " + boardSize + " runs are saved in this browser.</p>";

    return html;
}
