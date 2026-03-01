// game2.js

const collectHint  = document.getElementById('collect-hint');
const flashEl      = document.getElementById('collect-flash');
const shovelOverlay = document.getElementById('shovel-overlay');
const shovelText   = document.getElementById('shovel-intro-text');
const shovelImg    = document.getElementById('shovel-img');
const nextBgOverlay = document.getElementById('next-bg-overlay');
const needToolMsg  = document.getElementById('need-tool-msg');

const SHOVEL_UP   = '../assets/shovel1.png';
const SHOVEL_DOWN = '../assets/shovel2.png';
const TOTAL_PRESSES = 5;

let flashTimer   = null;
let shovelPhase  = false;
let shovelPresses = 0;
let shovelSwinging = false;
let shovelDone   = false;

// ── Flash message ─────────────────────────────────────────────
function showFlash(msg) {
    flashEl.textContent = msg;
    flashEl.classList.add('show');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => flashEl.classList.remove('show'), 2000);
}

// ── Collectibles ──────────────────────────────────────────────
function checkHint() {
    const remaining = document.querySelectorAll('.collectible:not(.collected)').length;
    if (remaining === 0) {
        collectHint.classList.add('hidden');
        // After both collected, prompt to dig (with short delay)
        setTimeout(promptDig, 800);
    }
}

document.querySelectorAll('.collectible').forEach(el => {
    const id = el.dataset.id;
    if (GameState.isCollected(id)) el.classList.add('collected');

    el.addEventListener('click', () => {
        if (GameState.isCollected(id)) return;
        const item = ITEMS[id];
        GameState.addCollected(id);
        el.classList.add('collected');
        showFlash(`${item.name} collected!`);
        checkHint();
    });
});

checkHint();

// ── Prompt to dig ─────────────────────────────────────────────
function promptDig() {
    if (shovelPhase || shovelDone) return;

    if (GameState.ownsTool('shovel')) {
        // Has shovel — show digging overlay
        shovelOverlay.classList.add('visible');
        shovelPhase = true;
        needToolMsg.style.display = 'none';
    } else {
        // Doesn't have shovel — show message
        needToolMsg.style.display = 'block';
    }
}

// Re-check when returning from tools page (in case they just bought it)
window.addEventListener('focus', () => {
    if (!shovelPhase && !shovelDone) promptDig();
});

// ── Shovel digging spacebar logic ─────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.code !== 'Space') return;
    e.preventDefault();

    if (!shovelPhase || shovelDone || shovelSwinging) return;

    shovelSwinging = true;
    shovelPresses++;

    shovelImg.src = SHOVEL_DOWN;
    shovelImg.classList.add('swing');

    // Fade next bg gradually
    nextBgOverlay.style.opacity = shovelPresses / TOTAL_PRESSES;

    setTimeout(() => {
        shovelImg.src = SHOVEL_UP;
        shovelImg.classList.remove('swing');

        setTimeout(() => {
            shovelSwinging = false;

            if (shovelPresses >= TOTAL_PRESSES) {
                shovelDone = true;
                finishLevel();
            }
        }, 500);
    }, 600);
});

function finishLevel() {
    shovelText.style.opacity = '0';
    shovelImg.style.opacity = '0';

    setTimeout(() => {
        window.location.href = 'game3.html'; // next level
    }, 500);
}