// Task 4: Word Meaning Engine

const VOCABULARY = {
  ru: [
    { w1: "Холодный", w2: "Ледяной", odd: "Быстрый", type: "syn", rel: "синонимы (температура)" },
    { w1: "Высокий", w2: "Низкий", odd: "Зеленый", type: "ant", rel: "антонимы (рост/высота)" },
    { w1: "Светлый", w2: "Темный", odd: "Деревянный", type: "ant", rel: "антонимы (освещенность)" },
    { w1: "Грустный", w2: "Печальный", odd: "Твердый", type: "syn", rel: "синонимы (эмоция)" },
    { w1: "Быстрый", w2: "Медленный", odd: "Сладкий", type: "ant", rel: "антонимы (скорость)" },
    { w1: "Огромный", w2: "Гигантский", odd: "Мокрый", type: "syn", rel: "синонимы (размер)" },
    { w1: "Богатый", w2: "Бедный", odd: "Круглый", type: "ant", rel: "антонимы (состояние)" },
    { w1: "Смелый", w2: "Храбрый", odd: "Острый", type: "syn", rel: "синонимы (характер)" },
    { w1: "Начало", w2: "Конец", odd: "Камень", type: "ant", rel: "антонимы (время/порядок)" },
    { w1: "Добрый", w2: "Злой", odd: "Тяжелый", type: "ant", rel: "антонимы (нрав)" },
    { w1: "Умный", w2: "Мудрый", odd: "Холодный", type: "syn", rel: "синонимы (интеллект)" },
    { w1: "Шумный", w2: "Тихий", odd: "Желтый", type: "ant", rel: "антонимы (звук)" },
    { w1: "Простой", w2: "Легкий", odd: "Громкий", type: "syn", rel: "синонимы (сложность)" },
    { w1: "Твердый", w2: "Мягкий", odd: "Кислый", type: "ant", rel: "антонимы (плотность)" },
    { w1: "Чистый", w2: "Грязный", odd: "Далекий", type: "ant", rel: "антонимы (гигиена)" },
    { w1: "Верный", w2: "Преданный", odd: "Сухой", type: "syn", rel: "синонимы (отношение)" }
  ],
  en: [
    { w1: "Cold", w2: "Freezing", odd: "Fast", type: "syn", rel: "synonyms (temperature)" },
    { w1: "Tall", w2: "Short", odd: "Green", type: "ant", rel: "antonyms (height)" },
    { w1: "Bright", w2: "Dark", odd: "Wooden", type: "ant", rel: "antonyms (light)" },
    { w1: "Sad", w2: "Gloomy", odd: "Solid", type: "syn", rel: "synonyms (mood)" },
    { w1: "Fast", w2: "Slow", odd: "Sweet", type: "ant", rel: "antonyms (speed)" },
    { w1: "Huge", w2: "Giant", odd: "Wet", type: "syn", rel: "synonyms (size)" },
    { w1: "Rich", w2: "Poor", odd: "Round", type: "ant", rel: "antonyms (wealth)" },
    { w1: "Brave", w2: "Courageous", odd: "Sharp", type: "syn", rel: "synonyms (trait)" },
    { w1: "Start", w2: "Finish", odd: "Stone", type: "ant", rel: "antonyms (order)" },
    { w1: "Kind", w2: "Cruel", odd: "Heavy", type: "ant", rel: "antonyms (character)" },
    { w1: "Clever", w2: "Wise", odd: "Cold", type: "syn", rel: "synonyms (intellect)" },
    { w1: "Noisy", w2: "Quiet", odd: "Yellow", type: "ant", rel: "antonyms (sound)" }
  ]
};

let session = new SessionTracker('word_meaning', 'Значение слов (Word Meaning)', 'Word Meaning');
let timer = null;
let currentQuestion = null;
let selectedDuration = 120;
let isAcceptingInput = false;
let isReviewingError = false;

function generateWordQuestion() {
  const lang = getGlobalLanguage();
  const pool = VOCABULARY[lang] || VOCABULARY.en;
  const item = pool[Math.floor(Math.random() * pool.length)];

  const words = [item.w1, item.w2, item.odd];
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }

  const explanation = (lang === 'ru')
    ? `Слова <b>${item.w1}</b> и <b>${item.w2}</b> — это ${item.rel}. Лишнее слово: <b>${item.odd}</b>.`
    : `Words <b>${item.w1}</b> and <b>${item.w2}</b> are ${item.rel}. The odd word is <b>${item.odd}</b>.`;

  return {
    words,
    w1: item.w1,
    w2: item.w2,
    odd: item.odd,
    type: item.type,
    correctAnswer: item.odd,
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
  currentQuestion = generateWordQuestion();
  isAcceptingInput = true;
  session.recordItemStart();

  const container = document.getElementById('stage-arena');
  const lang = getGlobalLanguage();

  const choicesHtml = currentQuestion.words.map(word => `<button class="word-card" data-word="${word}"><span class="word-text">${word}</span></button>`).join('');

  container.innerHTML = `
    <div class="phase-indicator">
      ${lang === 'ru' ? 'Какое слово является лишним?' : 'Which word is the odd one out?'}
    </div>
    <div class="words-row">
      ${choicesHtml}
    </div>
    <div class="helper-text" style="margin-top: 18px;">
      ${lang === 'ru' ? 'Нажмите на лишнее слово' : 'Click the odd word out'}
    </div>
    <div id="feedback-area"></div>
  `;

  const btns = container.querySelectorAll('.word-card');
  btns.forEach(b => {
    b.addEventListener('click', () => {
      const w = b.getAttribute('data-word');
      handleChoice(w);
    });
  });
}

function handleChoice(selectedWord) {
  if (!isAcceptingInput || isReviewingError) return;
  isAcceptingInput = false;

  const isCorrect = (selectedWord === currentQuestion.correctAnswer);
  const lang = getGlobalLanguage();

  session.recordAnswer(isCorrect, {
    promptHtml: `<b>${lang === 'ru' ? 'Слова:' : 'Words:'}</b> <span style="font-size: 15px; font-weight: 600;">${currentQuestion.words.join(' · ')}</span>`,
    userAnswer: selectedWord,
    correctAnswer: currentQuestion.correctAnswer,
    explanation: currentQuestion.explanation
  });

  updateStatsDisplay();

  const container = document.getElementById('stage-arena');
  const btns = container.querySelectorAll('.word-card');
  btns.forEach(b => {
    const val = b.getAttribute('data-word');
    if (val === currentQuestion.correctAnswer) {
      b.classList.add('correct');
    } else if (val === selectedWord) {
      b.classList.add('incorrect');
    }
  });

  if (!isCorrect && selectedDuration === 0) {
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

function startTest(duration) {
  selectedDuration = duration;
  session = new SessionTracker('word_meaning', 'Значение слов (Word Meaning)', 'Word Meaning');
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
    titleRu: 'Результаты: Значение слов (Word Meaning)',
    titleEn: 'Results: Word Meaning',
    targetAnsweredRu: '30–45 за 2 мин',
    targetAnsweredEn: '30–45 in 2 mins',
    targetSpeedRu: '16–25 /мин',
    targetSpeedEn: '16–25 /min',
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
