import { useRef, useState } from "react";
import { useFx } from "../game/hooks.js";

let nextFloatId = 1;

// A card that reacts to hits: damage numbers float off it and it shakes.
// target is "hero" or "enemy", matching what the engine emits.
export default function FxBox({ id, target, className, children }) {
    const box = useRef(null);
    const [floats, setFloats] = useState([]);

    useFx(function(type, payload) {
        if (payload === undefined || payload.target !== target) {
            return;
        }
        if (type === "float") {
            const float = { ...payload, id: nextFloatId, left: 20 + Math.random() * 55 };
            nextFloatId = nextFloatId + 1;
            setFloats(function(list) {
                return [...list, float];
            });
        }
        if (type === "shake") {
            // Removing the class and reading a layout value restarts the animation.
            const el = box.current;
            el.classList.remove("hit", "hit-big");
            void el.offsetWidth;
            el.classList.add(payload.big ? "hit-big" : "hit");
        }
    });

    // Each number removes itself when its animation is over, so a long fight
    // does not leave hundreds of dead spans behind.
    function removeFloat(floatId) {
        setFloats(function(list) {
            return list.filter(function(float) {
                return float.id !== floatId;
            });
        });
    }

    return (
        <div id={id} className={className} ref={box}>
            {children}
            {floats.map(function(float) {
                return (
                    <span
                        key={float.id}
                        className={"float " + float.kind + (float.big ? " big" : "")}
                        style={{ left: float.left + "%" }}
                        onAnimationEnd={function() {
                            removeFloat(float.id);
                        }}
                    >
                        {float.text}
                    </span>
                );
            })}
        </div>
    );
}
