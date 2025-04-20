// Navigation highlight and smooth scroll
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({ top: target.offsetTop - 20, behavior: 'smooth' });
        }
    });
});

// Progress and achievements
const quizKeys = {
    beginner: ['b','c','a','a','a'],
    'beginner-tf': ['false','true','true','false','true'],
    'order-types': ['Market Order','Limit Order','Stop Order','Stop-Limit Order'],
    intermediate: ['b','b','a','a','a'],
    'intermediate-fill': ['spread','liquidity','volatility'],
    advanced: ['b','a','b','a','a'],
    expert: ['a','a','a','a','a']
};
let quizResults = {
    beginner: false, 'beginner-tf': false, 'order-types': false,
    intermediate: false, 'intermediate-fill': false,
    advanced: false, 'scenario-advanced': false,
    expert: false, 'case-expert': false
};
const achievements = [
    { id: 'first-quiz', name: 'First Quiz!', desc: 'Completed your first quiz.' },
    { id: 'dragdrop-master', name: 'Order Types Pro', desc: 'Mastered order types drag-and-drop.' },
    { id: 'fillblank-whiz', name: 'Fill-in-the-Blank Whiz', desc: 'Completed a fill-in-the-blank quiz.' },
    { id: 'scenario-thinker', name: 'Scenario Thinker', desc: 'Submitted a scenario answer.' },
    { id: 'case-study', name: 'Case Study Star', desc: 'Submitted a case study.' },
    { id: 'chapter-beginner', name: 'Beginner Complete', desc: 'Completed all beginner quizzes.' },
    { id: 'chapter-intermediate', name: 'Intermediate Complete', desc: 'Completed all intermediate quizzes.' },
    { id: 'chapter-advanced', name: 'Advanced Complete', desc: 'Completed all advanced quizzes.' },
    { id: 'chapter-expert', name: 'Expert Complete', desc: 'Completed all expert quizzes.' },
    { id: 'master-trader', name: 'Master Trader', desc: 'Completed all quizzes and exercises!' }
];
let achieved = {};

function saveAchievements() {
    localStorage.setItem('achieved', JSON.stringify(achieved));
}
function loadAchievements() {
    try {
        const data = localStorage.getItem('achieved');
        if (data) {
            achieved = JSON.parse(data);
        }
    } catch (e) {
        achieved = {};
    }
}

function unlockAchievement(id) {
    if (achieved[id]) return;
    achieved[id] = true;
    saveAchievements();
    updateAchievementsSidebar();
    const ach = achievements.find(a => a.id === id);
    if (ach) {
        document.getElementById('achievement-title').textContent = ach.name;
        document.getElementById('achievement-desc').textContent = ach.desc;
        document.getElementById('achievement-popup').style.display = 'flex';
    }
}
function closeAchievement() {
    document.getElementById('achievement-popup').style.display = 'none';
}
function updateAchievementsSidebar() {
    const ul = document.getElementById('achievements-list');
    ul.innerHTML = '';
    achievements.forEach(a => {
        const li = document.createElement('li');
        li.textContent = a.name;
        if (achieved[a.id]) li.classList.add('achieved');
        ul.appendChild(li);
    });
}

// Multiple choice quizzes (original)
function checkQuiz(level) {
    const form = document.querySelector(`#quiz-${level} form`);
    const feedback = document.getElementById(`feedback-${level}`);
    const answers = quizKeys[level];
    let correct = 0;
    let total = answers.length;
    for (let i = 0; i < total; i++) {
        const q = form.querySelectorAll(`input[name="q${i+1}"]`);
        let selected = '';
        q.forEach(r => { if (r.checked) selected = r.value; });
        if (selected === answers[i]) correct++;
    }
    if (correct === total) {
        feedback.textContent = "✅ All correct! Well done.";
        feedback.className = "quiz-feedback correct";
        quizResults[level] = true;
        if (level === 'beginner') unlockAchievement('first-quiz');
    } else {
        feedback.textContent = `❌ You got ${correct} out of ${total} correct. Try again!`;
        feedback.className = "quiz-feedback incorrect";
        quizResults[level] = false;
    }
    updateProgress();
    checkChapterAchievements();
}

// True/False quizzes
function checkTrueFalse(quiz) {
    const form = document.querySelector(`form[data-quiz="${quiz}"]`);
    const feedback = document.getElementById(`feedback-${quiz}`);
    const answers = quizKeys[quiz];
    let correct = 0;
    let total = answers.length;
    const selects = form.querySelectorAll('select');
    selects.forEach((sel, i) => {
        if (sel.value.toLowerCase() === answers[i]) correct++;
    });
    if (correct === total) {
        feedback.textContent = "✅ All correct!";
        feedback.className = "quiz-feedback correct";
        quizResults[quiz] = true;
        unlockAchievement('first-quiz');
    } else {
        feedback.textContent = `❌ You got ${correct} out of ${total} correct.`;
        feedback.className = "quiz-feedback incorrect";
        quizResults[quiz] = false;
    }
    updateProgress();
    checkChapterAchievements();
}

