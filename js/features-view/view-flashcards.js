// js/features-view/view-flashcards.js
// Web Component pour la vue des flashcards

class ViewFlashcards extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  connectedCallback() {
    this.classList.add('view');
    this.setAttribute('role', 'region');
    this.setAttribute('aria-labelledby', 'flashcards-title');
  }

  render() {
    this.innerHTML = `
      <div class="quiz-header">
        <div>
          <h2 id="flashcards-title" style="margin: 0;">🎴 Flashcards</h2>
          <span id="flashcards-theme-title" class="badge" style="margin-top: 8px;"></span>
        </div>
        <div class="quiz-meta">
          <span id="flashcards-progress" class="muted"></span>
        </div>
      </div>

      <div class="flashcard-container">
        <article id="flashcard" class="card flashcard" aria-live="polite">
        </article>
      </div>

      <div class="actions" style="margin-top: 24px;">
        <button id="btn-show-answer" class="btn primary">
          👁️ Afficher la réponse
        </button>
        <button id="btn-know" class="btn" style="background: var(--accent); color: white;" hidden>
          ✅ Je savais
        </button>
        <button id="btn-dont-know" class="btn ghost" hidden>
          ❌ Je me suis trompé
        </button>
        <div style="flex: 1;"></div>
        <button id="btn-fc-prev" class="btn ghost">
          ← Précédent
        </button>
        <button id="btn-fc-next" class="btn">
          Suivant →
        </button>
      </div>

      <div style="margin-top: 16px; text-align: center;">
        <button id="btn-fc-back" class="btn ghost">
          ✕ Retour aux thèmes
        </button>
      </div>

      <div class="card" style="margin-top: 24px; background: rgba(14, 165, 233, 0.05);">
        <p class="muted" style="margin: 0; font-size: 0.875rem; text-align: center;">
          💡 <strong>Astuce :</strong> Utilisez les touches ← → pour naviguer et Espace/Entrée pour révéler
        </p>
      </div>
    `;
  }

  getTitle() {
    return this.querySelector('#flashcards-title');
  }

  getThemeTitle() {
    return this.querySelector('#flashcards-theme-title');
  }

  getProgress() {
    return this.querySelector('#flashcards-progress');
  }

  getFlashcard() {
    return this.querySelector('#flashcard');
  }

  getShowAnswerButton() {
    return this.querySelector('#btn-show-answer');
  }

  getKnowButton() {
    return this.querySelector('#btn-know');
  }

  getDontKnowButton() {
    return this.querySelector('#btn-dont-know');
  }

  getPrevButton() {
    return this.querySelector('#btn-fc-prev');
  }

  getNextButton() {
    return this.querySelector('#btn-fc-next');
  }

  getBackButton() {
    return this.querySelector('#btn-fc-back');
  }
}

customElements.define('view-flashcards', ViewFlashcards);
