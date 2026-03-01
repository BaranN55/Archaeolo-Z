// gamestate.js — shared state across all pages via localStorage

const GameState = {
    getCoins() {
        return parseInt(localStorage.getItem('coins') || '0');
    },
    setCoins(n) {
        localStorage.setItem('coins', String(n));
    },
    addCoins(n) {
        this.setCoins(this.getCoins() + n);
    },
    spendCoins(n) {
        this.setCoins(Math.max(0, this.getCoins() - n));
    },

    getCollected() {
        return JSON.parse(localStorage.getItem('collected') || '[]');
    },
    addCollected(id) {
        const c = this.getCollected();
        if (!c.includes(id)) { c.push(id); localStorage.setItem('collected', JSON.stringify(c)); }
    },
    isCollected(id) { return this.getCollected().includes(id); },

    getSold() {
        return JSON.parse(localStorage.getItem('sold') || '[]');
    },
    addSold(id) {
        const s = this.getSold();
        if (!s.includes(id)) { s.push(id); localStorage.setItem('sold', JSON.stringify(s)); }
    },
    isSold(id) { return this.getSold().includes(id); },

    // ── Tools ──────────────────────────────────────────────────
    getOwnedTools() {
        return JSON.parse(localStorage.getItem('tools') || '[]');
    },
    buyTool(id) {
        const t = this.getOwnedTools();
        if (!t.includes(id)) { t.push(id); localStorage.setItem('tools', JSON.stringify(t)); }
    },
    ownsTool(id) { return this.getOwnedTools().includes(id); }
};

// ── Collectible items ─────────────────────────────────────────
const ITEMS = {
    matcha: {
        id: 'matcha',
        name: 'Matcha',
        image: '../assets/Matcha.png',
        description: 'A drink or a sip of feeling better than others? This earthy drink had the generation captive on who liked it and who was just performing.',
        coins: 100
    },
    sbag: {
        id: 'sbag',
        name: 'Sephora Bag',
        image: '../assets/Sbag.png',
        description: 'Get your glam ladies! Well I mean 10 year olds absolutely needed retinol back then…right?',
        coins: 200
    }
};

// ── Tools available for purchase ─────────────────────────────
const TOOLS = {
    shovel: {
        id: 'shovel',
        name: 'Shovel',
        image: '../assets/shovel1.png',
        description: 'A trusty shovel to dig deeper into the earth. Required to reach the next level.',
        coins: 100
    },
    drill: {
        id: 'drill',
        name: 'Drill',
        image: '../assets/drill1.png',
        description: 'A powerful drill that can break through solid rock. Required for the deepest levels.',
        coins: 500
    }
};