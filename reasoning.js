// Task 1: Reasoning Logic Engine

const NAMES_RU = ["Иван", "Петр", "Борис", "Анна", "Елена", "Ольга", "Сергей", "Дмитрий", "Мария", "Татьяна"];
const NAMES_EN = ["John", "Peter", "David", "Mary", "Helen", "Sarah", "James", "Robert", "Emma", "Lucy"];

const COMPARISONS = {
  ru: [
    { direct: "тяжелее, чем", invert: "легче, чем", posQ: "Кто тяжелее?", negQ: "Кто легче?", posAdj: "тяжелее", negAdj: "легче" },
    { direct: "выше, чем", invert: "ниже, чем", posQ: "Кто выше?", negQ: "Кто ниже?", posAdj: "выше", negAdj: "ниже" },
    { direct: "быстрее, чем", invert: "медленнее, чем", posQ: "Кто быстрее?", negQ: "Кто медленнее?", posAdj: "быстрее", negAdj: "медленнее" },
    { direct: "сильнее, чем", invert: "слабее, чем", posQ: "Кто сильнее?", negQ: "Кто слабее?", posAdj: "сильнее", negAdj: "слабее" },
    { direct: "ярче, чем", invert: "темнее, чем", posQ: "Кто ярче?", negQ: "Кто темнее?", posAdj: "ярче", negAdj: "темнее" },
    { direct: "богаче, чем", invert: "беднее, чем", posQ: "Кто богаче?", negQ: "Кто беднее?", posAdj: "богаче", negAdj: "беднее" },
    { direct: "старше, чем", invert: "младше, чем", posQ: "Кто старше?", negQ: "Кто младше?", posAdj: "старше", negAdj: "младше" }
  ],
  en: [
    { direct: "heavier than", invert: "lighter than", posQ: "Who is heavier?", negQ: "Who is lighter?", posAdj: "heavier", negAdj: "lighter" },
    { direct: "taller than", invert: "shorter than", posQ: "Who is taller?", negQ: "Who is shorter?", posAdj: "taller", negAdj: "shorter" },
    { direct: "faster than", invert: "slower than", posQ: "Who is faster?", negQ: "Who is slower?", posAdj: "faster", negAdj: "slower" },
    { direct: "stronger than", invert: "weaker than", posQ: "Who is stronger?", negQ: "Who is weaker?", posAdj: "stronger", negAdj: "weaker" },
    { direct: "brighter than", invert: "darker than", posQ: "Who is brighter?", negQ: "Who is darker?", posAdj: "brighter", negAdj: "darker" },
    { direct: "richer than", invert: "poorer than", posQ: "Who is richer?", negQ: "Who is poorer?", posAdj: "richer", negAdj: "poorer" },
    { direct: "older than", invert: "younger than", posQ: "Who is older?", negQ: "Who is younger?", posAdj: "older", negAdj: "younger" }
  ]
};

let session = new SessionTracker('reasoning', 'Логика и рассуждения (Reasoning)', 'Reasoning');
let timer = null;
let currentQuestion = null;
let currentPhase = 'statement';
let selectedDuration = 120;
let isAlgorithmMode = false;

function generateReasoningQuestion() {
  const lang = getGlobalLanguage();
  const namesPool = (lang === 'ru') ? NAMES_RU : NAMES_EN;
  const compPool = COMPARISONS[lang] || COMPARISONS.en;

  let nameA = namesPool[Math.floor(Math.random() * namesPool.length)];
  let nameB = namesPool[Math.floor(Math.random() * namesPool.length)];
  while (nameB === nameA) {
    nameB = namesPool[Math.floor(Math.random() * namesPool.length)];
  }

  const comp = compPool[Math.floor(Math.random() * compPool.length)];
  const stmtType = Math.floor(Math.random() * 3);
  let statementText = "";
  let aIsGreater = true;
  let stmtSign = "+";

  if (stmtType === 0) {
    statementText = (lang === 'ru')
      ? `${nameA} ${comp.direct} ${nameB}`
      : `${nameA} is ${comp.direct} ${nameB}`;
    aIsGreater = true;
    stmtSign = "+";
  } else if (stmtType === 1) {
    statementText = (lang === 'ru')
      ? `${nameA} ${comp.invert} ${nameB}`
      : `${nameA} is ${comp.invert} ${nameB}`;
    aIsGreater = false;
    stmtSign = "-";
  } else {
    statementText = (lang === 'ru')
      ? `${nameA} не такой ${comp.posAdj}, как ${nameB}`
      : `${nameA} is not as ${comp.posAdj} as ${nameB}`;
    aIsGreater = false;
    stmtSign = "NOT(+) = -";
  }

  const askPositive = Math.random() < 0.5;
  const questionText = askPositive ? comp.posQ : comp.negQ;
  const questionSign = askPositive ? "+" : "-";

  let correctAnswer = askPositive ? (aIsGreater ? nameA : nameB) : (aIsGreater ? nameB : nameA);
  const choices = Math.random() < 0.5 ? [nameA, nameB] : [nameB, nameA];

  const explanation = (lang === 'ru')
    ? `Утверждение: «${statementText}». Вопрос: «${questionText}» ➔ Ответ: <b>${correctAnswer}</b>.`
    : `Statement: "${statementText}". Question: "${questionText}" ➔ Answer: <b>${correctAnswer}</b>.`;

  return {
    nameA,
    nameB,
    statementText,
    stmtSign,
    questionText,
    questionSign,
    askPositive,
    aIsGreater,
    correctAnswer,
    choices,
    explanation
  };
}

