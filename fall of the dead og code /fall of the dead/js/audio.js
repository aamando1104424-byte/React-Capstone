let muted = false;
let audio = null;           // The AudioContext, built on that first click.
let master = null;
const soundFiles = {};      // Raw bytes, keyed by file name.
const soundBuffers = {};    // Decoded and ready to play.
let useAudioTags = false;   // Set when fetch is blocked, e.g. opened from disk.

function loadSounds() {
    for (const name in sounds) {
        for (const file of sounds[name].files) {
            if (soundFiles[file] === undefined) {
                soundFiles[file] = null;
                fetch("sounds/" + file + ".ogg").then(function(response) {
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

function startAudio() {
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
}

// slice(0) because decoding consumes the buffer, and one file can be played by
// several different sounds.
function decodeSound(file) {
    audio.decodeAudioData(soundFiles[file].slice(0)).then(function(buffer) {
        soundBuffers[file] = buffer;
    }).catch(function() {});
}

function playSound(name, volume) {
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
        const tag = new Audio("sounds/" + file + ".ogg");
        tag.volume = Math.min(1, level * 0.6);
        tag.preservesPitch = false;
        tag.playbackRate = rate;
        tag.play().catch(function() {});
    }
}

function toggleSound() {
    muted = !muted;
    try {
        localStorage.setItem(muteKey, muted ? "1" : "0");
    } catch (err) {
        console.log(err);
    }
    showSoundButton();
}

function showSoundButton() {
    const button = document.getElementById("soundBtn");
    button.textContent = muted ? "Sound: Off" : "Sound: On";
    button.setAttribute("aria-pressed", muted ? "false" : "true");
}

function loadMuted() {
    try {
        muted = localStorage.getItem(muteKey) === "1";
    } catch (err) {
        console.log(err);
    }
    showSoundButton();
}
