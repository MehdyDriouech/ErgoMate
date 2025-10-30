// js/app.js — Ergo Quiz Enhanced v2 (+ Dashboard & Analytics)
// ✨ NOUVELLES FONCTIONNALITÉS EPIC 3 :
// - Tableau de bord avec graphiques de progression
// - Historique détaillé avec statistiques
// - Tracking du temps moyen par question
// - Export/Import des données

///////////////////////////
// THÈME AUTO-ADAPTATIF  //
///////////////////////////
const THEME_STORAGE_KEY = 'ergoquiz_theme';
let themeMediaQuery = null;

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }
  
  const btn = document.getElementById('btn-theme');
  if (btn) {
    btn.textContent = (theme === 'dark') ? '☀️' : '🌙';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre');
  }
}

function getSavedTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) || null;
}

function detectPreferredTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function initTheme() {
  const saved = getSavedTheme();
  const theme = saved || detectPreferredTheme();
  applyTheme(theme);
  
  if (!saved && window.matchMedia) {
    themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => {
      if (!getSavedTheme()) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    if (themeMediaQuery.addEventListener) {
      themeMediaQuery.addEventListener('change', handleThemeChange);
    } else if (themeMediaQuery.addListener) {
      themeMediaQuery.addListener(handleThemeChange);
    }
  }
}

///////////////////////////
// ÉTAT & STOCKAGE LOCAL //
///////////////////////////
const state = {
  config: {
    app: {
      title: 'Ergo Quiz',
      defaultLocale: 'fr-FR',
      modes: { enabled: ['practice','mcq_only','exam','error_review'], default: 'practice' },
      examDefaults: { questionCount: 20, timeLimitSec: 1200, passingPercent: 70 },
      errorReview: { maxPerSession: 15, decayOnCorrect: 1 }
    }
  },
  themes: [],
  currentTheme: null,
  themeCounts: {},
  mode: 'practice',
  questions: [],
  qIndex: 0,
  score: 0,
  locked: false,
  startedAt: null,
  fcIndex: 0,
  fcRevealed: false,
  fcAnimating: false,
  
  // US 3.3 - Tracking du temps
  questionStartTime: null,
  questionTimes: [], // Array de durées en ms pour chaque question
  sessionStartTime: null
};

const STORAGE_KEYS = {
  HISTORY: 'ergoquiz_history',
  ERRORS:  'ergoquiz_errors',
  STATS: 'ergoquiz_stats', // US 3.1 - Stats pour dashboard
  CUSTOM_THEMES: 'ergoquiz_custom_themes' // Thèmes personnalisés
};

///////////////////////////
// GESTION HISTORIQUE    //
///////////////////////////
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || []; }
  catch { return []; }
}

function saveHistoryEntry(entry) {
  const items = loadHistory();
  items.unshift(entry);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(items.slice(0, 200)));
}

///////////////////////////
// GESTION ERREURS       //
///////////////////////////
function loadErrors() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ERRORS)) || {}; }
  catch { return {}; }
}

function saveErrors(obj) {
  localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(obj));
}

function incError(themeId, qid) {
  const e = loadErrors();
  e[themeId] = e[themeId] || {};
  e[themeId][qid] = (e[themeId][qid] || 0) + 1;
  saveErrors(e);
}

function decError(themeId, qid, amount = 1) {
  const e = loadErrors();
  if (!e[themeId] || !e[themeId][qid]) return;
  e[themeId][qid] = Math.max(0, e[themeId][qid] - amount);
  saveErrors(e);
}

function getErrorCount(themeId, qid) {
  const e = loadErrors();
  return e?.[themeId]?.[qid] || 0;
}

function getThemeErrorTotal(themeId) {
  const e = loadErrors();
  const map = e?.[themeId] || {};
  return Object.values(map).reduce((a,b)=>a+b,0);
}

