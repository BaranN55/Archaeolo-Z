const TOTAL_PRESSES = 5;

let presses = 0;
let isSwinging = false;
let diggingDone = false;

const pickaxe     = document.getElementById('pickaxe');
const overlay     = document.getElementById('bg-overlay');
const introText   = document.getElementById('intro-text');
const sideButtons = document.getElementById('side-buttons');

// Pickaxe images - up = resting, down = swinging
const PICKAXE_UP   = 'assets/Axeup.png';
const PICKAXE_DOWN = 'assets/Axedown.png';

const axeSound = new Audio('assets/axesound.mp3');

document.addEventListener('keydown', (e) => {
    if (e.code !== 'Space') return;
    e.preventDefault(); // prevent page scroll

    if (diggingDone || isSwinging) return;

    axeSound.currentTime = 0;
    axeSound.play();
    
    isSwinging = true;
    presses++;

    // Switch to swinging pickaxe image
    pickaxe.src = PICKAXE_DOWN;
    pickaxe.classList.add('swing');

    // Fade background a bit more with each press
    const newOpacity = presses / TOTAL_PRESSES;
    overlay.style.opacity = newOpacity;

    // After a visible delay, return pickaxe to resting position
    setTimeout(() => {
        pickaxe.src = PICKAXE_UP;
        pickaxe.classList.remove('swing');

        setTimeout(() => {
            isSwinging = false;

            if (presses >= TOTAL_PRESSES) {
                diggingDone = true;
                finishDigging();
            }
        }, 200);
    }, 200);
});

function finishDigging() {
    // Hide intro text and pickaxe
    introText.style.opacity = '0';
    pickaxe.style.transition = 'opacity 0.5s ease';
    pickaxe.style.opacity = '0';

    // Wait for the final background overlay transition to fully complete (0.4s)
    // then navigate so the paper appears right as the new bg is fully visible
    setTimeout(() => {
        window.location.href = 'quiz.html';
    }, 500);
}
