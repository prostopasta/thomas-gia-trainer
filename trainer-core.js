// Thomas GIA Aptitude Trainer - Core Shared Framework


// --- UI Scaling Engine (50% - 150%, Default: 100% => Base 1.2x) ---
function getGlobalScale() {
  const saved = localStorage.getItem('gia_scale_v4');
  if (!saved) {
    localStorage.removeItem('gia_scale');
    localStorage.removeItem('gia_scale_v2');
    localStorage.removeItem('gia_scale_v3');
    localStorage.setItem('gia_scale_v4', '100');
    return 100;
  }
  const num = parseInt(saved, 10);
  return (!isNaN(num) && num >= 50 && num <= 150) ? num : 100;
}

function setGlobalScale(scalePercent) {
  const clamped = Math.max(50, Math.min(150, Math.round(scalePercent)));
  localStorage.setItem('gia_scale_v4', clamped.toString());
  applyScale(clamped);
  window.dispatchEvent(new CustomEvent('gia-scale-change', { detail: { scale: clamped } }));
}

function applyScale(scalePercent) {
  // Base default (100%) is 1.2x scale for clean, spacious and readable layout
  document.body.style.zoom = (scalePercent / 100) * 1.2;
  const labels = document.querySelectorAll('.scale-value-label');
  labels.forEach(lbl => {
    lbl.textContent = `${scalePercent}%`;
  });
}

function initScale() {
  const scale = getGlobalScale();
  applyScale(scale);

  document.querySelectorAll('.btn-scale-down').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cur = getGlobalScale();
      setGlobalScale(Math.max(50, cur - 10));
    });
  });

  document.querySelectorAll('.btn-scale-up').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cur = getGlobalScale();
      setGlobalScale(Math.min(150, cur + 10));
    });
  });

  document.querySelectorAll('.scale-value-label').forEach(lbl => {
    lbl.addEventListener('click', (e) => {
      e.preventDefault();
      setGlobalScale(100); // Reset to default 100%
    });
  });

  window.addEventListener('gia-scale-change', (e) => {
    applyScale(e.detail.scale);
  });
}

// --- Sidebar Menu Visibility (Hidden / Visible) ---
function isSidebarHidden() {
  return localStorage.getItem('gia_sidebar') === 'hidden';
}

function setSidebarHidden(hidden) {
  localStorage.setItem('gia_sidebar', hidden ? 'hidden' : 'visible');
  applySidebarState(hidden);
  window.dispatchEvent(new CustomEvent('gia-sidebar-change', { detail: { hidden } }));
}

function toggleSidebar() {
  const current = isSidebarHidden();
  setSidebarHidden(!current);
}

function applySidebarState(hidden) {
  document.documentElement.setAttribute('data-sidebar', hidden ? 'hidden' : 'visible');
  const btns = document.querySelectorAll('.btn-sidebar-toggle');
  const isRu = getGlobalLanguage() === 'ru';
  btns.forEach(btn => {
    btn.textContent = hidden 
      ? (isRu ? '☰ Меню: Скрыто' : '☰ Menu: Hidden') 
      : (isRu ? '☰ Меню: Вкл' : '☰ Menu: Visible');
    btn.classList.toggle('active', !hidden);
  });
}

function initSidebar() {
  const hidden = isSidebarHidden();
  applySidebarState(hidden);

  document.querySelectorAll('.btn-sidebar-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleSidebar();
    });
  });

  window.addEventListener('gia-lang-change', () => {
    applySidebarState(isSidebarHidden());
  });
  window.addEventListener('gia-sidebar-change', (e) => {
    applySidebarState(e.detail.hidden);
  });
}