/////////////////////
// SÉLECTEURS DOM  //
/////////////////////
const els = {
  views: {
    themes: document.getElementById('view-themes'),
    quiz: document.getElementById('view-quiz'),
    results: document.getElementById('view-results'),
    flashcards: document.getElementById('view-flashcards'),
    history: document.getElementById('view-history'),
    dashboard: document.getElementById('view-dashboard'), // US 3.1
    importTheme: document.getElementById('view-import-theme'), // Import thèmes
    customThemes: document.getElementById('view-custom-themes') // Gestion thèmes perso
  },
  btnHome: document.getElementById('btn-home'),
  btnHistory: document.getElementById('btn-history'),
  btnDashboard: document.getElementById('btn-dashboard'), // US 3.1
  btnTheme: document.getElementById('btn-theme'),
  btnAddTheme: document.getElementById('btn-add-theme'), // Ajouter un thème
  btnManageThemes: document.getElementById('btn-manage-themes'), // Gérer les thèmes perso
  themesList: document.getElementById('themes-list'),
  quizTitle: document.getElementById('quiz-title'),
  quizThemeTitle: document.getElementById('quiz-theme-title'),
  quizProgress: document.getElementById('quiz-progress'),
  questionContainer: document.getElementById('question-container'),
  btnSubmit: document.getElementById('btn-submit'),
  btnNext: document.getElementById('btn-next'),
  btnQuit: document.getElementById('btn-quit'),
  resultsSummary: document.getElementById('results-summary'),
  resultsDetails: document.getElementById('results-details'),
  btnRetry: document.getElementById('btn-retry'),
  btnBackThemes: document.getElementById('btn-back-themes'),
  flashcardsTitle: document.getElementById('flashcards-title'),
  flashcardsThemeTitle: document.getElementById('flashcards-theme-title'),
  flashcardsProgress: document.getElementById('flashcards-progress'),
  flashcard: document.getElementById('flashcard'),
  btnShowAnswer: document.getElementById('btn-show-answer'),
  btnKnow: document.getElementById('btn-know'),
  btnDontKnow: document.getElementById('btn-dont-know'),
  btnFcPrev: document.getElementById('btn-fc-prev'),
  btnFcNext: document.getElementById('btn-fc-next'),
  btnFcBack: document.getElementById('btn-fc-back'),
  historyList: document.getElementById('history-list'),
  dashboardContent: document.getElementById('dashboard-content'), // US 3.1
  btnExport: document.getElementById('btn-export'), // US 3.4
  btnImport: document.getElementById('btn-import'), // US 3.4
  fileImport: document.getElementById('file-import') // US 3.4
};

