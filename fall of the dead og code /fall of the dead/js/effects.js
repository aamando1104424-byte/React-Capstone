// Effects
// The parts that exist purely to make a hit feel like a hit: damage numbers
// that float off the cards, shakes, screen flashes, and the ash drifting behind
// the page. None of it changes a single rule, so all of it is safe to skip.

function heroBox() {
    return document.getElementById("userBox");
}

function enemyBox() {
    return document.getElementById("zombieBox");
}

// Floats a number out of a card. Each one removes itself when its animation is
// over, so a long fight does not leave hundreds of dead spans behind.
function floatText(box, text, kind, big) {
    const span = document.createElement("span");
    span.className = "float " + kind + (big ? " big" : "");
    span.textContent = text;
    span.style.left = (20 + Math.random() * 55) + "%";
    box.appendChild(span);
    span.addEventListener("animationend", function() {
        span.remove();
    });
}

function shakeBox(box, big) {
    box.classList.remove("hit", "hit-big");
    void box.offsetWidth;   // Reading a layout value restarts the animation.
    box.classList.add(big ? "hit-big" : "hit");
}

function flashScreen(kind) {
    const flash = document.getElementById("flash");
    flash.className = "";
    void flash.offsetWidth;
    flash.className = kind;
}

// Holds every animation still for a moment so a crit reads as a crit.
function freeze(ms) {
    document.body.classList.add("frozen");
    setTimeout(function() {
        document.body.classList.remove("frozen");
    }, ms);
}

// --- Ash and embers ---

let embers = [];
let emberCanvas = null;
let emberCtx = null;
let lastEmberTime = 0;

function startEmbers() {
    emberCanvas = document.getElementById("embers");
    emberCtx = emberCanvas.getContext("2d");
    sizeEmbers();
    window.addEventListener("resize", sizeEmbers);
    for (let i = 0; i < emberCount; i++) {
        embers.push(newEmber(Math.random() * window.innerHeight));
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches === false) {
        requestAnimationFrame(drawEmbers);
    }
}

function sizeEmbers() {
    emberCanvas.width = window.innerWidth;
    emberCanvas.height = window.innerHeight;
}

// Depth fakes distance: the far ones are small and slow, the near ones big and
// fast. Passing no y starts an ember below the bottom of the screen.
function newEmber(y) {
    const depth = 0.3 + Math.random() * 0.7;
    return {
        x: Math.random() * window.innerWidth,
        y: y === undefined ? window.innerHeight + 20 : y,
        size: depth * 2.4,
        speed: depth * (8 + Math.random() * 18),
        drift: (Math.random() - 0.5) * 14,
        life: 1,
        depth: depth
    };
}

function drawEmbers(now) {
    const step = Math.min(0.05, (now - lastEmberTime) / 1000 || 0.016);
    lastEmberTime = now;
    emberCtx.clearRect(0, 0, emberCanvas.width, emberCanvas.height);

    // Grey ash at Peasant turns to gold light by Saint.
    const warmth = (user.level - 1) / (ranks.length - 1);
    emberCtx.globalCompositeOperation = "lighter";
    for (const ember of embers) {
        ember.y = ember.y - ember.speed * step;
        ember.x = ember.x + Math.sin(ember.y / 90) * ember.drift * step;
        if (ember.y < -20) {
            Object.assign(ember, newEmber());
        }
        const red = Math.round(150 + 105 * warmth);
        const green = Math.round(120 + 90 * warmth);
        const blue = Math.round(110 - 60 * warmth);
        emberCtx.fillStyle = "rgba(" + red + "," + green + "," + blue + "," + (0.10 + 0.22 * ember.depth * (0.4 + warmth)) + ")";
        emberCtx.beginPath();
        emberCtx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
        emberCtx.fill();
    }
    emberCtx.globalCompositeOperation = "source-over";
    requestAnimationFrame(drawEmbers);
}

// A puff of light for a rank up. The extra embers are trimmed afterwards so
// they do not build up over a long run.
function emberBurst() {
    for (let i = 0; i < 40; i++) {
        const ember = newEmber(window.innerHeight * 0.6);
        ember.speed = ember.speed * 4;
        ember.size = ember.size * 1.6;
        embers.push(ember);
    }
    while (embers.length > emberCount + 60) {
        embers.shift();
    }
}
