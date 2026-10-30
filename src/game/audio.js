// Audio
// Sound effects through the Web Audio API, with plain <audio> tags as a
// fallback when fetch is blocked. The context can only be built after the
// first click, which is why startAudio is called from the prologue.

import { muteKey } from "./config.js";
import { sounds } from "./content.js";

// The fallback lets the balance bot import this file outside Vite.
const soundPath = (import.meta.env ? import.meta.env.BASE_URL : "/") + "sounds/";

let muted = false;
let audio = null;           // The AudioContext, built on that first click.
let master = null;
const soundFiles = {};      // Raw bytes, keyed by file name.
const soundBuffers = {};    // Decoded and ready to play.
let useAudioTags = false;   // Set when fetch is blocked.

function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
}

export function loadSounds() {
    for (const name in sounds) {
        for (const file of sounds[name].files) {
            if (soundFiles[file] === undefined) {
                soundFiles[file] = null;
                fetch(soundPath + file + ".ogg").then(function(response) {
                    return response.arrayBuffer();
                }).then(function(data) {
                    soundFiles[file] = data;
                    // A file that arrives after the first click has to be
                    // decoded now, or it would never get its turn.
                    if (audio !== null) {
                        decodeSound(file);
                    }
                }).catch(function() {
                    useAudioTags = true;
                });
            }
        }
    }
}

export function startAudio() {
    if (audio !== null || useAudioTags) {
        return;
    }
    try {
        audio = new AudioContext();
    } catch (err) {
        useAudioTags = true;
        return;
    }
    // A compressor on the way out keeps a crit landing on top of a boss roar
    // from clipping.
    const squash = audio.createDynamicsCompressor();
    squash.threshold.value = -12;
    squash.ratio.value = 4;
    master = audio.createGain();
    master.gain.value = 0.85;
    master.connect(squash);
    squash.connect(audio.destination);

    for (const file in soundFiles) {
        if (soundFiles[file] !== null) {
            decodeSound(file);
        }
    }
    master.gain.value = muted ? 0 : 0.85;
    startAmbience();
}

// slice(0) because decoding consumes the buffer, and one file can be played by
// several different sounds.
function decodeSound(file) {
    audio.decodeAudioData(soundFiles[file].slice(0)).then(function(buffer) {
        soundBuffers[file] = buffer;
    }).catch(function() {});
}

export function playSound(name, volume) {
    if (muted || sounds[name] === undefined) {
        return;
    }
    const sound = sounds[name];
    const file = pick(sound.files);
    let level = sound.volume;
    if (volume !== undefined) {
        level = level * volume;
    }
    // A little pitch wobble on every play, so forty sword hits in a row do not
    // sound like the same recording forty times.
    let rate = sound.rate ? sound.rate : 1;
    rate = rate * (0.94 + Math.random() * 0.12);

    if (audio !== null && soundBuffers[file]) {
        const source = audio.createBufferSource();
        source.buffer = soundBuffers[file];
        source.playbackRate.value = rate;
        const gain = audio.createGain();
        gain.gain.value = level;
        source.connect(gain);
        gain.connect(master);
        source.start();
    } else if (useAudioTags) {
        const tag = new Audio(soundPath + file + ".ogg");
        tag.volume = Math.min(1, level * 0.6);
        tag.preservesPitch = false;
        tag.playbackRate = rate;
        tag.play().catch(function() {});
    }
}

// --- Made in code ---
// The sounds below have no file behind them. They are built from noise and
// oscillators, which suits the ones that have to keep going for as long as a
// state lasts: the wind, the fire on a card, his heart when he is nearly dead.

let noise = null;

function noiseBuffer() {
    if (noise === null) {
        noise = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    }
    return noise;
}

// Wind through the empty streets, and a low hum under it.
function startAmbience() {
    const wind = audio.createBufferSource();
    wind.buffer = noiseBuffer();
    wind.loop = true;
    const band = audio.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 420;
    band.Q.value = 0.8;
    // A slow wobble on the filter makes the wind gust instead of hiss.
    const gust = audio.createOscillator();
    gust.frequency.value = 0.09;
    const gustDepth = audio.createGain();
    gustDepth.gain.value = 260;
    gust.connect(gustDepth);
    gustDepth.connect(band.frequency);
    const windGain = audio.createGain();
    windGain.gain.value = 0.05;
    wind.connect(band);
    band.connect(windGain);
    windGain.connect(master);

    const drone = audio.createGain();
    drone.gain.value = 0.025;
    const low = audio.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 180;
    for (const freq of [55, 55.4, 82.5]) {
        const osc = audio.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = freq;
        osc.connect(low);
        osc.start();
    }
    low.connect(drone);
    drone.connect(master);

    wind.start();
    gust.start();
}

// One crackle of a fire: a tiny burst of filtered noise.
function crackle() {
    const now = audio.currentTime;
    for (let i = 0; i < 3; i++) {
        const source = audio.createBufferSource();
        source.buffer = noiseBuffer();
        const high = audio.createBiquadFilter();
        high.type = "highpass";
        high.frequency.value = 1500 + Math.random() * 3000;
        const gain = audio.createGain();
        const start = now + Math.random() * 0.25;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12 + Math.random() * 0.15, start + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.03 + Math.random() * 0.05);
        source.connect(high);
        high.connect(gain);
        gain.connect(master);
        source.start(start, Math.random() * 1.5, 0.1);
    }
    // And the roar under it.
    const roar = audio.createBufferSource();
    roar.buffer = noiseBuffer();
    const lowpass = audio.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 500;
    const roarGain = audio.createGain();
    roarGain.gain.setValueAtTime(0.0001, now);
    roarGain.gain.linearRampToValueAtTime(0.06, now + 0.15);
    roarGain.gain.linearRampToValueAtTime(0.0001, now + 0.4);
    roar.connect(lowpass);
    lowpass.connect(roarGain);
    roarGain.connect(master);
    roar.start(now, Math.random() * 1.5, 0.45);
}

// Lub-dub.
function heartbeat() {
    const now = audio.currentTime;
    for (const offset of [0, 0.22]) {
        const osc = audio.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(70, now + offset);
        osc.frequency.exponentialRampToValueAtTime(38, now + offset + 0.15);
        const gain = audio.createGain();
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(offset === 0 ? 0.55 : 0.35, now + offset + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.2);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now + offset);
        osc.stop(now + offset + 0.25);
    }
}

const loopSounds = { crackle: { play: crackle, every: 400 }, heartbeat: { play: heartbeat, every: 950 } };
const loopTimers = {};

// Keeps a looping sound going while on is true. Safe to call every render.
export function setLoop(name, on) {
    const running = loopTimers[name] !== undefined;
    if (on && running === false) {
        loopTimers[name] = setInterval(function() {
            if (audio !== null && muted === false) {
                loopSounds[name].play();
            }
        }, loopSounds[name].every);
    } else if (on === false && running) {
        clearInterval(loopTimers[name]);
        delete loopTimers[name];
    }
}

export function isMuted() {
    return muted;
}

export function setMuted(value) {
    muted = value;
    if (master !== null) {
        master.gain.value = muted ? 0 : 0.85;
    }
    try {
        localStorage.setItem(muteKey, muted ? "1" : "0");
    } catch (err) {
        console.log(err);
    }
}

export function loadMuted() {
    try {
        muted = localStorage.getItem(muteKey) === "1";
    } catch (err) {
        console.log(err);
    }
    return muted;
}
