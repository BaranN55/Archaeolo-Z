// game5.js

const collectHint   = document.getElementById('collect-hint');
const flashEl       = document.getElementById('collect-flash');
const sellPrompt    = document.getElementById('sell-prompt');
const nextBgOverlay = document.getElementById('next-bg-overlay');

const MARS_COIN_TARGET = 1350;
let flashTimer = null;
let marsTriggered = false;

const clickSound = new Audio('assets/clicksound.mp3');

// ── Flash message ─────────────────────────────────────────────
function showFlash(msg) {
    flashEl.textContent = msg;
    flashEl.classList.add('show');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => flashEl.classList.remove('show'), 2000);
}

// ── Check coins and trigger Mars if target reached ────────────
function checkCoins() {
    if (marsTriggered) return;
    if (GameState.getCoins() >= MARS_COIN_TARGET) {
        marsTriggered = true;
        showMarsEnding();
    }
}

// ── Collectibles ──────────────────────────────────────────────
function checkHint() {
    const remaining = document.querySelectorAll('.collectible:not(.collected)').length;
    if (remaining === 0) {
        collectHint.classList.add('hidden');
        setTimeout(showSellPrompt, 800);
    }
}

document.querySelectorAll('.collectible').forEach(el => {
    const id = el.dataset.id;
    if (GameState.isCollected(id)) el.classList.add('collected');

    el.addEventListener('click', () => {
        if (GameState.isCollected(id)) return;
        clickSound.currentTime = 0;
        clickSound.play();
        const item = ITEMS[id];
        GameState.addCollected(id);
        el.classList.add('collected');
        showFlash(`${item.name} collected!`);
        checkHint();
    });
});

checkHint();

// ── Show sell prompt ──────────────────────────────────────────
function showSellPrompt() {
    sellPrompt.classList.add('visible');
}

// ── Poll coins every 500ms (catches sells done on other pages) ─
setInterval(checkCoins, 500);

// Also check immediately and on page focus/show
checkCoins();
window.addEventListener('pageshow', checkCoins);
window.addEventListener('focus', checkCoins);
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkCoins();
});

// ── Mars ending ───────────────────────────────────────────────
function showMarsEnding() {
    sellPrompt.style.display = 'none';
    collectHint.style.display = 'none';

    // Inject a style that permanently hides the nav regardless of re-injection
    const hideStyle = document.createElement('style');
    hideStyle.textContent = '#persistent-nav { display: none !important; }';
    document.head.appendChild(hideStyle);

    document.getElementById('coin-count').textContent = GameState.getCoins();

    // Stage 1: Show ticket bg + message
    const ticketOverlay = document.getElementById('ticket-overlay');
    ticketOverlay.classList.add('visible');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        ticketOverlay.classList.add('shown');
    }));

// Stage 2: After 3 seconds, fade mars in OVER the ticket, then hide ticket
setTimeout(() => {
    // Stop theme music and play end sound
    if (typeof bgMusic !== 'undefined' && bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }
    const endSound = new Audio('assets/endsound.mp3');
    endSound.play();

    const marsOverlay = document.getElementById('mars-overlay');
    marsOverlay.classList.add('visible');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        marsOverlay.classList.add('shown');
    }));

    // Once mars is fully visible, remove the ticket underneath
    setTimeout(() => {
        ticketOverlay.style.display = 'none';
    }, 1000);
}, 3000);
}