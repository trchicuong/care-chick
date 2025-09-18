import { BG_MUSIC_NORMAL_VOLUME, BG_MUSIC_DUCKED_VOLUME } from './data.js';
import { muteIcon, bgMusic as bgMusicElement } from './ui.js';

export let isMuted = false;
let duckingTimeout = null;
let audioContext;
let bgMusicSource;
let bgMusicGainNode;
let masterGainNode;
const sfxBuffers = {};

export const startAudio = new Audio('/audio/start.mp3');
startAudio.volume = 1.0;

async function loadSoundToBuffer(url) {
    if (!audioContext) return null;
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
    } catch (error) {
        console.error(`Lỗi tải file âm thanh ${url}:`, error);
        return null;
    }
}

export function playSfxFromBuffer(key, loop = false) {
    if (sfxBuffers[key] && audioContext) {
        clearTimeout(duckingTimeout);
        if (bgMusicGainNode) {
            bgMusicGainNode.gain.linearRampToValueAtTime(BG_MUSIC_DUCKED_VOLUME, audioContext.currentTime + 0.5);
        }

        const sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = sfxBuffers[key];
        sourceNode.loop = loop;
        sourceNode.connect(masterGainNode);
        sourceNode.start(0);

        if (!loop) {
            duckingTimeout = setTimeout(() => {
                if (bgMusicGainNode) {
                    bgMusicGainNode.gain.linearRampToValueAtTime(BG_MUSIC_NORMAL_VOLUME, audioContext.currentTime + 0.5);
                }
            }, 2000);
        }
        return sourceNode;
    }
    return null;
}

export function playSound(key) {
    if (sfxBuffers[key] && audioContext) {
        const sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = sfxBuffers[key];
        sourceNode.connect(masterGainNode);
        sourceNode.start(0);
    }
}

export function playStart(audio) {
    audio.currentTime = 0;
    audio.play().catch(e => console.error("Audio play failed:", e));
};

export async function setupBgMusicWithWebAudio() {
    if (audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
    masterGainNode = audioContext.createGain();
    bgMusicGainNode = audioContext.createGain();
    bgMusicSource = audioContext.createMediaElementSource(bgMusicElement);

    bgMusicSource.connect(bgMusicGainNode).connect(masterGainNode).connect(audioContext.destination);

    bgMusicGainNode.gain.value = BG_MUSIC_NORMAL_VOLUME;
    masterGainNode.gain.value = isMuted ? 0 : 1;

    const sfxToLoad = {
        sad: '/audio/sad.mp3', wake: '/audio/wake.mp3',
        sleep: '/audio/sleep.mp3', heal: '/audio/healing.mp3',
        click: '/audio/click.mp3', eat: '/audio/eat.mp3',
        clean: '/audio/clean.mp3', pay: '/audio/pay.mp3'
    };
    for (const key in sfxToLoad) {
        sfxBuffers[key] = await loadSoundToBuffer(sfxToLoad[key]);
    }
}

export function applyMuteState() {
    muteIcon.className = isMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    localStorage.setItem('isGameMuted', isMuted);

    if (masterGainNode) {
        masterGainNode.gain.value = isMuted ? 0 : 1;
    }

    if (isMuted) {
        bgMusicElement.pause();
    } else {
        if (audioContext && audioContext.state === 'running') {
            bgMusicElement.play().catch(e => { });
        }
    }
}

export function toggleMute() {
    isMuted = !isMuted;
    applyMuteState();
}

export function loadMuteState() {
    isMuted = localStorage.getItem('isGameMuted') === 'true';
    muteIcon.className = isMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
}