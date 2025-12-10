// js/features/features-fichederevision.js
// Mode fiches de révision : consultation de fiches synthétiques organisées par sections

//////////////////////////
// FICHES DE RÉVISION   //
//////////////////////////

// État spécifique aux fiches de révision
const revisionState = {
  allCards: [],         // Toutes les cartes à plat
  currentCardIndex: 0,  // Index de la carte actuelle
  understood: {},       // { cardId: boolean } - Cartes comprises
  toReview: {},         // { cardId: boolean } - Cartes à revoir
};

//////////////////////////
// UTILITAIRES          //
//////////////////////////

/**
 * Échappe les caractères HTML pour éviter les injections
 */
function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

//////////////////////////
// RENDU DES FICHES     //
//////////////////////////

function renderRevisionHeader() {
  const t = state.currentTheme;
  if (els.revisionThemeTitle) {
    els.revisionThemeTitle.textContent = t?.title || t?.id || '';
  }
  if (els.revisionTitle) {
    els.revisionTitle.textContent = `📖 Fiches de révision - ${t?.title || ''}`;
  }
  updateRevisionProgress();
}

function updateRevisionProgress() {
  if (!els.revisionProgress) return;
  const current = revisionState.currentCardIndex + 1;
  const total = revisionState.allCards.length;
  
  // Compter les cartes comprises et à revoir
  const understoodCount = Object.values(revisionState.understood).filter(Boolean).length;
  const toReviewCount = Object.values(revisionState.toReview).filter(Boolean).length;
  
  els.revisionProgress.innerHTML = `
    <span>Fiche ${current} / ${total}</span>
    <span style="margin-left: 16px;">
      <span class="badge success">✓ ${understoodCount}</span>
      <span class="badge warning">⟳ ${toReviewCount}</span>
    </span>
  `;
}

/**
 * Rendu adaptatif selon le type de carte
 */
function renderRevisionCard() {
  const card = revisionState.allCards[revisionState.currentCardIndex];
  if (!card || !els.revisionCard) return;

  updateRevisionProgress();

  let html = '';

  // Rendu selon le type de carte
  switch (card.type) {
    case 'definition':
      html = renderDefinitionCard(card);
      break;
    case 'etymology':
      html = renderEtymologyCard(card);
      break;
    case 'timeline':
      html = renderTimelineCard(card);
      break;
    case 'summary':
      html = renderSummaryCard(card);
      break;
    case 'focus':
      html = renderFocusCard(card);
      break;
    case 'comparison':
      html = renderComparisonCard(card);
      break;
    case 'key_takeaways':
      html = renderKeyTakeawaysCard(card);
      break;
    case 'mnemonic':
      html = renderMnemonicCard(card);
      break;
    case 'diagram_mermaid':
      html = renderMermaidCard(card);
      break;
    case 'qna':
      html = renderQnACard(card);
      break;
    case 'case_study':
      html = renderCaseStudyCard(card);
      break;
    case 'exercise':
      html = renderExerciseCard(card);
      break;
    case 'diagram_textual':
      html = renderDiagramTextualCard(card);
      break;
    default:
      html = renderGenericCard(card);
  }

  els.revisionCard.innerHTML = html;
  
  // Rerender Mermaid après injection DOM
  if (card.type === 'diagram_mermaid' && window.mermaid) {
    // Utiliser setTimeout pour s'assurer que le DOM est prêt
    setTimeout(() => {
      window.mermaid.run({
        querySelector: '.mermaid'
      }).catch(err => {
        console.error('Erreur rendu Mermaid:', err);
      });
    }, 0);
  }
  
  // Mettre à jour l'état des boutons
  updateRevisionButtons();
}

/**
 * Rendu pour une carte de type "definition"
 */
