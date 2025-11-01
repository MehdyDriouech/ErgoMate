// js/features/features-pdf-import.js
// Gestion de l'upload et de l'extraction de texte depuis un PDF

///////////////////////////
// ÉTAT DE L'IMPORT PDF  //
///////////////////////////

const pdfImportState = {
  currentFile: null,
  extractedText: '',
  metadata: null,
  step: 1 // 1=upload, 2=config, 3=preview
};

///////////////////////////
// INITIALISATION        //
///////////////////////////

/**
 * Initialise l'interface d'import PDF
 */
function initPdfImport() {
  // Protection globale contre l'ouverture de fichiers glissés
  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, preventDefaults, false);
  });
  
  // Initialiser les listeners une fois le DOM chargé
  setTimeout(() => {
    initPdfUploadListeners();
    initPdfNavigationListeners();
  }, 100);
}

/**
 * Initialise les listeners pour l'upload
 */
function initPdfUploadListeners() {
  const dropZone = document.getElementById('pdf-drop-zone');
  const fileInput = document.getElementById('file-pdf-import');
  const selectButton = document.getElementById('btn-select-pdf');
  
  // ✅ Bouton de sélection - TOUJOURS attacher ce listener
  if (selectButton && fileInput) {
    selectButton.addEventListener('click', () => {
      fileInput.click();
    });
  }
  
  // ✅ Input file - TOUJOURS attacher ce listener
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        handlePdfUpload(file);
      }
    });
  }
  
  // ✅ Drag & Drop - seulement si dropZone existe
  if (!dropZone) return;
  
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
      handlePdfUpload(file);
    }
  });
}

/**
 * Initialise les listeners de navigation
 */
function initPdfNavigationListeners() {
  const closeBtn = document.getElementById('btn-pdf-close');
  const backBtn = document.getElementById('btn-pdf-back');
  
  closeBtn?.addEventListener('click', closePdfImport);
  backBtn?.addEventListener('click', () => {
    if (pdfImportState.step > 1) {
      showPdfStep(pdfImportState.step - 1);
    } else {
      closePdfImport();
    }
  });
}

///////////////////////////
// GESTION DES VUES      //
///////////////////////////

/**
 * Affiche la vue d'import PDF
 */
function showPdfImportView() {
  // Réinitialiser l'état
  pdfImportState.currentFile = null;
  pdfImportState.extractedText = '';
  pdfImportState.metadata = null;
  pdfImportState.step = 1;
  
  // Réinitialiser l'input file
  const fileInput = document.getElementById('file-pdf-import');
  if (fileInput) fileInput.value = '';
  
  // Réinitialiser l'interface
  hidePdfError();
  showPdfStep(1);
  
  // Afficher la vue
  showView('pdfImport');
}

/**
 * Affiche une étape spécifique
 */
function showPdfStep(stepNumber) {
  pdfImportState.step = stepNumber;
  
  // Cacher toutes les étapes
  for (let i = 1; i <= 3; i++) {
    const step = document.getElementById(`pdf-step-${i}`);
    if (step) {
      step.hidden = (i !== stepNumber);
      step.classList.toggle('active', i === stepNumber);
    }
  }
  
  // Mettre à jour le titre
  const titles = {
    1: '📄 Étape 1 : Importer votre PDF',
    2: '⚙️ Étape 2 : Configuration',
    3: '🎯 Étape 3 : Prévisualisation'
  };
  
  const titleEl = document.getElementById('pdf-import-title');
  if (titleEl) titleEl.textContent = titles[stepNumber] || 'Import PDF';
}

/**
 * Ferme la vue d'import PDF
 */
function closePdfImport() {
  pdfImportState.currentFile = null;
  pdfImportState.extractedText = '';
  pdfImportState.metadata = null;
  showThemes();
}

///////////////////////////
// GESTION DE L'UPLOAD   //
///////////////////////////

/**
 * Gère l'upload d'un fichier PDF
 */
async function handlePdfUpload(file) {
  hidePdfError();
  
  // Validation du type
  if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
    showPdfError('❌ Seuls les fichiers PDF sont acceptés');
    return;
  }
  
  // Validation de la taille (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    showPdfError(`❌ Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum: 10MB`);
    return;
  }
  
  pdfImportState.currentFile = file;
  
  // Afficher un loader
  showPdfLoader('📖 Lecture du PDF en cours...');
  
  try {
    // Extraire le texte du PDF
    const result = await extractTextFromPdf(file);
    
    if (!result.text || result.text.trim().length === 0) {
      hidePdfLoader();
      showPdfError('❌ Aucun texte trouvé dans le PDF. Assurez-vous qu\'il ne s\'agit pas d\'un PDF scanné ou composé uniquement d\'images.');
      return;
    }
    
    // Vérifier la longueur minimale (au moins 100 caractères)
    if (result.text.trim().length < 100) {
      hidePdfLoader();
      showPdfError('❌ Le contenu du PDF est trop court pour générer des questions (minimum 100 caractères)');
      return;
    }
    
    pdfImportState.extractedText = result.text;
    pdfImportState.metadata = result.metadata;
    
    hidePdfLoader();
    
    // Passer à l'étape de configuration
    showConfigStep();
    
  } catch (error) {
    hidePdfLoader();
    console.error('Erreur lors de l\'extraction:', error);
    showPdfError(`❌ Erreur lors de la lecture du PDF: ${error.message}`);
  }
}

/**
 * Extrait le texte d'un fichier PDF avec PDF.js
 */
