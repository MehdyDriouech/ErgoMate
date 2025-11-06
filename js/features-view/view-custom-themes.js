// js/features-view/view-custom-themes.js
// Web Component pour la gestion des thèmes personnalisés

class ViewCustomThemes extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  connectedCallback() {
    this.classList.add('view');
  }

  render() {
    this.innerHTML = `
      <header class="view-header">
        <div class="view-header-content">
          <h2>📚 Mes Thèmes Personnalisés</h2>
          <button id="btn-custom-close" class="btn ghost" aria-label="Fermer">
            ✕ Fermer
          </button>
        </div>
      </header>

      <div style="margin-bottom: 24px; text-align: center;">
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button id="btn-pdf-create" class="btn primary">
            📄 Créer depuis PDF
          </button>
          <button id="btn-json-import" class="btn ghost">
            📥 Importer JSON
          </button>
        </div>
        <p class="muted" style="margin-top: 12px; font-size: 0.9rem;">
          Créez un thème depuis un PDF ou importez un thème existant
        </p>
      </div>

      <div id="custom-themes-list">
        <!-- Liste générée dynamiquement par JS -->
      </div>
    `;
  }

  getCloseButton() {
    return this.querySelector('#btn-custom-close');
  }

  getPdfButton() {
    return this.querySelector('#btn-pdf-create');
  }

  getJsonButton() {
    return this.querySelector('#btn-json-import');
  }

  getList() {
    return this.querySelector('#custom-themes-list');
  }
}

customElements.define('view-custom-themes', ViewCustomThemes);
