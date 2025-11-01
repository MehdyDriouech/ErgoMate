// js/features/features-pdf-generator.js
// Génération de questions via OpenRouter API (Qwen3) à partir du texte PDF

///////////////////////////
// ÉTAT DE LA GÉNÉRATION //
///////////////////////////

const generatorState = {
  generatedTheme: null,
  isGenerating: false
};

///////////////////////////
// GÉNÉRATION VIA API PHP //
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
    // URL de votre backend PHP
    //const BACKEND_URL = 'https://ergo-mate.mehdydriouech.fr/backend-php/api.php/generate-questions';
    const BACKEND_URL = 'https://ergo-mate.mehdydriouech.fr/backend-php/api.php/generate-complete-theme';


    console.log('🚀 Envoi de la requête à l\'API...', {
      textLength: text.length,
      config: config
    });
    
    // Appeler l'API PHP qui utilise OpenRouter/Qwen3
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
     body: JSON.stringify({
       text: text,
       config: config,
       metadata: {
         fileName: pdfImportState.metadata?.fileName || 'document.pdf',
          author: pdfImportState.metadata?.author || null,
          numPages: pdfImportState.metadata?.numPages || null
        }
     })
    });
    
    // Parser la réponse JSON (qu'elle soit OK ou erreur)
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('❌ Erreur de parsing JSON:', parseError);
      throw new Error('Réponse du serveur invalide (pas du JSON)');
    }
    
    // Vérifier si la requête a échoué
    if (!response.ok) {
      console.error('❌ Erreur HTTP:', response.status, data);
      throw new Error(
        data.error || 
        data.details || 
        `Erreur serveur: ${response.status} ${response.statusText}`
      );
    }
    
    console.log('✅ Réponse reçue de l\'API:', data);
    
    // Extraire le texte de la réponse (format Anthropic compatible)
    const responseText = data.content[0].text;
    
    console.log('📝 Texte extrait:', responseText.substring(0, 200) + '...');
    
    // Parser la réponse JSON
    const theme = parseApiResponse(responseText);
    
    console.log('🎯 Thème parsé:', theme);
    
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
    console.error('❌ Erreur de génération:', error);
    hidePdfLoader();
    showPdfError(
      `❌ Erreur lors de la génération: ${error.message}<br><br>` +
      `💡 Suggestions :<br>` +
      `• Vérifiez votre connexion internet<br>` +
      `• Réduisez le nombre de questions demandées<br>` +
      `• Assurez-vous que le PDF contient suffisamment de texte<br>` +
      `• Vérifiez que le backend PHP est bien configuré`
    );
  } finally {
    generatorState.isGenerating = false;
  }
}

/**
 * Parse la réponse de l'API en JSON
 * Compatible avec Qwen3 qui peut ajouter du markdown
 */
function parseApiResponse(responseText) {
  // Nettoyer la réponse (enlever les éventuels markdown)
  let cleaned = responseText.trim();
  
  console.log('🧹 Nettoyage de la réponse...');
  
  // Enlever les balises markdown si présentes
  cleaned = cleaned.replace(/```json\s*/gi, '');
  cleaned = cleaned.replace(/```\s*/g, '');
  cleaned = cleaned.trim();
  
  // Qwen3 peut parfois ajouter du texte avant le JSON
  // On cherche le premier { et le dernier }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    console.log('✂️ JSON extrait des accolades');
  }
  
  // Parser le JSON
  try {
    const parsed = JSON.parse(cleaned);
    console.log('✅ JSON parsé avec succès');
    return parsed;
  } catch (error) {
    console.error('❌ Erreur de parsing JSON:', error);
    console.error('📄 Réponse brute (premiers 500 caractères):', responseText.substring(0, 500));
    console.error('🧹 Réponse nettoyée (premiers 500 caractères):', cleaned.substring(0, 500));
    throw new Error('La réponse de l\'API n\'est pas un JSON valide. Vérifiez les logs de la console.');
  }
}

///////////////////////////
// VALIDATION DU THÈME   //
///////////////////////////

/**
 * Valide la structure du thème généré
 */
function validateTheme(theme) {
  const errors = [];
  
  // Vérifier les champs obligatoires
  if (!theme.title || typeof theme.title !== 'string') {
    errors.push('Le champ "title" est manquant ou invalide');
  }
  
  if (!theme.description || typeof theme.description !== 'string') {
    errors.push('Le champ "description" est manquant ou invalide');
  }
  
  if (!Array.isArray(theme.questions) || theme.questions.length === 0) {
    errors.push('Le champ "questions" est manquant ou vide');
  }
  
  // Vérifier les questions
  if (theme.questions) {
    theme.questions.forEach((q, idx) => {
      if (!q.id) errors.push(`Question ${idx + 1}: "id" manquant`);
      if (!q.type) errors.push(`Question ${idx + 1}: "type" manquant`);
      if (!q.prompt) errors.push(`Question ${idx + 1}: "prompt" manquant`);
      if (!q.rationale) errors.push(`Question ${idx + 1}: "rationale" manquant`);
      
      // Validation spécifique par type
      if (q.type === 'mcq') {
        if (!Array.isArray(q.choices) || q.choices.length !== 4) {
          errors.push(`Question ${idx + 1}: les QCM doivent avoir exactement 4 choix`);
        }
        if (!q.answer) {
          errors.push(`Question ${idx + 1}: "answer" manquant pour le QCM`);
        }
      } else if (q.type === 'true_false') {
        if (typeof q.answer !== 'boolean') {
          errors.push(`Question ${idx + 1}: "answer" doit être un boolean pour Vrai/Faux`);
        }
      } else if (q.type === 'fill_in') {
        if (!q.answer || typeof q.answer !== 'string') {
          errors.push(`Question ${idx + 1}: "answer" manquant ou invalide pour la complétion`);
        }
      }
    });
  }
  
  // Si pas de tags, en créer des vides
  if (!theme.tags) {
    theme.tags = [];
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    theme: theme
  };
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
