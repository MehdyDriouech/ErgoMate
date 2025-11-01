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
    default:
      html = renderGenericCard(card);
  }

  els.revisionCard.innerHTML = html;
  
  // Mettre à jour l'état des boutons
  updateRevisionButtons();
}

/**
 * Rendu pour une carte de type "definition"
 */
function renderDefinitionCard(card) {
  const keyPoints = card.keyPoints?.map(point => 
    `<li>${point}</li>`
  ).join('') || '';

  return `
    <div class="revision-card-header">
      <span class="badge info">${card.section?.title || 'Définition'}</span>
      <h3>${card.title}</h3>
    </div>
    <div class="revision-card-body">
      <p class="card-content">${card.content}</p>
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
      <strong>${item.term}</strong>
      <span class="muted"> → ${item.meaning}</span>
    </div>
  `).join('') || '';

  return `
    <div class="revision-card-header">
      <span class="badge info">${card.section?.title || 'Étymologie'}</span>
      <h3>${card.title}</h3>
    </div>
    <div class="revision-card-body">
      <p class="card-content">${card.content}</p>
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
  const events = card.events?.map(event => `
    <div class="timeline-event">
      <div class="timeline-period">${event.period}</div>
      <div class="timeline-content">
        <strong>${event.actors}</strong>
        <p>${event.event}</p>
      </div>
    </div>
  `).join('') || '';

  return `
    <div class="revision-card-header">
      <span class="badge info">${card.section?.title || 'Chronologie'}</span>
      <h3>${card.title}</h3>
    </div>
    <div class="revision-card-body">
      <div class="timeline">
        ${events}
      </div>
      ${card.keyTakeaway ? `
        <div class="key-takeaway">
          <strong>💡 À retenir :</strong> ${card.keyTakeaway}
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
  
  if (card.domains) {
    items = card.domains.map(domain => `
      <div class="summary-item">
        <h4>${domain.name}</h4>
        <p><strong>Focus :</strong> ${domain.focus}</p>
        <p class="muted">${domain.details}</p>
      </div>
    `).join('');
  } else if (card.disciplines) {
    items = card.disciplines.map(disc => `
      <div class="summary-item">
        <h4>${disc.name}</h4>
        <p>${disc.definition}</p>
      </div>
    `).join('');
  }

  return `
    <div class="revision-card-header">
      <span class="badge info">${card.section?.title || 'Résumé'}</span>
      <h3>${card.title}</h3>
    </div>
    <div class="revision-card-body">
      <p class="card-content">${card.content}</p>
      <div class="summary-list">
        ${items}
      </div>
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
        <h4>${p.concept}</h4>
        <p>${p.explanation}</p>
        ${p.example ? `<p class="muted"><em>Exemple : ${p.example}</em></p>` : ''}
      </div>
    `).join('');
  } else if (card.keyPoints) {
    details = `<ul class="key-points-list">
      ${card.keyPoints.map(point => `<li>${point}</li>`).join('')}
    </ul>`;
  }

  const intervention = card.intervention ? 
    (typeof card.intervention === 'string' 
      ? `<p><strong>Intervention :</strong> ${card.intervention}</p>`
      : `<ul>${card.intervention.map(i => `<li>${i}</li>`).join('')}</ul>`) : '';

  const objective = card.objective || card.objectives ? 
    `<p><strong>Objectif :</strong> ${card.objective || card.objectives}</p>` : '';

  const formation = card.formation ? 
    `<p><strong>Formation :</strong> ${card.formation}</p>` : '';

  const examples = card.examples ? `
    <div class="examples">
      <h4>Exemples :</h4>
      <ul>${card.examples.map(ex => `<li>${ex}</li>`).join('')}</ul>
    </div>
  ` : '';

  return `
    <div class="revision-card-header">
      <span class="badge info">${card.section?.title || 'Focus'}</span>
      <h3>${card.title}</h3>
    </div>
    <div class="revision-card-body">
      <p class="card-content">${card.content}</p>
      ${objective}
      ${intervention}
      ${formation}
      ${details}
      ${examples}
      ${card.keyTakeaway ? `
        <div class="key-takeaway">
          <strong>💡 À retenir :</strong> ${card.keyTakeaway}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Rendu pour une carte de type "comparison"
 */
function renderComparisonCard(card) {
  const professionals = card.professionals?.map(prof => `
    <div class="comparison-item">
      <h4>${prof.title}</h4>
      <p><strong>Formation :</strong> ${prof.formation}</p>
      <p><strong>Statut :</strong> ${prof.status}</p>
      <p><strong>Prescription :</strong> ${prof.canPrescribe ? '✅ Oui' : '❌ Non'}</p>
      <p><strong>Remboursement :</strong> ${prof.reimbursement ? '✅ Oui' : '❌ Non'}</p>
      ${prof.specificities ? `
        <ul class="specificities">
          ${prof.specificities.map(s => `<li>${s}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `).join('') || '';

  const concepts = card.concepts?.map(concept => `
    <div class="comparison-item">
      <h4>${concept.name}</h4>
      <p>${concept.definition}</p>
      ${concept.keyIdeas ? `
        <ul>
          ${concept.keyIdeas.map(idea => `<li>${idea}</li>`).join('')}
        </ul>
      ` : ''}
      ${concept.therapeuticDevice ? `
        <div class="therapeutic-device">
          <p><strong>Dispositif thérapeutique :</strong></p>
          <p>${concept.therapeuticDevice.participants}</p>
          <p><strong>Objectif :</strong> ${concept.therapeuticDevice.objective}</p>
          ${concept.therapeuticDevice.techniques ? `
            <p><strong>Techniques :</strong> ${concept.therapeuticDevice.techniques.join(', ')}</p>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `).join('') || '';

  return `
    <div class="revision-card-header">
      <span class="badge info">${card.section?.title || 'Comparaison'}</span>
      <h3>${card.title}</h3>
    </div>
    <div class="revision-card-body">
      <p class="card-content">${card.content}</p>
      <div class="comparison-grid">
        ${professionals}${concepts}
      </div>
      ${card.keyDifference ? `
        <div class="key-takeaway">
          <strong>🔑 Différence clé :</strong> ${card.keyDifference}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Rendu pour une carte de type "key_takeaways"
 */
function renderKeyTakeawaysCard(card) {
  const takeaways = card.takeaways?.map(item => `
    <div class="takeaway-item">
      <div class="takeaway-topic">${item.topic}</div>
      <div class="takeaway-point">${item.point}</div>
    </div>
  `).join('') || '';

  return `
    <div class="revision-card-header">
      <span class="badge success">${card.section?.title || 'Points clés'}</span>
      <h3>${card.title}</h3>
    </div>
    <div class="revision-card-body">
      <div class="takeaways-list">
        ${takeaways}
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
      <h4>🧠 ${item.concept}</h4>
      <div class="mnemonic-technique">${item.technique}</div>
      <ul class="mnemonic-breakdown">
        ${item.breakdown.map(line => `<li>${line}</li>`).join('')}
      </ul>
    </div>
  `).join('') || '';

  return `
    <div class="revision-card-header">
      <span class="badge info">${card.section?.title || 'Mnémotechnique'}</span>
      <h3>${card.title}</h3>
    </div>
    <div class="revision-card-body">
      <div class="mnemonics-list">
        ${mnemonics}
      </div>
    </div>
  `;
}

/**
 * Rendu générique pour les types non gérés
 */
function renderGenericCard(card) {
  return `
    <div class="revision-card-header">
      <span class="badge">${card.section?.title || 'Fiche'}</span>
      <h3>${card.title}</h3>
    </div>
    <div class="revision-card-body">
      <p class="card-content">${card.content || 'Contenu non disponible'}</p>
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
    const url = theme.path || `./data/${theme.file}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erreur de chargement');
    themeData = await response.json();
  } catch (error) {
    alert('❌ Erreur lors du chargement des fiches de révision.');
    console.error(error);
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
    .map(card => `<li>${card.title} <span class="muted">(${card.section.title})</span></li>`)
    .join('');

  // Afficher les résultats
  if (els.resultsSummary) {
    els.resultsSummary.innerHTML = `
      <div class="results-header">
        <h2>📖 Révision terminée !</h2>
        <p class="muted">${state.currentTheme?.title}</p>
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
