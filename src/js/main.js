import { init } from './game.js';

const preloader = document.getElementById('preloader');
if (preloader) {
    preloader.classList.add('preloader-hidden');
}

init();