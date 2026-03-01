// game3.js

const stageBox    = document.getElementById('stage-box');
const stageReveal = document.getElementById('stage-reveal');
const boxImg      = document.getElementById('box-img');
let boxOpened     = false;

boxImg.addEventListener('click', () => {
    if (boxOpened) return;
    boxOpened = true;

    // Swap to open box image
    boxImg.src = '../assets/bx2.png';

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
    window.location.href = '67.html';
});