function renderDefinitionCard(card) {
  const keyPoints = card.keyPoints?.map(point => 
    `<li>${escapeHtml(point)}</li>`
  ).join('') || '';

  const examples = card.examples?.map(ex =>
    `<li>${escapeHtml(ex)}</li>`
  ).join('') || '';

  const synonyms = card.synonyms?.length ? `
    <p class="muted"><strong>Synonymes :</strong> ${card.synonyms.map(s => escapeHtml(s)).join(', ')}</p>
  ` : '';

  return `
    <div class="revision-card-header">
      <span class="badge info">${escapeHtml(card.section?.title || 'Définition')}</span>
      <h3>${escapeHtml(card.title)}</h3>
    </div>
    <div class="revision-card-body">
      <p class="card-content">${escapeHtml(card.definition || card.content)}</p>
      ${synonyms}
      ${examples ? `
        <div class="examples">
          <h4>📌 Exemples</h4>
          <ul>${examples}</ul>
        </div>
      ` : ''}
      ${keyPoints ? `
        <div class="key-points">
          <h4>📌 Points clés</h4>
          <ul>${keyPoints}</ul>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Rendu pour une carte de type "etymology"
 */
function renderEtymologyCard(card) {
  const breakdown = card.breakdown?.map(item => `
    <div class="etymology-item">
      <strong>${escapeHtml(item.term)}</strong>
      <span class="muted"> → ${escapeHtml(item.meaning)}</span>
    </div>
  `).join('') || '';

  return `
    <div class="revision-card-header">
      <span class="badge info">${escapeHtml(card.section?.title || 'Étymologie')}</span>
      <h3>${escapeHtml(card.title)}</h3>
    </div>
    <div class="revision-card-body">
      <p class="card-content">${escapeHtml(card.content)}</p>
      ${breakdown ? `
        <div class="etymology-breakdown">
          ${breakdown}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Rendu pour une carte de type "timeline"
 */
function renderTimelineCard(card) {
  const events = card.timeline?.map(event => `
    <div class="timeline-event">
      <div class="timeline-period">${escapeHtml(event.period || event.date)}</div>
      <div class="timeline-content">
        ${event.actors ? `<strong>${escapeHtml(event.actors)}</strong>` : ''}
        <p>${escapeHtml(event.event || event.description)}</p>
      </div>
    </div>
  `).join('') || '';

  return `
    <div class="revision-card-header">
      <span class="badge info">${escapeHtml(card.section?.title || 'Chronologie')}</span>
      <h3>${escapeHtml(card.title)}</h3>
    </div>
    <div class="revision-card-body">
      <div class="timeline">
        ${events}
      </div>
      ${card.summary || card.keyTakeaway ? `
        <div class="key-takeaway">
          <strong>💡 À retenir :</strong> ${escapeHtml(card.summary || card.keyTakeaway)}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Rendu pour une carte de type "summary"
 */
function renderSummaryCard(card) {
  let items = '';
  
  if (card.items) {
    items = card.items.map(item => `
      <div class="summary-item">
        <h4>${escapeHtml(item.title || item.name)}</h4>
        <p>${escapeHtml(item.content || item.description || item.definition)}</p>
      </div>
    `).join('');
  } else if (card.domains) {
    items = card.domains.map(domain => `
      <div class="summary-item">
        <h4>${escapeHtml(domain.name)}</h4>
        <p><strong>Focus :</strong> ${escapeHtml(domain.focus)}</p>
        <p class="muted">${escapeHtml(domain.details)}</p>
      </div>
    `).join('');
  } else if (card.disciplines) {
    items = card.disciplines.map(disc => `
      <div class="summary-item">
        <h4>${escapeHtml(disc.name)}</h4>
        <p>${escapeHtml(disc.definition)}</p>
      </div>
    `).join('');
  }

  const keyPoints = card.keyPoints?.map(point => 
    `<li>${escapeHtml(point)}</li>`
  ).join('') || '';

  return `
    <div class="revision-card-header">
      <span class="badge info">${escapeHtml(card.section?.title || 'Résumé')}</span>
      <h3>${escapeHtml(card.title)}</h3>
    </div>
    <div class="revision-card-body">
      ${card.content ? `<p class="card-content">${escapeHtml(card.content)}</p>` : ''}
      ${items ? `<div class="summary-list">${items}</div>` : ''}
      ${keyPoints ? `
        <div class="key-points">
          <h4>📌 Points clés</h4>
          <ul>${keyPoints}</ul>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Rendu pour une carte de type "focus"
 */
function renderFocusCard(card) {
  let details = '';
  
  if (card.principles) {
    details = card.principles.map(p => `
      <div class="focus-principle">
        <h4>${escapeHtml(p.concept)}</h4>
        <p>${escapeHtml(p.explanation)}</p>
        ${p.example ? `<p class="muted"><em>Exemple : ${escapeHtml(p.example)}</em></p>` : ''}
      </div>
    `).join('');
  } else if (card.keyPoints) {
    details = `<ul class="key-points-list">
      ${card.keyPoints.map(point => `<li>${escapeHtml(point)}</li>`).join('')}
    </ul>`;
  }

  const intervention = card.intervention ? 
    (typeof card.intervention === 'string' 
      ? `<p><strong>Intervention :</strong> ${escapeHtml(card.intervention)}</p>`
      : `<ul>${card.intervention.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`) : '';

  const objective = card.objective || card.objectives ? 
    `<p><strong>Objectif :</strong> ${escapeHtml(card.objective || card.objectives)}</p>` : '';

  const formation = card.formation ? 
    `<p><strong>Formation :</strong> ${escapeHtml(card.formation)}</p>` : '';

  const examples = card.examples ? `
    <div class="examples">
      <h4>Exemples :</h4>
      <ul>${card.examples.map(ex => `<li>${escapeHtml(ex)}</li>`).join('')}</ul>
    </div>
  ` : '';

  return `
    <div class="revision-card-header">
      <span class="badge info">${escapeHtml(card.section?.title || 'Focus')}</span>
      <h3>${escapeHtml(card.title)}</h3>
    </div>
    <div class="revision-card-body">
      <p class="card-content">${escapeHtml(card.content)}</p>
      ${objective}
      ${intervention}
      ${formation}
      ${details}
      ${examples}
      ${card.keyTakeaway ? `
        <div class="key-takeaway">
          <strong>💡 À retenir :</strong> ${escapeHtml(card.keyTakeaway)}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Rendu pour une carte de type "comparison"
 */
function renderComparisonCard(card) {
  let comparisonContent = '';

  if (card.rows && card.columns) {
    // Format tableau structuré
    const headers = card.columns.map(col => `<th>${escapeHtml(col)}</th>`).join('');
    const rows = card.rows.map(row => {
      const cells = row.values.map(val => `<td>${escapeHtml(val)}</td>`).join('');
      return `<tr><th>${escapeHtml(row.label)}</th>${cells}</tr>`;
    }).join('');

    comparisonContent = `
      <table class="comparison-table">
        <thead>
          <tr><th></th>${headers}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } else if (card.professionals) {
    // Format professions (ancien format)
    comparisonContent = card.professionals.map(prof => `
      <div class="comparison-item">
        <h4>${escapeHtml(prof.title)}</h4>
        <p><strong>Formation :</strong> ${escapeHtml(prof.formation)}</p>
        <p><strong>Statut :</strong> ${escapeHtml(prof.status)}</p>
        <p><strong>Prescription :</strong> ${prof.canPrescribe ? '✅ Oui' : '❌ Non'}</p>
        <p><strong>Remboursement :</strong> ${prof.reimbursement ? '✅ Oui' : '❌ Non'}</p>
        ${prof.specificities ? `<p class="muted">${escapeHtml(prof.specificities)}</p>` : ''}
      </div>
    `).join('');
  }

  return `
    <div class="revision-card-header">
      <span class="badge info">${escapeHtml(card.section?.title || 'Comparaison')}</span>
      <h3>${escapeHtml(card.title)}</h3>
    </div>
    <div class="revision-card-body">
      ${comparisonContent}
      ${card.keyDifference ? `
        <div class="key-takeaway">
          <strong>💡 Différence clé :</strong> ${escapeHtml(card.keyDifference)}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Rendu pour une carte de type "key_takeaways"
 */
function renderKeyTakeawaysCard(card) {
  const takeaways = card.takeaways?.map(item => {
    if (typeof item === 'string') {
      return `<li>${escapeHtml(item)}</li>`;
    }
    return `
      <li>
        <strong>${escapeHtml(item.point)}</strong>
        ${item.details ? `<br><span class="muted">${escapeHtml(item.details)}</span>` : ''}
      </li>
    `;
  }).join('') || '';

  return `
    <div class="revision-card-header">
      <span class="badge success">${escapeHtml(card.section?.title || 'Points clés')}</span>
      <h3>${escapeHtml(card.title)}</h3>
    </div>
    <div class="revision-card-body">
      <div class="key-takeaways">
        <ul>${takeaways}</ul>
      </div>
    </div>
  `;
}

/**
 * Rendu pour une carte de type "mnemonic"
 */
function renderMnemonicCard(card) {
  const mnemonics = card.mnemonics?.map(item => `
    <div class="mnemonic-item">
      <h4>🧠 ${escapeHtml(item.concept)}</h4>
      <div class="mnemonic-technique">${escapeHtml(item.technique)}</div>
      <ul class="mnemonic-breakdown">
        ${item.breakdown.map(line => `<li>${escapeHtml(line)}</li>`).join('')}
      </ul>
    </div>
  `).join('') || '';

  return `
    <div class="revision-card-header">
      <span class="badge info">${escapeHtml(card.section?.title || 'Mnémotechnique')}</span>
      <h3>${escapeHtml(card.title)}</h3>
    </div>
    <div class="revision-card-body">
      <div class="mnemonics-list">
        ${mnemonics}
      </div>
    </div>
  `;
}

/**
 * Rendu pour une carte de type "diagram_mermaid"
 */
function renderMermaidCard(card) {
  const mermaidId = `mermaid-${card.id}`;
  
  return `
    <div class="revision-card-header">
      <span class="badge info">${escapeHtml(card.section?.title || 'Diagramme')}</span>
      <h3>${escapeHtml(card.title)}</h3>
    </div>
    <div class="revision-card-body">
      <div class="mermaid" id="${mermaidId}">
${card.mermaid}
      </div>
      ${card.note ? `<p class="muted" style="margin-top:12px;">${escapeHtml(card.note)}</p>` : ''}
    </div>
  `;
}

/**
 * Rendu pour une carte de type "qna" (Questions-Réponses)
 */
function renderQnACard(card) {
  const qaPairs = card.qaPairs?.map(pair => `
    <div class="qna-item">
      <div class="qna-question"><strong>Q :</strong> ${escapeHtml(pair.question)}</div>
      <div class="qna-answer"><strong>R :</strong> ${escapeHtml(pair.answer)}</div>
    </div>
  `).join('') || '';

  return `
    <div class="revision-card-header">
      <span class="badge info">${escapeHtml(card.section?.title || 'Q&A')}</span>
      <h3>${escapeHtml(card.title)}</h3>
    </div>
    <div class="revision-card-body">
      <div class="qna-list">
        ${qaPairs}
      </div>
    </div>
  `;
}

/**
 * Rendu pour une carte de type "case_study" (Étude de cas)
 */
function renderCaseStudyCard(card) {
  return `
    <div class="revision-card-header">
      <span class="badge warning">${escapeHtml(card.section?.title || 'Cas clinique')}</span>
      <h3>${escapeHtml(card.title)}</h3>
    </div>
    <div class="revision-card-body">
      ${card.context ? `
        <div class="case-section">
          <h4>📋 Contexte</h4>
          <p>${escapeHtml(card.context)}</p>
        </div>
      ` : ''}
      ${card.problem ? `
        <div class="case-section">
          <h4>❓ Problématique</h4>
          <p>${escapeHtml(card.problem)}</p>
        </div>
      ` : ''}
      ${card.intervention ? `
        <div class="case-section">
          <h4>🎯 Intervention</h4>
          <p>${escapeHtml(card.intervention)}</p>
        </div>
      ` : ''}
      ${card.outcome ? `
        <div class="case-section">
          <h4>✅ Résultat</h4>
          <p>${escapeHtml(card.outcome)}</p>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Rendu pour une carte de type "exercise" (Exercice)
 */
function renderExerciseCard(card) {
  return `
    <div class="revision-card-header">
      <span class="badge warning">${escapeHtml(card.section?.title || 'Exercice')}</span>
      <h3>${escapeHtml(card.title)}</h3>
    </div>
    <div class="revision-card-body">
      <div class="exercise-prompt">
        <h4>📝 Consigne</h4>
        <p>${escapeHtml(card.prompt)}</p>
      </div>
      <details class="exercise-answer">
        <summary><strong>Voir la réponse attendue</strong></summary>
        <div style="margin-top: 12px;">
          <p><strong>Réponse :</strong> ${escapeHtml(card.expectedAnswer)}</p>
          ${card.rationale ? `<p class="muted" style="margin-top: 8px;"><strong>Explication :</strong> ${escapeHtml(card.rationale)}</p>` : ''}
        </div>
      </details>
    </div>
  `;
}

/**
 * Rendu pour une carte de type "diagram_textual" (Diagramme textuel)
 */
function renderDiagramTextualCard(card) {
  const nodes = card.nodes?.map(node => `
    <div class="diagram-node">
      <strong>${escapeHtml(node.label || node.title)}</strong>
      ${node.description ? `<p class="muted">${escapeHtml(node.description)}</p>` : ''}
    </div>
  `).join('') || '';

  return `
    <div class="revision-card-header">
      <span class="badge info">${escapeHtml(card.section?.title || 'Diagramme')}</span>
      <h3>${escapeHtml(card.title)}</h3>
    </div>
    <div class="revision-card-body">
      <div class="diagram-textual">
        ${nodes}
      </div>
      ${card.note ? `<p class="muted" style="margin-top:12px;">${escapeHtml(card.note)}</p>` : ''}
    </div>
  `;
}

/**
 * Rendu générique pour les types non gérés
 */
function renderGenericCard(card) {
  return `
    <div class="revision-card-header">
      <span class="badge">${escapeHtml(card.section?.title || 'Fiche')}</span>
      <h3>${escapeHtml(card.title)}</h3>
    </div>
    <div class="revision-card-body">
      <p class="card-content">${escapeHtml(card.content || 'Contenu non disponible')}</p>
    </div>
  `;
}

//////////////////////////
// NAVIGATION           //
//////////////////////////

function revisionPrev() {
  if (revisionState.currentCardIndex <= 0) return;
  revisionState.currentCardIndex -= 1;
  renderRevisionCard();
}

function revisionNext() {
  if (revisionState.currentCardIndex >= revisionState.allCards.length - 1) {
    return showRevisionResults();
  }
  revisionState.currentCardIndex += 1;
  renderRevisionCard();
}

function updateRevisionButtons() {
  const card = revisionState.allCards[revisionState.currentCardIndex];
  if (!card) return;

  // Mettre à jour les boutons "J'ai compris" / "À revoir"
  const isUnderstood = revisionState.understood[card.id];
  const isToReview = revisionState.toReview[card.id];

  if (els.btnRevisionUnderstood) {
    els.btnRevisionUnderstood.classList.toggle('active', isUnderstood);
  }
  if (els.btnRevisionToReview) {
    els.btnRevisionToReview.classList.toggle('active', isToReview);
  }

  // Désactiver le bouton précédent si on est au début
  if (els.btnRevisionPrev) {
    els.btnRevisionPrev.disabled = revisionState.currentCardIndex === 0;
  }
}

//////////////////////////
// ACTIONS              //
//////////////////////////

function markAsUnderstood() {
  const card = revisionState.allCards[revisionState.currentCardIndex];
  if (!card) return;

  // Toggle understood
  revisionState.understood[card.id] = !revisionState.understood[card.id];
  
  // Si marqué comme compris, retirer de "à revoir"
  if (revisionState.understood[card.id]) {
    revisionState.toReview[card.id] = false;
  }

  updateRevisionButtons();
  updateRevisionProgress();
}

function markToReview() {
  const card = revisionState.allCards[revisionState.currentCardIndex];
  if (!card) return;

  // Toggle to review
  revisionState.toReview[card.id] = !revisionState.toReview[card.id];
  
  // Si marqué à revoir, retirer de "compris"
  if (revisionState.toReview[card.id]) {
    revisionState.understood[card.id] = false;
  }

  updateRevisionButtons();
  updateRevisionProgress();
}

//////////////////////////
// DÉMARRAGE            //
//////////////////////////

async function startRevision(themeId) {
  const theme = state.themes.find(t => t.id === themeId);
  if (!theme) return;

  state.currentTheme = theme;
  state.mode = 'revision';

  // Charger les données du thème
  let themeData;
  
  try {
    // ✅ CORRECTION : Gérer les thèmes personnalisés différemment
    if (theme.isCustom) {
      // Pour les thèmes personnalisés, les données sont dans l'objet lui-même
      console.log('📦 Chargement thème personnalisé depuis localStorage');
      themeData = getCustomTheme(themeId);
      
      if (!themeData) {
        throw new Error('Thème personnalisé introuvable dans localStorage');
      }
    } else {
      // Pour les thèmes officiels, charger depuis un fichier externe
      console.log('📂 Chargement thème officiel depuis fichier');
      const url = theme.path || `./data/${theme.file}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erreur de chargement du fichier');
      themeData = await response.json();
    }
  } catch (error) {
    alert('❌ Erreur lors du chargement des fiches de révision.');
    console.error('Erreur de chargement:', error);
    return;
  }

  // Vérifier que le thème contient des fiches de révision
  if (!themeData.revision || !themeData.revision.sections) {
    alert('📚 Ce thème ne contient pas de fiches de révision.');
    return;
  }

  // Aplatir toutes les cartes en gardant l'ordre des sections
  const allCards = [];
  const sections = themeData.revision.sections.sort((a, b) => a.order - b.order);
  
  sections.forEach(section => {
    section.cards.forEach(card => {
      allCards.push({
        ...card,
        section: {
          id: section.id,
          title: section.title,
          order: section.order
        }
      });
    });
  });

  if (!allCards.length) {
    alert('📚 Aucune fiche de révision disponible pour ce thème.');
    return;
  }

  // Initialiser l'état
  revisionState.allCards = allCards;
  revisionState.currentCardIndex = 0;
  revisionState.understood = {};
  revisionState.toReview = {};

  // Afficher la vue
  renderRevisionHeader();
  showView('revision');
  renderRevisionCard();
}

//////////////////////////
// RÉSULTATS            //
//////////////////////////

function showRevisionResults() {
  const total = revisionState.allCards.length;
  const understoodCount = Object.values(revisionState.understood).filter(Boolean).length;
  const toReviewCount = Object.values(revisionState.toReview).filter(Boolean).length;
  const unmarkedCount = total - understoodCount - toReviewCount;

  // Sauvegarder dans l'historique
  const entry = {
    at: Date.now(),
    mode: 'revision',
    themeId: state.currentTheme?.id,
    themeTitle: state.currentTheme?.title,
    totalCards: total,
    understood: understoodCount,
    toReview: toReviewCount,
    unmarked: unmarkedCount,
    percent: Math.round((understoodCount / total) * 100)
  };
  saveHistoryEntry(entry);

  // Construire la liste des cartes à revoir
  const cardsToReviewList = revisionState.allCards
    .filter(card => revisionState.toReview[card.id])
    .map(card => `<li>${escapeHtml(card.title)} <span class="muted">(${escapeHtml(card.section.title)})</span></li>`)
    .join('');

  // Afficher les résultats
  if (els.resultsSummary) {
    els.resultsSummary.innerHTML = `
      <div class="results-header">
        <h2>📖 Révision terminée !</h2>
        <p class="muted">${escapeHtml(state.currentTheme?.title)}</p>
      </div>
      <div class="results-stats">
        <div class="stat-card success">
          <div class="stat-value">${understoodCount}</div>
          <div class="stat-label">✓ Comprises</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value">${toReviewCount}</div>
          <div class="stat-label">⟳ À revoir</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${unmarkedCount}</div>
          <div class="stat-label">Non marquées</div>
        </div>
      </div>
      ${cardsToReviewList ? `
        <div class="to-review-section">
          <h3>Fiches à revoir :</h3>
          <ul>${cardsToReviewList}</ul>
        </div>
      ` : ''}
      <div class="results-message">
        ${understoodCount === total 
          ? '🎉 Excellent ! Vous avez tout compris !' 
          : toReviewCount > 0 
            ? '💪 Bon travail ! Pensez à revoir les fiches marquées.'
            : '👍 Session de révision complétée.'}
      </div>
    `;
  }

  showView('results');
}

//////////////////////////
// EVENT BINDINGS       //
//////////////////////////

// Ces fonctions seront appelées depuis app.js après le chargement du DOM
function bindRevisionEvents() {
  els.btnRevisionPrev?.addEventListener('click', revisionPrev);
  els.btnRevisionNext?.addEventListener('click', revisionNext);
  els.btnRevisionUnderstood?.addEventListener('click', markAsUnderstood);
  els.btnRevisionToReview?.addEventListener('click', markToReview);
  els.btnRevisionBack?.addEventListener('click', showThemes);

  // Support clavier
  document.addEventListener('keydown', (e) => {
    if (els.views.revision?.hidden) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      revisionPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      revisionNext();
    } else if (e.key === 'u' || e.key === 'U') {
      markAsUnderstood();
    } else if (e.key === 'r' || e.key === 'R') {
      markToReview();
    }
  });
}
