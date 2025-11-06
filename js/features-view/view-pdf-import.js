// js/features-view/view-pdf-import.js
// Web Component pour l'import et la génération de thèmes depuis PDF

class ViewPdfImport extends HTMLElement {
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
          <h2 id="pdf-import-title">📄 Créer un thème depuis un PDF</h2>
          <div style="display: flex; gap: 12px;">
            <button id="btn-pdf-back" class="btn ghost" aria-label="Retour">
              ← Retour
            </button>
            <button id="btn-pdf-close" class="btn ghost" aria-label="Fermer">
              ✕ Fermer
            </button>
          </div>
        </div>
      </header>

      <!-- Zone d'erreur globale -->
      <div id="pdf-error" hidden></div>
      
      <!-- Loader global -->
      <div id="pdf-loader" hidden></div>

      <!-- ÉTAPE 1 : UPLOAD DU PDF -->
      <div id="pdf-step-1" class="pdf-step active">
        <article class="card">
          <h3 style="margin: 0 0 16px 0;">📁 Sélectionnez votre fichier PDF</h3>
          
          <div id="pdf-drop-zone" class="drop-zone">
            <div class="drop-zone-content">
              <div class="drop-icon">📄</div>
              <p class="drop-text">Glissez votre fichier PDF ici</p>
              <p class="muted">ou</p>
              <button id="btn-select-pdf" class="btn primary">
                📂 Choisir un fichier
              </button>
              <input type="file" id="file-pdf-import" accept=".pdf,application/pdf" hidden />
              <p class="muted" style="margin-top: 16px; font-size: 0.85rem;">
                Fichiers acceptés : PDF • Taille max : 10MB
              </p>
            </div>
          </div>
        </article>

        <!-- Aide -->
        <article class="card" style="margin-top: 24px; background: var(--bg-secondary);">
          <h4 style="margin: 0 0 12px 0;">💡 Conseils pour un meilleur résultat</h4>
          <ul style="margin: 0; padding-left: 24px; display: grid; gap: 8px; font-size: 0.9rem;">
            <li><strong>PDF textuel :</strong> Assurez-vous que votre PDF contient du texte sélectionnable (pas juste des images scannées)</li>
            <li><strong>Contenu structuré :</strong> Les cours avec titres, sections et paragraphes donnent de meilleurs résultats</li>
            <li><strong>Taille raisonnable :</strong> Pour de meilleurs résultats, privilégiez des PDF de 10-50 pages</li>
            <li><strong>Qualité du contenu :</strong> Plus le cours est clair et détaillé, meilleures seront les questions générées</li>
          </ul>
        </article>
      </div>

      <!-- ÉTAPE 2 : CONFIGURATION -->
      <div id="pdf-step-2" class="pdf-step" hidden>
        
        <!-- Aperçu du texte extrait -->
        <div id="pdf-text-preview"></div>

        <!-- BYOK : Clé API Mistral -->
        <div class="card" style="background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%); border-left: 4px solid var(--accent); margin-bottom: 24px;">
          <h4 style="margin: 0 0 12px 0;">🔑 Clé API Mistral (optionnelle)</h4>
          
          <p class="muted" style="margin-bottom: 16px; font-size: 0.9rem;">
            Vous pouvez fournir votre propre clé API Mistral gratuite. Si vous ne la fournissez pas, la clé serveur sera utilisée (si configurée).
          </p>
          
          <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
            <input 
              type="password" 
              id="pdf-api-key" 
              placeholder="sk-..." 
              style="flex: 1; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 1rem; background: var(--card);"
            />
            <button 
              type="button" 
              id="btn-toggle-api-key" 
              class="btn ghost"
              style="padding: 12px 16px; font-size: 1.2rem;"
              title="Afficher/Masquer la clé"
            >
              👁️
            </button>
          </div>
          
          <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 8px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="pdf-save-api-key" />
              <span style="font-size: 0.9rem;">Sauvegarder ma clé localement</span>
            </label>
          </div>
          
