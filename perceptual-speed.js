// Task 2: Perceptual Speed Engine

const LETTERS_EN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LETTERS_RU = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ";

let session = new SessionTracker('perceptual_speed', 'Скорость восприятия (Perceptual Speed)', 'Perceptual Speed');
let timer = null;
let currentQuestion = null;
let selectedDuration = 120;
let isAcceptingInput = false;
let isReviewingError = false;

function generateQuestion() {
  const lang = getGlobalLanguage();
  const alphabet = (lang === 'ru') ? LETTERS_RU : LETTERS_EN;
  const columns = [];
  let matchesCount = 0;

  for (let i = 0; i < 4; i++) {
    const isMatch = Math.random() < 0.45;
    const letterA = alphabet[Math.floor(Math.random() * alphabet.length)];
    let letterB = letterA;

    if (!isMatch) {
      do {
        letterB = alphabet[Math.floor(Math.random() * alphabet.length)];
      } while (letterB === letterA);
    } else {
      matchesCount++;
    }

    const topUpper = Math.random() < 0.5;
    const topChar = topUpper ? letterA.toUpperCase() : letterA.toLowerCase();
    const bottomChar = topUpper ? letterB.toLowerCase() : letterB.toUpperCase();

    columns.push({
      top: topChar,
      bottom: bottomChar,
      isMatch: isMatch
    });
  }

  return {
    columns: columns,
    correctAnswer: matchesCount
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

function showNextItem() {
  isReviewingError = false;
  currentQuestion = generateQuestion();
  isAcceptingInput = true;
  session.recordItemStart();

  const container = document.getElementById('stage-arena');
  const lang = getGlobalLanguage();

  const matrixHtml = `
    <div class="pairs-matrix">
      ${currentQuestion.columns.map(c => `
        <div class="pair-column">
          <div class="pair-cell top">${c.top}</div>
          <div class="pair-cell bottom">${c.bottom}</div>
        </div>
      `).join('')}
    </div>
  `;

  const choicesHtml = [0, 1, 2, 3, 4].map(num => `<button class="btn-choice-num" data-choice="${num}"><span>${num}</span></button>`).join('');

  container.innerHTML = `
    <div class="phase-indicator">${lang === 'ru' ? 'Сколько пар содержат одинаковые буквы?' : 'How many pairs contain the same letter?'}</div>
    ${matrixHtml}
    <div class="choices-row" style="margin-top: 24px;">
      ${choicesHtml}
    </div>
    <div class="helper-text">
      ${lang === 'ru' ? 'Нажмите на количество совпадающих пар (0–4)' : 'Click the matching pair count (0–4)'}
    </div>
    <div id="feedback-area"></div>
  `;

  const btns = container.querySelectorAll('.btn-choice-num');
  btns.forEach(b => {
    b.addEventListener('click', () => {
      const val = parseInt(b.getAttribute('data-choice'), 10);
      handleChoice(val);
    });
  });
}

function handleChoice(selectedNum) {
  if (!isAcceptingInput || isReviewingError) return;
  isAcceptingInput = false;

  const isCorrect = (selectedNum === currentQuestion.correctAnswer);
  const lang = getGlobalLanguage();

  const colsSummary = currentQuestion.columns.map((c, i) => `
    <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; background: ${c.isMatch ? 'var(--good-soft)' : 'var(--surface-2)'}; border: 1px solid ${c.isMatch ? 'var(--good)' : 'var(--border)'}; font-family: ui-monospace, monospace; margin-right: 4px;">
      ${c.top} / ${c.bottom} ${c.isMatch ? '✅' : '❌'}
    </span>
  `).join('');

  session.recordAnswer(isCorrect, {
    promptHtml: `<b>${lang === 'ru' ? 'Столбцы букв:' : 'Letter columns:'}</b> ${colsSummary}`,
    userAnswer: `${selectedNum} ${lang === 'ru' ? 'совп.' : 'matches'}`,
    correctAnswer: `${currentQuestion.correctAnswer} ${lang === 'ru' ? 'совп.' : 'matches'}`,
    explanation: lang === 'ru' 
      ? `Правильный ответ: <b>${currentQuestion.correctAnswer}</b> совпадений букв.`
      : `Correct answer: <b>${currentQuestion.correctAnswer}</b> matching pairs.`
  });

  updateStatsDisplay();

  const container = document.getElementById('stage-arena');
  const btns = container.querySelectorAll('.btn-choice-num');
  btns.forEach(b => {
    const val = parseInt(b.getAttribute('data-choice'), 10);
    if (val === currentQuestion.correctAnswer) {
      b.classList.add('correct');
    } else if (val === selectedNum) {
      b.classList.add('incorrect');
    }
  });

  if (!isCorrect && selectedDuration === 0) {
    isReviewingError = true;
    const feedback = document.getElementById('feedback-area');
    if (feedback) {
      feedback.innerHTML = `
        <div class="feedback-box bad">
          ❌ <b>${lang === 'ru' ? 'Неверно' : 'Incorrect'}!</b> ${lang === 'ru' ? 'Правильный ответ:' : 'Correct answer:'} <b>${currentQuestion.correctAnswer}</b>.
        </div>
        <div style="margin-top: 14px; text-align: center;">
          <button id="btn-next-item" class="btn btn-primary" style="font-size: 16px; padding: 10px 24px;">
            ${lang === 'ru' ? 'Следующий вопрос →' : 'Next Question →'}
          </button>
        </div>
      `;
      document.getElementById('btn-next-item').addEventListener('click', () => {
        showNextItem();
      });
    }
  } else {
    setTimeout(() => {
      showNextItem();
    }, isCorrect ? 150 : 600);
  }
}

function startTest(duration) {
  selectedDuration = duration;
  session = new SessionTracker('perceptual_speed', 'Скорость восприятия (Perceptual Speed)', 'Perceptual Speed');
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
  showNextItem();
}

function endTest() {
  isAcceptingInput = false;
  if (timer) timer.stop();
  document.getElementById('test-arena').style.display = 'none';

  renderResultsModal(session, {
    containerId: 'results-panel',
    titleRu: 'Результаты: Скорость восприятия (Perceptual Speed)',
    titleEn: 'Results: Perceptual Speed',
    targetAnsweredRu: '35–55 за 2 мин',
    targetAnsweredEn: '35–55 in 2 mins',
    targetSpeedRu: '20–30 /мин',
    targetSpeedEn: '20–30 /min',
    onRetry: () => startTest(selectedDuration)
  });
}

// Global keydown handler
window.addEventListener('keydown', (e) => {
  if (isReviewingError) {
    if (e.key === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      showNextItem();
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const chk = document.getElementById('chk-auto-fs');
  if (chk) chk.checked = isAutoFullscreen();
});

window.addEventListener('gia-lang-change', () => {
  if (isAcceptingInput && !isReviewingError) {
    showNextItem();
  }
});