function updateStatsDisplay() {
  const lang = getGlobalLanguage();
  document.getElementById('stat-answered').textContent = session.answered;
  document.getElementById('stat-correct').textContent = session.correct;
  document.getElementById('stat-accuracy').textContent = `${session.getAccuracy()}%`;
  document.getElementById('stat-speed').textContent = `${session.getItemsPerMinute()} ${lang === 'ru' ? '/мин' : '/min'}`;
  document.getElementById('stat-streak').textContent = session.currentStreak;
}

function showStatementPhase() {
  currentQuestion = generateReasoningQuestion();
  currentPhase = 'statement';
  session.recordItemStart();

  const container = document.getElementById('stage-arena');
  const lang = getGlobalLanguage();

  let algoHint = '';
  if (isAlgorithmMode) {
    algoHint = `
      <div style="margin: 12px auto; max-width: 540px; background: var(--surface-2); padding: 12px 18px; border-radius: 8px; border: 1px solid var(--accent); font-size: 13.5px; text-align: center;">
        🧠 <b>${lang === 'ru' ? 'Разбор по ролям:' : 'Role Parsing:'}</b><br>
        [${lang === 'ru' ? 'Первое имя' : '1st Name'} (A): <b>${currentQuestion.nameA}</b>] — 
        [${lang === 'ru' ? 'Знак' : 'Sign'}: <b>${currentQuestion.stmtSign}</b>] — 
        [${lang === 'ru' ? 'Второе имя' : '2nd Name'} (B): <b>${currentQuestion.nameB}</b>]<br>
        <span style="color: var(--ink-muted); font-size: 12.5px;">
          (${lang === 'ru' ? 'Если знак вопроса совпадёт ➔ жмите A, если знак другой ➔ B' : 'If question sign matches ➔ choose A, if opposite ➔ choose B'})
        </span>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="phase-indicator">${lang === 'ru' ? 'ШАГ 1: Прочтите утверждение' : 'STEP 1: Read statement'}</div>
    <div id="statement-card" class="statement-box" title="${lang === 'ru' ? 'Нажмите на утверждение, чтобы открыть вопрос' : 'Click statement to see question'}">
      ${currentQuestion.statementText}
    </div>
    ${algoHint}
    <div class="helper-text" style="margin-top: 18px;">
      ${lang === 'ru' 
        ? 'Нажмите на утверждение или кнопку ниже, чтобы увидеть вопрос' 
        : 'Click the statement or the button below to see the question'}
    </div>
    <div style="margin-top: 20px;">
      <button id="btn-next-phase" class="btn btn-primary btn-large">
        ${lang === 'ru' ? 'Показать вопрос' : 'Click to see question'} →
      </button>
    </div>
  `;

  const advanceToQuestion = () => {
    if (currentPhase === 'statement') {
      showQuestionPhase();
    }
  };

  document.getElementById('btn-next-phase').addEventListener('click', advanceToQuestion);
  document.getElementById('statement-card').addEventListener('click', advanceToQuestion);
}

function showQuestionPhase() {
  currentPhase = 'question';
  const container = document.getElementById('stage-arena');
  const lang = getGlobalLanguage();

  const choicesHtml = currentQuestion.choices.map(name => `<button class="btn-choice" data-answer="${name}"><span>${name}</span></button>`).join('');

  let algoHint = '';
  if (isAlgorithmMode) {
    const isSameSign = (currentQuestion.stmtSign.includes("+") && currentQuestion.questionSign === "+") ||
                       (currentQuestion.stmtSign.includes("-") && currentQuestion.questionSign === "-");
    algoHint = `
      <div style="margin: 12px auto; max-width: 540px; background: var(--surface-2); padding: 10px 16px; border-radius: 8px; border: 1px solid var(--accent); font-size: 13.5px; text-align: center; color: var(--accent-ink);">
        🧠 ${lang === 'ru' ? 'Знак утверждения:' : 'Statement Sign:'} <b>${currentQuestion.stmtSign}</b> vs ${lang === 'ru' ? 'Знак вопроса:' : 'Question Sign:'} <b>${currentQuestion.questionSign}</b><br>
        ➔ ${isSameSign ? (lang === 'ru' ? `Знаки совпали ➔ <b>Первое имя (${currentQuestion.correctAnswer})</b>` : `Signs match ➔ <b>1st name (${currentQuestion.correctAnswer})</b>`) : (lang === 'ru' ? `Знаки разные ➔ <b>Второе имя (${currentQuestion.correctAnswer})</b>` : `Signs differ ➔ <b>2nd name (${currentQuestion.correctAnswer})</b>`)}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="question-text">${currentQuestion.questionText}</div>
    ${algoHint}
    <div class="choices-row">
      ${choicesHtml}
    </div>
    <div class="helper-text">
      ${lang === 'ru' ? 'Нажмите на правильный вариант ответа' : 'Click the correct option'}
    </div>
    <div id="feedback-area"></div>
  `;

  const btns = container.querySelectorAll('.btn-choice');
  btns.forEach(b => {
    b.addEventListener('click', () => handleAnswer(b.getAttribute('data-answer')));
  });
}

function handleAnswer(selectedName) {
  if (currentPhase !== 'question') return;
  const isCorrect = (selectedName === currentQuestion.correctAnswer);
  const lang = getGlobalLanguage();

  session.recordAnswer(isCorrect, {
    promptHtml: `<b>${lang === 'ru' ? 'Утверждение:' : 'Statement:'}</b> «${currentQuestion.statementText}»<br><b>${lang === 'ru' ? 'Вопрос:' : 'Question:'}</b> «${currentQuestion.questionText}»`,
    userAnswer: selectedName,
    correctAnswer: currentQuestion.correctAnswer,
    explanation: currentQuestion.explanation
  });

  updateStatsDisplay();

  const container = document.getElementById('stage-arena');
  const btns = container.querySelectorAll('.btn-choice');
  btns.forEach(b => {
    const val = b.getAttribute('data-answer');
    if (val === currentQuestion.correctAnswer) {
      b.classList.add('correct');
    } else if (val === selectedName) {
      b.classList.add('incorrect');
    }
  });

  if (!isCorrect && (selectedDuration === 0 || isAlgorithmMode)) {
    currentPhase = 'review_error';
    const feedback = document.getElementById('feedback-area');
    if (feedback) {
      feedback.innerHTML = `
        <div class="feedback-box bad">
          ❌ <b>${lang === 'ru' ? 'Неверно' : 'Incorrect'}!</b> ${currentQuestion.explanation}
        </div>
        <div style="margin-top: 14px; text-align: center;">
          <button id="btn-next-item" class="btn btn-primary" style="font-size: 16px; padding: 10px 24px;">
            ${lang === 'ru' ? 'Следующий вопрос →' : 'Next Question →'}
          </button>
        </div>
      `;
      document.getElementById('btn-next-item').addEventListener('click', () => {
        showStatementPhase();
      });
    }
  } else {
    currentPhase = 'paused';
    setTimeout(() => {
      showStatementPhase();
    }, isCorrect ? 250 : 700);
  }
}

function startTest(duration, isAlgo = false) {
  selectedDuration = duration;
  isAlgorithmMode = isAlgo;
  session = new SessionTracker('reasoning', 'Логика и рассуждения (Reasoning)', 'Reasoning');
  session.start();
  if (isAutoFullscreen()) requestAppFullscreen();
  updateStatsDisplay();

  document.getElementById('setup-panel').style.display = 'none';
  document.getElementById('test-arena').style.display = 'flex';
  document.getElementById('results-panel').style.display = 'none';

  const timerEl = document.getElementById('timer-display');
  const fillEl = document.getElementById('progress-fill');

  if (timer) timer.stop();

  timer = new GiaTimer(
    duration,
    (rem, fmt, hurry) => {
      timerEl.textContent = fmt;
      if (hurry) timerEl.classList.add('hurry');
      else timerEl.classList.remove('hurry');
      if (duration > 0) {
        const percent = ((duration - rem) / duration) * 100;
        fillEl.style.width = `${percent}%`;
      } else {
        fillEl.style.width = '100%';
      }
    },
    () => {
      endTest();
    }
  );

  timer.start();
  showStatementPhase();
}

function endTest() {
  currentPhase = 'paused';
  if (timer) timer.stop();
  document.getElementById('test-arena').style.display = 'none';

  renderResultsModal(session, {
    containerId: 'results-panel',
    titleRu: 'Результаты: Логика и рассуждения (Reasoning)',
    titleEn: 'Results: Reasoning & Deduction',
    targetAnsweredRu: '30–45 за 2 мин',
    targetAnsweredEn: '30–45 in 2 mins',
    targetSpeedRu: '16–25 /мин',
    targetSpeedEn: '16–25 /min',
    onRetry: () => startTest(selectedDuration, isAlgorithmMode)
  });
}

// Global keydown handler
window.addEventListener('keydown', (e) => {
  if (currentPhase === 'review_error') {
    if (e.key === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      showStatementPhase();
    }
  }
});

// React to language changes
window.addEventListener('gia-lang-change', () => {
  if (currentPhase === 'statement') {
    showStatementPhase();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const chk = document.getElementById('chk-auto-fs');
  if (chk) chk.checked = isAutoFullscreen();
});
