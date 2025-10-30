// js/modules/render.js
import { isMultiSelect } from './utils.js';
import { getThemeErrorTotal, loadHistory } from './storage.js';

/** Liste des thèmes + boutons de modes */
export function renderThemes(state, els, startThemeCb, startFlashcardsCb){
  els.themesList.innerHTML = '';
  state.themes.forEach(t=>{
    const errorTotal = getThemeErrorTotal(t.id);

    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role','listitem');

    card.innerHTML = `
      <h3>${t.title}</h3>
      <div class="meta">
        <span class="badge">${(t.tags||[]).join(' • ') || '—'}</span>
        ${errorTotal>0 ? `<span class="badge" title="Questions à revoir">Erreurs : ${errorTotal}</span>` : ``}
      </div>
      <div class="actions" style="margin-top:.5rem;display:flex;flex-wrap:wrap;gap:6px">
        <button class="btn" data-mode="practice"    data-id="${t.id}">Entraînement</button>
        <button class="btn" data-mode="mcq_only"    data-id="${t.id}">QCM</button>
        <button class="btn" data-mode="exam"        data-id="${t.id}">Examen</button>
        <button class="btn" data-mode="error_review"data-id="${t.id}">Révision erreurs</button>
        <button class="btn ghost" data-mode="flashcards" data-id="${t.id}">Flashcards</button>
      </div>
      <small class="muted">
        Examen : ${state.examCfg.questionCount} q / ${Math.floor(state.examCfg.timeLimitSec/60)} min
        • Seuil ${state.examCfg.passingPercent}%
      </small>
    `;

    card.querySelectorAll('button[data-mode]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const mode = e.currentTarget.getAttribute('data-mode');
        if(mode === 'flashcards'){ startFlashcardsCb?.(t.id); }
        else { startThemeCb(t.id, mode); }
      });
    });

    els.themesList.appendChild(card);
  });
}

/** Rendu de la question courante (mcq mono/multi, true_false, fill_in) */
export function renderQuestion(state, els){
  const q = state.questions[state.qIndex];
  els.quizProgress.textContent = `Question ${state.qIndex+1} / ${state.questions.length}`;

  const container = els.questionContainer;
  state.locked = false;
  els.btnSubmit.disabled = false;
  els.btnNext.disabled = true;

  if(!q){ return; }

  if(q.type==='mcq'){
    const multi = isMultiSelect(q);
    const choicesHtml = (q.choices||[]).map(c=>`
      <label class="choice">
        <input type="${multi?'checkbox':'radio'}" name="answer" value="${c.id}" ${multi?'':'required'} />
        <span>${c.label}</span>
      </label>
    `).join('');
    container.innerHTML = `
      <div><strong>${q.prompt}</strong></div>
      ${multi ? `<div class="muted">Plusieurs réponses possibles</div>` : ``}
      <form id="form-q">${choicesHtml}</form>
      ${state.mode==='exam' ? '' : `<div id="feedback" class="feedback muted"></div>`}
    `;
  }
  else if(q.type==='true_false'){
    container.innerHTML = `
      <div><strong>${q.prompt}</strong></div>
      <form id="form-q">
        <label class="choice"><input type="radio" name="answer" value="true" required />Vrai</label>
        <label class="choice"><input type="radio" name="answer" value="false" required />Faux</label>
      </form>
      ${state.mode==='exam' ? '' : `<div id="feedback" class="feedback muted"></div>`}
    `;
  }
  else if(q.type==='fill_in'){
    container.innerHTML = `
      <div><strong>${q.prompt}</strong></div>
      <form id="form-q">
        <input type="text" name="answer" placeholder="Votre réponse" aria-label="Réponse" required />
      </form>
      ${state.mode==='exam' ? '' : `<div id="feedback" class="feedback muted"></div>`}
    `;
  }
  else {
    container.innerHTML = `<p>Type de question non supporté.</p>`;
  }
}

/** Rendu de l’historique */
export function renderHistory(state, els){
  const hist = loadHistory();
  els.historyList.innerHTML = '';
  if(hist.length===0){
    els.historyList.innerHTML = `<div class="card"><small class="muted">Aucun quiz pour l’instant.</small></div>`;
    return;
  }
  hist.forEach(h=>{
    const card = document.createElement('article'); 
    card.className='card';
    const d = new Date(h.at);
    const modeLabel = ({practice:'Entraînement', mcq_only:'QCM', exam:'Examen', error_review:'Révision', flashcards:'Flashcards'})[h.mode] || 'Entraînement';
    card.innerHTML = `
      <div><strong>${h.themeTitle}</strong> <span class="badge">${modeLabel}</span></div>
      <div class="meta">Le ${d.toLocaleDateString()} à ${d.toLocaleTimeString()}</div>
      <div>Score: ${h.score??'-'}/${h.total??'-'} ${typeof h.percent==='number' ? `(${h.percent}%)` : ''} ${h.exam? `• ${h.exam.passed?'Réussi ✅':'Échoué ❌'}`:''}</div>
    `;
    els.historyList.appendChild(card);
  });
}

/** Rendu d’une flashcard (face question / face réponse) */
export function renderFlashcard(state, els){
  const i = state.fIndex;
  const total = state.flashcards.length;
  els.flashcardsProgress.textContent = total ? `Carte ${i+1} / ${total}` : '—';
  const card = state.flashcards[i];
  const el = els.flashcard;
  if(!card){ el.innerHTML = `<small class="muted">Aucune carte.</small>`; return; }

  if(!state.fRevealed){
    // face question
    el.innerHTML = `
      <div class="fc-face">
        <div class="fc-title"><strong>${card.prompt}</strong></div>
        <div class="muted">Cliquez sur "Afficher la réponse"</div>
      </div>
    `;
  } else {
    // face réponse
    const rationale = card.rationale ? `<div class="muted" style="margin-top:8px">${card.rationale}</div>` : '';
    el.innerHTML = `
      <div class="fc-face">
        <div class="fc-title"><strong>${card.prompt}</strong></div>
        <div class="fc-answer">Réponse : <strong>${card.answerLabel}</strong></div>
        ${rationale}
      </div>
    `;
  }

  // boutons
  els.btnShowAnswer.hidden = !!state.fRevealed;
  els.btnKnow.hidden = !state.fRevealed;
  els.btnDontKnow.hidden = !state.fRevealed;
}