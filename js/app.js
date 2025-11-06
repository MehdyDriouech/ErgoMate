// js/app.js — Ergo Mate Enhanced v2 (+ Dashboard & Analytics)
// ✨ NOUVELLES FONCTIONNALITÉS EPIC 3 :
// - Tableau de bord avec graphiques de progression
// - Historique détaillé avec statistiques
// - Tracking du temps moyen par question
// - Export/Import des données
// - Mode recherche

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
      examDefaults: { questionCount: 20, timeLimitSec: 1500, passingPercent: 80 },
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

/**
 * Normalise un thème personnalisé pour s'assurer qu'il a tous les champs requis
 * Cette fonction est accessible globalement pour les fichiers features
 */
function normalizeCustomTheme(theme) {
  return {
    ...theme,
    isCustom: true, // Force toujours à true
    questions: theme.questions || [],
    tags: theme.tags || [],
    meta: theme.meta || {}
  };
}

// Rendre accessible globalement
window.normalizeCustomTheme = normalizeCustomTheme;

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
    dashboard: document.getElementById('view-dashboard'),
    importTheme: document.getElementById('view-import-theme'),
    customThemes: document.getElementById('view-custom-themes'),
    pdfImport: document.getElementById('view-pdf-import'),
    revision: document.getElementById('view-revision'),
    about: document.getElementById('view-about')
  },
  btnHome: document.getElementById('btn-home'),
  btnHistory: document.getElementById('btn-history'),
  btnDashboard: document.getElementById('btn-dashboard'),
  btnTheme: document.getElementById('btn-theme'),
  btnAddTheme: document.getElementById('btn-add-theme'),
  btnManageThemes: document.getElementById('btn-manage-themes'),
  btnAbout: document.getElementById('btn-about'),
  btnAboutBack: document.getElementById('btn-about-back'),
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
  dashboardContent: document.getElementById('dashboard-content'),
  btnExport: document.getElementById('btn-export'),
  btnImport: document.getElementById('btn-import'),
  fileImport: document.getElementById('file-import'),
  searchInput: document.getElementById('search-themes'),
  btnClearSearch: document.getElementById('btn-clear-search'),
  searchResultsCount: document.getElementById('search-results-count'),
  examTimer: document.getElementById('exam-timer'),
  pdfImport: document.getElementById('view-pdf-import'),
  revisionTitle: document.getElementById('revision-title'),
  revisionThemeTitle: document.getElementById('revision-theme-title'),
  revisionProgress: document.getElementById('revision-progress'),
  revisionCard: document.getElementById('revision-card'),
  btnRevisionPrev: document.getElementById('btn-revision-prev'),
  btnRevisionNext: document.getElementById('btn-revision-next'),
  btnRevisionUnderstood: document.getElementById('btn-revision-understood'),
  btnRevisionToReview: document.getElementById('btn-revision-to-review'),
  btnRevisionBack: document.getElementById('btn-revision-back')
};

