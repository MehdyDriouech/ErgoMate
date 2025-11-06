// js/features-view/view-history.js
// Web Component pour la vue de l'historique

class ViewHistory extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  connectedCallback() {
    this.classList.add('view');
    this.setAttribute('role', 'region');
    this.setAttribute('aria-labelledby', 'history-title');
  }

  render() {
    this.innerHTML = `
      <div class="card" style="margin-bottom: 24px;">
        <h2 id="history-title" style="margin: 0;">📚 Historique de vos sessions</h2>
        <p class="muted" style="margin: 8px 0 0 0;">
          Retrouvez vos 200 dernières sessions avec détails complets : date, mode, score et temps moyen
        </p>
      </div>

      <div id="history-list" class="card-list"></div>
    `;
  }

  getHistoryList() {
    return this.querySelector('#history-list');
  }
}

customElements.define('view-history', ViewHistory);
