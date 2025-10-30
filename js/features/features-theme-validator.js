// js/features/features-theme-validator.js
// Validation des thèmes importés par l'utilisateur

///////////////////////////
// VALIDATION DE THÈME   //
///////////////////////////

/**
 * Valide la structure complète d'un thème
 * @param {Object} themeData - Données du thème à valider
 * @returns {Object} { valid: boolean, errors: string[], warnings: string[], theme: Object }
 */
function validateTheme(themeData) {
  const errors = [];
  const warnings = [];
  
  // Vérification que c'est un objet
  if (!themeData || typeof themeData !== 'object') {
    return { valid: false, errors: ['Le fichier doit contenir un objet JSON valide'], warnings: [] };
  }
  
  // Champs obligatoires
  if (!themeData.title || typeof themeData.title !== 'string' || themeData.title.trim() === '') {
    errors.push('Le champ "title" est obligatoire et doit être une chaîne non vide');
  }
  
  if (!themeData.questions || !Array.isArray(themeData.questions)) {
    errors.push('Le champ "questions" est obligatoire et doit être un tableau');
    return { valid: false, errors, warnings };
  }
  
  if (themeData.questions.length === 0) {
    errors.push('Le thème doit contenir au moins une question');
    return { valid: false, errors, warnings };
  }
  
  // Limite de questions
  if (themeData.questions.length > 200) {
    errors.push('Maximum 200 questions par thème');
  }
  
  // Valider chaque question
  const questionErrors = [];
  themeData.questions.forEach((q, index) => {
    const qErrors = validateQuestion(q, index + 1);
    questionErrors.push(...qErrors);
  });
  
  errors.push(...questionErrors);
  
  // Avertissements pour champs optionnels
  if (!themeData.description) {
    warnings.push('Le champ "description" est recommandé pour décrire le thème');
  }
  
  if (!themeData.tags || !Array.isArray(themeData.tags) || themeData.tags.length === 0) {
    warnings.push('Les tags sont recommandés pour organiser les thèmes');
  }
  
  // Validation des tags
  if (themeData.tags && Array.isArray(themeData.tags)) {
    if (themeData.tags.length > 10) {
      warnings.push('Maximum 10 tags recommandés');
    }
  }
  
  // Créer le thème nettoyé
  const cleanTheme = sanitizeTheme(themeData);
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    theme: cleanTheme
  };
}

/**
 * Valide une question individuelle
 * @param {Object} question - Question à valider
 * @param {number} index - Index de la question (pour les messages d'erreur)
 * @returns {string[]} Tableau d'erreurs
 */
function validateQuestion(question, index) {
  const errors = [];
  const prefix = `Question ${index}:`;
  
  // Vérifier que c'est un objet
  if (!question || typeof question !== 'object') {
    errors.push(`${prefix} Doit être un objet`);
    return errors;
  }
  
  // Champs obligatoires
  if (!question.prompt || typeof question.prompt !== 'string' || question.prompt.trim() === '') {
    errors.push(`${prefix} Le champ "prompt" (énoncé) est obligatoire`);
  }
  
  if (!question.type || typeof question.type !== 'string') {
    errors.push(`${prefix} Le champ "type" est obligatoire`);
  } else {
    // Types supportés
    const validTypes = ['mcq', 'true_false', 'fill_in'];
    if (!validTypes.includes(question.type)) {
      errors.push(`${prefix} Type "${question.type}" non supporté. Types valides: ${validTypes.join(', ')}`);
    }
  }
  
  // Validation spécifique par type
  if (question.type === 'mcq') {
    errors.push(...validateMCQQuestion(question, prefix));
  } else if (question.type === 'true_false') {
    errors.push(...validateTrueFalseQuestion(question, prefix));
  } else if (question.type === 'fill_in') {
    errors.push(...validateFillInQuestion(question, prefix));
  }
  
  return errors;
}

/**
 * Valide une question à choix multiples (MCQ)
 */
function validateMCQQuestion(question, prefix) {
  const errors = [];
  
  if (!question.choices || !Array.isArray(question.choices)) {
    errors.push(`${prefix} Les questions MCQ doivent avoir un tableau "choices"`);
    return errors;
  }
  
  if (question.choices.length < 2) {
    errors.push(`${prefix} Les questions MCQ doivent avoir au moins 2 choix`);
  }
  
  if (question.choices.length > 10) {
    errors.push(`${prefix} Maximum 10 choix par question MCQ`);
  }
  
  // Valider chaque choix
  const choiceIds = new Set();
  question.choices.forEach((choice, idx) => {
    if (!choice.id) {
      errors.push(`${prefix} Choix ${idx + 1}: Le champ "id" est obligatoire`);
    } else {
      if (choiceIds.has(choice.id)) {
        errors.push(`${prefix} ID de choix dupliqué: "${choice.id}"`);
      }
      choiceIds.add(choice.id);
    }
    
    if (!choice.label || typeof choice.label !== 'string') {
      errors.push(`${prefix} Choix ${idx + 1}: Le champ "label" est obligatoire`);
    }
  });
  
  // Valider la réponse
  if (question.answer === undefined && question.answers === undefined) {
    errors.push(`${prefix} Le champ "answer" ou "answers" est obligatoire`);
  } else {
    const answers = Array.isArray(question.answer) ? question.answer : 
                   Array.isArray(question.answers) ? question.answers : 
                   [question.answer];
    
    answers.forEach(ans => {
      if (!choiceIds.has(ans)) {
        errors.push(`${prefix} La réponse "${ans}" ne correspond à aucun ID de choix`);
      }
    });
  }
  
  return errors;
}

