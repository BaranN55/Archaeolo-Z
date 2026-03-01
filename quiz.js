// ── Answer bank ──────────────────────────────────────────────
const ANSWERS = [
    {
        word: "Rizz",
        accepted: [
            "charisma", "charm", "charisma or flirting skill", "flirting skill",
            "ability to attract others", "attractiveness", "flirt", "flirting ability",
            "the ability to charm someone", "natural charm"
        ]
    },
    {
        word: "Bussin'",
        accepted: [
            "really good", "really good food", "delicious", "amazing food",
            "very good", "great food", "fire", "excellent", "tasty",
            "good food", "amazing", "bussin", "extremely good"
        ]
    },
    {
        word: "Sus",
        accepted: [
            "suspicious", "suspect", "sketchy", "shady",
            "untrustworthy", "questionable", "weird", "suspicious behavior",
            "acting suspicious", "not to be trusted"
        ]
    },
    {
        word: "Lowkey",
        accepted: [
            "slightly", "a little", "kind of", "secretly",
            "quietly", "subtly", "not openly", "somewhat",
            "a bit", "under the radar", "in secret", "low key"
        ]
    },
    {
        word: "Cap",
        accepted: [
            "lie", "lying", "a lie", "false",
            "not true", "untrue", "bs", "fake",
            "not real", "a falsehood", "capping", "fib"
        ]
    }
];

// ── Quiz elements ─────────────────────────────────────────────
const inputs     = document.querySelectorAll('.answer-input');
const feedbacks  = document.querySelectorAll('.feedback');
const globalFB   = document.getElementById('global-feedback');
const submitBtn  = document.getElementById('submit-btn');
const quizWrapper = document.getElementById('quiz-wrapper');

const locked = [false, false, false, false, false];

submitBtn.addEventListener('click', checkAnswers);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !axePhase) checkAnswers();
});

function checkAnswers() {
    let allCorrect = true;
    let anyWrong = false;

    inputs.forEach((input, i) => {
        if (locked[i]) return;

        const val = input.value.trim().toLowerCase();

        if (val === '') {
            allCorrect = false;
            input.classList.remove('correct', 'wrong');
            feedbacks[i].textContent = '';
            feedbacks[i].className = 'feedback';
            return;
        }

        const isCorrect = ANSWERS[i].accepted.some(a => val === a.toLowerCase());

        if (isCorrect) {
            input.classList.remove('wrong');
            input.classList.add('correct');
            input.disabled = true;
            feedbacks[i].textContent = '✓';
            feedbacks[i].className = 'feedback correct';
            locked[i] = true;
        } else {
            input.classList.remove('correct');
            input.classList.add('wrong');
            void input.offsetWidth; // retrigger shake
            feedbacks[i].textContent = '✗';
            feedbacks[i].className = 'feedback wrong';
            allCorrect = false;
            anyWrong = true;
        }
    });

    if (anyWrong) {
        globalFB.textContent = 'ANSWER IS WRONG!';
        globalFB.className = '';
    } else if (allCorrect && locked.every(Boolean)) {
        globalFB.textContent = 'All correct! Well done!';
        globalFB.className = 'success';
        submitBtn.disabled = true;

        // After a short celebration pause, fade paper out and show axe
        setTimeout(startAxePhase, 900);
    } else {
        globalFB.textContent = '';
    }
}

// ── Post-quiz axe digging phase ───────────────────────────────
const axeOverlay   = document.getElementById('axe-overlay');
const axeIntroText = document.getElementById('axe-intro-text');
const axeImg       = document.getElementById('axe-img');
const nextBgOverlay = document.getElementById('next-bg-overlay');

const AXE_UP   = '../assets/Axeup.png';
const AXE_DOWN = '../assets/Axedown.png';
const AXE_TOTAL = 5;

let axePhase    = false;
let axePresses  = 0;
let axeSwinging = false;
let axeDone     = false;

function startAxePhase() {
    // Fade out paper
    quizWrapper.classList.add('hidden');

    // Show axe overlay after paper fades
    setTimeout(() => {
        axeOverlay.classList.add('visible');
        axePhase = true;
    }, 650);
}

document.addEventListener('keydown', (e) => {
    if (e.code !== 'Space') return;
    e.preventDefault();

    if (!axePhase || axeDone || axeSwinging) return;

    axeSwinging = true;
    axePresses++;

    // Swing down
    axeImg.src = AXE_DOWN;
    axeImg.classList.add('swing');

    // Fade in next background gradually
    nextBgOverlay.style.opacity = axePresses / AXE_TOTAL;

    setTimeout(() => {
        axeImg.src = AXE_UP;
        axeImg.classList.remove('swing');

        setTimeout(() => {
            axeSwinging = false;

            if (axePresses >= AXE_TOTAL) {
                axeDone = true;
                finishLevel();
            }
        }, 500);
    }, 600);
});

function finishLevel() {
    axeIntroText.style.opacity = '0';
    axeImg.style.opacity = '0';

    // Navigate to next level once background is fully shown
    setTimeout(() => {
        window.location.href = 'game2.html'; // change to your next level page
    }, 500);
}