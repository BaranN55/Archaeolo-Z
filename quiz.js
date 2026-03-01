// Accepted answers for each word (all lowercase, player input will be lowercased for comparison)
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

const inputs        = document.querySelectorAll('.answer-input');
const feedbacks     = document.querySelectorAll('.feedback');
const globalFB      = document.getElementById('global-feedback');
const submitBtn     = document.getElementById('submit-btn');

// Track which answers are already correct so they lock in
const locked = [false, false, false, false, false];

submitBtn.addEventListener('click', checkAnswers);

// Also allow Enter key to submit
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkAnswers();
});

function checkAnswers() {
    let allCorrect = true;
    let anyWrong = false;

    inputs.forEach((input, i) => {
        if (locked[i]) return; // skip already correct ones

        const val = input.value.trim().toLowerCase();

        if (val === '') {
            // Empty — mark as incomplete
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
            // Retrigger shake animation
            void input.offsetWidth;
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
        // TODO: navigate to next level or trigger next game event here
    } else {
        // Some still empty, no wrong ones
        globalFB.textContent = '';
    }
}