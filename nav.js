// nav.js — inject persistent side buttons on every game page

(function () {
    const page = window.location.pathname.split('/').pop().toLowerCase();

    const NAV_MAP = {
        'game.html':     { coin: 'coin.html',  collect: 'collect.html',  tool: 'tool.html'  },
        'quiz.html':     { coin: 'coin2.html', collect: 'collect2.html', tool: 'tool2.html' },
        'game2.html':    { coin: 'coin3.html', collect: 'collect3.html', tool: 'tool3.html' },
        'game3.html':    { coin: 'coin3.html', collect: 'collect3.html', tool: 'tool3.html' },
        '67.html':       { coin: 'coin3.html', collect: 'collect3.html', tool: 'tool3.html' },
        'game4.html':    { coin: 'coin4.html', collect: 'collect4.html', tool: 'tool4.html' },
        'game5.html':    { coin: 'coin5.html', collect: 'collect5.html', tool: 'tool5.html' },
    };

    const SIDE_PAGE_MAP = {
        'coin.html':      { coin: 'coin.html',  collect: 'collect.html',  tool: 'tool.html'  },
        'collect.html':   { coin: 'coin.html',  collect: 'collect.html',  tool: 'tool.html'  },
        'tool.html':      { coin: 'coin.html',  collect: 'collect.html',  tool: 'tool.html'  },
        'coin2.html':     { coin: 'coin2.html', collect: 'collect2.html', tool: 'tool2.html' },
        'collect2.html':  { coin: 'coin2.html', collect: 'collect2.html', tool: 'tool2.html' },
        'tool2.html':     { coin: 'coin2.html', collect: 'collect2.html', tool: 'tool2.html' },
        'coin3.html':     { coin: 'coin3.html', collect: 'collect3.html', tool: 'tool3.html' },
        'collect3.html':  { coin: 'coin3.html', collect: 'collect3.html', tool: 'tool3.html' },
        'tool3.html':     { coin: 'coin3.html', collect: 'collect3.html', tool: 'tool3.html' },
        'coin4.html':     { coin: 'coin4.html', collect: 'collect4.html', tool: 'tool4.html' },
        'collect4.html':  { coin: 'coin4.html', collect: 'collect4.html', tool: 'tool4.html' },
        'tool4.html':     { coin: 'coin4.html', collect: 'collect4.html', tool: 'tool4.html' },
        'coin5.html':     { coin: 'coin5.html', collect: 'collect5.html', tool: 'tool5.html' },
        'collect5.html':  { coin: 'coin5.html', collect: 'collect5.html', tool: 'tool5.html' },
        'tool5.html':     { coin: 'coin5.html', collect: 'collect5.html', tool: 'tool5.html' },
    };

    const links = NAV_MAP[page] || SIDE_PAGE_MAP[page];
    if (!links) return;

    // ── Inject CSS ────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
        #persistent-nav {
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 38px;
            z-index: 100000;
        }
        .nav-btn {
            display: block;
            width: 80px;
            height: 80px;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            text-decoration: none;
            cursor: pointer;
            transition: transform 0.2s ease;
            border-radius: 8px;
        }
        .nav-btn:hover { transform: scale(1.1); }
        .nav-btn-coin    { background-image: url("assets/coin.png"); }
        .nav-btn-collect { background-image: url("assets/Collects.png"); }
        .nav-btn-tool    { background-image: url("assets/Tools.png"); }
    `;
    document.head.appendChild(style);

    const coinSound  = new Audio('assets/coinsound.mp3');
    const clickSound = new Audio('assets/clicksound.mp3');

    // Play sound then navigate after short delay so sound has time to fire
    function playAndGo(sound, href) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
        setTimeout(() => { window.location.href = href; }, 150);
    }

    // ── Inject HTML ───────────────────────────────────────────
    function injectNav() {
        const existing = document.getElementById('persistent-nav');
        if (existing) existing.remove();

        const nav = document.createElement('div');
        nav.id = 'persistent-nav';
        nav.innerHTML = `
            <a class="nav-btn nav-btn-coin"    title="Coins"></a>
            <a class="nav-btn nav-btn-collect" title="Collection"></a>
            <a class="nav-btn nav-btn-tool"    title="Tools"></a>
        `;
        document.body.appendChild(nav);

        const [coinBtn, collectBtn, toolBtn] = nav.querySelectorAll('a');

        // Highlight current page button
        [coinBtn, collectBtn, toolBtn].forEach((btn, i) => {
            const href = [links.coin, links.collect, links.tool][i];
            if (href === page) {
                btn.style.outline = '3px solid #C8A582';
                btn.style.outlineOffset = '3px';
            }
        });

        // Wire up sounds + navigation (preventDefault stops instant nav, delay lets sound play)
        coinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            playAndGo(coinSound, links.coin);
        });
        collectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            playAndGo(clickSound, links.collect);
        });
        toolBtn.addEventListener('click', (e) => {
            e.preventDefault();
            playAndGo(clickSound, links.tool);
        });
    }

    injectNav();
    window.addEventListener('pageshow', () => { injectNav(); });
})();