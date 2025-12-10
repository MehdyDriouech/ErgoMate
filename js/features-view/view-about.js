// js/features-view/view-about.js
// Web Component pour la page "À propos"

class ViewAbout extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  connectedCallback() {
    this.classList.add('view');
    this.setAttribute('role', 'region');
    this.setAttribute('aria-labelledby', 'about-title');
  }

  render() {
    this.innerHTML = `
      <!-- En-tête avec illustration -->
      <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%);">
        <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
          <figure aria-hidden="true" style="margin: 0; flex-shrink: 0;">
            <svg width="100" height="100" viewBox="0 0 100 100" role="img" xmlns="http://www.w3.org/2000/svg">
              <title>Logo Ergo Mate</title>
              <defs>
                <linearGradient id="grad-about" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stop-color="#06b6d4"/>
                  <stop offset="100%" stop-color="#10b981"/>
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="#ECFEFF" stroke="#BAE6FD" stroke-width="2"/>
              <text x="50" y="60" font-size="50" text-anchor="middle" fill="url(#grad-about)">🧠</text>
            </svg>
          </figure>
          <div style="flex: 1; min-width: 240px;">
            <h2 id="about-title" style="margin: 0 0 8px 0; font-size: clamp(1.5rem, 4vw, 2rem);">
              À propos d'Ergo Mate
            </h2>
            <p class="muted" style="margin: 0; font-size: 1rem;">
              Application web progressive d'entraînement médical libre et gratuite
            </p>
          </div>
        </div>
      </div>

      <!-- Section 1 : Présentation -->
      <article class="card" style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5rem;">🎯</span>
          Qu'est-ce qu'Ergo Mate ?
        </h3>
        <p style="margin: 0 0 12px 0; line-height: 1.6;">
          <strong>Ergo Mate</strong> est une application web progressive (PWA) d'entraînement médical, 
          conçue pour les étudiants et professionnels en ergothérapie, santé et sciences du soin. 
          L'objectif : <strong>apprendre, réviser et s'auto-évaluer</strong> à travers des quiz thématiques 
          courts, visuels et accessibles, même hors ligne.
        </p>
        <p style="margin: 0; line-height: 1.6;">
          Que vous prépariez vos examens, que vous souhaitiez maintenir vos connaissances à jour, 
          ou simplement vous entraîner régulièrement, Ergo Mate vous accompagne dans votre parcours 
          d'apprentissage avec des outils modernes et efficaces.
        </p>
      </article>

      <!-- Section 2 : Fonctionnalités principales -->
      <article class="card" style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5rem;">✨</span>
          Fonctionnalités principales
        </h3>
        
        <div style="display: grid; gap: 16px;">
          <!-- Modes d'apprentissage -->
          <div style="padding: 16px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--card-border);">
            <h4 style="margin: 0 0 8px 0;">🎯 Modes d'apprentissage variés</h4>
            <ul style="margin: 0; padding-left: 20px; display: grid; gap: 6px;">
              <li><strong>Entraînement :</strong> Pratique libre avec feedback immédiat</li>
              <li><strong>Mode Examen :</strong> Simulation d'examen avec notation finale</li>
              <li><strong>Révision d'erreurs :</strong> Système intelligent qui cible vos points faibles</li>
              <li><strong>Flashcards :</strong> Apprentissage par répétition espacée</li>
              <li><strong>Fiches de révision :</strong> Notions élémentaires avec suivi de compréhension</li>
            </ul>
          </div>

          <!-- Suivi et analytics -->
          <div style="padding: 16px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--card-border);">
            <h4 style="margin: 0 0 8px 0;">📊 Suivi et analytics</h4>
            <ul style="margin: 0; padding-left: 20px; display: grid; gap: 6px;">
              <li>Dashboard interactif avec graphiques de progression</li>
              <li>Historique détaillé de toutes vos sessions</li>
              <li>Tracking du temps moyen par question</li>
              <li>Statistiques par thème (taux de réussite, évolution)</li>
            </ul>
          </div>

          <!-- Thèmes personnalisés -->
          <div style="padding: 16px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--card-border);">
            <h4 style="margin: 0 0 8px 0;">🎨 Thèmes personnalisés</h4>
            <ul style="margin: 0; padding-left: 20px; display: grid; gap: 6px;">
              <li><strong>Import JSON :</strong> Ajoutez vos propres questions</li>
              <li><strong>Import PDF via IA :</strong> Génération automatique de questions (MistralAI)</li>
              <li><strong>Validation automatique :</strong> Vérification de la structure des fichiers</li>
              <li>Gestion centralisée : Thèmes officiels + thèmes personnalisés</li>
            </ul>
          </div>

          <!-- Données et export -->
          <div style="padding: 16px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--card-border);">
            <h4 style="margin: 0 0 8px 0;">💾 Données et export</h4>
            <ul style="margin: 0; padding-left: 20px; display: grid; gap: 6px;">
              <li>Sauvegarde locale automatique (aucun compte requis)</li>
              <li>Export JSON : Sauvegardez toutes vos données</li>
              <li>Import de données : Restaurez ou fusionnez vos historiques</li>
              <li><strong>Confidentialité totale :</strong> Tout reste dans votre navigateur</li>
            </ul>
          </div>

          <!-- PWA & Mode hors-ligne -->
          <div style="padding: 16px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--card-border);">
            <h4 style="margin: 0 0 8px 0;">📱 PWA & Mode hors-ligne</h4>
            <ul style="margin: 0; padding-left: 20px; display: grid; gap: 6px;">
              <li>Service Worker : Mise en cache intelligente</li>
              <li>Fonctionne offline après la première visite</li>
              <li>Indicateur de statut réseau en temps réel</li>
              <li>Installation sur l'écran d'accueil (mobile & desktop)</li>
            </ul>
          </div>

          <!-- Interface moderne -->
          <div style="padding: 16px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--card-border);">
            <h4 style="margin: 0 0 8px 0;">🌗 Interface moderne</h4>
            <ul style="margin: 0; padding-left: 20px; display: grid; gap: 6px;">
              <li>Thème clair/sombre avec détection automatique</li>
              <li>Design responsive : fluide sur mobile, tablette et desktop</li>
              <li>Animations subtiles : transitions et micro-interactions</li>
              <li>Accessibilité soignée (ARIA, navigation clavier, contrastes)</li>
            </ul>
          </div>
        </div>
      </article>

      <!-- Section 3 : Philosophie & Gratuité -->
      <article class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%);">
        <h3 style="margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5rem;">💡</span>
          Philosophie & Gratuité
        </h3>
        <p style="margin: 0 0 12px 0; line-height: 1.6;">
          <strong>Ergo Mate est et restera gratuite.</strong> L'éducation et l'accès à des outils 
          de qualité ne doivent pas être un privilège. C'est pourquoi j'ai fait le choix de 
          développer cette application sous licence libre <strong>AGPL-3.0</strong>.
        </p>
        <p style="margin: 0 0 12px 0; line-height: 1.6;">
          Cette licence garantit que le code source reste ouvert et accessible à tous, 
          permettant à chacun de l'étudier, le modifier et le redistribuer. Toute modification 
          doit également être partagée sous la même licence, assurant ainsi que les améliorations 
          profitent à l'ensemble de la communauté.
        </p>
        <p style="margin: 0; line-height: 1.6;">
          Vos données restent privées et stockées localement dans votre navigateur. 
          Aucun compte n'est requis, aucune donnée n'est envoyée à des serveurs tiers.
        </p>
      </article>

      <!-- Section 4 : Contribuer -->
      <article class="card" style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5rem;">🤝</span>
          Contribuer au projet
        </h3>
        
        <p style="margin: 0 0 20px 0; line-height: 1.6;">
          Bien que l'application soit gratuite, son développement et sa maintenance demandent 
          du temps et des ressources. Vous pouvez soutenir le projet de plusieurs manières :
        </p>

        <div style="display: grid; gap: 16px;">
          <!-- Dons financiers -->
          <div style="padding: 20px; background: var(--card-bg); border-radius: 8px; border: 2px solid var(--primary);">
            <h4 style="margin: 0 0 12px 0; color: var(--primary);">💝 Soutien financier</h4>
            <p style="margin: 0 0 16px 0; line-height: 1.6;">
              Un don, même modeste, aide à maintenir l'application en ligne et à financer 
              de nouvelles fonctionnalités. Vous pouvez contribuer de manière ponctuelle ou récurrente :
            </p>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <a href="https://ko-fi.com/mehdydriouech" target="_blank" rel="noopener noreferrer" 
                 class="btn primary" 
                 style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
                <span>☕</span> Offrir un café
              </a>
              <a href="https://paypal.me/MDRIOUECH" target="_blank" rel="noopener noreferrer" 
                 class="btn ghost" 
                 style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
                <span>💳</span> Don ponctuel
              </a>
            </div>
          </div>

          <!-- Contribution au code -->
          <div style="padding: 16px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--card-border);">
            <h4 style="margin: 0 0 8px 0;">👨‍💻 Contribution au développement</h4>
            <p style="margin: 0 0 12px 0; line-height: 1.6;">
              Vous êtes développeur·euse ? Le code source est disponible sur GitHub. 
              N'hésitez pas à proposer des améliorations, corriger des bugs ou ajouter de nouvelles fonctionnalités.
            </p>
            <a href="https://github.com/MehdyDriouech/ErgoMate" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="btn ghost" 
               style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
              <span>🐙</span> Voir sur GitHub
            </a>
          </div>

          <!-- Hébergement -->
          <div style="padding: 16px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--card-border);">
            <h4 style="margin: 0 0 8px 0;">🖥️ Hébergement communautaire</h4>
            <p style="margin: 0; line-height: 1.6;">
              Vous gérez une infrastructure ou souhaitez proposer Ergo Mate à votre institution ? 
              Vous pouvez héberger l'application sur vos serveurs et la mettre à disposition 
              de votre communauté. Le code est libre et peut être déployé facilement.
            </p>
          </div>
        </div>
      </article>

      <!-- Section 5 : Licence & Utilisation commerciale -->
      <article class="card" style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5rem;">📜</span>
          Licence & Utilisation commerciale
        </h3>
        
        <div style="padding: 16px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--card-border); margin-bottom: 16px;">
          <h4 style="margin: 0 0 8px 0;">📖 Licence AGPL-3.0</h4>
          <p style="margin: 0; line-height: 1.6;">
            Ergo Mate est distribué sous la licence <strong>GNU Affero General Public License v3.0</strong>. 
            Cette licence vous permet de :
          </p>
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            <li>Utiliser l'application gratuitement</li>
            <li>Modifier le code source selon vos besoins</li>
            <li>Redistribuer l'application (modifiée ou non)</li>
            <li>Héberger votre propre instance</li>
          </ul>
          <p style="margin: 12px 0 0 0; line-height: 1.6;">
            <strong>Condition importante :</strong> Toute modification ou service basé sur Ergo Mate 
            doit également être publié sous licence AGPL-3.0, avec le code source accessible.
          </p>
        </div>

        <div style="padding: 16px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(234, 179, 8, 0.1) 100%); border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.3);">
          <h4 style="margin: 0 0 8px 0; color: var(--warning);">🏫 Écoles & Institutions privées</h4>
          <p style="margin: 0 0 12px 0; line-height: 1.6;">
            Les établissements d'enseignement privés souhaitant utiliser Ergo Mate devront 
            acquérir une licence commerciale. Cette licence permettra :
          </p>
          <ul style="margin: 0 0 12px 0; padding-left: 20px;">
            <li>Des personnalisations spécifiques à l'institution</li>
          </ul>
          <p style="margin: 0; line-height: 1.6;">
            <em>Note : Les cours de médecine étant très réglementés, certaines fonctionnalités 
            pourront être désactivées ou adaptées selon les besoins de l'établissement.</em>
          </p>
        </div>
      </article>

      <!-- Section 6 : Contact -->
      <article class="card" style="background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%);">
        <h3 style="margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5rem;">📞</span>
          Contact & Liens utiles
        </h3>
        
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.3rem;">🐙</span>
            <div>
              <strong>Code source :</strong>
              <a href="https://github.com/MehdyDriouech/ErgoMate" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 style="color: var(--primary); text-decoration: none; margin-left: 8px;">
                github.com/MehdyDriouech/ErgoMate
              </a>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.3rem;">🌐</span>
            <div>
              <strong>Application web :</strong>
              <a href="https://ergo-mate.mehdydriouech.fr/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 style="color: var(--primary); text-decoration: none; margin-left: 8px;">
                https://ergo-mate.mehdydriouech.fr/
              </a>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.3rem;">📧</span>
            <div>
              <strong>Contact :</strong>
              <span style="margin-left: 8px; opacity: 0.8;">
                Via les issues GitHub pour toute question ou suggestion
              </span>
            </div>
          </div>
        </div>

        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--card-border); text-align: center;">
          <p style="margin: 0; opacity: 0.7; font-size: 0.95rem;">
            Fait avec ❤️ pour la communauté de l'ergothérapie et des sciences de la santé
          </p>
        </div>
      </article>

      <!-- Bouton retour -->
      <div style="text-align: center; margin-top: 24px;">
        <button id="btn-about-back" class="btn primary large">
          ← Retour à l'accueil
        </button>
      </div>
    `;
  }

  getBackButton() {
    return this.querySelector('#btn-about-back');
  }
}

customElements.define('view-about', ViewAbout);