// Fonction pour mettre à jour els après le chargement des composants Web Components
function updateElementReferences() {
  // Quiz
  els.quizTitle = els.views.quiz?.querySelector('#quiz-title');
  els.quizThemeTitle = els.views.quiz?.querySelector('#quiz-theme-title');
  els.quizProgress = els.views.quiz?.querySelector('#quiz-progress');
  els.questionContainer = els.views.quiz?.querySelector('#question-container');
  els.btnSubmit = els.views.quiz?.querySelector('#btn-submit');
  els.btnNext = els.views.quiz?.querySelector('#btn-next');
  els.btnQuit = els.views.quiz?.querySelector('#btn-quit');
  els.examTimer = els.views.quiz?.querySelector('#exam-timer');
  
  // Results
  els.resultsSummary = els.views.results?.querySelector('#results-summary');
  els.resultsDetails = els.views.results?.querySelector('#results-details');
  els.btnRetry = els.views.results?.querySelector('#btn-retry');
  els.btnBackThemes = els.views.results?.querySelector('#btn-back-themes');
  
  // Flashcards
  els.flashcardsTitle = els.views.flashcards?.querySelector('#flashcards-title');
  els.flashcardsThemeTitle = els.views.flashcards?.querySelector('#flashcards-theme-title');
  els.flashcardsProgress = els.views.flashcards?.querySelector('#flashcards-progress');
  els.flashcard = els.views.flashcards?.querySelector('#flashcard');
  els.btnShowAnswer = els.views.flashcards?.querySelector('#btn-show-answer');
  els.btnKnow = els.views.flashcards?.querySelector('#btn-know');
  els.btnDontKnow = els.views.flashcards?.querySelector('#btn-dont-know');
  els.btnFcPrev = els.views.flashcards?.querySelector('#btn-fc-prev');
  els.btnFcNext = els.views.flashcards?.querySelector('#btn-fc-next');
  els.btnFcBack = els.views.flashcards?.querySelector('#btn-fc-back');
  
  // Revision
  els.revisionTitle = els.views.revision?.querySelector('#revision-title');
  els.revisionThemeTitle = els.views.revision?.querySelector('#revision-theme-title');
  els.revisionProgress = els.views.revision?.querySelector('#revision-progress');
  els.revisionCard = els.views.revision?.querySelector('#revision-card');
  els.btnRevisionPrev = els.views.revision?.querySelector('#btn-revision-prev');
  els.btnRevisionNext = els.views.revision?.querySelector('#btn-revision-next');
  els.btnRevisionUnderstood = els.views.revision?.querySelector('#btn-revision-understood');
  els.btnRevisionToReview = els.views.revision?.querySelector('#btn-revision-to-review');
  els.btnRevisionBack = els.views.revision?.querySelector('#btn-revision-back');
  
  // Dashboard
  els.dashboardContent = els.views.dashboard?.querySelector('#dashboard-content');
  els.btnExport = els.views.dashboard?.querySelector('#btn-export');
  els.btnImport = els.views.dashboard?.querySelector('#btn-import');
  els.fileImport = els.views.dashboard?.querySelector('#file-import');
  
  // History
  els.historyList = els.views.history?.querySelector('#history-list');
  
  // Themes
  els.themesList = els.views.themes?.querySelector('#themes-list');
  els.searchInput = els.views.themes?.querySelector('#search-themes');
  els.btnClearSearch = els.views.themes?.querySelector('#btn-clear-search');
  els.searchResultsCount = els.views.themes?.querySelector('#search-results-count');
}

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
    //mcq_only: `QCM (${title})`,
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
// RECHERCHE DE THÈMES     //
/////////////////////////////

/**
 * Normalise une chaîne pour la recherche (sans accents, minuscules)
 */
function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Vérifie si un thème correspond à la requête de recherche
 */
function themeMatchesSearch(theme, query) {
  if (!query || query.trim() === '') return true;
  
  const normalizedQuery = normalizeString(query.trim());
  const normalizedTitle = normalizeString(theme.title || '');
  const normalizedTags = (theme.tags || []).map(tag => normalizeString(tag));
  
  // Recherche dans le titre
  if (normalizedTitle.includes(normalizedQuery)) {
    return true;
  }
  
  // Recherche dans les tags
  return normalizedTags.some(tag => tag.includes(normalizedQuery));
}

/**
 * Surligne les termes de recherche dans le texte
 */
