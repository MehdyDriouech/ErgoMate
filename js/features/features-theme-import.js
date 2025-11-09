// js/features/features-theme-import.js
// Interface d'import de thèmes avec drag & drop

///////////////////////////
// INTERFACE D'IMPORT    //
///////////////////////////

let currentImportTheme = null;

/**
 * Initialise l'interface d'import
 */
function initThemeImport() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-theme-import');
  const selectButton = document.getElementById('btn-select-file');
  
  if (!dropZone || !fileInput) return;
  
  // ✅ AJOUT : Protection globale contre l'ouverture de fichiers
  // Empêcher le navigateur d'ouvrir les fichiers glissés n'importe où sur la page
  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, preventDefaults, false);
  });
  
  // Drag & Drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
  });
  
  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleThemeFileUpload(file);
    }
  });
  
  // Bouton de sélection
  selectButton?.addEventListener('click', () => {
    fileInput.click();
  });
  
  // Input file
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleThemeFileUpload(file);
    }
  });
  
  // Bouton de confirmation d'import
  const confirmBtn = document.getElementById('btn-confirm-import');
  confirmBtn?.addEventListener('click', confirmThemeImport);
  
  // Bouton de fermeture
  const closeBtn = document.getElementById('btn-import-close');
  closeBtn?.addEventListener('click', closeThemeImport);
  
  // Boutons de copie
  initCopyButtons();
}

/**
 * Initialise les boutons de copie pour le JSON et le prompt
 */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('.btn-copy-json');
  
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.getAttribute('data-target');
      const targetElement = document.getElementById(targetId);
      
      if (!targetElement) return;
      
      const textToCopy = targetElement.tagName === 'TEXTAREA' 
        ? targetElement.value 
        : targetElement.textContent;
      
      try {
        await navigator.clipboard.writeText(textToCopy);
        
        // Feedback visuel
        const originalText = btn.textContent;
        btn.textContent = '✅ Copié !';
        btn.style.background = '#10b981';
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 2000);
      } catch (err) {
        console.error('Erreur de copie:', err);
        alert('❌ Erreur lors de la copie. Veuillez copier manuellement.');
      }
    });
  });
}

/**
 * Gère l'upload d'un fichier de thème
 */
async function handleThemeFileUpload(file) {
  // Réinitialiser l'état
  currentImportTheme = null;
  hideElement('theme-preview');
  hideElement('validation-errors');
  hideElement('btn-confirm-import');
  
  // Validation du type de fichier
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) {
    showValidationErrors([typeValidation.error]);
    return;
  }
  
  // Validation de la taille
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    showValidationErrors([sizeValidation.error]);
    return;
  }
  
  // Lire le fichier
  try {
    const content = await readFileAsText(file);
    let themeData;
    
    try {
      themeData = JSON.parse(content);
    } catch (e) {
      showValidationErrors(['❌ Fichier JSON invalide. Vérifiez la syntaxe.']);
      return;
    }
    
    // Valider le thème
    const validation = validateTheme(themeData);
    
    if (!validation.valid) {
      showValidationErrors(validation.errors);
      if (validation.warnings.length > 0) {
        showValidationWarnings(validation.warnings);
      }
      return;
    }
    
    // Thème valide - Afficher la prévisualisation
    currentImportTheme = validation.theme;
    showThemePreview(validation.theme);
    
    if (validation.warnings.length > 0) {
      showValidationWarnings(validation.warnings);
    }
    
    // Afficher le bouton de confirmation
    showElement('btn-confirm-import');
    
  } catch (e) {
    showValidationErrors([`❌ Erreur lors de la lecture du fichier : ${e.message}`]);
  }
}

/**
 * Lit un fichier comme texte
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsText(file);
  });
}

/**
 * Affiche la prévisualisation d'un thème
 */
function showThemePreview(theme) {
  const preview = document.getElementById('theme-preview');
  if (!preview) return;
  
  const qCount = theme.questions.length;
  const mcqCount = theme.questions.filter(q => q.type === 'mcq').length;
  const tfCount = theme.questions.filter(q => q.type === 'true_false').length;
  const fillCount = theme.questions.filter(q => q.type === 'fill_in').length;
  
  const tagsHtml = (theme.tags || []).length > 0
    ? theme.tags.map(tag => `<span class="badge">${tag}</span>`).join('')
    : '<span class="muted">Aucun tag</span>';
  
  preview.innerHTML = `
    <div class="card" style="background: var(--accent); color: white;">
      <h3 style="margin: 0 0 16px 0; color: white;">
        ✨ Prévisualisation du thème
      </h3>
      
      <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; font-size: 1.2rem; color: white;">${theme.title}</h4>
        ${theme.description ? `<p style="margin: 0; opacity: 0.9;">${theme.description}</p>` : ''}
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 16px;">
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
            <div style="font-size: 2rem; margin-bottom: 4px;">✓✗</div>
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
  `;
  
  showElement('theme-preview');
}

