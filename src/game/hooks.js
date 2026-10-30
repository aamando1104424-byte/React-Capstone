// Hooks
// The bridge between the engine and React. The engine mutates `game` in place
// and bumps a version number; useGame re-renders a component when it does.

import { useEffect, useRef, useSyncExternalStore } from "react";
import { game, subscribe, getVersion } from "./engine.js";
import { onFx } from "./fx.js";

export function useGame() {
    useSyncExternalStore(subscribe, getVersion);
    return game;
}

// Calls handler(type, payload) for every effect the engine emits. The handler
// is kept in a ref so components can pass a fresh closure every render.
export function useFx(handler) {
    const saved = useRef(handler);
    useEffect(function() {
        saved.current = handler;
    });
    useEffect(function() {
        return onFx(function(type, payload) {
            saved.current(type, payload);
        });
    }, []);
}
