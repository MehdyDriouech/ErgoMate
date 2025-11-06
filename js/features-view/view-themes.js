// js/features-view/view-themes.js
// Web Component pour la vue des thèmes

class ViewThemes extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  connectedCallback() {
    this.classList.add('view', 'active');
    this.setAttribute('role', 'region');
    this.setAttribute('aria-labelledby', 'themes-title');
  }

  render() {
    this.innerHTML = `
      <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%);">
        <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
          
          <figure aria-hidden="true" style="margin: 0; flex-shrink: 0;">
            <svg width="120" height="120" viewBox="0 0 120 120" role="img" xmlns="http://www.w3.org/2000/svg">
              <title>Illustration médicale</title>
              <desc>Stéthoscope formant un cœur, symbole d'apprentissage en santé.</desc>
              <defs>
                <linearGradient id="grad1" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stop-color="#06b6d4"/>
                  <stop offset="100%" stop-color="#10b981"/>
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="56" fill="#ECFEFF" stroke="#BAE6FD" stroke-width="2"/>
              <path d="M40 50c0-8 6-14 14-14s14 6 14 14-6 14-14 14-14-6-14-14z" fill="url(#grad1)"/>
              <path d="M74 40c10 0 18 8 18 18 0 7-4 13-10 16" fill="none" stroke="#0891b2" stroke-width="4" stroke-linecap="round"/>
              <path d="M30 82c6 6 14 10 22 10 8 0 16-4 22-10" fill="none" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
              <path d="M84 72v10a8 8 0 0 0 8 8h6" fill="none" stroke="#06b6d4" stroke-width="4" stroke-linecap="round"/>
            </svg>
          </figure>

          <div style="flex: 1; min-width: 240px;">
            <h2 id="themes-title" style="margin: 0 0 8px 0; font-size: clamp(1.25rem, 3vw, 1.75rem);">
              Ergo Mate, ton compagnon pour réussir
            </h2>
            <p class="muted" style="margin: 0 0 16px 0; font-size: 1rem;">
              Quiz interactifs, flashcards animées, tableau de bord et suivi de progression. 
              L'outil idéal pour tes révisions en ergothérapie.
            </p>
          </div>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--card-border);">
          <h3 style="margin: 0 0 12px 0; font-size: 1.1rem;">💡 Conseils pour maximiser ta mémorisation</h3>
          <ul style="margin: 0; padding-left: 24px; display: grid; gap: 8px;">
            <li><strong>Répétition espacée :</strong> Refais un thème 24h puis 72h plus tard pour ancrer durablement.</li>
            <li><strong>Sessions courtes :</strong> 10-15 minutes par session, 2-3 thèmes ciblés pour rester concentré.</li>
            <li><strong>Alternance :</strong> Mélange QCM et flashcards pour stimuler différentes formes de mémoire.</li>
          </ul>
        </div>
      </div>

      <!-- Barre de recherche -->
      <div class="search-container" style="margin-bottom: 24px;">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input 
            type="search" 
            id="search-themes" 
            class="search-input" 
            placeholder="Rechercher par titre ou tag..."
            aria-label="Rechercher un thème"
          />
          <button id="btn-clear-search" class="clear-search" aria-label="Effacer la recherche" hidden>
            ✕
          </button>
        </div>
        <div id="search-results-count" class="search-results-count muted" hidden></div>
      </div>

      <div id="themes-list" class="card-list" role="list"></div>
    `;
  }

  // Méthodes publiques pour interagir avec le composant
  getThemesList() {
    return this.querySelector('#themes-list');
  }

  getSearchInput() {
    return this.querySelector('#search-themes');
  }

  getClearButton() {
    return this.querySelector('#btn-clear-search');
  }

  getResultsCount() {
    return this.querySelector('#search-results-count');
  }
}

// Enregistrer le composant
customElements.define('view-themes', ViewThemes);