/**
 * Valide une question Vrai/Faux
 */
function validateTrueFalseQuestion(question, prefix) {
  const errors = [];
  
  if (question.answer === undefined) {
    errors.push(`${prefix} Le champ "answer" est obligatoire pour les questions vrai/faux`);
  } else if (typeof question.answer !== 'boolean') {
    errors.push(`${prefix} Le champ "answer" doit être un booléen (true ou false)`);
  }
  
  return errors;
}

/**
 * Valide une question à compléter
 */
function validateFillInQuestion(question, prefix) {
  const errors = [];
  
  if (question.answer === undefined) {
    errors.push(`${prefix} Le champ "answer" est obligatoire`);
  } else {
    const answerType = typeof question.answer;
    const isValidArray = Array.isArray(question.answer) && 
                        question.answer.length > 0 && 
                        question.answer.every(a => typeof a === 'string');
    
    if (answerType !== 'string' && answerType !== 'number' && !isValidArray) {
      errors.push(`${prefix} Le champ "answer" doit être une chaîne, un nombre, ou un tableau de chaînes`);
    }
    
    if (isValidArray && question.answer.length > 10) {
      errors.push(`${prefix} Maximum 10 réponses acceptables`);
    }
  }
  
  return errors;
}

/**
 * Nettoie et normalise un thème
 * @param {Object} themeData - Données brutes du thème
 * @returns {Object} Thème nettoyé
 */
function sanitizeTheme(themeData) {
  return {
    id: themeData.id || generateUniqueThemeId(),
    title: sanitizeString(themeData.title),
    description: themeData.description ? sanitizeString(themeData.description) : '',
    tags: Array.isArray(themeData.tags) 
      ? themeData.tags.map(t => sanitizeString(t)).filter(t => t).slice(0, 10)
      : [],
    questions: themeData.questions.map((q, idx) => sanitizeQuestion(q, idx)),
    isCustom: true,
    createdAt: Date.now(),
    settings: themeData.settings || {}
  };
}

/**
 * Nettoie une question
 */
function sanitizeQuestion(question, index) {
  const baseQuestion = {
    id: question.id || `q${index + 1}`,
    type: question.type,
    prompt: sanitizeString(question.prompt),
    rationale: question.rationale ? sanitizeString(question.rationale) : undefined
  };
  
  if (question.type === 'mcq') {
    baseQuestion.choices = question.choices.map(c => ({
      id: sanitizeString(c.id),
      label: sanitizeString(c.label)
    }));
    
    // Normaliser answer/answers
    if (Array.isArray(question.answers)) {
      baseQuestion.answers = question.answers.map(a => sanitizeString(a));
    } else if (Array.isArray(question.answer)) {
      baseQuestion.answers = question.answer.map(a => sanitizeString(a));
    } else {
      baseQuestion.answer = sanitizeString(question.answer);
    }
  } else if (question.type === 'true_false') {
    baseQuestion.answer = Boolean(question.answer);
  } else if (question.type === 'fill_in') {
    if (Array.isArray(question.answer)) {
      baseQuestion.answer = question.answer.map(a => String(a).trim());
    } else {
      baseQuestion.answer = String(question.answer).trim();
    }
  }
  
  return baseQuestion;
}

/**
 * Nettoie une chaîne de caractères (échapper HTML)
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return String(str);
  
  return str
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Génère un ID unique pour un thème
 */
function generateUniqueThemeId() {
  return `custom-theme-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Valide la taille d'un fichier
 * @param {File} file - Fichier à valider
 * @returns {Object} { valid: boolean, error: string }
 */
function validateFileSize(file) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum: 5MB`
    };
  }
  
  return { valid: true };
}

/**
 * Valide le type de fichier
 * @param {File} file - Fichier à valider
 * @returns {Object} { valid: boolean, error: string }
 */
function validateFileType(file) {
  if (!file.name.endsWith('.json')) {
    return {
      valid: false,
      error: 'Seuls les fichiers JSON sont acceptés'
    };
  }
  
  return { valid: true };
}
