// js/features-view/view-revision.js
// Web Component pour la vue des fiches de révision

class ViewRevision extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  connectedCallback() {
    this.classList.add('view');
    this.setAttribute('role', 'region');
    this.setAttribute('aria-labelledby', 'revision-title');
  }

  render() {
    this.innerHTML = `
      <div class="quiz-header">
        <div>
          <h2 id="revision-title" style="margin: 0;">📖 Fiches de révision</h2>
          <p id="revision-theme-title" class="muted" style="margin: 4px 0 0 0;"></p>
        </div>
        <div id="revision-progress" style="text-align: right; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; justify-content: flex-end;"></div>
      </div>

      <div class="card" style="min-height: 400px; margin-bottom: 20px;">
        <div id="revision-card"></div>
      </div>

      <div class="quiz-actions">
        <button id="btn-revision-back" class="btn ghost">
          ↩️ Retour
        </button>
        
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button id="btn-revision-understood" class="btn success">
            ✓ J'ai compris
          </button>
          <button id="btn-revision-to-review" class="btn warning">
            ⟳ À revoir
          </button>
        </div>

        <div style="display: flex; gap: 12px;">
          <button id="btn-revision-prev" class="btn">
            ← Précédent
          </button>
          <button id="btn-revision-next" class="btn primary">
            Suivant →
          </button>
        </div>
      </div>
    `;
  }

  getTitle() {
    return this.querySelector('#revision-title');
  }

  getThemeTitle() {
    return this.querySelector('#revision-theme-title');
  }

  getProgress() {
    return this.querySelector('#revision-progress');
  }

  getCard() {
    return this.querySelector('#revision-card');
  }

  getBackButton() {
    return this.querySelector('#btn-revision-back');
  }

  getUnderstoodButton() {
    return this.querySelector('#btn-revision-understood');
  }

  getToReviewButton() {
    return this.querySelector('#btn-revision-to-review');
  }

  getPrevButton() {
    return this.querySelector('#btn-revision-prev');
  }

  getNextButton() {
    return this.querySelector('#btn-revision-next');
  }
}

customElements.define('view-revision', ViewRevision);