/////////////////////
// OUTILS GÉNÉRAUX //
/////////////////////
function showView(name) {
  Object.entries(els.views).forEach(([key, sec])=>{
    if (!sec) return;
    const active = (key === name);
    sec.hidden = !active;
    if (active) sec.classList.add('active'); else sec.classList.remove('active');
  });
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i=a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isMultiSelect(q) {
  if (Array.isArray(q.answers)) return q.answers.length > 1;
  if (Array.isArray(q.answer))  return q.answer.length > 1;
  return false;
}

function getExpectedIds(q) {
  if (Array.isArray(q.answers)) return q.answers.slice();
  if (Array.isArray(q.answer))  return q.answer.slice();
  return [q.answer];
}

function labelForMode(mode, title) {
  const map = {
    practice: `Entraînement (${title})`,
    mcq_only: `QCM (${title})`,
    exam: `Examen (${title})`,
    error_review: `Révision d'erreurs (${title})`,
    flashcard: `Flashcards (${title})`
  };
  return map[mode] || `Quiz (${title})`;
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

/////////////////////////////
// CHARGEMENT DES DONNÉES  //
/////////////////////////////
async function loadMainConfig() {
  const res = await fetch('./data/theme-main.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('theme-main.json introuvable');
  const cfg = await res.json();

  const defaults = state.config.app;
  const app = cfg.app || {};
  state.config.app = {
    title: app.title || defaults.title,
    defaultLocale: app.defaultLocale || defaults.defaultLocale,
    modes: {
      enabled: Array.from(new Set([...(app.modes?.enabled || defaults.modes.enabled), 'flashcard'])),
      default: app.modes?.default || defaults.modes.default
    },
    examDefaults: app.examDefaults || defaults.examDefaults,
    errorReview: app.errorReview || defaults.errorReview
  };

  state.themes = Array.isArray(cfg.themes) ? cfg.themes.slice() : [];
}

async function loadThemeQuestions(theme) {
  try {
    // Construire l'URL correctement
    let url;
    
    if (theme.isCustom) {
      // Thème personnalisé depuis localStorage
      const customTheme = getCustomTheme(theme.id);
      if (!customTheme) {
        throw new Error('Thème personnalisé introuvable');
      }
      // ✨ NOUVEAU : Fusionner les settings du thème personnalisé
      if (customTheme.settings) {
        theme.settings = { ...theme.settings, ...customTheme.settings };
      }
      return customTheme.questions || [];
    } else if (theme.path) {
      // Si le thème a un attribut "path"
      url = theme.path;
    } else if (theme.file) {
      // Si le thème a un attribut "file"
      url = `./data/${theme.file}`;
    } else {
      throw new Error('Chemin du thème introuvable (pas de "path" ni "file")');
    }
    
    console.log('🔍 Chargement du thème depuis:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Détecter l'erreur offline retournée par le Service Worker
    if (data.error === 'offline_unavailable') {
      alert('📡 Ce thème n\'est pas disponible hors ligne.\n\n💡 Astuce : Connectez-vous à internet et ouvrez ce thème une première fois pour le rendre disponible offline.');
      showThemes();
      return [];
    }
    
    // ✨ NOUVEAU : Fusionner les settings du JSON dans l'objet theme
    if (data.settings) {
      theme.settings = { ...theme.settings, ...data.settings };
    }
    
    // Retourner les questions
    let questions = Array.isArray(data) ? data : (data.questions || []);
    
    // Mélanger si demandé dans les settings
    if (data?.settings?.shuffleQuestions || theme?.settings?.shuffleQuestions) {
      questions = shuffle(questions);
    }
    
    return questions;
    
  } catch (error) {
    console.error('❌ Erreur chargement thème:', error);
    
    // Message différent selon le contexte
    if (!navigator.onLine) {
      alert('❌ Impossible de charger ce thème hors ligne.\n\nCe thème n\'a pas encore été mis en cache.');
    } else {
      alert('❌ Erreur de chargement du thème.\n\n' + error.message);
    }
    
    showThemes();
    return [];
  }
}


async function fetchThemeCount(theme){
  if (!theme?.file) return 0;
  const url = `./data/${theme.file}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return 0;
  const data = await res.json();
  if (Array.isArray(data)) return data.length;
  if (Array.isArray(data?.questions)) return data.questions.length;
  return 0;
}

async function preloadThemeCounts() {
  const promises = state.themes.map(async (t) => {
    const count = await fetchThemeCount(t);
    state.themeCounts[t.id] = count;
  });
  await Promise.all(promises);
}

/////////////////////////////
// RENDU DES THÈMES        //
/////////////////////////////
function renderThemes() {
  if (!els.themesList) return;
  
  // Fusionner thèmes officiels et personnalisés
  const allThemes = getAllThemes();
  
  const sorted = allThemes.slice().sort((a,b)=> {
    const cA = state.themeCounts[a.id] || (a.questions?.length || 0);
    const cB = state.themeCounts[b.id] || (b.questions?.length || 0);
    return cB - cA;
  });

  els.themesList.innerHTML = '';
  
  sorted.forEach((theme, index) => {
    const errorTotal = getThemeErrorTotal(theme.id);
    const qCount = state.themeCounts[theme.id] || (theme.questions?.length || '?');

    const card = document.createElement('article');
    card.className = 'card';
    card.style.animationDelay = `${index * 50}ms`;

    const tagsHtml = (theme.tags || []).map(tag => 
      `<span class="badge">${tag}</span>`
    ).join('');

    const errorBadge = errorTotal > 0 
      ? `<span class="badge danger" title="Questions à revoir">❌ ${errorTotal}</span>` 
      : '';
    
    // Badge pour thèmes personnalisés
    const customBadge = theme.isCustom 
      ? `<span class="badge info" title="Thème personnalisé">👤 Personnalisé</span>` 
      : '';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <h3 style="margin: 0; flex: 1;">${theme.title}</h3>
        <span class="badge success">📚 ${qCount}</span>
      </div>
      <div class="meta">
        ${customBadge}
        ${tagsHtml}
        ${errorBadge}
      </div>
      <div class="actions" style="margin-top: 16px;">
        <button class="btn primary" data-mode="practice" data-id="${theme.id}">
          🎯 Entraînement
        </button>
        <button class="btn" data-mode="mcq_only" data-id="${theme.id}">
          ✅ QCM
        </button>
        <button class="btn" data-mode="exam" data-id="${theme.id}">
          🏆 Examen
        </button>
        <button class="btn ghost" data-mode="error_review" data-id="${theme.id}">
          🔄 Réviser erreurs
        </button>
        <button class="btn ghost" data-mode="flashcard" data-id="${theme.id}">
          🎴 Flashcards
        </button>
      </div>
    `;

    card.querySelectorAll('button[data-mode]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.getAttribute('data-mode');
        const themeId = e.currentTarget.getAttribute('data-id');
        if (mode === 'flashcard') {
          startFlashcards(themeId);
        } else {
          startTheme(themeId, mode);
        }
      });
    });

    els.themesList.appendChild(card);
  });
}

//////////////////////////
// NAVIGATION / ACTIONS //
//////////////////////////
function showThemes() {
  showView('themes');
  renderThemes();
}

