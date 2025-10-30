// js/features/features-quiz.js
// Gestion complète du mode quiz : démarrage, rendu, vérification et résultats

/////////////////////////////
// UTILITAIRES             //
/////////////////////////////
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/////////////////////////////
// TIMER MODE EXAMEN       //
/////////////////////////////
let examTimerInterval = null;

function startExamTimer(durationSeconds) {
  // Arrêter le timer précédent s'il existe
  if (examTimerInterval) {
    clearInterval(examTimerInterval);
  }
  
  const endTime = Date.now() + (durationSeconds * 1000);
  
  function updateTimer() {
    const remaining = Math.max(0, endTime - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (els.examTimer) {
      els.examTimer.hidden = false;
      els.examTimer.innerHTML = `
        <span class="timer-icon">⏱️</span>
        <span>${minutes}:${seconds.toString().padStart(2, '0')}</span>
      `;
      
      // Changer la couleur selon le temps restant
      els.examTimer.classList.remove('warning', 'danger');
      if (totalSeconds <= 60) {
        els.examTimer.classList.add('danger');
      } else if (totalSeconds <= 300) { // 5 minutes
        els.examTimer.classList.add('warning');
      }
    }
    
    // Terminer l'examen si le temps est écoulé
    if (remaining <= 0) {
      clearInterval(examTimerInterval);
      examTimerInterval = null;
      alert('⏰ Temps écoulé ! L\'examen est terminé.');
      showResults();
    }
  }
  
  updateTimer(); // Mise à jour immédiate
  examTimerInterval = setInterval(updateTimer, 1000);
}

function stopExamTimer() {
  if (examTimerInterval) {
    clearInterval(examTimerInterval);
    examTimerInterval = null;
  }
  if (els.examTimer) {
    els.examTimer.hidden = true;
  }
}

/////////////////////////////
// DÉMARRAGE QUIZ/SESSION  //
/////////////////////////////
async function startTheme(themeId, mode) {
  const theme = state.themes.find(t => t.id === themeId);
  if (!theme) return;

  state.currentTheme = theme;
  state.mode = mode;
  state.qIndex = 0;
  state.score = 0;
  state.locked = false;
  state.startedAt = Date.now();
  state.sessionStartTime = Date.now(); // US 3.3
  state.questionTimes = []; // US 3.3

  let questions = await loadThemeQuestions(theme);

  if (mode === 'error_review') {
    const errors = loadErrors();
    const themeErrors = errors?.[themeId] || {};
    const errorQids = Object.keys(themeErrors).filter(qid => themeErrors[qid] > 0);
    questions = questions.filter(q => errorQids.includes(q.id));
    const max = state.config.app.errorReview.maxPerSession || 15;
    questions = questions.slice(0, max);
  } else if (mode === 'exam') {
    // Mélanger d'abord pour avoir un échantillon aléatoire
    questions = shuffleArray(questions);
    const cfg = state.config.app.examDefaults;
    // Prendre 20 questions ou moins si pas assez disponibles
    questions = questions.slice(0, Math.min(cfg.questionCount, questions.length));
  }

  // ✨ Mélanger les questions si demandé (sauf en mode examen où c'est déjà fait)
  if (theme.settings?.shuffleQuestions && mode !== 'exam') {
    questions = shuffleArray(questions);
  }

  if (!questions.length) {
    alert('Aucune question disponible pour ce mode.');
    return;
  }

  state.questions = questions;
  
  if (els.quizTitle) els.quizTitle.textContent = labelForMode(mode, theme.title);
  if (els.quizThemeTitle) els.quizThemeTitle.textContent = theme.title;
  
  // Démarrer le timer pour le mode examen
  if (mode === 'exam') {
    const cfg = state.config.app.examDefaults;
    startExamTimer(cfg.timeLimitSec);
  } else {
    stopExamTimer();
  }
  
  showView('quiz');
  renderQuestion();
}

/////////////////////////////
// RENDU QUESTION          //
/////////////////////////////
function renderQuestion() {
  const q = state.questions[state.qIndex];
  if (!q) return;

  // US 3.3 - Démarrer le chrono pour cette question
  state.questionStartTime = Date.now();

  if (els.quizProgress) {
    els.quizProgress.textContent = `Question ${state.qIndex + 1} / ${state.questions.length}`;
  }

  const container = els.questionContainer;
  if (!container) return;

  state.locked = false;
  if (els.btnSubmit) els.btnSubmit.disabled = false;
  if (els.btnNext) els.btnNext.disabled = true;

  if (q.type === 'mcq') {
    const multi = isMultiSelect(q);
    
    // ✨ Mélanger les choix si demandé
    let choices = q.choices || [];
    if (state.currentTheme?.settings?.shuffleChoices) {
      choices = shuffleArray(choices);
    }
    
    const choicesHtml = choices.map(c => `
      <label class="choice">
        <input type="${multi ? 'checkbox' : 'radio'}" name="answer" value="${c.id}" ${multi ? '' : 'required'} />
        <span>${c.label}</span>
      </label>
    `).join('');

    container.innerHTML = `
      <div style="margin-bottom: 16px;">
        <strong style="font-size: 1.1rem;">${q.prompt}</strong>
      </div>
      ${multi ? `<div class="muted" style="margin-bottom: 12px;">⚠️ Plusieurs réponses possibles</div>` : ''}
      <form id="form-q">${choicesHtml}</form>
      ${state.mode === 'exam' ? '' : `<div id="feedback" class="feedback"></div>`}
    `;
  } else if (q.type === 'true_false') {
    // ✨ Mélanger les choix vrai/faux si demandé
    const tfChoices = [
      { value: 'true', label: '✅ Vrai' },
      { value: 'false', label: '❌ Faux' }
    ];
    
    const shuffledTF = state.currentTheme?.settings?.shuffleChoices 
      ? shuffleArray(tfChoices) 
      : tfChoices;
    
    const tfHtml = shuffledTF.map(c => `
      <label class="choice">
        <input type="radio" name="answer" value="${c.value}" required />
        <span>${c.label}</span>
      </label>
    `).join('');
    
    container.innerHTML = `
      <div style="margin-bottom: 16px;">
        <strong style="font-size: 1.1rem;">${q.prompt}</strong>
      </div>
      <form id="form-q">${tfHtml}</form>
      ${state.mode === 'exam' ? '' : `<div id="feedback" class="feedback"></div>`}
    `;
  } else if (q.type === 'fill_in') {
    container.innerHTML = `
      <div style="margin-bottom: 16px;">
        <strong style="font-size: 1.1rem;">${q.prompt}</strong>
      </div>
      <form id="form-q">
        <input type="text" name="answer" placeholder="Votre réponse" aria-label="Réponse" required />
      </form>
      ${state.mode === 'exam' ? '' : `<div id="feedback" class="feedback"></div>`}
    `;
  } else {
    container.innerHTML = `<p>Type de question non supporté.</p>`;
  }
}

/////////////////////////////
// VÉRIFICATION RÉPONSE    //
/////////////////////////////
function checkAnswer() {
  if (state.locked) return;

  const q = state.questions[state.qIndex];
  if (!q) return;

  // US 3.3 - Enregistrer le temps pour cette question
  if (state.questionStartTime) {
    const timeSpent = Date.now() - state.questionStartTime;
    state.questionTimes.push(timeSpent);
  }

  const form = document.getElementById('form-q');
  if (!form) return;

  let userAnswer = null;
  let ok = false;

  if (q.type === 'mcq') {
    const checked = Array.from(form.querySelectorAll('input[name="answer"]:checked'));
    userAnswer = checked.map(inp => inp.value);
    const expected = getExpectedIds(q);
    const setUser = new Set(userAnswer.map(String));
    const setExp = new Set(expected.map(String));
    ok = (setUser.size === setExp.size) && Array.from(setUser).every(v => setExp.has(v));

    form.querySelectorAll('.choice').forEach(ch => {
      const inp = ch.querySelector('input');
      const val = inp.value;
      if (setExp.has(val)) ch.classList.add('correct');
      else if (setUser.has(val)) ch.classList.add('incorrect');
    });
  } else if (q.type === 'true_false') {
    const inp = form.querySelector('input[name="answer"]:checked');
    if (!inp) return;
    userAnswer = inp.value === 'true';
    ok = userAnswer === q.answer;

    form.querySelectorAll('.choice').forEach(ch => {
      const inp = ch.querySelector('input');
      const val = inp.value === 'true';
      if (val === q.answer) ch.classList.add('correct');
      else if (val === userAnswer) ch.classList.add('incorrect');
    });
  } else if (q.type === 'fill_in') {
    const inp = form.querySelector('input[name="answer"]');
    if (!inp) return;
    userAnswer = (inp.value || '').trim().toLowerCase();
    const expected = Array.isArray(q.answer) ? q.answer : [q.answer];
    ok = expected.some(exp => (exp || '').toString().toLowerCase().trim() === userAnswer);
  }

  if (state.mode !== 'exam') {
    const fb = document.getElementById('feedback');
    if (fb) {
      fb.textContent = ok ? '✅ Correct !' : '❌ Incorrect.';
      if (q.rationale) fb.textContent += ` ${q.rationale}`;
      fb.classList.remove('correct', 'incorrect');
      fb.classList.add(ok ? 'correct' : 'incorrect');
    }
  }

  if (ok) {
    state.score += 1;
    if (getErrorCount(state.currentTheme.id, q.id) > 0) {
      decError(state.currentTheme.id, q.id, state.config.app.errorReview.decayOnCorrect || 1);
    }
  } else {
    incError(state.currentTheme.id, q.id);
  }

  state.locked = true;
  if (els.btnNext) els.btnNext.disabled = false;
}

function nextQuestion() {
  if (!state.locked) return;
  state.qIndex += 1;
  if (state.qIndex >= state.questions.length) return showResults();
  renderQuestion();
}

function quitQuiz() {
  if (!confirm('Quitter la session en cours ?')) return;
  stopExamTimer(); // Arrêter le timer si mode examen
  showThemes();
}

//////////////////////////
// RÉSULTATS & HISTO    //
//////////////////////////
function showResults() {
  // Arrêter le timer du mode examen
  stopExamTimer();
  
  const total = state.questions.length || 0;
  const percent = total ? Math.round((state.score / total) * 100) : 0;
  const themeTitle = state.currentTheme?.title || '';

  // US 3.3 - Calculer le temps total et moyen
  const totalTime = state.questionTimes.reduce((sum, t) => sum + t, 0);
  const avgTime = total > 0 ? Math.round(totalTime / total) : 0;

  const entry = {
    at: Date.now(),
    mode: state.mode,
    themeId: state.currentTheme?.id,
    themeTitle,
    score: state.score,
    total,
    percent,
    totalTime, // US 3.3
    avgTime // US 3.3
  };

  saveHistoryEntry(entry);
  updateStats(state.currentTheme?.id, entry); // US 3.1

  if (els.resultsSummary) {
    const emoji = percent >= 70 ? '🎉' : percent >= 50 ? '👍' : '💪';
    els.resultsSummary.textContent = `${emoji} ${themeTitle} — ${state.score}/${total} (${percent}%)`;
  }
  
  if (els.resultsDetails) {
    const modeLabel = labelForMode(state.mode, '');
    els.resultsDetails.innerHTML = `
      <article class="card">
        <h3 style="margin-bottom: 16px;">📊 Détails</h3>
        <div style="display: grid; gap: 12px;">
          <div><strong>Mode :</strong> ${modeLabel}</div>
          <div><strong>Réussite :</strong> <span class="badge ${percent >= 70 ? 'success' : 'danger'}">${percent}%</span></div>
          <div><strong>Questions :</strong> ${total}</div>
          <div><strong>Correctes :</strong> ${state.score}</div>
          <div><strong>Incorrectes :</strong> ${total - state.score}</div>
          <div><strong>Temps total :</strong> ${formatTime(totalTime)}</div>
          <div><strong>Temps moyen/question :</strong> ${Math.round(avgTime / 1000)}s</div>
        </div>
      </article>
    `;
  }
  
  showView('results');
  renderHistory();
}

function renderHistory() {
  if (!els.historyList) return;
  const items = loadHistory();
  
  if (!items.length) {
    els.historyList.innerHTML = `
      <article class="card">
        <p class="muted">🔭 Aucun historique pour le moment.</p>
      </article>
    `;
    return;
  }
  
  els.historyList.innerHTML = items.map((it, index) => {
    const d = new Date(it.at);
    const date = d.toLocaleString('fr-FR');
    const modeEmoji = {
      practice: '🎯',
      exam: '🏆',
      error_review: '🔄',
      flashcard: '🎴'
    }[it.mode] || '📝';
    
    // US 3.3 - Afficher le temps moyen
    const avgTimeDisplay = it.avgTime ? `<span>⏱️ ${Math.round(it.avgTime / 1000)}s/q</span>` : '';
    
    return `
      <article class="card" style="animation-delay: ${index * 30}ms;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <strong style="flex: 1;">${modeEmoji} ${it.themeTitle || it.themeId || 'Thème'}</strong>
          <span class="badge ${it.percent >= 70 ? 'success' : 'danger'}">${it.percent}%</span>
        </div>
        <div class="meta">
          <span>${it.score}/${it.total}</span>
          ${avgTimeDisplay ? '<span>•</span>' + avgTimeDisplay : ''}
          <span>•</span>
          <span class="muted">${date}</span>
        </div>
      </article>
    `;
  }).join('');
}
