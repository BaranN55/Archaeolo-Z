// game5.js

const collectHint   = document.getElementById('collect-hint');
const flashEl       = document.getElementById('collect-flash');
const sellPrompt    = document.getElementById('sell-prompt');
const nextBgOverlay = document.getElementById('next-bg-overlay');
const marsOverlay   = document.getElementById('mars-overlay');

const MARS_COIN_TARGET = 1350;
let flashTimer = null;
let marsTriggered = false;

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
    // Hide everything else
    sellPrompt.style.display = 'none';
    collectHint.style.display = 'none';

    // Update coin count display
    document.getElementById('coin-count').textContent = GameState.getCoins();

    // Fade in mars background
    nextBgOverlay.style.opacity = '1';

    // Show mars overlay after bg fades in
    setTimeout(() => {
        marsOverlay.classList.add('visible');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => marsOverlay.classList.add('shown'));
        });
    }, 800);
}