          <details style="margin-top: 12px;">
            <summary style="cursor: pointer; font-weight: 500; margin-bottom: 8px; color: var(--accent);">
              ℹ️ Comment obtenir une clé API gratuite ?
            </summary>
            <div class="muted" style="font-size: 0.85rem; line-height: 1.6; padding: 12px 16px; background: rgba(0,0,0,0.02); border-radius: 8px; margin-top: 8px;">
              <ol style="margin: 8px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Visitez <a href="https://console.mistral.ai/" target="_blank" rel="noopener" style="color: var(--accent); font-weight: 500;">console.mistral.ai</a></li>
                <li style="margin-bottom: 8px;">Créez un compte gratuit (si ce n'est pas déjà fait)</li>
                <li style="margin-bottom: 8px;">Allez dans "API Keys"</li>
                <li style="margin-bottom: 8px;">Cliquez sur "Create new key"</li>
                <li style="margin-bottom: 8px;">Copiez la clé (commence par "sk-...")</li>
              </ol>
              <div style="padding: 12px; background: var(--card); border-left: 3px solid var(--success); border-radius: 4px; margin-top: 12px;">
                <strong style="color: var(--success);">✅ Tier gratuit :</strong>
                <ul style="margin: 8px 0 0 0; padding-left: 20px; list-style: none;">
                  <li style="margin-bottom: 4px;">📦 1 milliard de tokens par mois</li>
                  <li style="margin-bottom: 4px;">⚡ 500k tokens par minute</li>
                  <li>🔄 1 requête par seconde</li>
                </ul>
              </div>
            </div>
          </details>
        </div>

        <!-- Configuration -->
        <article class="card" style="margin-top: 24px;">
          <h3 style="margin: 0 0 20px 0;">⚙️ Configuration de la génération</h3>
          
          <!-- Nombre de questions -->
          <div style="margin-bottom: 24px;">
            <label for="pdf-question-count" style="display: block; font-weight: 600; margin-bottom: 8px;">
              📊 Nombre de questions : <span id="pdf-question-count-value" style="color: var(--accent);">20</span>
            </label>
            <input 
              type="range" 
              id="pdf-question-count" 
              min="10" 
              max="50" 
              value="20" 
              step="5"
              style="width: 100%;"
            />
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; opacity: 0.7; margin-top: 4px;">
              <span>10</span>
              <span>30</span>
              <span>50</span>
            </div>
          </div>

          
          <!-- Types de questions -->
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-weight: 600; margin-bottom: 12px;">
              🎯 Types de questions
            </label>
            <div style="display: grid; gap: 12px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" id="pdf-type-mcq" checked style="width: 20px; height: 20px;">
                <span>✅ <strong>QCM</strong> - Questions à Choix Multiples</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" id="pdf-type-tf" checked style="width: 20px; height: 20px;">
                <span>✔✗ <strong>Vrai/Faux</strong> - Affirmations à évaluer</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" id="pdf-type-fill" style="width: 20px; height: 20px;">
                <span>✏️ <strong>Complétion</strong> - Phrases à compléter</span>
              </label>
            </div>
          </div>

          <!-- Niveau de difficulté -->
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-weight: 600; margin-bottom: 12px;">
              📈 Niveau de difficulté
            </label>
            <div style="display: grid; gap: 12px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="pdf-difficulty" value="facile" style="width: 20px; height: 20px;">
                <span><strong>Facile</strong> - Définitions, concepts de base</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="pdf-difficulty" value="moyen" checked style="width: 20px; height: 20px;">
                <span><strong>Moyen</strong> - Compréhension, application</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="pdf-difficulty" value="difficile" style="width: 20px; height: 20px;">
                <span><strong>Difficile</strong> - Analyse, synthèse, cas pratiques</span>
              </label>
            </div>
          </div>

          <!-- Bouton de génération -->
          <div style="text-align: center; padding-top: 12px; border-top: 1px solid var(--card-border);">
            <button id="btn-generate-questions" class="btn primary large">
              🤖 Générer les questions avec l'IA
            </button>
            <p class="muted" style="margin-top: 12px; font-size: 0.85rem;">
              ⏱️ La génération peut prendre plusieurs minutes...
            </p>
          </div>
        </article>

        <!-- Information sur l'IA -->
        <article class="card" style="margin-top: 24px; background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%);">
          <div style="display: flex; gap: 16px; align-items: start;">
            <div style="font-size: 3rem; flex-shrink: 0;">🤖</div>
            <div>
              <h4 style="margin: 0 0 8px 0;">Intelligence Artificielle Mistral AI</h4>
              <p style="margin: 0; font-size: 0.9rem;">
                Mistral AI analysera votre cours et générera automatiquement des questions pertinentes accompagnées de leurs explications.
                Ces questions seront ajustées en fonction du contenu et du niveau de difficulté que vous aurez sélectionné.
              </p>
              <p class="muted" style="margin: 8px 0 0 0; font-size: 0.85rem;">
                💡 Pour cette démo, nous utilisons la version gratuite (free-tier) de Mistral AI.
                La génération des questions peut donc prendre un certain temps.
                Les questions produites vous appartiennent intégralement.
              </p>
            </div>
          </div>
        </article>
      </div>

      <!-- ÉTAPE 3 : PRÉVISUALISATION -->
      <div id="pdf-step-3" class="pdf-step" hidden>
        <div id="pdf-generated-preview"></div>
      </div>
    `;
  }

  getBackButton() {
    return this.querySelector('#btn-pdf-back');
  }

  getCloseButton() {
    return this.querySelector('#btn-pdf-close');
  }

  getError() {
    return this.querySelector('#pdf-error');
  }

  getLoader() {
    return this.querySelector('#pdf-loader');
  }

  getStep1() {
    return this.querySelector('#pdf-step-1');
  }

  getStep2() {
    return this.querySelector('#pdf-step-2');
  }

  getStep3() {
    return this.querySelector('#pdf-step-3');
  }

  getDropZone() {
    return this.querySelector('#pdf-drop-zone');
  }

  getFileInput() {
    return this.querySelector('#file-pdf-import');
  }

  getSelectButton() {
    return this.querySelector('#btn-select-pdf');
  }

  getTextPreview() {
    return this.querySelector('#pdf-text-preview');
  }

  getApiKeyInput() {
    return this.querySelector('#pdf-api-key');
  }

  getToggleKeyButton() {
    return this.querySelector('#btn-toggle-api-key');
  }

  getSaveKeyCheckbox() {
    return this.querySelector('#pdf-save-api-key');
  }

  getQuestionCountSlider() {
    return this.querySelector('#pdf-question-count');
  }

  getQuestionCountValue() {
    return this.querySelector('#pdf-question-count-value');
  }

  getGenerateButton() {
    return this.querySelector('#btn-generate-questions');
  }

  getGeneratedPreview() {
    return this.querySelector('#pdf-generated-preview');
  }
}

customElements.define('view-pdf-import', ViewPdfImport);