// Fill-in-the-blank quizzes
function checkFillBlank(quiz) {
    const form = document.querySelector(`form[data-quiz="${quiz}"]`);
    const feedback = document.getElementById(`feedback-${quiz}`);
    const answers = quizKeys[quiz];
    let correct = 0;
    let total = answers.length;
    const inputs = form.querySelectorAll('input[type="text"]');
    inputs.forEach((inp, i) => {
        if (inp.value.trim().toLowerCase() === answers[i]) correct++;
    });
    if (correct === total) {
        feedback.textContent = "✅ All correct!";
        feedback.className = "quiz-feedback correct";
        quizResults[quiz] = true;
        unlockAchievement('fillblank-whiz');
    } else {
        feedback.textContent = `❌ You got ${correct} out of ${total} correct.`;
        feedback.className = "quiz-feedback incorrect";
        quizResults[quiz] = false;
    }
    updateProgress();
    checkChapterAchievements();
}

// Drag-and-drop quiz
function checkDragDrop(qid) {
    const dropAreas = document.querySelectorAll(`.dragdrop-question[data-question="${qid}"] .drop-area`);
    let correct = 0;
    dropAreas.forEach(area => {
        const slot = area.querySelector('.drop-slot');
        if (slot && slot.textContent.trim() === area.dataset.answer) correct++;
    });
    const feedback = document.getElementById(`feedback-${qid}`);
    if (correct === dropAreas.length) {
        feedback.textContent = "✅ All correct!";
        feedback.className = "quiz-feedback correct";
        quizResults[qid] = true;
        unlockAchievement('dragdrop-master');
    } else {
        feedback.textContent = `❌ You got ${correct} out of ${dropAreas.length} correct.`;
        feedback.className = "quiz-feedback incorrect";
        quizResults[qid] = false;
    }
    updateProgress();
    checkChapterAchievements();
}

// Drag-and-drop logic
document.querySelectorAll('.drag-item').forEach(item => {
    item.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', item.dataset.value);
        setTimeout(() => item.classList.add('dragging'), 0);
    });
    item.addEventListener('dragend', e => {
        item.classList.remove('dragging');
    });
});
document.querySelectorAll('.drop-area').forEach(area => {
    area.addEventListener('dragover', e => {
        e.preventDefault();
        area.classList.add('dragover');
    });
    area.addEventListener('dragleave', e => {
        area.classList.remove('dragover');
    });
    area.addEventListener('drop', e => {
        e.preventDefault();
        area.classList.remove('dragover');
        const value = e.dataTransfer.getData('text/plain');
        area.querySelector('.drop-slot').textContent = value;
    });
});

// Scenario/Case Study (freeform)
function submitScenario(level) {
    const textarea = document.getElementById(`scenario-${level}`);
    const feedback = document.getElementById(`feedback-scenario-${level}`);
    if (textarea.value.trim().length > 30) {
        feedback.textContent = "✅ Submitted! (Your answer will be reviewed.)";
        feedback.className = "quiz-feedback correct";
        quizResults[`scenario-${level}`] = true;
        unlockAchievement('scenario-thinker');
    } else {
        feedback.textContent = "❌ Please provide a more detailed answer.";
        feedback.className = "quiz-feedback incorrect";
        quizResults[`scenario-${level}`] = false;
    }
    updateProgress();
    checkChapterAchievements();
}
function submitCase(level) {
    const textarea = document.getElementById(`case-${level}`);
    const feedback = document.getElementById(`feedback-case-${level}`);
    if (textarea.value.trim().length > 40) {
        feedback.textContent = "✅ Submitted! (Your answer will be reviewed.)";
        feedback.className = "quiz-feedback correct";
        quizResults[`case-${level}`] = true;
        unlockAchievement('case-study');
    } else {
        feedback.textContent = "❌ Please provide a more detailed answer.";
        feedback.className = "quiz-feedback incorrect";
        quizResults[`case-${level}`] = false;
    }
    updateProgress();
    checkChapterAchievements();
}

// Progress bar and chapter achievements
function updateProgress() {
    const total = Object.keys(quizResults).length;
    const done = Object.values(quizResults).filter(Boolean).length;
    const percent = Math.round((done/total)*100);
    document.getElementById('progress-bar-inner').style.width = percent + '%';
    document.getElementById('progress-percent').textContent = percent + '%';
    if (done === total) unlockAchievement('master-trader');
}
function checkChapterAchievements() {
    // Beginner
    if (quizResults.beginner && quizResults['beginner-tf'] && quizResults['order-types'])
        unlockAchievement('chapter-beginner');
    // Intermediate
    if (quizResults.intermediate && quizResults['intermediate-fill'])
        unlockAchievement('chapter-intermediate');
    // Advanced
    if (quizResults.advanced && quizResults['scenario-advanced'])
        unlockAchievement('chapter-advanced');
    // Expert
    if (quizResults.expert && quizResults['case-expert'])
        unlockAchievement('chapter-expert');
    updateAchievementsSidebar();
}

// Highlight sidebar as user scrolls
window.addEventListener('scroll', () => {
    const sections = ['beginner','intermediate','advanced','expert','resources'];
    let found = false;
    for (let i = 0; i < sections.length; i++) {
        const sec = document.getElementById(sections[i]);
        if (sec && window.scrollY + 80 >= sec.offsetTop) {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelector(`.nav-link[href="#${sections[i]}"]`).classList.add('active');
            found = true;
        }
    }
    if (!found) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    }
});

// Initialize
loadAchievements();
updateProgress();
updateAchievementsSidebar();
