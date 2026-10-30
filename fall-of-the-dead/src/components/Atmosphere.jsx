import { useEffect, useRef, useState } from "react";
import { useFx } from "../game/hooks.js";
import { emberCount } from "../game/config.js";
import { ranks } from "../game/content.js";

// The parts that exist purely to make a hit feel like a hit. None of it
// changes a single rule, so all of it is safe to skip.

// A full screen flash. Changing the key remounts the div, which restarts the
// animation even when two red flashes land back to back.
export function Flash() {
    const [flash, setFlash] = useState({ kind: "", n: 0 });
    useFx(function(type, kind) {
        if (type === "flash") {
            setFlash(function(last) {
                return { kind: kind, n: last.n + 1 };
            });
        }
    });
    return <div id="flash" key={flash.n} className={flash.kind} aria-hidden="true"></div>;
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
        depth: depth
    };
}

// The ash drifting behind the page. Grey ash at Peasant turns to gold light by
// Saint, so it reads the current rank on every frame.
export function Embers({ level }) {
    const canvas = useRef(null);
    const embers = useRef([]);
    const levelRef = useRef(level);

    useEffect(function() {
        levelRef.current = level;
    }, [level]);

    // A puff of light for a rank up. The extras are trimmed afterwards so they
    // do not build up over a long run.
    useFx(function(type) {
        if (type !== "emberBurst") {
            return;
        }
        for (let i = 0; i < 40; i++) {
            const ember = newEmber(window.innerHeight * 0.6);
            ember.speed = ember.speed * 4;
            ember.size = ember.size * 1.6;
            embers.current.push(ember);
        }
        while (embers.current.length > emberCount + 60) {
            embers.current.shift();
        }
    });

    useEffect(function() {
        const el = canvas.current;
        const ctx = el.getContext("2d");
        let frame = 0;
        let lastTime = 0;

        function size() {
            el.width = window.innerWidth;
            el.height = window.innerHeight;
        }
        size();
        window.addEventListener("resize", size);

        embers.current = [];
        for (let i = 0; i < emberCount; i++) {
            embers.current.push(newEmber(Math.random() * window.innerHeight));
        }

        function draw(now) {
            const step = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
            lastTime = now;
            ctx.clearRect(0, 0, el.width, el.height);

            const warmth = (levelRef.current - 1) / (ranks.length - 1);
            const red = Math.round(150 + 105 * warmth);
            const green = Math.round(120 + 90 * warmth);
            const blue = Math.round(110 - 60 * warmth);
            ctx.globalCompositeOperation = "lighter";
            for (const ember of embers.current) {
                ember.y = ember.y - ember.speed * step;
                ember.x = ember.x + Math.sin(ember.y / 90) * ember.drift * step;
                if (ember.y < -20) {
                    Object.assign(ember, newEmber());
                }
                ctx.fillStyle = "rgba(" + red + "," + green + "," + blue + "," + (0.10 + 0.22 * ember.depth * (0.4 + warmth)) + ")";
                ctx.beginPath();
                ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalCompositeOperation = "source-over";
            frame = requestAnimationFrame(draw);
        }

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches === false) {
            frame = requestAnimationFrame(draw);
        }

        return function() {
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", size);
        };
    }, []);

    return <canvas id="embers" ref={canvas} aria-hidden="true"></canvas>;
}