function bindEvents() {
  els.btnHome?.addEventListener('click', () => showThemes());
  els.btnHistory?.addEventListener('click', () => {
    renderHistory();
    showView('history');
  });
  els.btnDashboard?.addEventListener('click', showDashboard); // US 3.1
  
  // Boutons pour les thèmes personnalisés
  els.btnAddTheme?.addEventListener('click', showThemeImportView);
  els.btnManageThemes?.addEventListener('click', showCustomThemesView);

  els.btnTheme?.addEventListener('click', () => {
    const current = getSavedTheme();
    let next;
    
    if (current === null || current === 'auto') {
      next = 'light';
    } else if (current === 'light') {
      next = 'dark';
    } else {
      next = null;
      localStorage.removeItem(THEME_STORAGE_KEY);
      applyTheme(detectPreferredTheme());
      return;
    }
    
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
  });

  els.btnSubmit?.addEventListener('click', checkAnswer);
  els.btnNext?.addEventListener('click', nextQuestion);
  els.btnQuit?.addEventListener('click', quitQuiz);

  els.btnRetry?.addEventListener('click', () => {
    if (state.currentTheme) {
      if (state.mode === 'flashcard') {
        startFlashcards(state.currentTheme.id);
      } else {
        startTheme(state.currentTheme.id, state.mode);
      }
    }
  });
  els.btnBackThemes?.addEventListener('click', showThemes);

  els.btnShowAnswer?.addEventListener('click', flashShowAnswer);
  els.btnKnow?.addEventListener('click', flashKnow);
  els.btnDontKnow?.addEventListener('click', flashDontKnow);
  els.btnFcPrev?.addEventListener('click', flashPrev);
  els.btnFcNext?.addEventListener('click', flashNext);
  els.btnFcBack?.addEventListener('click', showThemes);

  // US 3.4 - Export/Import
  els.btnExport?.addEventListener('click', () => {
    try {
      const data = exportData();
      alert(`✅ Données exportées avec succès!\n\n📊 ${data.history.length} sessions\n❌ ${Object.keys(data.errors).length} thèmes avec erreurs`);
    } catch (e) {
      alert('❌ Erreur lors de l\'export : ' + e.message);
    }
  });

  els.btnImport?.addEventListener('click', () => {
    els.fileImport?.click();
  });

  els.fileImport?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const result = await importData(file);
      alert(`✅ Import réussi!\n\n📥 Importé:\n- ${result.imported.history} sessions\n- ${result.imported.errors} erreurs\n\n📊 Total:\n- ${result.total.history} sessions\n- ${result.total.errors} thèmes`);
      
      // Rafraîchir les vues
      renderHistory();
      renderDashboard();
      renderThemes();
    } catch (error) {
      alert('❌ Erreur lors de l\'import : ' + error.message);
    }
    
    // Reset input
    e.target.value = '';
  });

  // Support du clavier
  document.addEventListener('keydown', (e) => {
    if (!els.views.quiz?.hidden) {
      if (e.key === 'Enter' && !state.locked) {
        checkAnswer();
      } else if (e.key === 'Enter' && state.locked) {
        nextQuestion();
      }
    }
    
    if (!els.views.flashcards?.hidden) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!state.fcRevealed) {
          flashShowAnswer();
        }
      } else if (e.key === 'ArrowRight') {
        flashNext();
      } else if (e.key === 'ArrowLeft') {
        flashPrev();
      }
    }
  });
}

async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    if (reg.waiting) {
      console.log('Nouvelle version disponible');
    }
  } catch (e) {
    console.warn('SW registration failed', e);
  }
}

/////////////////////
// DÉMARRAGE APP   //
/////////////////////
document.addEventListener('DOMContentLoaded', async () => {
  try {
    initTheme();
    await loadMainConfig();
    await preloadThemeCounts();
    
    // Initialiser l'interface d'import de thèmes
    initThemeImport();
    
    // Charger les compteurs pour les thèmes personnalisés
    const customThemes = loadCustomThemes();
    Object.values(customThemes).forEach(theme => {
      state.themeCounts[theme.id] = theme.questions?.length || 0;
    });
  } catch (e) {
    console.error('Erreur de chargement:', e);
    alert('Erreur lors du chargement de l\'application. Vérifiez la console.');
  }
  
  bindEvents();
  renderThemes();
  renderHistory();
  showView('themes');
  registerSW();
});

//indicateur réseau

(function() {
  const status = document.getElementById('network-status');
  const text = status?.querySelector('.status-text');
  
  function update() {
    if (navigator.onLine) {
      status?.classList.remove('offline');
      if (text) text.textContent = 'En ligne';
    } else {
      status?.classList.add('offline');
      if (text) text.textContent = 'Hors ligne';
    }
  }
  
  update();
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
})();

