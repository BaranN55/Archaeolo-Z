// gamestate.js — shared state across all pages via localStorage
// IMPORTANT: This file must be in your /pages/ folder alongside your HTML files

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
    getCollected() {
        return JSON.parse(localStorage.getItem('collected') || '[]');
    },
    addCollected(id) {
        const c = this.getCollected();
        if (!c.includes(id)) {
            c.push(id);
            localStorage.setItem('collected', JSON.stringify(c));
        }
    },
    isCollected(id) {
        return this.getCollected().includes(id);
    },
    getSold() {
        return JSON.parse(localStorage.getItem('sold') || '[]');
    },
    addSold(id) {
        const s = this.getSold();
        if (!s.includes(id)) {
            s.push(id);
            localStorage.setItem('sold', JSON.stringify(s));
        }
    },
    isSold(id) {
        return this.getSold().includes(id);
    }
};

// All collectible items in the game
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