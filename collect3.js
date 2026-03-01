// collect3.js

const grid     = document.getElementById('items-grid');
const emptyMsg = document.getElementById('empty-msg');

function buildCards() {
    const collected = GameState.getCollected();
    grid.innerHTML = '';

    if (collected.length === 0) {
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';

    collected.forEach(id => {
        const item = ITEMS[id];
        if (!item) return;

        const sold = GameState.isSold(id);

        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-img-wrap">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="item-name">${item.name}</div>
            <div class="item-desc">${item.description}</div>
            <div class="item-price">
                <img src="../assets/coin.png" alt="coin">
                ${item.coins}
            </div>
            <button class="sell-btn ${sold ? 'sold' : 'can-sell'}" data-id="${id}">
                ${sold ? 'Sold' : 'Sell'}
            </button>
        `;

        const btn = card.querySelector('.sell-btn');
        if (!sold) {
            btn.addEventListener('click', () => {
                GameState.addSold(id);
                GameState.addCoins(item.coins);
                btn.textContent = 'Sold';
                btn.classList.remove('can-sell');
                btn.classList.add('sold');
            });
        }

        grid.appendChild(card);
    });
}

buildCards();