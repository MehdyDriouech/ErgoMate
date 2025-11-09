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

        <!-- Tutoriel -->
        <article class="card" style="margin-top: 24px; background: var(--bg-secondary);">
          <h3 style="margin: 0 0 16px 0;">📖 Guide d'utilisation</h3>
          
          <!-- Section 1: Import manuel -->
          <details class="tutorial-section">
            <summary class="tutorial-summary">
              <span class="tutorial-icon">📄</span>
              <span class="tutorial-title">Option 1 : Importer un fichier JSON existant</span>
              <span class="tutorial-chevron">▼</span>
            </summary>
            <div class="tutorial-content">
              <p class="muted" style="margin: 0 0 16px 0;">
                Importez un thème déjà créé au format JSON. Parfait si vous avez déjà un fichier prêt.
              </p>
              
              <h4 style="margin: 0 0 12px 0; font-size: 1rem;">Structure JSON attendue :</h4>
              
              <div style="position: relative;">
                <button class="btn-copy-json" data-target="json-manual" style="position: absolute; top: 8px; right: 8px; padding: 6px 12px; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; z-index: 10;">
                  📋 Copier
                </button>
                <pre id="json-manual" style="background: var(--bg); padding: 16px 16px 16px 12px; border-radius: 8px; overflow-x: auto; font-size: 0.8rem; max-height: 400px; margin: 0;"><code>
                {
  "title": "Titre du thème",
  "description": "Description concise (1-2 phrases)",
  "tags": ["tag1", "tag2", "tag3"],
  "questions": [
    {
      "id": "q001",
      "type": "mcq",
      "prompt": "Question ?",
      "choices": [
        {"id": "a", "label": "Option A"},
        {"id": "b", "label": "Option B"},
        {"id": "c", "label": "Option C"},
        {"id": "d", "label": "Option D"}
      ],
      "answer": "a",
      "rationale": "Explication détaillée",
      "tags": ["concept"]
    },
    {
      "id": "q002",
      "type": "true_false",
      "prompt": "Affirmation",
      "answer": true,
      "rationale": "Explication",
      "tags": ["fait"]
    }
  ],
  "revision": {
    "sections": [
      {
        "id": "section_001",
        "title": "Titre section",
        "order": 1,
        "cards": [
          {
            "id": "rev_summary_001",
            "type": "summary",
            "title": "Titre résumé",
            "content": "Contenu",
            "items": [{"title": "Item", "content": "Description"}],
            "keyPoints": ["Point 1", "Point 2"],
            "tags": ["synthèse"],
            "relatedQuestions": ["q001"]
          },
          {
            "id": "rev_mermaid_001",
            "type": "diagram_mermaid",
            "title": "Titre diagramme",
            "mermaid": "mindmap\\n  root((Concept))\\n    Branche 1\\n      Sous A\\n    Branche 2",
            "note": "Explication",
            "tags": ["visuel"],
            "relatedQuestions": ["q001"]
          }
        ]
      }
    ]
  }
}</code></pre>
              </div>
              
              <div style="margin-top: 16px; padding: 12px; background: rgba(14, 165, 233, 0.1); border-left: 3px solid var(--accent); border-radius: 4px;">
                <strong style="color: var(--accent);">💡 Types de questions / fiches de revisions supportés :</strong>
                <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                  <li><code>mcq</code> : Questions à choix multiples (QCM)</li>
                  <li><code>true_false</code> : Questions Vrai/Faux</li>
                  <li><code>fill_in</code> : Questions à compléter</li>    
                  <li><code>summary</code> : Résumés</li>
                  <li><code>definition</code> : definition</li>
                  <li><code>timeline</code> : timeline</li>
                  <li><code>comparison</code> : comparaison</li>
                  <li><code>qna</code> : Questions/Reponses</li>
                  <li><code>mnemonic</code> : Moyens memothechniques</li>
                  <li><code>diagram_mermaid</code> : Diagrames mermaid.js (mindmap ect)</li>
                  <li><code>diagram_textual</code> : Diagrames textuels</li>
                  <li><code>focus</code> : point important</li>
                  <li><code>key_takeaways</code> : Lecons a retenir</li>
                  <li><code>case_study</code> : Etudes de cas</li>
                  <li><code>exercise</code> : exercice</li>                   
                </ul>
              </div>
            </div>
          </details>

          <!-- Section 2: Génération IA -->
          <details class="tutorial-section" style="margin-top: 12px;">
            <summary class="tutorial-summary">
              <span class="tutorial-icon">🤖</span>
              <span class="tutorial-title">Option 2 : Générer un thème avec l'IA</span>
              <span class="tutorial-chevron">▼</span>
            </summary>
            <div class="tutorial-content">
              <p class="muted" style="margin: 0 0 16px 0;">
                Utilisez un assistant IA pour créer automatiquement un thème complet à partir de votre document PDF.
              </p>
              
              <h4 style="margin: 0 0 12px 0; font-size: 1rem;">🎯 Étapes à suivre :</h4>
              
              <ol style="margin: 0 0 16px 0; padding-left: 20px; line-height: 1.6;">
                <li>
                  <strong>Choisissez votre assistant IA :</strong>
                  <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <a href="https://chat.openai.com" target="_blank" rel="noopener" class="ai-link">ChatGPT</a>
                    <a href="https://claude.ai" target="_blank" rel="noopener" class="ai-link">Claude</a>
                    <a href="https://chat.mistral.ai" target="_blank" rel="noopener" class="ai-link">Mistral AI</a>
                  </div>
                </li>
                <li style="margin-top: 12px;"><strong>Uploadez votre PDF</strong> dans la conversation</li>
                <li style="margin-top: 12px;"><strong>Copiez et collez le prompt ci-dessous</strong> dans le chat</li>
                <li style="margin-top: 12px;"><strong>Récupérez le JSON généré</strong> et importez-le ici</li>
              </ol>
              
              <h4 style="margin: 16px 0 12px 0; font-size: 1rem;">📝 Prompt à utiliser :</h4>
              
              <div style="position: relative;">
                <button class="btn-copy-json" data-target="prompt-ai" style="position: absolute; top: 8px; right: 8px; padding: 6px 12px; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; z-index: 10;">
                  📋 Copier le prompt
                </button>
                <textarea id="prompt-ai" readonly style="width: 100%; min-height: 300px; max-height: 500px; background: var(--bg); padding: 16px 16px 16px 12px; border: 1px solid var(--card-border); border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.8rem; resize: vertical; color: var(--text);">Tu es un expert pédagogique spécialisé dans la création de contenus éducatifs de haute qualité.

