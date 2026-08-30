// Task 3: Number Speed & Accuracy Engine

let session = new SessionTracker('number_speed', 'Числовая скорость и точность (Number Speed)', 'Number Speed');
let timer = null;
let currentQuestion = null;
let selectedDuration = 120;
let isAcceptingInput = false;
let isReviewingError = false;
let isAlgorithmMode = false;

function generateNumberQuestion() {
  const minVal = Math.floor(Math.random() * 20) + 2;
  const spread = Math.floor(Math.random() * 15) + 6;
  const maxVal = minVal + spread;

  const validMids = [];
  for (let m = minVal + 1; m < maxVal; m++) {
    const dMin = m - minVal;
    const dMax = maxVal - m;
    if (dMin !== dMax) {
      validMids.push(m);
    }
  }

  const midVal = validMids[Math.floor(Math.random() * validMids.length)];
  const dMin = midVal - minVal;
  const dMax = maxVal - midVal;
  const correctAnswer = (dMin > dMax) ? minVal : maxVal;
  const midpoint = (minVal + maxVal) / 2;

  const numbers = [minVal, midVal, maxVal];
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  const lang = getGlobalLanguage();
  const explanation = (lang === 'ru')
    ? `Числа: <b>[ ${minVal}, ${midVal}, ${maxVal} ]</b>. Крайние: <b>${minVal}</b> и <b>${maxVal}</b>. Середина = <b>${midpoint}</b>. Третье число <b>${midVal}</b> ${midVal > midpoint ? `> ${midpoint} (ближе к ${maxVal}) ➔ дальше находится <b>${minVal}</b>` : `< ${midpoint} (ближе к ${minVal}) ➔ дальше находится <b>${maxVal}</b>`}.`
    : `Numbers: <b>[ ${minVal}, ${midVal}, ${maxVal} ]</b>. Extremes: <b>${minVal}</b> & <b>${maxVal}</b>. Midpoint = <b>${midpoint}</b>. 3rd value <b>${midVal}</b> is ${midVal > midpoint ? `> ${midpoint} ➔ further from <b>${minVal}</b>` : `< ${midpoint} ➔ further from <b>${maxVal}</b>`}.`;

  return {
    numbers,
    minVal,
    maxVal,
    midVal,
    midpoint,
    correctAnswer,
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

function showNextItem() {
  isReviewingError = false;
  currentQuestion = generateNumberQuestion();
  isAcceptingInput = true;
  session.recordItemStart();

  const container = document.getElementById('stage-arena');
  const lang = getGlobalLanguage();

  let axisHtml = '';
  if (isAlgorithmMode) {
    const min = currentQuestion.minVal;
    const max = currentQuestion.maxVal;
    const mid = currentQuestion.midVal;
    const center = currentQuestion.midpoint;
    const range = max - min;
    const midPct = Math.min(95, Math.max(5, ((mid - min) / range) * 100));

    axisHtml = `
      <div style="margin: 18px auto; max-width: 580px; background: var(--surface-2); padding: 18px 22px 22px; border-radius: 8px; border: 1px solid var(--accent);">
        <div style="font-size: 11.5px; color: var(--ink-muted); margin-bottom: 12px; font-family: ui-monospace, monospace; text-align: center; text-transform: uppercase; letter-spacing: .05em;">
          ${lang === 'ru' ? 'Числовая шкала (от Min до Max):' : 'Number Axis (Min to Max):'}
        </div>

        <!-- Top Min & Max Nodes -->
        <div style="display: flex; justify-content: space-between; font-family: ui-monospace, monospace; font-size: 13px; font-weight: 700; margin-bottom: 6px; padding: 0 4px;">
          <span style="color: var(--ink);">◀ ${min} (Min)</span>
          <span style="color: var(--ink);">${max} (Max) ▶</span>
        </div>

        <!-- Track Bar -->
        <div style="position: relative; height: 14px; background: var(--border); border-radius: 7px; margin: 8px 0 24px;">
          <!-- Center Vertical Tick & Label -->
          <div style="position: absolute; left: 50%; top: -6px; bottom: -6px; width: 2px; background: var(--ink-muted); transform: translateX(-50%); z-index: 1;">
            <span style="position: absolute; top: 22px; left: 50%; transform: translateX(-50%); font-size: 11px; font-family: ui-monospace, monospace; color: var(--ink-muted); white-space: nowrap;">
              ${lang === 'ru' ? 'Середина' : 'Center'} = ${center}
            </span>
          </div>

          <!-- Moving Middle Value Bubble -->
          <div style="position: absolute; left: ${midPct}%; top: 50%; transform: translate(-50%, -50%); z-index: 3;">
            <span style="background: var(--accent); color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; font-family: ui-monospace, monospace; box-shadow: 0 2px 6px rgba(0,0,0,0.25); white-space: nowrap;">
              ${mid} (${lang === 'ru' ? '3-е' : '3rd'})
            </span>
          </div>
        </div>

        <!-- Conclusion Rule -->
        <div style="font-size: 13px; text-align: center; color: var(--accent-ink); margin-top: 14px; font-weight: 600;">
          ${mid > center 
            ? (lang === 'ru' ? `💡 Число ${mid} > Середины ${center} (справа) ➔ Дальше от <b>${min}</b>` : `💡 Value ${mid} > Center ${center} (shifted right) ➔ Furthest from <b>${min}</b>`)
            : (lang === 'ru' ? `💡 Число ${mid} < Середины ${center} (слева) ➔ Дальше от <b>${max}</b>` : `💡 Value ${mid} < Center ${center} (shifted left) ➔ Furthest from <b>${max}</b>`)}
        </div>
      </div>
    `;
  }

  const cardsHtml = currentQuestion.numbers.map(val => `<button class="number-card" data-val="${val}"><span class="number-val">${val}</span></button>`).join('');

  container.innerHTML = `
    <div class="phase-indicator">
      ${lang === 'ru' ? 'Какое из крайних чисел дальше от оставшегося?' : 'Which extreme is furthest from the remaining number?'}
    </div>
    <div class="numbers-row">
      ${cardsHtml}
    </div>
    ${axisHtml}
    <div class="helper-text" style="margin-top: 14px;">
      ${lang === 'ru' ? 'Нажмите на карточку с правильным числом' : 'Click the card with the correct number'}
    </div>
    <div id="feedback-area"></div>
  `;

  const btns = container.querySelectorAll('.number-card');
  btns.forEach(b => {
    b.addEventListener('click', () => {
      const val = parseInt(b.getAttribute('data-val'), 10);
      handleChoice(val);
    });
  });
}

function handleChoice(selectedVal) {
  if (!isAcceptingInput || isReviewingError) return;
  isAcceptingInput = false;

  const isCorrect = (selectedVal === currentQuestion.correctAnswer);
  const lang = getGlobalLanguage();

  session.recordAnswer(isCorrect, {
    promptHtml: `<b>${lang === 'ru' ? 'Числа:' : 'Numbers:'}</b> <span style="font-family: ui-monospace, monospace; font-size: 16px; font-weight: 700; color: var(--ink);">[ ${currentQuestion.numbers.join(', ')} ]</span>`,
    userAnswer: selectedVal,
    correctAnswer: currentQuestion.correctAnswer,
    explanation: currentQuestion.explanation
  });

  updateStatsDisplay();

  const container = document.getElementById('stage-arena');
  const btns = container.querySelectorAll('.number-card');
  btns.forEach(b => {
    const val = parseInt(b.getAttribute('data-val'), 10);
    if (val === currentQuestion.correctAnswer) {
      b.classList.add('correct');
    } else if (val === selectedVal) {
      b.classList.add('incorrect');
    }
  });

  if (!isCorrect && (selectedDuration === 0 || isAlgorithmMode)) {
    isReviewingError = true;
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
        showNextItem();
      });
    }
  } else {
    setTimeout(() => {
      showNextItem();
    }, isCorrect ? 180 : 700);
  }
}

function startTest(duration, isAlgo = false) {
  selectedDuration = duration;
  isAlgorithmMode = isAlgo;
  session = new SessionTracker('number_speed', 'Числовая скорость и точность (Number Speed)', 'Number Speed');
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
    titleRu: 'Результаты: Числовая скорость и точность (Number Speed)',
    titleEn: 'Results: Number Speed & Accuracy',
    targetAnsweredRu: '25–40 за 2 мин',
    targetAnsweredEn: '25–40 in 2 mins',
    targetSpeedRu: '14–22 /мин',
    targetSpeedEn: '14–22 /min',
    onRetry: () => startTest(selectedDuration, isAlgorithmMode)
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