async function extractTextFromPdf(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async function(e) {
      try {
        const typedArray = new Uint8Array(e.target.result);
        
        // Charger le document PDF
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        
        let fullText = '';
        const metadata = {
          numPages: pdf.numPages,
          fileName: file.name,
          fileSize: file.size
        };
        
        // Extraire le texte de chaque page
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        
        resolve({
          text: fullText.trim(),
          metadata
        });
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

///////////////////////////
// ÉTAPE 2: CONFIG       //
///////////////////////////

/**
 * Affiche l'étape de configuration
 */
function showConfigStep() {
  // Afficher l'étape 2
  showPdfStep(2);
  
  // Afficher l'aperçu du contenu
  displayTextPreview();
  
  // Initialiser les listeners de configuration
  initConfigListeners();
}

/**
 * Affiche un aperçu du texte extrait
 */
function displayTextPreview() {
  const previewEl = document.getElementById('pdf-text-preview');
  if (!previewEl) return;
  
  const text = pdfImportState.extractedText;
  const preview = text.length > 500 ? text.substring(0, 500) + '...' : text;
  const wordCount = text.split(/\s+/).length;
  const charCount = text.length;
  
  previewEl.innerHTML = `
    <div class="card" style="background: var(--bg-secondary);">
      <h4 style="margin: 0 0 12px 0;">📄 Aperçu du contenu</h4>
      <div style="background: var(--card); padding: 12px; border-radius: 8px; margin-bottom: 12px; max-height: 200px; overflow-y: auto; font-size: 0.9rem; line-height: 1.6;">
        ${preview.replace(/\n/g, '<br>')}
      </div>
      <div class="meta">
        <span class="badge">📊 ${wordCount.toLocaleString()} mots</span>
        <span class="badge">📝 ${charCount.toLocaleString()} caractères</span>
        <span class="badge">📄 ${pdfImportState.metadata?.numPages || '?'} page${(pdfImportState.metadata?.numPages || 0) > 1 ? 's' : ''}</span>
      </div>
    </div>
  `;
}

/**
 * Initialise les listeners de configuration
 */
function initConfigListeners() {
  // Slider pour le nombre de questions
  const slider = document.getElementById('pdf-question-count');
  const sliderValue = document.getElementById('pdf-question-count-value');
  
  if (slider && sliderValue) {
    slider.addEventListener('input', (e) => {
      sliderValue.textContent = e.target.value;
    });
  }
  
  // Bouton de génération
  const generateBtn = document.getElementById('btn-generate-questions');
  generateBtn?.addEventListener('click', handleGenerateQuestions);
}

/**
 * Démarre la génération des questions
 */
async function handleGenerateQuestions() {
  // Récupérer la configuration
  const config = getPdfGenerationConfig();
  
  if (config.types.length === 0) {
    showPdfError('❌ Veuillez sélectionner au moins un type de question');
    return;
  }
  
  hidePdfError();
  
  // Passer à l'étape de génération
  showPdfStep(3);
  showPdfLoader('🤖 Génération des questions par Qwen AI...<br><small>Cela peut prendre plusieurs minutes</small>');
  
  // Appeler la fonction de génération (dans features-pdf-generator.js)
  try {
    await generateQuestionsFromText(pdfImportState.extractedText, config);
  } catch (error) {
    hidePdfLoader();
    showPdfError(`❌ Erreur lors de la génération: ${error.message}`);
  }
}

/**
 * Récupère la configuration de génération
 */
function getPdfGenerationConfig() {
  const questionCount = parseInt(document.getElementById('pdf-question-count')?.value || 20);
  
  const types = [];
  if (document.getElementById('pdf-type-mcq')?.checked) types.push('mcq');
  if (document.getElementById('pdf-type-tf')?.checked) types.push('true_false');
  if (document.getElementById('pdf-type-fill')?.checked) types.push('fill_in');
  
  const difficulty = document.querySelector('input[name="pdf-difficulty"]:checked')?.value || 'moyen';
  
  return {
    questionCount,
    types,
    difficulty
  };
}

///////////////////////////
// UTILITAIRES UI        //
///////////////////////////

/**
 * Affiche un message d'erreur
 */
function showPdfError(message) {
  const errorEl = document.getElementById('pdf-error');
  if (errorEl) {
    errorEl.innerHTML = `
      <div class="card" style="border-left: 4px solid var(--danger); background: rgba(239, 68, 68, 0.05);">
        ${message}
      </div>
    `;
    errorEl.hidden = false;
  }
}

/**
 * Cache le message d'erreur
 */
function hidePdfError() {
  const errorEl = document.getElementById('pdf-error');
  if (errorEl) errorEl.hidden = true;
}

/**
 * Affiche un loader
 */
function showPdfLoader(message) {
  const loaderEl = document.getElementById('pdf-loader');
  if (loaderEl) {
    loaderEl.innerHTML = `
      <div class="card" style="text-align: center; padding: 32px; background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%);">
        <div style="font-size: 3rem; margin-bottom: 16px; animation: pulse 2s infinite;">⏳</div>
        <p style="margin: 0; font-weight: 500;">${message}</p>
      </div>
    `;
    loaderEl.hidden = false;
  }
}

/**
 * Cache le loader
 */
function hidePdfLoader() {
  const loaderEl = document.getElementById('pdf-loader');
  if (loaderEl) loaderEl.hidden = true;
}

/**
 * Animation pulse pour le loader
 */
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);
}
