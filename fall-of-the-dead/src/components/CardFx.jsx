import { useEffect, useRef } from "react";
import { useFx } from "../game/hooks.js";

// The particles drawn over a card while something is happening to it: flames
// licking up from the bottom while it burns, blood running down from the top
// while it bleeds, and so on. It also throws a burst of sparks every time a
// number floats off the card. Pure decoration: nothing here touches a rule.
//
// modes is a list of the effects running right now ("burn", "bleed", "holy",
// "rot", "frost", "shadow", "fury"). aura is an element the card gives off
// faintly all the time, like the rot coming off a ghoul.

const colours = {
    fire: [255, 140, 40],
    blood: [200, 20, 25],
    holy: [255, 214, 120],
    rot: [130, 220, 80],
    frost: [170, 220, 255],
    shadow: [150, 90, 220],
    steel: [220, 230, 240],
    crit: [255, 190, 80],
    heal: [110, 240, 190],
    loot: [255, 210, 90],
    block: [200, 210, 225]
};

// Flames go white-hot at the base, through yellow and orange, to a dark red.
const fireRamp = [
    [255, 250, 220], [255, 220, 120], [255, 160, 40], [240, 90, 20], [180, 40, 10], [90, 20, 10]
];

// A soft round dot, drawn once per colour and stamped from then on. Far
// cheaper than building a gradient for every particle on every frame.
const sprites = {};