/**
 * Affiche les erreurs de validation
 */
function showValidationErrors(errors) {
  const container = document.getElementById('validation-errors');
  if (!container) return;
  
  container.innerHTML = `
    <div class="card" style="border-left: 4px solid var(--danger);">
      <h4 style="color: var(--danger); margin: 0 0 12px 0;">
        ❌ Erreurs de validation
      </h4>
      <ul style="margin: 0; padding-left: 20px;">
        ${errors.map(err => `<li style="margin-bottom: 8px;">${err}</li>`).join('')}
      </ul>
      <p style="margin: 16px 0 0 0;" class="muted">
        💡 Corrigez ces erreurs dans votre fichier JSON et réessayez.
      </p>
    </div>
  `;
  
  showElement('validation-errors');
}

/**
 * Affiche les avertissements de validation
 */
function showValidationWarnings(warnings) {
  const container = document.getElementById('validation-errors');
  if (!container) return;
  
  const existingContent = container.innerHTML;
  
  container.innerHTML = existingContent + `
    <div class="card" style="border-left: 4px solid var(--warning); margin-top: 12px;">
      <h4 style="color: var(--warning); margin: 0 0 12px 0;">
        ⚠️ Avertissements
      </h4>
      <ul style="margin: 0; padding-left: 20px;">
        ${warnings.map(warn => `<li style="margin-bottom: 8px;">${warn}</li>`).join('')}
      </ul>
      <p style="margin: 16px 0 0 0;" class="muted">
        Ces avertissements n'empêchent pas l'import, mais il est recommandé de les corriger.
      </p>
    </div>
  `;
  
  showElement('validation-errors');
}

/**
 * Confirme et effectue l'import du thème
 */
function confirmThemeImport() {
  if (!currentImportTheme) {
    alert('❌ Aucun thème à importer');
    return;
  }
  
  try {
    // Vérifier si un thème avec le même ID existe déjà
    const existingTheme = getCustomTheme(currentImportTheme.id);
    if (existingTheme) {
      const overwrite = confirm(
        `⚠️ Un thème avec l'ID "${currentImportTheme.id}" existe déjà.\n\n` +
        `Voulez-vous le remplacer ?\n\n` +
        `Cette action est irréversible.`
      );
      
      if (!overwrite) {
        // Générer un nouvel ID
        currentImportTheme.id = generateUniqueThemeId();
        alert(`ℹ️ Le thème sera importé avec un nouvel ID : ${currentImportTheme.id}`);
      }
    }
    
    // ✅ Normaliser le thème avant sauvegarde
    const normalizedTheme = normalizeCustomTheme(currentImportTheme);
    
    // Sauvegarder le thème
    saveCustomTheme(normalizedTheme);
    
    // Message de succès
    const qCount = normalizedTheme.questions.length;
    alert(
      `✅ Thème importé avec succès !\n\n` +
      `📚 ${normalizedTheme.title}\n` +
      `❓ ${qCount} question${qCount > 1 ? 's' : ''}\n\n` +
      `Le thème est maintenant disponible dans la liste.`
    );
    
    // Fermer la vue d'import et retourner aux thèmes
    closeThemeImport();
    showThemes();
    
  } catch (e) {
    alert(`❌ Erreur lors de l'import : ${e.message}`);
  }
}

/**
 * Ferme la vue d'import
 */
function closeThemeImport() {
  currentImportTheme = null;
  
  // Réinitialiser l'input file
  const fileInput = document.getElementById('file-theme-import');
  if (fileInput) fileInput.value = '';
  
  // Cacher les éléments
  hideElement('theme-preview');
  hideElement('validation-errors');
  hideElement('btn-confirm-import');
  
  // Retourner à la vue des thèmes
  showThemes();
}

/**
 * Affiche la vue d'import
 */
function showThemeImportView() {
  currentImportTheme = null;
  hideElement('theme-preview');
  hideElement('validation-errors');
  hideElement('btn-confirm-import');
  
  showView('importTheme');  // ✅ CORRECTION: utiliser 'importTheme' au lieu de 'import-theme'
}

/**
 * Utilitaires pour afficher/cacher des éléments
 */
function showElement(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = false;
}

function hideElement(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}
