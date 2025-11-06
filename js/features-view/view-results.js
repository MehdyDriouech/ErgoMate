// js/features-view/view-results.js
// Web Component pour la vue des résultats

class ViewResults extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  connectedCallback() {
    this.classList.add('view');
    this.setAttribute('role', 'region');
    this.setAttribute('aria-labelledby', 'results-title');
  }

  render() {
    this.innerHTML = `
      <div class="card" style="text-align: center; padding: 32px;">
        <h2 id="results-title" style="margin-bottom: 16px;">🎯 Résultats</h2>
        <p id="results-summary" style="font-size: 1.25rem; font-weight: 600; margin-bottom: 24px;"></p>
      </div>

      <div id="results-details" class="card-list" style="margin-top: 24px;"></div>

      <div class="actions" style="margin-top: 24px;">
        <button id="btn-retry" class="btn primary">
          🔄 Rejouer le thème
        </button>
        <button id="btn-back-themes" class="btn ghost">
          ← Retour aux thèmes
        </button>
      </div>
    `;
  }

  getSummary() {
    return this.querySelector('#results-summary');
  }

  getDetails() {
    return this.querySelector('#results-details');
  }

  getRetryButton() {
    return this.querySelector('#btn-retry');
  }

  getBackButton() {
    return this.querySelector('#btn-back-themes');
  }
}

customElements.define('view-results', ViewResults);
