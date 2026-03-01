// game2.js

const collectHint = document.getElementById('collect-hint');
const flashEl     = document.getElementById('collect-flash');

let flashTimer = null;

function showFlash(msg) {
    flashEl.textContent = msg;
    flashEl.classList.add('show');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => flashEl.classList.remove('show'), 2000);
}

function checkHint() {
    const remaining = document.querySelectorAll('.collectible:not(.collected)').length;
    if (remaining === 0) collectHint.classList.add('hidden');
}

document.querySelectorAll('.collectible').forEach(el => {
    const id = el.dataset.id;

    // Already collected — hide immediately on page load
    if (GameState.isCollected(id)) {
        el.classList.add('collected');
    }

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