function highlightSearchTerm(text, query) {
  if (!query || query.trim() === '') return text;
  
  const normalizedQuery = normalizeString(query.trim());
  const normalizedText = normalizeString(text);
  const index = normalizedText.indexOf(normalizedQuery);
  
  if (index === -1) return text;
  
  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);
  
  return `${before}<span class="search-highlight">${match}</span>${after}`;
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

  // ✅ CORRECTION : Charger les thèmes officiels
  const officialThemes = Array.isArray(cfg.themes) ? cfg.themes.slice() : [];
  
  // ✅ CORRECTION : Charger les thèmes personnalisés depuis localStorage
  const customThemes = loadCustomThemes();
  const customThemesArray = Object.values(customThemes).map(theme => normalizeCustomTheme(theme));
  
  // ✅ CORRECTION : Récupérer les IDs des thèmes personnalisés
  const customThemeIds = new Set(customThemesArray.map(t => t.id));
  
  // ✅ CORRECTION : Filtrer les thèmes officiels pour éviter les doublons
  const filteredOfficialThemes = officialThemes.filter(t => !customThemeIds.has(t.id));
  
  // ✅ CORRECTION : Combiner les deux (personnalisés en premier pour priorité)
  state.themes = [...customThemesArray, ...filteredOfficialThemes];
  
  console.log('✅ Thèmes chargés:', {
    officiels: filteredOfficialThemes.length,
    personnalisés: customThemesArray.length,
    total: state.themes.length,
    customIds: Array.from(customThemeIds)
  });
}

/**
 * Recharge state.themes pour inclure les thèmes personnalisés mis à jour
 */
