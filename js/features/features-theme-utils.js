// js/features/features-theme-utils.js
// Fonctions utilitaires pour la gestion des thèmes

///////////////////////////
// GÉNÉRATION D'ID       //
///////////////////////////

/**
 * Génère un ID unique pour un thème
 * @returns {string} ID au format "theme-TIMESTAMP-RANDOM"
 */
function generateUniqueThemeId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `theme-${timestamp}-${random}`;
}

///////////////////////////
// NORMALISATION         //
///////////////////////////

/**
 * Normalise un thème personnalisé pour garantir tous les champs nécessaires
 * @param {Object} theme - Thème à normaliser
 * @returns {Object} Thème normalisé avec tous les champs requis
 */
function normalizeCustomTheme(theme) {
  // Générer un ID si manquant
  if (!theme.id) {
    theme.id = generateUniqueThemeId();
    console.log('🔑 ID généré automatiquement:', theme.id);
  }
  
  // Garantir le flag isCustom
  const normalized = {
    ...theme,
    isCustom: true,  // 🔒 FLAG ESSENTIEL
    createdAt: theme.createdAt || Date.now(),
    updatedAt: Date.now()
  };
  
  // Garantir la présence des champs de base
  normalized.title = normalized.title || 'Thème sans titre';
  normalized.description = normalized.description || '';
  normalized.tags = Array.isArray(normalized.tags) ? normalized.tags : [];
  normalized.questions = Array.isArray(normalized.questions) ? normalized.questions : [];
  
  return normalized;
}

///////////////////////////
// VALIDATION DE FICHIER //
///////////////////////////

/**
 * Valide le type d'un fichier
 * @param {File} file - Fichier à valider
 * @returns {Object} Résultat de validation
 */
function validateFileType(file) {
  const validTypes = ['application/json', 'text/plain'];
  const validExtensions = ['.json'];
  
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension && !validTypes.includes(file.type)) {
    return {
      valid: false,
      error: '❌ Type de fichier invalide. Seuls les fichiers JSON (.json) sont acceptés.'
    };
  }
  
  return { valid: true };
}

/**
 * Valide la taille d'un fichier
 * @param {File} file - Fichier à valider
 * @param {number} maxSize - Taille maximale en octets (défaut: 5MB)
 * @returns {Object} Résultat de validation
 */
function validateFileSize(file, maxSize = 5 * 1024 * 1024) {
  if (file.size > maxSize) {
    const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `❌ Fichier trop volumineux. Taille maximale : ${sizeMB}MB`
    };
  }
  
  return { valid: true };
}

///////////////////////////
// VALIDATION DE THÈME   //
///////////////////////////

/**
 * Valide la structure complète d'un thème
 * @param {Object} theme - Thème à valider
 * @returns {Object} Résultat de validation avec erreurs et warnings
 */
