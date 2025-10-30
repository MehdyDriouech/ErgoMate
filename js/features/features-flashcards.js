// js/features/features-flashcards.js
// Mode flashcards : révision interactive avec cartes recto-verso

//////////////////////////
// FLASHCARDS : RENDU   //
//////////////////////////
function renderFlashcardHeader() {
  const t = state.currentTheme;
  if (els.flashcardsThemeTitle) els.flashcardsThemeTitle.textContent = t?.title || t?.id || '';
  if (els.flashcardsTitle) els.flashcardsTitle.textContent = labelForMode('flashcard', t?.title || '');
  updateFlashProgress();
}

function updateFlashProgress() {
  if (!els.flashcardsProgress) return;
  els.flashcardsProgress.textContent = `Carte ${state.fcIndex + 1} / ${state.questions.length}`;
}

function expectedLabelFor(q) {
  const exp = getExpectedIds(q);
  if (q.type === 'mcq') {
    const toLabel = (id) => {
      const found = (q.choices || []).find(c => String(c.id) === String(id));
      return found ? found.label : id;
    };
    return (Array.isArray(exp) ? exp : [exp]).map(toLabel).join(', ');
  }
  if (q.type === 'true_false') return exp[0] ? 'Vrai' : 'Faux';
  return Array.isArray(exp) ? exp.join(' / ') : String(exp);
}

function renderFlashcard() {
  const q = state.questions[state.fcIndex];
  if (!q || !els.flashcard) return;

  updateFlashProgress();

  const revealed = state.fcRevealed;
  const rationale = q.rationale ? `<div class="muted" style="margin-top: 12px;">${q.rationale}</div>` : '';
  const exp = expectedLabelFor(q);

  if (state.fcAnimating) {
    els.flashcard.classList.add('flipping');
    setTimeout(() => {
      els.flashcard.classList.remove('flipping');
      state.fcAnimating = false;
    }, 600);
  }

  els.flashcard.innerHTML = `
    <div class="fc-face">
      <div class="fc-title">${q.prompt}</div>
      ${!revealed ? `
        <div class="muted" style="margin-top: 16px;">
          💡 Cliquez sur "Afficher la réponse" pour révéler
        </div>
      ` : `
        <div class="fc-answer">
          ${exp}
        </div>
        ${rationale}
      `}
    </div>
  `;

  if (els.btnShowAnswer) els.btnShowAnswer.hidden = revealed;
  if (els.btnKnow) els.btnKnow.hidden = !revealed;
  if (els.btnDontKnow) els.btnDontKnow.hidden = !revealed;
}

async function startFlashcards(themeId) {
  const theme = state.themes.find(t => t.id === themeId);
  if (!theme) return;

  state.currentTheme = theme;
  state.mode = 'flashcard';
  state.fcIndex = 0;
  state.fcRevealed = false;
  state.fcAnimating = false;
  state.score = 0;
  state.sessionStartTime = Date.now(); // US 3.3
  state.questionTimes = []; // US 3.3

  let questions = await loadThemeQuestions(theme);  // ⚠️ Changer "const" en "let"
  if (!questions.length) {
    alert('Aucune question disponible.');
    return;
  }

  questions = shuffle(questions);  // ✨ AJOUTER CETTE LIGNE ICI

  state.questions = questions;
  renderFlashcardHeader();
  showView('flashcards');
  renderFlashcard();

}

function flashShowAnswer() {
  if (state.fcAnimating) return;
  state.fcRevealed = true;
  state.fcAnimating = true;
  renderFlashcard();
}

function flashKnow() {
  const q = state.questions[state.fcIndex];
  state.score += 1;
  if (getErrorCount(state.currentTheme.id, q.id) > 0) {
    decError(state.currentTheme.id, q.id, state.config.app.errorReview.decayOnCorrect || 1);
  }
  flashNext();
}

function flashDontKnow() {
  const q = state.questions[state.fcIndex];
  incError(state.currentTheme.id, q.id);
  flashNext();
}

function flashPrev() {
  if (state.fcIndex <= 0) return;
  state.fcIndex -= 1;
  state.fcRevealed = false;
  state.fcAnimating = true;
  renderFlashcard();
}

function flashNext() {
  if (state.fcIndex >= state.questions.length - 1) {
    // Pour les flashcards, on enregistre aussi le temps
    const totalTime = Date.now() - state.sessionStartTime;
    const entry = {
      at: Date.now(),
      mode: 'flashcard',
      themeId: state.currentTheme?.id,
      themeTitle: state.currentTheme?.title,
      score: state.score,
      total: state.questions.length,
      percent: Math.round((state.score / state.questions.length) * 100),
      totalTime,
      avgTime: Math.round(totalTime / state.questions.length)
    };
    saveHistoryEntry(entry);
    updateStats(state.currentTheme?.id, entry);
    return showResults();
  }
  state.fcIndex += 1;
  state.fcRevealed = false;
  state.fcAnimating = true;
  renderFlashcard();
}