function refreshThemesState() {
  // Récupérer les thèmes officiels (ceux qui ne sont pas custom)
  const officialThemes = state.themes.filter(t => !t.isCustom);
  
  // Charger les thèmes personnalisés depuis localStorage
  const customThemes = loadCustomThemes();
  const customThemesArray = Object.values(customThemes).map(theme => normalizeCustomTheme(theme));
  
  // ✅ CORRECTION : Récupérer les IDs des thèmes personnalisés
  const customThemeIds = new Set(customThemesArray.map(t => t.id));
  
  // ✅ CORRECTION : Filtrer les thèmes officiels pour éviter les doublons
  const filteredOfficialThemes = officialThemes.filter(t => !customThemeIds.has(t.id));
  
  // ✅ CORRECTION : Recombiner (personnalisés en premier)
  state.themes = [...customThemesArray, ...filteredOfficialThemes];
  
  // Mettre à jour les compteurs
  customThemesArray.forEach(theme => {
    state.themeCounts[theme.id] = theme.questions?.length || 0;
  });
  
  console.log('🔄 state.themes actualisé:', {
    officiels: filteredOfficialThemes.length,
    personnalisés: customThemesArray.length,
    total: state.themes.length,
    customIds: Array.from(customThemeIds)
  });
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
function renderThemes(searchQuery = '') {
  // Fusionner thèmes officiels et personnalisés
  const allThemes = getAllThemes();
  
  const sorted = allThemes.slice().sort((a,b)=> {
    const cA = state.themeCounts[a.id] || (a.questions?.length || 0);
    const cB = state.themeCounts[b.id] || (b.questions?.length || 0);
    return cB - cA;
  });

  // Filtrer les thèmes selon la recherche
  const filteredThemes = sorted.filter(theme => themeMatchesSearch(theme, searchQuery));
  
  els.themesList.innerHTML = '';
  
  // Afficher le compteur de résultats
  if (searchQuery && searchQuery.trim() !== '') {
    els.searchResultsCount.hidden = false;
    els.searchResultsCount.textContent = `${filteredThemes.length} thème(s) trouvé(s)`;
  } else {
    els.searchResultsCount.hidden = true;
  }
  
  // Afficher un message si aucun résultat
  if (filteredThemes.length === 0) {
    els.themesList.innerHTML = `
      <div class="card" style="text-align: center; padding: 48px 24px;">
        <div style="font-size: 3rem; margin-bottom: 16px;">🔍</div>
        <h3 style="margin: 0 0 8px 0;">Aucun thème trouvé</h3>
        <p class="muted" style="margin: 0;">
          Essayez avec d'autres mots-clés
        </p>
      </div>
    `;
    return;
  }
  
  filteredThemes.forEach((theme, index) => {
    const errorTotal = getThemeErrorTotal(theme.id);
    const qCount = state.themeCounts[theme.id] || (theme.questions?.length || '?');

    const card = document.createElement('article');
    card.className = 'card search-match';
    card.style.animationDelay = `${index * 50}ms`;

    // Surligner les termes de recherche dans le titre et les tags
    const highlightedTitle = highlightSearchTerm(theme.title, searchQuery);
    const tagsHtml = (theme.tags || []).map(tag => {
      const highlightedTag = highlightSearchTerm(tag, searchQuery);
      return `<span class="badge">${highlightedTag}</span>`;
    }).join('');

    const errorBadge = errorTotal > 0 
      ? `<span class="badge danger" title="Questions à revoir">❌ ${errorTotal}</span>` 
      : '';
    
    // Badge pour thèmes personnalisés
    const customBadge = theme.isCustom 
      ? `<span class="badge info" title="Thème personnalisé">👤 Personnalisé</span>` 
      : '';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <h3 style="margin: 0; flex: 1;">${highlightedTitle}</h3>
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
        <button class="btn" data-mode="exam" data-id="${theme.id}">
          🏆 Examen
        </button>
        <button class="btn ghost" data-mode="error_review" data-id="${theme.id}">
          🔄 Réviser erreurs
        </button>
        <button class="btn ghost" data-mode="flashcard" data-id="${theme.id}">
          🎴 Flashcards
        </button>
        <button class="btn ghost" data-mode="revision" data-id="${theme.id}">
          📖 Fiches
        </button>
      </div>
    `;

    card.querySelectorAll('button[data-mode]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.getAttribute('data-mode');
        const themeId = e.currentTarget.getAttribute('data-id');
        if (mode === 'flashcard') {
          startFlashcards(themeId);
        } else if (mode === 'revision') {
          startRevision(themeId);
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

  els.btnAbout?.addEventListener('click', () => {
    showView('about');
  });

  els.btnAboutBack?.addEventListener('click', () => {
    showView('themes');
  });
  
  // Au cas où le bouton est dans le composant, on l'ajoute aussi après le chargement
  setTimeout(() => {
    const aboutBackBtn = els.views.about?.querySelector('#btn-about-back');
    if (aboutBackBtn && !aboutBackBtn.onclick) {
      aboutBackBtn.addEventListener('click', () => {
        showView('themes');
      });
    }
  }, 100);

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

  // Support du clavier pour quiz
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

  // Événements de recherche
  els.searchInput?.addEventListener('input', (e) => {
    const query = e.target.value;
    renderThemes(query);
    
    // Afficher/masquer le bouton clear
    if (els.btnClearSearch) {
      els.btnClearSearch.hidden = query.trim() === '';
    }
  });
  
  els.btnClearSearch?.addEventListener('click', () => {
    if (els.searchInput) {
      els.searchInput.value = '';
      els.searchInput.focus();
      els.btnClearSearch.hidden = true;
      renderThemes('');
    }
  });
  
  // Raccourci clavier : Ctrl+K ou Cmd+K pour focus sur la recherche
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      els.searchInput?.focus();
    }
  });

  bindRevisionEvents();
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
    
    // Attendre que les Web Components soient chargés
    await Promise.all([
      customElements.whenDefined('view-themes'),
      customElements.whenDefined('view-dashboard'),
      customElements.whenDefined('view-quiz'),
      customElements.whenDefined('view-results'),
      customElements.whenDefined('view-flashcards'),
      customElements.whenDefined('view-revision'),
      customElements.whenDefined('view-history'),
      customElements.whenDefined('view-import-theme'),
      customElements.whenDefined('view-custom-themes'),
      customElements.whenDefined('view-pdf-import'),
      customElements.whenDefined('view-about')
    ]);
    
    // Mettre à jour les références aux éléments DOM des composants
    updateElementReferences();
    
    await loadMainConfig();
    await preloadThemeCounts();
    
    // Initialiser l'interface d'import de thèmes
    initThemeImport();
    // intialiser pdf import
    initPdfImport();
    // ✅ AJOUTER CETTE LIGNE
    initCustomThemes();
    
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