// --- Theme Management ---
function initTheme() {
  const saved = localStorage.getItem('gia_theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('gia_theme', next);
}

// --- Language Management (Default: EN) ---
function getGlobalLanguage() {
  return localStorage.getItem('gia_lang') || 'en';
}

function setGlobalLanguage(lang) {
  localStorage.setItem('gia_lang', lang);
  document.documentElement.setAttribute('data-lang', lang);
  document.documentElement.setAttribute('lang', lang);

  // Update active states on lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  // Dispatch custom event for active test modules
  window.dispatchEvent(new CustomEvent('gia-lang-change', { detail: { lang } }));
}

function initLanguage() {
  const lang = getGlobalLanguage();
  document.documentElement.setAttribute('data-lang', lang);
  document.documentElement.setAttribute('lang', lang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const chosen = btn.getAttribute('data-lang');
      if (chosen) setGlobalLanguage(chosen);
    });
  });
}

// --- Audio FX (Web Audio API - zero external assets) ---
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('gia_sound') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('gia_sound', this.enabled ? 'true' : 'false');
    return this.enabled;
  }

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime); // A3
    osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.23);
  }

  playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
}

const soundFx = new SoundEffects();

// --- Timer Engine ---
class GiaTimer {
  constructor(durationSeconds, onTick, onComplete) {
    this.duration = durationSeconds; // 0 = unlimited
    this.remaining = durationSeconds;
    this.elapsed = 0;
    this.timerId = null;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const startTime = Date.now() - (this.elapsed * 1000);
    
    this.timerId = setInterval(() => {
      const now = Date.now();
      this.elapsed = Math.floor((now - startTime) / 1000);
      
      if (this.duration > 0) {
        this.remaining = Math.max(0, this.duration - this.elapsed);
        if (this.onTick) this.onTick(this.remaining, this.format(this.remaining), this.remaining <= 15);
        if (this.remaining <= 0) {
          this.stop();
          if (this.onComplete) this.onComplete();
        }
      } else {
        if (this.onTick) this.onTick(this.elapsed, this.format(this.elapsed), false);
      }
    }, 250);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
  }

  format(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}

// --- Assessment Session Tracker ---
class SessionTracker {
  constructor(testId, testNameRu, testNameEn) {
    this.testId = testId;
    this.testNameRu = testNameRu;
    this.testNameEn = testNameEn || testNameRu;
    this.answered = 0;
    this.correct = 0;
    this.incorrect = 0;
    this.currentStreak = 0;
    this.bestStreak = 0;
    this.latencies = []; // in ms
    this.history = [];   // item-by-item breakdown
    this.startTime = 0;
    this.itemStartTime = 0;
  }

  start() {
    this.startTime = Date.now();
    this.itemStartTime = Date.now();
    this.history = [];
    this.latencies = [];
    this.answered = 0;
    this.correct = 0;
    this.incorrect = 0;
    this.currentStreak = 0;
    this.bestStreak = 0;
  }

  recordItemStart() {
    this.itemStartTime = Date.now();
  }

  recordAnswer(isCorrect, details = {}) {
    const latency = Date.now() - this.itemStartTime;
    this.latencies.push(latency);
    this.answered++;

    const entry = {
      index: this.answered,
      isCorrect,
      latency,
      promptHtml: details.promptHtml || '',
      userAnswer: details.userAnswer !== undefined ? details.userAnswer : '',
      correctAnswer: details.correctAnswer !== undefined ? details.correctAnswer : '',
      explanation: details.explanation || ''
    };
    this.history.push(entry);

    if (isCorrect) {
      this.correct++;
      this.currentStreak++;
      if (this.currentStreak > this.bestStreak) {
        this.bestStreak = this.currentStreak;
      }
      soundFx.playCorrect();
    } else {
      this.incorrect++;
      this.currentStreak = 0;
      soundFx.playWrong();
    }

    return {
      isCorrect,
      latency,
      accuracy: this.getAccuracy(),
      speed: this.getItemsPerMinute()
    };
  }

  getAccuracy() {
    if (this.answered === 0) return 100;
    return Math.round((this.correct / this.answered) * 100);
  }

  getItemsPerMinute() {
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    if (elapsedMinutes <= 0.05) return 0;
    return Math.round(this.answered / elapsedMinutes);
  }

