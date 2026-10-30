// Effects bus
// The rules announce the moments that should feel like something (a number
// floating off a card, a shake, a screen flash, a crit freeze, a burst of
// embers) and whichever components care pick them up. The rules never touch
// the page, so the engine can still be run headless by a test.

const listeners = new Set();

export function onFx(listener) {
    listeners.add(listener);
    return function() {
        listeners.delete(listener);
    };
}

export function emitFx(type, payload) {
    for (const listener of listeners) {
        listener(type, payload);
    }
}

export function floatText(target, text, kind, big) {
    emitFx("float", { target: target, text: String(text), kind: kind, big: big === true });
}

export function shakeBox(target, big) {
    emitFx("shake", { target: target, big: big === true });
}

export function flashScreen(kind) {
    emitFx("flash", kind);
}

export function freeze(ms) {
    emitFx("freeze", ms);
}

export function emberBurst() {
    emitFx("emberBurst");
}
