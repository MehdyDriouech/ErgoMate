// js/features/features-pdf-generator.js
// Génération de questions via Claude API à partir du texte PDF

///////////////////////////
// ÉTAT DE LA GÉNÉRATION //
///////////////////////////

const generatorState = {
  generatedTheme: null,
  isGenerating: false
};

///////////////////////////
// GÉNÉRATION CLAUDE API //
///////////////////////////

/**
 * Génère des questions à partir du texte extrait
 */
async function generateQuestionsFromText(text, config) {
  if (generatorState.isGenerating) {
    console.warn('Génération déjà en cours');
    return;
  }
  
  generatorState.isGenerating = true;
  
  try {
    // Construire le prompt pour Claude
    const prompt = buildGenerationPrompt(text, config);
    
    // Appeler l'API Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erreur API Claude: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extraire le texte de la réponse
    const responseText = data.content[0].text;
    
    // Parser la réponse JSON
    const theme = parseClaudeResponse(responseText);
    
    // Valider le thème
    const validation = validateTheme(theme);
    
    if (!validation.valid) {
      throw new Error(`Thème généré invalide: ${validation.errors.join(', ')}`);
    }
    
    // Sauvegarder le thème généré
    generatorState.generatedTheme = validation.theme;
    
    // Afficher la prévisualisation
    hidePdfLoader();
    showGeneratedPreview(validation.theme);
    
  } catch (error) {
    console.error('Erreur de génération:', error);
    hidePdfLoader();
    showPdfError(`❌ Erreur lors de la génération: ${error.message}<br><br>💡 Essayez de réduire le nombre de questions ou vérifiez votre connexion.`);
  } finally {
    generatorState.isGenerating = false;
  }
}

/**
 * Construit le prompt pour Claude
 */
function buildGenerationPrompt(text, config) {
  const typeLabels = {
    mcq: 'QCM (Questions à Choix Multiples)',
    true_false: 'Vrai/Faux',
    fill_in: 'Questions à compléter'
  };
  
  const typesText = config.types.map(t => typeLabels[t]).join(', ');
  
  const difficultyInstructions = {
    facile: 'Questions simples, concepts de base, définitions directes',
    moyen: 'Questions de compréhension, application des concepts',
    difficile: 'Questions complexes, analyse, synthèse, cas pratiques'
  };
  
  // Limiter le texte si trop long (pour éviter de dépasser les limites de tokens)
  const maxChars = 15000;
  const truncatedText = text.length > maxChars ? text.substring(0, maxChars) + '\n\n[...texte tronqué...]' : text;
  
  return `Tu es un expert pédagogique spécialisé dans la création de contenus de révision pour étudiants.

À partir du texte de cours suivant, génère un thème de révision complet au format JSON.

═══════════════════════════════════════
TEXTE DU COURS :
═══════════════════════════════════════

${truncatedText}

═══════════════════════════════════════
CONSIGNES DE GÉNÉRATION :
═══════════════════════════════════════

📊 QUANTITÉ :
- Génère exactement ${config.questionCount} questions
- Répartis-les équitablement entre les types demandés

🎯 TYPES DE QUESTIONS :
${config.types.map(t => `- ${typeLabels[t]}`).join('\n')}

📈 NIVEAU DE DIFFICULTÉ :
- ${config.difficulty.toUpperCase()} : ${difficultyInstructions[config.difficulty]}

✅ RÈGLES DE QUALITÉ :
- Chaque question doit tester une connaissance clé du cours
- Les réponses doivent être claires et non ambiguës
- Pour les QCM : 4 choix de réponse, une seule bonne réponse
- Pour les Vrai/Faux : énoncés clairs et vérifiables
- Fournis TOUJOURS une explication dans "rationale"
- Assure-toi que les questions couvrent différentes parties du cours
- Évite les questions pièges ou trop spécifiques

═══════════════════════════════════════
FORMAT DE RÉPONSE :
═══════════════════════════════════════

Réponds UNIQUEMENT avec un objet JSON valide, SANS markdown, SANS balises de code.

Structure exacte à respecter :

{
  "title": "Titre du thème (basé sur le contenu)",
  "description": "Description courte du thème (1-2 phrases)",
  "tags": ["tag1", "tag2", "tag3"],
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "prompt": "Quelle est la question ?",
      "choices": [
        {"id": "a", "label": "Première réponse"},
        {"id": "b", "label": "Deuxième réponse"},
        {"id": "c", "label": "Troisième réponse"},
        {"id": "d", "label": "Quatrième réponse"}
      ],
      "answer": "a",
      "rationale": "Explication claire de pourquoi c'est la bonne réponse"
    },
    {
      "id": "q2",
      "type": "true_false",
      "prompt": "Affirmation à évaluer",
      "answer": true,
      "rationale": "Explication"
    },
    {
      "id": "q3",
      "type": "fill_in",
      "prompt": "Question à compléter ___",
      "answer": "réponse attendue",
      "rationale": "Explication"
    }
  ]
}

═══════════════════════════════════════

IMPORTANT : 
- Réponds UNIQUEMENT avec le JSON
- PAS de texte avant ou après
- PAS de balises \`\`\`json
- PAS de commentaires
- Juste le JSON pur

Commence maintenant :`;
}