  getAvgLatency() {
    if (this.latencies.length === 0) return 0;
    const sum = this.latencies.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.latencies.length);
  }

  getEstimatedScore() {
    const speed = this.getItemsPerMinute();
    const acc = this.getAccuracy();
    const effectiveCorrectRate = (this.correct - (this.incorrect * 0.5));
    const elapsedMinutes = Math.max(0.1, (Date.now() - this.startTime) / 60000);
    const effectiveRatePerMin = effectiveCorrectRate / elapsedMinutes;

    return {
      answered: this.answered,
      correct: this.correct,
      incorrect: this.incorrect,
      accuracy: acc,
      itemsPerMin: speed,
      avgLatencyMs: this.getAvgLatency(),
      bestStreak: this.bestStreak,
      effectiveScore: Math.round(effectiveRatePerMin * 10)
    };
  }

  saveHighScore() {
    const key = `gia_best_${this.testId}`;
    const currentBest = JSON.parse(localStorage.getItem(key) || 'null');
    const summary = this.getEstimatedScore();
    const isRu = getGlobalLanguage() === 'ru';
    summary.date = new Date().toLocaleDateString(isRu ? 'ru-RU' : 'en-US');

    if (!currentBest || summary.effectiveScore > (currentBest.effectiveScore || 0)) {
      localStorage.setItem(key, JSON.stringify(summary));
      return true;
    }
    return false;
  }
}

