// music.js — persistent looping background music across all pages
// Add <script src="music.js"></script> to every page (after other scripts)
// The music resumes from the same position when navigating between pages.

(function () {
    const AUDIO_SRC = '../assets/themesong.mp3';
    const POS_KEY   = 'music_pos';
    const MUTED_KEY = 'music_muted';

    // ── Create audio element ──────────────────────────────────
    const audio = document.createElement('audio');
    audio.src   = AUDIO_SRC;
    audio.loop  = true;
    audio.volume = 0.35;
    document.body.appendChild(audio);

    // ── Restore mute preference ───────────────────────────────
    const wasMuted = sessionStorage.getItem(MUTED_KEY) === '1';
    audio.muted = wasMuted;

    // ── Restore playback position ─────────────────────────────
    const savedPos = parseFloat(sessionStorage.getItem(POS_KEY) || '0');

    // Start playing (browsers require user interaction first, handled below)
    function startMusic() {
        audio.currentTime = savedPos || 0;
        audio.play().catch(() => {
            // Autoplay blocked — wait for first user interaction
            const unlock = () => {
                audio.currentTime = savedPos || 0;
                audio.play().catch(() => {});
                document.removeEventListener('click',   unlock);
                document.removeEventListener('keydown', unlock);
            };
            document.addEventListener('click',   unlock);
            document.addEventListener('keydown', unlock);
        });
    }

    startMusic();

    // ── Save position before leaving the page ─────────────────
    window.addEventListener('beforeunload', () => {
        sessionStorage.setItem(POS_KEY, audio.currentTime);
        sessionStorage.setItem(MUTED_KEY, audio.muted ? '1' : '0');
    });
    // Also save on visibility change (mobile tab switch)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            sessionStorage.setItem(POS_KEY, audio.currentTime);
        }
    });

    // ── Mute/unmute button ────────────────────────────────────
    const btn = document.createElement('button');
    btn.id = 'music-toggle';
    btn.textContent = wasMuted ? '🔇' : '🎵';
    btn.title = 'Toggle music';

    const style = document.createElement('style');
    style.textContent = `
        #music-toggle {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 99999;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 2px solid #a0845a;
            background: rgba(0,0,0,0.55);
            color: #fff;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.15s ease, background 0.15s ease;
            padding: 0;
            line-height: 1;
        }
        #music-toggle:hover {
            transform: scale(1.12);
            background: rgba(0,0,0,0.75);
        }
    `;
    document.head.appendChild(style);

    btn.addEventListener('click', () => {
        audio.muted = !audio.muted;
        btn.textContent = audio.muted ? '🔇' : '🎵';
        sessionStorage.setItem(MUTED_KEY, audio.muted ? '1' : '0');
        // If unmuting and paused, try to play
        if (!audio.muted && audio.paused) {
            audio.play().catch(() => {});
        }
    });

    document.body.appendChild(btn);
})();
// ── Global click sounds for Discard buttons (runs on every page) ──
(function () {
    const clickSnd = new Audio('../assets/clicksound.mp3');

    function attachDiscardSounds() {
        document.querySelectorAll('.Discard-button').forEach(btn => {
            // avoid double-attaching
            if (btn.dataset.soundAttached) return;
            btn.dataset.soundAttached = '1';
            btn.addEventListener('click', () => {
                clickSnd.currentTime = 0;
                clickSnd.play();
            });
        });
    }

    // Run on load and on bfcache restore
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachDiscardSounds);
    } else {
        attachDiscardSounds();
    }
    window.addEventListener('pageshow', attachDiscardSounds);
})();