function sprite(rgb) {
    const key = rgb.join(",");
    if (sprites[key] === undefined) {
        const size = 64;
        const c = document.createElement("canvas");
        c.width = size;
        c.height = size;
        const ctx = c.getContext("2d");
        const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        g.addColorStop(0, "rgba(" + key + ",1)");
        g.addColorStop(0.4, "rgba(" + key + ",0.55)");
        g.addColorStop(1, "rgba(" + key + ",0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
        sprites[key] = c;
    }
    return sprites[key];
}

function rand(min, max) {
    return min + Math.random() * (max - min);
}

// How many of each a second, and how to start one. w and h are the card's size.
const emitters = {
    burn: {
        rate: 110,
        spawn: function(w, h) {
            // Mostly along the bottom, some climbing the sides.
            const side = Math.random();
            let x = rand(0, w);
            let y = h + 6;
            if (side < 0.2) {
                x = rand(-4, 14);
                y = rand(h * 0.35, h);
            } else if (side < 0.4) {
                x = rand(w - 14, w + 4);
                y = rand(h * 0.35, h);
            }
            return { kind: "flame", x: x, y: y, vx: rand(-12, 12), vy: rand(-120, -50), life: rand(0.5, 1.2), size: rand(14, 34) };
        }
    },
    ember: {
        rate: 14,
        spawn: function(w, h) {
            return { kind: "spark", rgb: [255, 200, 90], x: rand(0, w), y: h, vx: rand(-20, 20), vy: rand(-170, -90), life: rand(0.9, 1.8), size: rand(2, 4), wiggle: rand(2, 6) };
        }
    },
    bleed: {
        rate: 3.5,
        spawn: function(w) {
            return { kind: "drip", x: rand(8, w - 8), y: rand(-4, 6), vx: 0, vy: rand(4, 14), life: rand(2.5, 4), size: rand(2.5, 4.5), gravity: rand(10, 40), trail: [] };
        }
    },
    holy: {
        rate: 28,
        spawn: function(w, h) {
            return { kind: "mote", rgb: colours.holy, x: rand(0, w), y: rand(h * 0.5, h + 4), vx: rand(-6, 6), vy: rand(-45, -15), life: rand(1.2, 2.4), size: rand(3, 9), twinkle: rand(0, 6) };
        }
    },
    rot: {
        rate: 9,
        spawn: function(w, h) {
            return { kind: "bubble", x: rand(6, w - 6), y: h + 4, vx: rand(-4, 4), vy: rand(-40, -18), life: rand(1.2, 2.6), size: rand(3, 8) };
        }
    },
    frost: {
        rate: 16,
        spawn: function(w) {
            return { kind: "flake", x: rand(0, w), y: -6, vx: rand(-10, 10), vy: rand(18, 45), life: rand(2, 4), size: rand(1.5, 3.5), spin: rand(0, 6) };
        }
    },
    shadow: {
        rate: 20,
        spawn: function(w, h) {
            const left = Math.random() < 0.5;
            return { kind: "wisp", x: left ? rand(-10, 20) : rand(w - 20, w + 10), y: rand(0, h), vx: left ? rand(4, 18) : rand(-18, -4), vy: rand(-18, -4), life: rand(1.4, 2.6), size: rand(22, 46) };
        }
    },
    fury: {
        rate: 26,
        spawn: function(w, h) {
            return { kind: "spark", rgb: [255, 70, 50], x: Math.random() < 0.5 ? rand(0, 10) : rand(w - 10, w), y: rand(h * 0.3, h), vx: rand(-10, 10), vy: rand(-110, -50), life: rand(0.5, 1.1), size: rand(2, 3.5), wiggle: 2 };
        }
    }
};

// Which emitters each mode runs, and how hard.
const modeEmitters = {
    burn: [["burn", 1], ["ember", 1]],
    bleed: [["bleed", 1]],
    holy: [["holy", 1]],
    rot: [["rot", 1]],
    frost: [["frost", 1]],
    shadow: [["shadow", 1]],
    fury: [["fury", 1]]
};

// The faint version an enemy gives off on its own.
const auraEmitters = {
    fire: [["ember", 0.35]],
    rot: [["rot", 0.3]],
    frost: [["frost", 0.3]],
    shadow: [["shadow", 0.25]],
    blood: [["bleed", 0.2]],
    holy: [["holy", 0.15]]
};

export default function CardFx({ target, modes, aura }) {
    const canvas = useRef(null);
    const particles = useRef([]);
    const settings = useRef({ modes: modes, aura: aura });

    useEffect(function() {
        settings.current = { modes: modes, aura: aura };
    });

    // Every hit throws sparks off the card in the colour of what hit it.
    useFx(function(type, payload) {
        if (type !== "float" || payload === undefined || payload.target !== target) {
            return;
        }
        const el = canvas.current;
        if (el === null) {
            return;
        }
        const w = el.clientWidth;
        const h = el.clientHeight;
        const rgb = colours[payload.kind] || colours.steel;
        const rising = payload.kind === "heal" || payload.kind === "loot" || payload.kind === "holy";
        const cx = rand(w * 0.3, w * 0.7);
        const cy = rand(h * 0.25, h * 0.55);
        const count = payload.big ? 46 : 22;
        for (let i = 0; i < count; i++) {
            const angle = rising ? rand(-Math.PI * 0.9, -Math.PI * 0.1) : rand(0, Math.PI * 2);
            const speed = rand(60, payload.big ? 320 : 200);
            particles.current.push({
                kind: "spark",
                rgb: rgb,
                x: cx + rand(-20, 20),
                y: cy + rand(-10, 10),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: rand(0.35, 0.8),
                size: rand(2, payload.big ? 5 : 3.5),
                gravity: rising ? -40 : 260,
                wiggle: 0
            });
        }
        // A puff of light behind the sparks.
        particles.current.push({ kind: "flash", rgb: rgb, x: cx, y: cy, vx: 0, vy: 0, life: 0.3, size: payload.big ? 180 : 110 });
    });

    useEffect(function() {
        const el = canvas.current;
        const ctx = el.getContext("2d");
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        let frame = 0;
        let last = performance.now();
        const debt = {};   // Fractions of a particle owed to each emitter.

        function size() {
            el.width = Math.round(el.clientWidth * dpr);
            el.height = Math.round(el.clientHeight * dpr);
        }
        size();
        const observer = new ResizeObserver(size);
        observer.observe(el);

        function emit(name, strength, step, w, h) {
            const owed = (debt[name] || 0) + emitters[name].rate * strength * step;
            const whole = Math.floor(owed);
            debt[name] = owed - whole;
            for (let i = 0; i < whole; i++) {
                const p = emitters[name].spawn(w, h);
                p.age = 0;
                particles.current.push(p);
            }
        }

        function draw(now) {
            const step = Math.min(0.05, (now - last) / 1000);
            last = now;
            const w = el.clientWidth;
            const h = el.clientHeight;
            const active = settings.current;

            const running = {};
            for (const mode of active.modes) {
                for (const [name, strength] of modeEmitters[mode] || []) {
                    running[name] = Math.max(running[name] || 0, strength);
                }
            }
            for (const [name, strength] of auraEmitters[active.aura] || []) {
                running[name] = Math.max(running[name] || 0, strength);
            }
            for (const name in running) {
                emit(name, running[name], step, w, h);
            }

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);

            const list = particles.current;
            let keep = 0;
            for (let i = 0; i < list.length; i++) {
                const p = list[i];
                p.age = (p.age || 0) + step;
                if (p.age >= p.life) {
                    continue;
                }
                list[keep] = p;
                keep = keep + 1;
                const t = p.age / p.life;

                if (p.gravity) {
                    p.vy = p.vy + p.gravity * step;
                }
                p.x = p.x + p.vx * step;
                p.y = p.y + p.vy * step;

                drawParticle(ctx, p, t, step);
            }
            list.length = keep;
            // A hard cap, so a long boss fight cannot grind the page down.
            if (list.length > 900) {
                list.splice(0, list.length - 900);
            }
            frame = requestAnimationFrame(draw);
        }

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches === false) {
            frame = requestAnimationFrame(draw);
        }
        return function() {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, []);

    return <canvas className="card-fx" ref={canvas} aria-hidden="true"></canvas>;
}

function drawParticle(ctx, p, t, step) {
    switch (p.kind) {
        case "flame": {
            const rgb = fireRamp[Math.min(fireRamp.length - 1, Math.floor(t * fireRamp.length))];
            const s = p.size * (1 - t * 0.7);
            p.vx = p.vx + rand(-60, 60) * step;   // Flicker.
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = (1 - t) * 0.55;
            ctx.drawImage(sprite(rgb), p.x - s / 2, p.y - s * 0.65, s, s * 1.3);
            break;
        }
        case "spark": {
            if (p.wiggle) {
                p.x = p.x + Math.sin(p.age * 12) * p.wiggle * step * 10;
            }
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = 1 - t;
            const s = p.size * 3;
            ctx.drawImage(sprite(p.rgb), p.x - s / 2, p.y - s / 2, s, s);
            break;
        }
        case "flash": {
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = (1 - t) * 0.5;
            const s = p.size * (0.6 + t * 0.6);
            ctx.drawImage(sprite(p.rgb), p.x - s / 2, p.y - s / 2, s, s);
            break;
        }
        case "drip": {
            // A bead of blood with the streak it leaves behind.
            p.trail.push([p.x, p.y]);
            if (p.trail.length > 26) {
                p.trail.shift();
            }
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = Math.min(1, (1 - t) * 1.6) * 0.85;
            ctx.strokeStyle = "rgb(120, 6, 10)";
            ctx.lineWidth = p.size * 0.8;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(p.trail[0][0], p.trail[0][1]);
            for (const [x, y] of p.trail) {
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.fillStyle = "rgb(175, 12, 18)";
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.size * 0.8, p.size * 1.2, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        case "mote": {
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = Math.sin(t * Math.PI) * (0.6 + 0.4 * Math.sin(p.age * 8 + p.twinkle));
            const s = p.size * 2.4;
            ctx.drawImage(sprite(p.rgb), p.x - s / 2, p.y - s / 2, s, s);
            break;
        }
        case "bubble": {
            p.x = p.x + Math.sin(p.age * 5) * 6 * step;
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = t > 0.9 ? (1 - t) * 10 * 0.8 : 0.8;
            ctx.strokeStyle = "rgba(150, 230, 90, 0.9)";
            ctx.fillStyle = "rgba(90, 160, 40, 0.25)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (0.7 + t * 0.5), 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        }
        case "flake": {
            p.x = p.x + Math.sin(p.age * 2 + p.spin) * 12 * step;
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = Math.sin(t * Math.PI) * 0.9;
            const s = p.size * 3;
            ctx.drawImage(sprite(colours.frost), p.x - s / 2, p.y - s / 2, s, s);
            break;
        }
        case "wisp": {
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = Math.sin(t * Math.PI) * 0.35;
            const s = p.size * (0.8 + t * 0.8);
            ctx.drawImage(sprite([40, 10, 70]), p.x - s / 2, p.y - s / 2, s, s);
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = Math.sin(t * Math.PI) * 0.12;
            ctx.drawImage(sprite(colours.shadow), p.x - s / 4, p.y - s / 4, s / 2, s / 2);
            break;
        }
        default:
            break;
    }
}
