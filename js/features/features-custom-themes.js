// js/features/features-custom-themes.js
// Gestion des thèmes personnalisés - chargement, sauvegarde, suppression

///////////////////////////
// GESTION DES THÈMES    //
///////////////////////////

/**
 * Charge tous les thèmes personnalisés depuis le localStorage
 * @returns {Object} Dictionnaire des thèmes personnalisés par ID
 */
function loadCustomThemes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_THEMES);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error('Erreur lors du chargement des thèmes personnalisés:', e);
    return {};
  }
}

/**
 * Sauvegarde un thème personnalisé
 * @param {Object} theme - Thème à sauvegarder
 */
function saveCustomTheme(theme) {
  const themes = loadCustomThemes();
  themes[theme.id] = theme;
  localStorage.setItem(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(themes));
}

/**
 * Récupère un thème personnalisé par son ID
 * @param {string} themeId - ID du thème
 * @returns {Object|null} Le thème ou null s'il n'existe pas
 */
function getCustomTheme(themeId) {
  const themes = loadCustomThemes();
  return themes[themeId] || null;
}

/**
 * Supprime un thème personnalisé
 * @param {string} themeId - ID du thème à supprimer
 * @returns {boolean} true si supprimé, false sinon
 */
function deleteCustomTheme(themeId) {
  const themes = loadCustomThemes();
  if (themes[themeId]) {
    delete themes[themeId];
    localStorage.setItem(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(themes));
    return true;
  }
  return false;
}

/**
 * Récupère tous les thèmes (officiels + personnalisés)
 * @returns {Array} Tableau de tous les thèmes
 */
function getAllThemes() {
  const official = state.themes || [];
  const custom = Object.values(loadCustomThemes());
  return [...official, ...custom];
}

/**
 * Exporte un thème personnalisé vers un fichier JSON
 * @param {string} themeId - ID du thème à exporter
 */
function exportCustomTheme(themeId) {
  const theme = getCustomTheme(themeId);
  if (!theme) {
    alert('❌ Thème introuvable');
    return;
  }
  
  // Créer une copie propre pour l'export (sans métadonnées internes)
  const exportData = {
    title: theme.title,
    description: theme.description || '',
    tags: theme.tags || [],
    questions: theme.questions,
    settings: theme.settings || {}
  };
  
  // Créer un blob et télécharger
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${theme.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

///////////////////////////
// VUE DE GESTION        //
///////////////////////////

/**
 * Affiche la vue de gestion des thèmes personnalisés
 */
function showCustomThemesView() {
  showView('customThemes');
  renderCustomThemesList();
}

/**
 * Affiche la liste des thèmes personnalisés
 */
function renderCustomThemesList() {
  const container = document.getElementById('custom-themes-list');
  if (!container) return;
  
  const themes = Object.values(loadCustomThemes());
  
  if (themes.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 48px 24px;">
        <div style="font-size: 4rem; margin-bottom: 16px; opacity: 0.5;">📚</div>
        <h3 style="margin: 0 0 8px 0;">Aucun thème personnalisé</h3>
        <p class="muted" style="margin: 0 0 24px 0;">
          Commencez par importer un thème au format JSON
        </p>
        <button class="btn primary" onclick="showThemeImportView()">
          ➕ Importer un thème
        </button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  
  themes.forEach((theme, index) => {
    const qCount = theme.questions?.length || 0;
    const createdDate = theme.createdAt ? new Date(theme.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue';
    
    const card = document.createElement('article');
    card.className = 'card';
    card.style.animationDelay = `${index * 50}ms`;
    
    const tagsHtml = (theme.tags || []).length > 0
      ? theme.tags.map(tag => `<span class="badge">${tag}</span>`).join('')
      : '<span class="muted">Aucun tag</span>';
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 4px 0;">${theme.title}</h3>
          ${theme.description ? `<p class="muted" style="margin: 0; font-size: 0.9rem;">${theme.description}</p>` : ''}
        </div>
        <span class="badge success" style="flex-shrink: 0;">📚 ${qCount}</span>
      </div>
      
      <div class="meta" style="margin-bottom: 12px;">
        ${tagsHtml}
        <span class="badge" style="background: rgba(14, 165, 233, 0.1); color: var(--accent);">
          📅 ${createdDate}
        </span>
      </div>
      
      <div class="actions">
        <button class="btn primary btn-play-theme" data-id="${theme.id}">
          🎯 Jouer
        </button>
        <button class="btn btn-export-theme" data-id="${theme.id}">
          💾 Exporter
        </button>
        <button class="btn ghost btn-delete-theme" data-id="${theme.id}" style="color: var(--danger);">
          🗑️ Supprimer
        </button>
      </div>
    `;
    
    // Événements
    const playBtn = card.querySelector('.btn-play-theme');
    playBtn?.addEventListener('click', () => {
      startTheme(theme.id, 'practice');
    });
    
    const exportBtn = card.querySelector('.btn-export-theme');
    exportBtn?.addEventListener('click', () => {
      exportCustomTheme(theme.id);
    });
    
    const deleteBtn = card.querySelector('.btn-delete-theme');
    deleteBtn?.addEventListener('click', () => {
      deleteCustomThemeWithConfirmation(theme.id, theme.title);
    });
    
    container.appendChild(card);
  });
}

/**
 * Supprime un thème avec confirmation
 */
function deleteCustomThemeWithConfirmation(themeId, themeTitle) {
  const confirmed = confirm(
    `⚠️ Supprimer le thème "${themeTitle}" ?\n\n` +
    `Cette action est irréversible. Toutes les données de ce thème seront perdues.`
  );
  
  if (!confirmed) return;
  
  const success = deleteCustomTheme(themeId);
  
  if (success) {
    // Supprimer aussi les erreurs associées
    const errors = loadErrors();
    if (errors[themeId]) {
      delete errors[themeId];
      saveErrors(errors);
    }
    
    // Rafraîchir l'affichage
    renderCustomThemesList();
    renderThemes();
    
    alert(`✅ Thème "${themeTitle}" supprimé avec succès`);
  } else {
    alert('❌ Erreur lors de la suppression du thème');
  }
}

/**
 * Compte le nombre total de thèmes personnalisés
 * @returns {number} Nombre de thèmes personnalisés
 */
function getCustomThemesCount() {
  return Object.keys(loadCustomThemes()).length;
}

/**
 * Obtient des statistiques sur les thèmes personnalisés
 * @returns {Object} Statistiques
 */
function getCustomThemesStats() {
  const themes = Object.values(loadCustomThemes());
  const totalQuestions = themes.reduce((sum, theme) => sum + (theme.questions?.length || 0), 0);
  
  return {
    count: themes.length,
    totalQuestions,
    averageQuestions: themes.length > 0 ? Math.round(totalQuestions / themes.length) : 0
  };
}