// --- Universal Results Screen with Answer Review & Breakdown ---
function renderResultsModal(session, options = {}) {
  const container = document.getElementById(options.containerId || 'results-panel');
  if (!container) return;

  const summary = session.getEstimatedScore();
  const isNewRecord = session.saveHighScore();
  const lang = getGlobalLanguage();
  const history = session.history || [];
  const errors = history.filter(h => !h.isCorrect);
  const corrects = history.filter(h => h.isCorrect);

  const defaultFilter = errors.length > 0 ? 'errors' : 'all';

  function buildHistoryItems(filter) {
    let items = history;
    if (filter === 'errors') items = errors;
    else if (filter === 'corrects') items = corrects;

    if (items.length === 0) {
      if (filter === 'errors') {
        return `<div class="review-empty-state">🎉 ${lang === 'ru' ? 'Превосходно! В этой сессии нет ни одной ошибки.' : 'Awesome! Zero mistakes in this session.'}</div>`;
      }
      return `<div class="review-empty-state">${lang === 'ru' ? 'Нет ответов' : 'No items recorded'}</div>`;
    }

    return items.map(item => `
      <div class="review-card ${item.isCorrect ? 'correct' : 'incorrect'}">
        <div class="review-card-header">
          <span class="review-card-num">#${item.index}</span>
          <span class="review-badge ${item.isCorrect ? 'good' : 'bad'}">
            ${item.isCorrect ? (lang === 'ru' ? '✅ Верно' : '✅ Correct') : (lang === 'ru' ? '❌ Ошибка' : '❌ Incorrect')}
          </span>
          <span class="review-latency">⏱️ ${(item.latency / 1000).toFixed(2)}s</span>
        </div>
        <div class="review-prompt">${item.promptHtml}</div>
        <div class="review-answers-row">
          <span class="ans-tag user ${item.isCorrect ? 'good' : 'bad'}">
            ${lang === 'ru' ? 'Ваш ответ:' : 'Your answer:'} <b>${item.userAnswer}</b>
          </span>
          ${!item.isCorrect ? `
            <span class="ans-tag correct-val">
              ${lang === 'ru' ? 'Правильный ответ:' : 'Correct answer:'} <b>${item.correctAnswer}</b>
            </span>
          ` : ''}
        </div>
        ${item.explanation ? `
          <div class="review-explanation-box">
            ${item.explanation}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  const title = (lang === 'ru') ? (options.titleRu || session.testNameRu) : (options.titleEn || session.testNameEn);
  const normAnswered = (lang === 'ru') ? (options.targetAnsweredRu || '30–45 за 2 мин') : (options.targetAnsweredEn || '30–45 in 2 mins');
  const normSpeed = (lang === 'ru') ? (options.targetSpeedRu || '16–25 /мин') : (options.targetSpeedEn || '16–25 /min');

  container.style.display = 'block';
  container.innerHTML = `
    <div class="card results-modal">
      <span class="chip good">${lang === 'ru' ? 'Сессия завершена' : 'Session Complete'}</span>
      <h2>${title}</h2>
      <div class="results-score-big">${summary.effectiveScore} <span style="font-size: 20px; font-weight: normal; color: var(--ink-muted);">pts</span></div>
      <p style="color: var(--ink-muted); margin-bottom: 20px;">
        ${isNewRecord ? (lang === 'ru' ? '🔥 <b>Новый личный рекорд!</b>' : '🔥 <b>New Personal Best!</b>') : ''}
      </p>

      <table class="results-table">
        <tr>
          <th>${lang === 'ru' ? 'Метрика' : 'Metric'}</th>
          <th>${lang === 'ru' ? 'Результат' : 'Your Result'}</th>
          <th>${lang === 'ru' ? 'Норма GIA' : 'GIA Target'}</th>
        </tr>
        <tr>
          <td>${lang === 'ru' ? 'Всего решено' : 'Total Answered'}</td>
          <td><b>${summary.answered}</b></td>
          <td>${normAnswered}</td>
        </tr>
        <tr>
          <td>${lang === 'ru' ? 'Точность (Accuracy)' : 'Accuracy'}</td>
          <td><b>${summary.accuracy}%</b> (${summary.correct} ${lang === 'ru' ? 'верных' : 'correct'}, ${summary.incorrect} ${lang === 'ru' ? 'ошибок' : 'errors'})</td>
          <td>≥ 90–95%</td>
        </tr>
        <tr>
          <td>${lang === 'ru' ? 'Темп (Speed)' : 'Speed'}</td>
          <td><b>${summary.itemsPerMin} ${lang === 'ru' ? 'задач/мин' : 'items/min'}</b></td>
          <td>${normSpeed}</td>
        </tr>
        <tr>
          <td>${lang === 'ru' ? 'Среднее время' : 'Avg Latency'}</td>
          <td><b>${(summary.avgLatencyMs / 1000).toFixed(2)} ${lang === 'ru' ? 'сек' : 'sec'}</b></td>
          <td>2.0–3.0 ${lang === 'ru' ? 'сек' : 'sec'}</td>
        </tr>
        <tr>
          <td>${lang === 'ru' ? 'Лучшая серия (Streak)' : 'Best Streak'}</td>
          <td><b>${summary.bestStreak}</b></td>
          <td>–</td>
        </tr>
      </table>

      <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px; margin-bottom: 24px; flex-wrap: wrap;">
        <button id="btn-results-retry" class="btn btn-primary btn-large">
          ${lang === 'ru' ? 'Повторить попытку' : 'Retry Test'} ↺
        </button>
        <a class="btn btn-large" href="${options.dashboardUrl || 'index.html'}">
          ${lang === 'ru' ? 'На главную' : 'Dashboard'}
        </a>
      </div>

      <!-- Review of Answers and Mistakes Section -->
      <div class="review-section">
        <div class="review-section-title">
          <span>🔍 ${lang === 'ru' ? 'Подробный разбор ответов и ошибок' : 'Detailed Answer & Error Breakdown'}</span>
          <div class="review-filter-tabs">
            <button class="review-tab-btn ${defaultFilter === 'errors' ? 'active' : ''}" data-filter="errors">
              ❌ ${lang === 'ru' ? 'Ошибки' : 'Errors'} (${errors.length})
            </button>
            <button class="review-tab-btn ${defaultFilter === 'all' ? 'active' : ''}" data-filter="all">
              📋 ${lang === 'ru' ? 'Все' : 'All'} (${history.length})
            </button>
            <button class="review-tab-btn" data-filter="corrects">
              ✅ ${lang === 'ru' ? 'Верные' : 'Correct'} (${corrects.length})
            </button>
          </div>
        </div>

        <div id="review-items-container" class="review-list">
          ${buildHistoryItems(defaultFilter)}
        </div>
      </div>
    </div>
  `;

  // Bind retry button
  document.getElementById('btn-results-retry').addEventListener('click', () => {
    if (options.onRetry) options.onRetry();
  });

  // Bind filter tab buttons
  const tabBtns = container.querySelectorAll('.review-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      document.getElementById('review-items-container').innerHTML = buildHistoryItems(filter);
    });
  });
}



