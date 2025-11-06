// js/features-view/view-dashboard.js
// Web Component pour le tableau de bord

class ViewDashboard extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  connectedCallback() {
    this.classList.add('view');
    this.setAttribute('role', 'region');
    this.setAttribute('aria-labelledby', 'dashboard-title');
  }

  render() {
    this.innerHTML = `
      <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%);">
        <h2 id="dashboard-title" style="margin: 0 0 8px 0;">📊 Tableau de bord</h2>
        <p class="muted" style="margin: 0;">Vue d'ensemble de vos progrès et statistiques détaillées</p>
      </div>

      <div id="dashboard-content"></div>

      <!-- US 3.4 - Export/Import Section -->
      <div class="export-section">
        <h3>💾 Gestion des données</h3>
        <p class="muted" style="margin-bottom: 16px;">
          Exportez vos données pour les sauvegarder ou les transférer sur un autre appareil. 
          Importez des données pour fusionner avec votre historique actuel.
        </p>
        <div class="export-buttons">
          <button id="btn-export" class="btn primary">
            📥 Exporter mes données
          </button>
          <button id="btn-import" class="btn ghost">
            📤 Importer des données
          </button>
          <input type="file" id="file-import" accept=".json" aria-label="Importer un fichier de données" />
        </div>
      </div>
    `;
  }

  getDashboardContent() {
    return this.querySelector('#dashboard-content');
  }

  getExportButton() {
    return this.querySelector('#btn-export');
  }

  getImportButton() {
    return this.querySelector('#btn-import');
  }

  getFileInput() {
    return this.querySelector('#file-import');
  }
}

customElements.define('view-dashboard', ViewDashboard);
