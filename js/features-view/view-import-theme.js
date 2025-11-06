// js/features-view/view-import-theme.js
// Web Component pour la vue d'import de thème

class ViewImportTheme extends HTMLElement {
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
          <h2>📥 Importer un thème personnalisé</h2>
          <button id="btn-import-close" class="btn ghost" aria-label="Fermer">
            ✕ Fermer
          </button>
        </div>
      </header>

      <div class="import-container">
        <article class="card">
          <h3 style="margin: 0 0 16px 0;">📁 Sélectionnez votre fichier JSON</h3>
          
          <div id="drop-zone" class="drop-zone">
            <div class="drop-zone-content">
              <div class="drop-icon">📄</div>
              <p class="drop-text">Glissez votre fichier JSON ici</p>
              <p class="muted">ou</p>
              <button id="btn-select-file" class="btn primary">
                📂 Choisir un fichier
              </button>
              <input type="file" id="file-theme-import" accept=".json" hidden />
              <p class="muted" style="margin-top: 16px; font-size: 0.85rem;">
                Fichiers acceptés : .json • Taille max : 5MB
              </p>
            </div>
          </div>
        </article>

        <!-- Prévisualisation du thème -->
        <div id="theme-preview" hidden></div>

        <!-- Erreurs de validation -->
        <div id="validation-errors" hidden></div>

        <!-- Bouton de confirmation -->
        <div style="text-align: center; margin-top: 24px;">
          <button id="btn-confirm-import" class="btn primary large" hidden>
            ✅ Importer ce thème
          </button>
        </div>

        <!-- Aide -->
        <article class="card" style="margin-top: 24px; background: var(--bg-secondary);">
          <h4 style="margin: 0 0 12px 0;">💡 Format attendu</h4>
          <p class="muted" style="margin: 0 0 12px 0;">
            Votre fichier JSON doit contenir un objet avec la structure suivante :
          </p>
          <pre style="background: var(--bg); padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 0.85rem;"><code>{
  "id": "theme-unique-id",
  "title": "Nom du thème",
  "locale": "fr-FR",
  "meta": {
    "author": "Nom de l'auteur",
    "source": "Source",
    "updatedAt": "2025-01-01"
  },
  "settings": {
    "shuffleQuestions": false,
    "shuffleChoices": false
  },
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "prompt": "Question ?",
      "choices": [
        { "id": "a", "label": "Réponse A" },
        { "id": "b", "label": "Réponse B" }
      ],
      "answer": "a",
      "rationale": "Explication",
      "difficulty": 1,
      "tags": ["tag1"]
    }
  ]
}</code></pre>
          <p class="muted" style="margin: 12px 0 0 0; font-size: 0.85rem;">
            <strong>Types de questions supportés :</strong> mcq (QCM), true_false (Vrai/Faux), fill_in (Complétion)
          </p>
        </article>
      </div>
    `;
  }

  getDropZone() {
    return this.querySelector('#drop-zone');
  }

  getFileInput() {
    return this.querySelector('#file-theme-import');
  }

  getSelectButton() {
    return this.querySelector('#btn-select-file');
  }

  getCloseButton() {
    return this.querySelector('#btn-import-close');
  }

  getPreview() {
    return this.querySelector('#theme-preview');
  }

  getValidationErrors() {
    return this.querySelector('#validation-errors');
  }

  getConfirmButton() {
    return this.querySelector('#btn-confirm-import');
  }
}

customElements.define('view-import-theme', ViewImportTheme);
