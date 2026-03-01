// nav.js — inject persistent side buttons on every game page
// Include this script (after gamestate.js) on every page that should show the nav.
// It auto-detects the current page and sets the correct back-links.

(function () {
    // ── Determine which level's pages to link to ──────────────
    const page = window.location.pathname.split('/').pop().toLowerCase();

    // Map each page to its coin / collect / tool destinations
    const NAV_MAP = {
        // Level 1
        'game.html':     { coin: 'coin.html',  collect: 'collect.html',  tool: 'tool.html'  },
        // Quiz (between L1 and L2)
        'quiz.html':     { coin: 'coin2.html', collect: 'collect2.html', tool: 'tool2.html' },
        // Level 2
        'game2.html':    { coin: 'coin3.html', collect: 'collect3.html', tool: 'tool3.html' },
        // Level 3 / 67 pose
        'game3.html':    { coin: 'coin3.html', collect: 'collect3.html', tool: 'tool3.html' },
        '67.html':       { coin: 'coin3.html', collect: 'collect3.html', tool: 'tool3.html' },
    };

    // Coin / collect / tool pages themselves — show nav pointing back to same level
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
    };

    const links = NAV_MAP[page] || SIDE_PAGE_MAP[page];
    if (!links) return; // don't inject on index, about, credits etc.

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
            z-index: 9999;
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
        .nav-btn-coin    { background-image: url("../assets/coin.png"); }
        .nav-btn-collect { background-image: url("../assets/Collects.png"); }
        .nav-btn-tool    { background-image: url("../assets/Tools.png"); }
    `;
    document.head.appendChild(style);

    // ── Inject HTML ───────────────────────────────────────────
    const nav = document.createElement('div');
    nav.id = 'persistent-nav';
    nav.innerHTML = `
        <a href="${links.coin}"    class="nav-btn nav-btn-coin"    title="Coins"></a>
        <a href="${links.collect}" class="nav-btn nav-btn-collect" title="Collection"></a>
        <a href="${links.tool}"    class="nav-btn nav-btn-tool"    title="Tools"></a>
    `;
    document.body.appendChild(nav);

    // ── Highlight current page button ─────────────────────────
    nav.querySelectorAll('a').forEach(a => {
        if (a.getAttribute('href') === page) {
            a.style.outline = '3px solid #C8A582';
            a.style.outlineOffset = '3px';
        }
    });

})();