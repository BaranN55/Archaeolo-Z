// game3.js

const stageBox    = document.getElementById('stage-box');
const stageReveal = document.getElementById('stage-reveal');
const boxImg      = document.getElementById('box-img');
let boxOpened     = false;

const clickSound = new Audio('assets/clicksound.mp3');

boxImg.addEventListener('click', () => {
    if (boxOpened) return;
    clickSound.currentTime = 0;
    clickSound.play();
    boxOpened = true;

    // Swap to open box image
    boxImg.src = 'assets/bx2.png';

    // After a beat, fade out box and show reveal
    setTimeout(() => {
        stageBox.classList.add('hidden');
        setTimeout(() => {
            stageReveal.classList.add('visible');
        }, 500);
    }, 600);
});

// "I'm Ready" button → go to pose detector
document.getElementById('go-pose-btn').addEventListener('click', () => {
    clickSound.currentTime = 0;
    clickSound.play();
    window.location.href = '67.html';
});