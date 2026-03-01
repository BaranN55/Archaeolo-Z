// game4.js

const collectHint   = document.getElementById('collect-hint');
const flashEl       = document.getElementById('collect-flash');
const drillOverlay  = document.getElementById('drill-overlay');
const drillText     = document.getElementById('drill-intro-text');
const drillImg      = document.getElementById('drill-img');
const nextBgOverlay = document.getElementById('next-bg-overlay');
const needToolMsg   = document.getElementById('need-tool-msg');

const DRILL_UP   = '../assets/drill1.png';
const DRILL_DOWN = '../assets/drill2.png';
const TOTAL_PRESSES = 5;

let flashTimer    = null;
let drillPhase    = false;
let drillPresses  = 0;
let drillSwinging = false;
let drillDone     = false;

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
    if (drillPhase || drillDone) return;

    if (GameState.ownsTool('drill')) {
        drillOverlay.classList.add('visible');
        drillPhase = true;
        needToolMsg.style.display = 'none';
    } else {
        needToolMsg.style.display = 'block';
    }
}

window.addEventListener('focus', () => {
    if (!drillPhase && !drillDone) promptDig();
});

// ── Drill digging spacebar logic ──────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.code !== 'Space') return;
    e.preventDefault();

    if (!drillPhase || drillDone || drillSwinging) return;

    drillSwinging = true;
    drillPresses++;

    drillImg.src = DRILL_DOWN;

    nextBgOverlay.style.opacity = drillPresses / TOTAL_PRESSES;

    setTimeout(() => {
        drillImg.src = DRILL_UP;

        setTimeout(() => {
            drillSwinging = false;

            if (drillPresses >= TOTAL_PRESSES) {
                drillDone = true;
                finishLevel();
            }
        }, 150);
    }, 150);
});

function finishLevel() {
    drillText.style.opacity = '0';
    drillImg.style.opacity  = '0';

    setTimeout(() => {
        window.location.href = 'game5.html'; // next level
    }, 500);
}