// Task 5: Spatial Visualisation Engine

let session = new SessionTracker('spatial_visualisation', 'Пространственное мышление (Spatial Visualisation)', 'Spatial Visualisation');
let timer = null;
let currentQuestion = null;
let selectedDuration = 120;
let isAcceptingInput = false;
let isReviewingError = false;
let isAlgorithmMode = false;

const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function renderGlyphSvg(angleDeg, isMirrored, highlightSpine = false) {
  return `
    <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; overflow: visible;">
      <g transform="translate(50, 50) rotate(${angleDeg}) scale(${isMirrored ? -1 : 1}, 1)">
        <text x="0" y="0" 
              text-anchor="middle" 
              dominant-baseline="central" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
              font-weight="800" 
              font-size="66" 
              fill="var(--ink)">R</text>
        ${highlightSpine ? `
          <!-- Spine Highlight Line -->
          <line x1="-16" y1="-28" x2="-16" y2="28" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" opacity="0.85" />
        ` : ''}
      </g>
    </svg>
  `;
}

function generateSpatialQuestion() {
  const pairs = [];
  let sameCount = 0;

  for (let i = 0; i < 2; i++) {
    const isSame = Math.random() < 0.5;
    if (isSame) sameCount++;

    const leftAngle = ANGLES[Math.floor(Math.random() * ANGLES.length)];
    let rightAngle = ANGLES[Math.floor(Math.random() * ANGLES.length)];
    while (rightAngle === leftAngle) {
      rightAngle = ANGLES[Math.floor(Math.random() * ANGLES.length)];
    }

    const leftMirrored = Math.random() < 0.4;
    const rightMirrored = isSame ? leftMirrored : !leftMirrored;

    pairs.push({
      left: { angle: leftAngle, isMirrored: leftMirrored },
      right: { angle: rightAngle, isMirrored: rightMirrored },
      isSame: isSame
    });
  }

  const lang = getGlobalLanguage();
  const explanation = (lang === 'ru')
    ? `Пара 1: ${pairs[0].isSame ? '<b>СОВПАДАЕТ</b> (обе R или обе Я)' : '<b>РАЗЛИЧАЕТСЯ</b> (одна R, другая зеркало)'}. Пара 2: ${pairs[1].isSame ? '<b>СОВПАДАЕТ</b>' : '<b>РАЗЛИЧАЕТСЯ</b>'}. Итого совпадений: <b>${sameCount}</b>.`
    : `Pair 1: ${pairs[0].isSame ? '<b>MATCH</b> (both original or both mirrored)' : '<b>DIFFERENT</b> (one original, one mirrored)'}. Pair 2: ${pairs[1].isSame ? '<b>MATCH</b>' : '<b>DIFFERENT</b>'}. Total matching pairs: <b>${sameCount}</b>.`;

  return {
    pairs,
    correctAnswer: sameCount,
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
  currentQuestion = generateSpatialQuestion();
  isAcceptingInput = true;
  session.recordItemStart();

  const container = document.getElementById('stage-arena');
  const lang = getGlobalLanguage();

  const boxesHtml = currentQuestion.pairs.map((p, i) => {
    let algoGuide = '';
    if (isAlgorithmMode) {
      const leftSide = p.left.isMirrored ? (lang === 'ru' ? 'СЛЕВА (Я)' : 'LEFT (Mirrored)') : (lang === 'ru' ? 'СПРАВА (R)' : 'RIGHT (Original R)');
      const rightSide = p.right.isMirrored ? (lang === 'ru' ? 'СЛЕВА (Я)' : 'LEFT (Mirrored)') : (lang === 'ru' ? 'СПРАВА (R)' : 'RIGHT (Original R)');
      algoGuide = `
        <div style="font-size: 11px; font-family: ui-monospace, monospace; margin-top: 10px; color: var(--ink-muted); text-align: center;">
          ${lang === 'ru' ? 'Лев' : 'L'}: ${leftSide} · ${lang === 'ru' ? 'Прав' : 'R'}: ${rightSide}<br>
          ➔ <b style="color: ${p.isSame ? 'var(--good)' : 'var(--bad)'}">${p.isSame ? (lang === 'ru' ? '✅ СОВПАДАЕТ' : '✅ MATCH') : (lang === 'ru' ? '❌ РАЗНЫЕ' : '❌ DIFFER')}</b>
        </div>
      `;
    }

    return `
      <div class="spatial-pair-card">
        <span class="box-num">${lang === 'ru' ? 'Пара' : 'Pair'} ${i + 1}</span>
        <div class="spatial-glyphs-row">
          <div class="spatial-glyph-wrapper">${renderGlyphSvg(p.left.angle, p.left.isMirrored, isAlgorithmMode)}</div>
          <div class="spatial-divider-v"></div>
          <div class="spatial-glyph-wrapper">${renderGlyphSvg(p.right.angle, p.right.isMirrored, isAlgorithmMode)}</div>
        </div>
        ${algoGuide}
      </div>
    `;
  }).join('');

  const choicesHtml = [0, 1, 2].map(num => `<button class="btn-choice-num" data-choice="${num}" style="min-width: 80px;"><span>${num}</span></button>`).join('');

  container.innerHTML = `
    <div class="phase-indicator">
      ${lang === 'ru' ? 'Сколько пар совпадают только вращением (без зеркального отражения)?' : 'How many pairs match via rotation only (not mirrored)?'}
    </div>
    <div class="spatial-boxes-container">
      ${boxesHtml}
    </div>
    <div class="choices-row" style="margin-top: 24px;">
      ${choicesHtml}
    </div>
    <div class="helper-text">
      ${lang === 'ru' ? 'Нажмите клавишу 0, 1 или 2' : 'Press keys 0, 1 or 2'}
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

  const pairsSummary = currentQuestion.pairs.map((p, i) => `
    ${lang === 'ru' ? 'Пара' : 'Pair'} ${i + 1}: ${p.isSame ? (lang === 'ru' ? '✅ СОВПАДАЕТ' : '✅ MATCH') : (lang === 'ru' ? '❌ ЗЕРКАЛО' : '❌ MIRRORED')}
  `).join(' · ');

  session.recordAnswer(isCorrect, {
    promptHtml: `<b>${lang === 'ru' ? 'Символы R:' : 'Glyphs R:'}</b> ${pairsSummary}`,
    userAnswer: `${selectedNum} ${lang === 'ru' ? 'совп.' : 'matches'}`,
    correctAnswer: `${currentQuestion.correctAnswer} ${lang === 'ru' ? 'совп.' : 'matches'}`,
    explanation: currentQuestion.explanation
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
  session = new SessionTracker('spatial_visualisation', 'Пространственное мышление (Spatial Visualisation)', 'Spatial Visualisation');
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
    titleRu: 'Результаты: Пространственное мышление (Spatial Visualisation)',
    titleEn: 'Results: Spatial Visualisation',
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