/**
 * Parse la réponse de Claude en JSON
 */
function parseClaudeResponse(responseText) {
  // Nettoyer la réponse (enlever les éventuels markdown)
  let cleaned = responseText.trim();
  
  // Enlever les balises markdown si présentes
  cleaned = cleaned.replace(/```json\n?/g, '');
  cleaned = cleaned.replace(/```\n?/g, '');
  cleaned = cleaned.trim();
  
  // Parser le JSON
  try {
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error('Erreur de parsing JSON:', error);
    console.log('Réponse brute:', responseText);
    throw new Error('La réponse de Claude n\'est pas un JSON valide');
  }
}

///////////////////////////
// PRÉVISUALISATION      //
///////////////////////////

/**
 * Affiche la prévisualisation du thème généré
 */
function showGeneratedPreview(theme) {
  const previewContainer = document.getElementById('pdf-generated-preview');
  if (!previewContainer) return;
  
  const qCount = theme.questions.length;
  const mcqCount = theme.questions.filter(q => q.type === 'mcq').length;
  const tfCount = theme.questions.filter(q => q.type === 'true_false').length;
  const fillCount = theme.questions.filter(q => q.type === 'fill_in').length;
  
  const tagsHtml = (theme.tags || []).length > 0
    ? theme.tags.map(tag => `<span class="badge">${tag}</span>`).join('')
    : '<span class="muted">Aucun tag</span>';
  
  // Générer un aperçu des questions
  const questionsPreview = theme.questions.slice(0, 3).map((q, idx) => {
    const typeIcon = {
      mcq: '✅',
      true_false: '✔✗',
      fill_in: '✏️'
    };
    
    const typeLabel = {
      mcq: 'QCM',
      true_false: 'Vrai/Faux',
      fill_in: 'Complétion'
    };
    
    return `
      <div class="card" style="margin-bottom: 12px; background: var(--bg-secondary);">
        <div style="display: flex; align-items: start; gap: 12px;">
          <span class="badge" style="flex-shrink: 0;">${typeIcon[q.type]} ${typeLabel[q.type]}</span>
          <div style="flex: 1;">
            <p style="margin: 0; font-weight: 500;">${q.prompt}</p>
            ${q.rationale ? `<p class="muted" style="margin: 8px 0 0 0; font-size: 0.85rem;">💡 ${q.rationale}</p>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  const moreQuestions = qCount > 3 ? `
    <p class="muted" style="text-align: center; margin: 12px 0;">
      ... et ${qCount - 3} autres question${qCount - 3 > 1 ? 's' : ''}
    </p>
  ` : '';
  
  previewContainer.innerHTML = `
    <div class="card" style="background: var(--accent); color: white; margin-bottom: 24px;">
      <h3 style="margin: 0 0 16px 0; color: white;">
        ✨ Thème généré avec succès !
      </h3>
      
      <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; font-size: 1.2rem; color: white;">${theme.title}</h4>
        ${theme.description ? `<p style="margin: 0; opacity: 0.9;">${theme.description}</p>` : ''}
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 4px;">📚</div>
          <div style="font-size: 1.5rem; font-weight: bold;">${qCount}</div>
          <div style="opacity: 0.9; font-size: 0.85rem;">Question${qCount > 1 ? 's' : ''}</div>
        </div>
        
        ${mcqCount > 0 ? `
          <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 4px;">✅</div>
            <div style="font-size: 1.5rem; font-weight: bold;">${mcqCount}</div>
            <div style="opacity: 0.9; font-size: 0.85rem;">QCM</div>
          </div>
        ` : ''}
        
        ${tfCount > 0 ? `
          <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 4px;">✔✗</div>
            <div style="font-size: 1.5rem; font-weight: bold;">${tfCount}</div>
            <div style="opacity: 0.9; font-size: 0.85rem;">Vrai/Faux</div>
          </div>
        ` : ''}
        
        ${fillCount > 0 ? `
          <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 4px;">✏️</div>
            <div style="font-size: 1.5rem; font-weight: bold;">${fillCount}</div>
            <div style="opacity: 0.9; font-size: 0.85rem;">Complétion</div>
          </div>
        ` : ''}
      </div>
      
      <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px;">
        <div style="font-weight: 600; margin-bottom: 8px;">🏷️ Tags :</div>
        ${tagsHtml}
      </div>
    </div>
    
    <div style="margin-bottom: 24px;">
      <h4 style="margin: 0 0 16px 0;">📋 Aperçu des questions</h4>
      ${questionsPreview}
      ${moreQuestions}
    </div>
    
    <div class="actions" style="justify-content: center; gap: 16px;">
      <button id="btn-regenerate-questions" class="btn ghost">
        🔄 Régénérer
      </button>
      <button id="btn-save-pdf-theme" class="btn primary large">
        💾 Sauvegarder ce thème
      </button>
    </div>
    
    <p class="muted" style="text-align: center; margin-top: 16px; font-size: 0.85rem;">
      💡 Vous pourrez ensuite utiliser ce thème pour réviser en mode Quiz ou Flashcards
    </p>
  `;
  
  previewContainer.hidden = false;
  
  // Initialiser les listeners
  document.getElementById('btn-regenerate-questions')?.addEventListener('click', handleRegenerate);
  document.getElementById('btn-save-pdf-theme')?.addEventListener('click', handleSavePdfTheme);
}

/**
 * Régénère les questions
 */
async function handleRegenerate() {
  const confirmed = confirm(
    '🔄 Régénérer les questions ?\n\n' +
    'Les questions actuelles seront remplacées par de nouvelles questions générées avec les mêmes paramètres.\n\n' +
    'Continuer ?'
  );
  
  if (!confirmed) return;
  
  // Récupérer la config depuis l'étape 2
  const config = getPdfGenerationConfig();
  
  // Masquer la prévisualisation
  const previewContainer = document.getElementById('pdf-generated-preview');
  if (previewContainer) previewContainer.hidden = true;
  
  // Relancer la génération
  showPdfLoader('🔄 Régénération en cours...<br><small>Nouvelles questions à venir !</small>');
  
  try {
    await generateQuestionsFromText(pdfImportState.extractedText, config);
  } catch (error) {
    hidePdfLoader();
    showPdfError(`❌ Erreur lors de la régénération: ${error.message}`);
  }
}

/**
 * Sauvegarde le thème généré
 */
function handleSavePdfTheme() {
  if (!generatorState.generatedTheme) {
    alert('❌ Aucun thème à sauvegarder');
    return;
  }
  
  try {
    // Sauvegarder le thème (utilise la fonction existante)
    saveCustomTheme(generatorState.generatedTheme);
    
    const qCount = generatorState.generatedTheme.questions.length;
    
    alert(
      `✅ Thème sauvegardé avec succès !\n\n` +
      `📚 ${generatorState.generatedTheme.title}\n` +
      `❓ ${qCount} question${qCount > 1 ? 's' : ''}\n\n` +
      `Le thème est maintenant disponible dans "Mes Thèmes".`
    );
    
    // Fermer la vue et retourner à la liste des thèmes
    closePdfImport();
    showCustomThemesView();
    renderCustomThemesList();
    renderThemes();
    
  } catch (error) {
    console.error('Erreur de sauvegarde:', error);
    alert(`❌ Erreur lors de la sauvegarde : ${error.message}`);
  }
}

///////////////////////////
// UTILITAIRES           //
///////////////////////////

/**
 * Réinitialise l'état du générateur
 */
function resetGeneratorState() {
  generatorState.generatedTheme = null;
  generatorState.isGenerating = false;
}
