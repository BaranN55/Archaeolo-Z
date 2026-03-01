// tool3.js

const grid       = document.getElementById('tools-grid');
const noCoinsMsg = document.getElementById('no-coins-msg');

function buildTools() {
    grid.innerHTML = '';
    const currentCoins = GameState.getCoins();

    Object.values(TOOLS).forEach(tool => {
        const owned      = GameState.ownsTool(tool.id);
        const canAfford  = currentCoins >= tool.coins;

        const card = document.createElement('div');
        card.className = 'tool-card';

        let btnClass, btnText;
        if (owned)          { btnClass = 'owned';       btnText = 'Owned'; }
        else if (canAfford) { btnClass = 'can-buy';     btnText = 'Buy'; }
        else                { btnClass = 'cant-afford'; btnText = 'Not enough coins'; }

        card.innerHTML = `
            <div class="tool-img-wrap">
                <img src="${tool.image}" alt="${tool.name}">
            </div>
            <div class="tool-name">${tool.name}</div>
            <div class="tool-desc">${tool.description}</div>
            <div class="tool-price">
                <img src="../assets/coin.png" alt="coin">
                ${tool.coins}
            </div>
            <button class="buy-btn ${btnClass}" data-id="${tool.id}">
                ${btnText}
            </button>
        `;

        const btn = card.querySelector('.buy-btn');
        if (!owned && canAfford) {
            btn.addEventListener('click', () => {
                GameState.spendCoins(tool.coins);
                GameState.buyTool(tool.id);
                // Update button to owned
                btn.textContent = 'Owned';
                btn.classList.remove('can-buy');
                btn.classList.add('owned');
                noCoinsMsg.textContent = `${tool.name} purchased! Head back to dig deeper.`;
                noCoinsMsg.style.color = '#4a9a3a';
            });
        } else if (!owned && !canAfford) {
            btn.addEventListener('click', () => {
                noCoinsMsg.textContent = `Not enough coins! You need ${tool.coins} coins.`;
                noCoinsMsg.style.color = '#e84a4a';
            });
        }

        grid.appendChild(card);
    });
}

buildTools();