Ta mission : Analyser le contenu ci-dessous et générer un thème de révision complet au format JSON STRICT comprenant :
1. Des questions de révision variées et pertinentes
2. Des fiches de révision structurées et complètes avec support des diagrammes Mermaid

═══════════════════════════════════════════════════════════════════
📚 DOCUMENT SOURCE :
═══════════════════════════════════════════════════════════════════

📄 Nom du fichier : [Insérer le nom de votre PDF ici]

CONTENU :
---
[Le contenu du PDF sera automatiquement inséré ici par l'IA]
---

═══════════════════════════════════════════════════════════════════
⚙️ PARAMÈTRES DE GÉNÉRATION :
═══════════════════════════════════════════════════════════════════

📊 QUANTITÉ EXACTE REQUISE :
→ Tu DOIS générer EXACTEMENT 20 questions (ni plus, ni moins)
→ Répartis-les équitablement entre les types demandés

🎯 TYPES DE QUESTIONS À GÉNÉRER :
→ QCM (Questions à Choix Multiples)
→ Vrai/Faux
→ Questions à compléter

📈 NIVEAU DE DIFFICULTÉ : Medium
→ Questions adaptées à un niveau intermédiaire, équilibrant concepts fondamentaux et applications pratiques

═══════════════════════════════════════════════════════════════════
📋 FORMAT JSON EXACT À RESPECTER :
═══════════════════════════════════════════════════════════════════

                {
  "title": "Titre du thème",
  "description": "Description concise (1-2 phrases)",
  "tags": ["tag1", "tag2", "tag3"],
  "questions": [
    {
      "id": "q001",
      "type": "mcq",
      "prompt": "Question ?",
      "choices": [
        {"id": "a", "label": "Option A"},
        {"id": "b", "label": "Option B"},
        {"id": "c", "label": "Option C"},
        {"id": "d", "label": "Option D"}
      ],
      "answer": "a",
      "rationale": "Explication détaillée",
      "tags": ["concept"]
    },
    {
      "id": "q002",
      "type": "true_false",
      "prompt": "Affirmation",
      "answer": true,
      "rationale": "Explication",
      "tags": ["fait"]
    }
  ],
  "revision": {
    "sections": [
      {
        "id": "section_001",
        "title": "Titre section",
        "order": 1,
        "cards": [
          {
            "id": "rev_summary_001",
            "type": "summary",
            "title": "Titre résumé",
            "content": "Contenu",
            "items": [{"title": "Item", "content": "Description"}],
            "keyPoints": ["Point 1", "Point 2"],
            "tags": ["synthèse"],
            "relatedQuestions": ["q001"]
          },
          {
            "id": "rev_mermaid_001",
            "type": "diagram_mermaid",
            "title": "Titre diagramme",
            "mermaid": "mindmap\\n  root((Concept))\\n    Branche 1\\n      Sous A\\n    Branche 2",
            "note": "Explication",
            "tags": ["visuel"],
            "relatedQuestions": ["q001"]
          }
        ]
      }
    ]
  }
}

═══════════════════════════════════════════════════════════════════
🚀 GÉNÉRATION :
═══════════════════════════════════════════════════════════════════

Réponds UNIQUEMENT avec le JSON complet et valide.
Commence IMMÉDIATEMENT par le caractère {
Aucun texte explicatif, aucune balise markdown.</textarea>
              </div>
              
              <div style="margin-top: 16px; padding: 12px; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; border-radius: 4px;">
                <strong style="color: #10b981;">✨ Astuce :</strong> Vous pouvez modifier les paramètres dans le prompt (nombre de questions, difficulté, types) selon vos besoins.
              </div>
            </div>
          </details>
        </article>

        <style>
          .tutorial-section {
            background: var(--bg);
            border: 1px solid var(--card-border);
            border-radius: 8px;
            overflow: hidden;
          }
          
          .tutorial-summary {
            padding: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
            user-select: none;
            font-weight: 500;
            transition: background 0.2s;
          }
          
          .tutorial-summary:hover {
            background: rgba(14, 165, 233, 0.05);
          }
          
          .tutorial-icon {
            font-size: 1.5rem;
            flex-shrink: 0;
          }
          
          .tutorial-title {
            flex: 1;
            font-size: 1.05rem;
          }
          
          .tutorial-chevron {
            flex-shrink: 0;
            transition: transform 0.3s;
            color: var(--accent);
          }
          
          details[open] .tutorial-chevron {
            transform: rotate(180deg);
          }
          
          .tutorial-content {
            padding: 0 16px 16px 16px;
            border-top: 1px solid var(--card-border);
            animation: slideDown 0.3s ease-out;
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .ai-link {
            display: inline-block;
            padding: 6px 12px;
            background: var(--accent);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-size: 0.9rem;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          
          .ai-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
          }
          
          .btn-copy-json:hover {
            background: #0891b2;
            transform: translateY(-1px);
          }
          
          .btn-copy-json:active {
            transform: translateY(0);
          }
          
          code {
            background: rgba(14, 165, 233, 0.1);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
          }
        </style>
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