function validateTheme(theme) {
  const errors = [];
  const warnings = [];
  
  // ===== CHAMPS OBLIGATOIRES =====
  if (!theme.title || typeof theme.title !== 'string' || theme.title.trim() === '') {
    errors.push('❌ Le champ "title" est manquant ou invalide');
  }
  
  if (!theme.description || typeof theme.description !== 'string') {
    warnings.push('⚠️ Le champ "description" est manquant ou vide');
  }
  
  if (!Array.isArray(theme.questions) || theme.questions.length === 0) {
    errors.push('❌ Le champ "questions" est manquant ou vide');
  }
  
  // ===== VALIDATION DES QUESTIONS =====
  if (Array.isArray(theme.questions)) {
    theme.questions.forEach((q, idx) => {
      const questionNum = idx + 1;
      
      // Champs obligatoires de la question
      if (!q.id) {
        errors.push(`❌ Question ${questionNum}: "id" manquant`);
      }
      
      if (!q.type || !['mcq', 'true_false', 'fill_in'].includes(q.type)) {
        errors.push(`❌ Question ${questionNum}: "type" manquant ou invalide (doit être: mcq, true_false, ou fill_in)`);
      }
      
      if (!q.prompt || typeof q.prompt !== 'string' || q.prompt.trim() === '') {
        errors.push(`❌ Question ${questionNum}: "prompt" manquant ou vide`);
      }
      
      if (!q.rationale) {
        warnings.push(`⚠️ Question ${questionNum}: "rationale" manquant (recommandé)`);
      }
      
      // Validation spécifique par type
      if (q.type === 'mcq') {
        if (!Array.isArray(q.choices)) {
          errors.push(`❌ Question ${questionNum} (QCM): "choices" manquant ou invalide`);
        } else if (q.choices.length !== 4) {
          errors.push(`❌ Question ${questionNum} (QCM): doit avoir exactement 4 choix (actuellement: ${q.choices.length})`);
        } else {
          // Valider la structure de chaque choix
          q.choices.forEach((choice, choiceIdx) => {
            if (!choice.id || !choice.label) {
              errors.push(`❌ Question ${questionNum} (QCM): choix ${choiceIdx + 1} invalide (doit avoir "id" et "label")`);
            }
          });
        }
        
        if (!q.answer || typeof q.answer !== 'string') {
          errors.push(`❌ Question ${questionNum} (QCM): "answer" manquant ou invalide`);
        } else if (Array.isArray(q.choices)) {
          // Vérifier que la réponse correspond à un choix existant
          const validAnswers = q.choices.map(c => c.id);
          if (!validAnswers.includes(q.answer)) {
            errors.push(`❌ Question ${questionNum} (QCM): "answer" (${q.answer}) ne correspond à aucun choix`);
          }
        }
      } else if (q.type === 'true_false') {
        if (typeof q.answer !== 'boolean') {
          errors.push(`❌ Question ${questionNum} (Vrai/Faux): "answer" doit être un boolean (true ou false)`);
        }
      } else if (q.type === 'fill_in') {
        if (!q.answer || typeof q.answer !== 'string' || q.answer.trim() === '') {
          errors.push(`❌ Question ${questionNum} (Complétion): "answer" manquant ou vide`);
        }
      }
      
      // Tags (optionnel mais recommandé)
      if (!Array.isArray(q.tags) || q.tags.length === 0) {
        warnings.push(`⚠️ Question ${questionNum}: aucun tag (recommandé pour l'organisation)`);
      }
    });
  }
  
  // ===== CHAMPS OPTIONNELS =====
  if (!Array.isArray(theme.tags) || theme.tags.length === 0) {
    warnings.push('⚠️ Aucun tag défini pour le thème (recommandé pour l\'organisation)');
  }
  
  // Générer un ID si manquant (pas une erreur, juste un avertissement)
  if (!theme.id) {
    warnings.push('ℹ️ Aucun ID défini, un ID sera généré automatiquement');
    theme.id = generateUniqueThemeId();
  }
  
  // Ajouter les valeurs par défaut pour les champs manquants
  if (!theme.tags) {
    theme.tags = [];
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings,
    theme: theme
  };
}

///////////////////////////
// ACTUALISATION STATE   //
///////////////////////////

/**
 * Actualise state.themes avec les thèmes officiels + personnalisés
 * Cette fonction doit être appelée après chaque modification des thèmes personnalisés
 */
function refreshThemesState() {
  if (typeof state === 'undefined' || !state) {
    console.error('❌ state non défini, impossible de rafraîchir');
    return;
  }
  
  // Sauvegarder les thèmes officiels (si pas encore fait)
  if (!state.officialThemes) {
    state.officialThemes = state.themes ? [...state.themes] : [];
  }
  
  // Recharger tous les thèmes (officiels + personnalisés)
  state.themes = getAllThemes();
  
  console.log('✅ state.themes actualisé:', {
    total: state.themes.length,
    official: state.officialThemes.length,
    custom: state.themes.length - state.officialThemes.length
  });
}