// --- Fullscreen Management ---
function isAutoFullscreen() {
  return localStorage.getItem('gia_auto_fullscreen') === 'true';
}

function setAutoFullscreen(val) {
  localStorage.setItem('gia_auto_fullscreen', val ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('gia-fullscreen-setting-change', { detail: { enabled: val } }));
}

function requestAppFullscreen() {
  const elem = document.documentElement;
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  }
}

function exitAppFullscreen() {
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

function toggleAppFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    requestAppFullscreen();
  } else {
    exitAppFullscreen();
  }
}

function initFullscreen() {
  const btn = document.getElementById('btn-fullscreen-toggle');
  if (btn) {
    const updateFsText = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      const isRu = getGlobalLanguage() === 'ru';
      btn.textContent = isFs 
        ? (isRu ? '⛶ Обычный экран' : '⛶ Exit Fullscreen')
        : (isRu ? '⛶ Полный экран' : '⛶ Fullscreen');
      btn.classList.toggle('active', isFs);
    };

    updateFsText();
    window.addEventListener('gia-lang-change', updateFsText);
    document.addEventListener('fullscreenchange', updateFsText);
    document.addEventListener('webkitfullscreenchange', updateFsText);

    btn.addEventListener('click', () => {
      toggleAppFullscreen();
    });
  }
}

// --- Hotkeys Setting (Default: Disabled) ---
function isHotkeysEnabled() {
  return localStorage.getItem('gia_hotkeys') === 'true';
}

function toggleHotkeys() {
  const current = isHotkeysEnabled();
  const next = !current;
  localStorage.setItem('gia_hotkeys', next ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('gia-hotkeys-change', { detail: { enabled: next } }));
  return next;
}

function initHotkeys() {
  const btn = document.getElementById('btn-hotkeys-toggle');
  if (btn) {
    const updateHotkeysText = () => {
      const enabled = isHotkeysEnabled();
      const isRu = getGlobalLanguage() === 'ru';
      btn.textContent = enabled 
        ? (isRu ? '⌨️ Клавиши: Вкл' : '⌨️ Hotkeys: On') 
        : (isRu ? '⌨️ Клавиши: Выкл' : '⌨️ Hotkeys: Off');
      btn.classList.toggle('active', enabled);
    };
    updateHotkeysText();
    window.addEventListener('gia-lang-change', updateHotkeysText);
    window.addEventListener('gia-hotkeys-change', updateHotkeysText);

    btn.addEventListener('click', () => {
      toggleHotkeys();
      updateHotkeysText();
    });
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initFullscreen();
  initScale();
  initSidebar();
  
  // Bind theme toggle buttons
  const themeBtns = document.querySelectorAll('.theme-toggle');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  // Bind sound toggle button if present
  const soundBtn = document.getElementById('btn-sound-toggle');
  if (soundBtn) {
    const updateSoundText = () => {
      const isRu = getGlobalLanguage() === 'ru';
      soundBtn.textContent = soundFx.enabled 
        ? (isRu ? '🔊 Звук: Вкл' : '🔊 Sound: On') 
        : (isRu ? '🔇 Звук: Выкл' : '🔇 Sound: Off');
    };
    updateSoundText();
    window.addEventListener('gia-lang-change', updateSoundText);

    soundBtn.addEventListener('click', () => {
      soundFx.toggle();
      updateSoundText();
    });
  }
});
