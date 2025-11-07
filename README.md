# 🧠 Ergo mate

**Ergo mate** est une PWA d'entraînement médical, conçue pour les étudiants et professionnels en ergothérapie, santé et sciences du soin. L'objectif : apprendre, réviser et s'auto-évaluer à travers des quiz thématiques courts, visuels et accessibles, **même hors ligne**.
🌐 [ErgoMate](http://ergo-mate.mehdydriouech.fr/)
---

## ✨ Fonctionnalités principales

### 🎯 Modes d'apprentissage variés
- **Entraînement** : Pratique libre avec feedback immédiat
- **Mode Examen** : Simulation d'examen avec notation finale
- **Révision d'erreurs** : Système intelligent qui cible vos points faibles
- **Flashcards** : Apprentissage par répétition espacée
- **Fiches de révisions** : Apprentissage des notions élementaires avec un suivi de compréhension + diagrammes avec mermaid.js

### 📊 Suivi et analytics
- **Dashboard interactif** avec graphiques de progression
- **Historique détaillé** de toutes vos sessions
- **Tracking du temps** moyen par question
- **Statistiques par thème** (taux de réussite, évolution)

### 🎨 Thèmes personnalisés
- **Import de thèmes JSON** : Ajoutez vos propres questions
- **Import de thèmes PDF via MistralAI** : Bring Your Own Key possible
- **Validation automatique** : Vérification de la structure des fichiers
- **Gestion centralisée** : Thèmes officiels + thèmes personnalisés

### 💾 Données et export
- **Sauvegarde locale automatique** (aucun compte requis)
- **Export JSON** : Sauvegardez toutes vos données
- **Import de données** : Restaurez ou fusionnez vos historiques
- **Confidentialité totale** : Tout reste dans votre navigateur

### 📱 PWA & Mode hors-ligne
- **Service Worker** : Mise en cache intelligente
- **Fonctionne offline** après la première visite
- **Indicateur de statut réseau** en temps réel
- **Installation sur l'écran d'accueil** (mobile & desktop)

### 🌗 Interface moderne
- **Thème clair/sombre** avec détection automatique
- **Design responsive** : fluide sur mobile, tablette et desktop
- **Animations subtiles** : transitions et micro-interactions
- **Accessibilité** soignée (ARIA, navigation clavier, contrastes)

### 🔧 Backend
- **Architecture modulaire** : séparation claire des responsabilités (API, auth, AI)
- **Mistral AI** : migration depuis OpenRouter pour un meilleur support français
- **BYOK (Bring Your Own Key)** : les utilisateurs peuvent utiliser leur propre clé API
- **Logging complet** : suivi des métriques d'utilisation et des erreurs
- **Dashboard analytics** : visualisation des statistiques d'API et de performance
- **Support des diagrammes** : génération Mermaid.js pour l'apprentissage visuel
- **Gestion des PDFs** : extraction et traitement de contenu pour quiz/flashcards
- **Authentification sécurisée** : TBD
- **Cache intelligent** : optimisation des appels API et des performances
- **Offline-first** : synchronisation et fonctionnement hors ligne (PWA)

---

## 🏗️ Structure du projet

```
ergo-mate/
├── index.html                      # Page principale (SPA)
├── manifest.webmanifest            # Configuration PWA
├── sw.js                           # Service Worker (cache offline)
│
├── assets/
│   ├── libjs/                     # LibrariesJS
│   │   ├── mermaid.esm.min.mjs    # MermaidJS pour les diagrames
│   ├── icons/                     # icones PWA
│   │   ├── icon-192.png
│   │   ├── icon-512.png   
│   └── styles.css                 # Styles globaux et thèmes
│
├── backend-php/                   # api génération question via pdf
│       ├── api.php                # api
│       ├── api-stats.php          # stats
│       ├── config.php             # fichier de config
│       └── dashboard.html         # Dashboard API
│
├── js/
│   ├── app.js                      # Point d'entrée principal
│   │
│   ├── features-views/             # Vues / écrans de l'application
│   │   ├── view-about.js           # Page "À propos"
│   │   ├── view-custom-themes.js   # Gestion des thèmes personnalisés
│   │   ├── view-dashboard.js       # Dashboard & statistiques
│   │   ├── view-flashcards.js      # Vue des flashcards
│   │   ├── view-history.js         # Historique des sessions
│   │   ├── view-import-theme.js    # Importation de thèmes
│   │   ├── view-pdf-import.js      # Importation depuis un PDF
│   │   ├── view-quiz.js            # Interface des quiz
│   │   ├── view-results.js         # Résultats & score final
│   │   ├── view-revision.js        # Mode révision ciblée
│   │   └── view-themes.js          # Liste & gestion des thèmes
│   │
│   └── features/                   # Fonctionnalités métier
│       ├── features-quiz.js              # Logique des quiz
│       ├── features-flashcards.js        # Système de flashcards
│       ├── features-dashboard.js         # Dashboard & analytics
│       ├── features-export.js            # Export/Import données
│       ├── features-theme-import.js      # Import thèmes perso
│       ├── features-theme-validator.js   # Validation JSON
│       └── features-custom-themes.js     # Gestion thèmes perso
│
├── data/
│   ├── theme-main.json             # Index des thèmes officiels
│   └── themes/                     # Thèmes JSON
│       ├── anatomie-ms.json
│       ├── neurotransmission.json
│       └── ...
│
└── icons/                          # Icônes PWA
    ├── icon-192.png
    └── icon-512.png
```

---

## ⚙️ Technologies utilisées

| Catégorie | Stack |
|-----------|-------|
| **Frontend** | HTML5, CSS3 (custom), JavaScript ES6 (modules) |
| **backend** | PHP |
| **PWA** | Service Worker, Cache API, Web App Manifest |
| **Accessibilité** | WAI-ARIA, roles, aria-live, navigation clavier |
| **Stockage** | LocalStorage (historique, stats, erreurs) |
| **Typographie** | Police système optimisée |
| **Architecture** | SPA modulaire, composants légers, zéro framework |

---

## 🚀 Installation et utilisation

### 🌐 Utilisation en ligne
Accédez directement à l'application : **[ergo-mate.mehdydriouech.fr](http://ergo-mate.mehdydriouech.fr)**

### 📲 Installation PWA

**Sur mobile :**
1. Ouvrez l'app dans votre navigateur
2. Tapez "Ajouter à l'écran d'accueil"
3. L'app fonctionne ensuite comme une app native

**Sur desktop (Chrome/Edge) :**
1. Cliquez sur l'icône ➕ dans la barre d'adresse
2. "Installer Ergo Mate"
3. L'app s'ouvre dans sa propre fenêtre

### 💻 Développement local

```bash
# Cloner le repository
git clone https://github.com/mehdy-driouech/ErgoMate.git
cd ErgoMate

# Lancer un serveur local
python -m http.server 8000
# ou
npx serve

# Ouvrir dans le navigateur
open http://localhost:8000
```

---

## 📝 Créer vos propres thèmes

### Format JSON

```json
{
  "title": "Titre du thème (basé sur le contenu)",
  "description": "Description concise du thème (1-2 phrases)",
  "tags": ["tag1", "tag2", "tag3"],
  "questions": [
    {
      "id": "q001",
      "type": "mcq",
      "prompt": "Question claire et précise ?",
      "choices": [
        { "id": "a", "label": "Première option" },
        { "id": "b", "label": "Deuxième option" },
        { "id": "c", "label": "Troisième option" },
        { "id": "d", "label": "Quatrième option" }
      ],
      "answer": "a",
      "rationale": "Explication pédagogique détaillée de la bonne réponse",
      "tags": ["concept", "catégorie"]
    },
    {
      "id": "q002",
      "type": "true_false",
      "prompt": "Affirmation à évaluer",
      "answer": true,
      "rationale": "Explication de pourquoi c'est vrai ou faux",
      "tags": ["fait", "théorie"]
    },
    {
      "id": "q003",
      "type": "fill_in",
      "prompt": "Question avec un ___ à compléter",
      "answer": "réponse courte",
      "rationale": "Explication de la réponse attendue",
      "tags": ["définition"]
    }
  ],
  "revisionCards": [
    {
      "sectionTitle": "",
      "cards": [
        {
          "id": "",
          "type": "summary",
          "layout": "bullet_points",
          "title": "",
          "content": "",
          "items": [],
          "keyPoints": [],
          "tags": [],
          "relatedQuestions": []
        },
        {
          "id": "",
          "type": "timeline",
          "title": "",
          "timeline": [],
          "summary": "",
          "tags": [],
          "relatedQuestions": []
        },
        {
          "id": "",
          "type": "definition",
          "title": "",
          "definition": "",
          "examples": [],
          "synonyms": [],
          "tags": [],
          "relatedQuestions": []
        },
        {
          "id": "",
          "type": "comparison",
          "title": "",
          "columns": [],
          "rows": [],
          "keyDifference": "",
          "tags": [],
          "relatedQuestions": []
        },
        {
          "id": "",
          "type": "qna",
          "title": "",
          "qaPairs": [],
          "tags": [],
          "relatedQuestions": []
        },
        {
          "id": "",
          "type": "mnemonic",
          "title": "",
          "mnemonics": [],
          "tags": [],
          "relatedQuestions": []
        },
        {
          "id": "",
          "type": "diagram_textual",
          "title": "",
          "nodes": [],
          "note": "",
          "tags": [],
          "relatedQuestions": []
        },
        {
          "id": "",
          "type": "focus",
          "title": "",
          "content": "",
          "objective": "",
          "examples": [],
          "tags": [],
          "relatedQuestions": []
        },
        {
          "id": "",
          "type": "key_takeaways",
          "title": "",
          "takeaways": [],
          "tags": [],
          "relatedQuestions": []
        },
        {
          "id": "",
          "type": "case_study",
          "title": "",
          "context": "",
          "problem": "",
          "intervention": "",
          "outcome": "",
          "tags": [],
          "relatedQuestions": []
        },
        {
          "id": "",
          "type": "exercise",
          "title": "",
          "prompt": "",
          "expectedAnswer": "",
          "rationale": "",
          "tags": [],
          "relatedQuestions": []
        }
      ]
    }
  ]
}```

### Types de questions supportés
- **`mcq`** : Questions à choix multiple (simple ou multiple)
- **`true_false`** : Questions Vrai/Faux
- **`fill_in`** : Questions à compléter

### Import dans l'application
1. Cliquez sur **"➕ Ajouter un thème"**
2. Sélectionnez votre fichier JSON ou votre PDF de cours (pas dispo en offline pour la partie PDF)
3. Validation automatique
4. Le thème apparaît dans votre liste

---

## 🎯 Roadmap & idées futures

### 🔜 Prochaines versions
- [ ] Graphiques de progression avancés
- [ ] Mode révision intelligente (espacée)
- [ ] Partage de thèmes entre utilisateurs
- [ ] Synchronisation cloud (optionnelle)

### 💡 Suggestions bienvenues
- [ ] Mode collaboratif (multi-joueurs)
- [ ] Audio pour questions de reconnaissance
- [ ] Dashboard enseignant (statistiques de classe)
- [ ] Génération de PDF de révision
- [ ] Intégration d'images/schémas interactifs

---

## 🤝 Contribution

Les contributions sont les bienvenues ! 

**Pour contribuer :**
1. Fork le projet
2. Créez une branche (`git checkout -b feature/amelioration`)
3. Committez vos changements (`git commit -m 'Ajout de...'`)
4. Push vers la branche (`git push origin feature/amelioration`)
5. Ouvrez une Pull Request

**Guidelines :**
- Code lisible et commenté
- Respect des conventions de nommage
- Tests de fonctionnement sur mobile
- Accessibilité maintenue

---

## 👨‍💻 Développé par

**Mehdy Driouech**  
Engineering Manager & Formateur 
🌐 [www.mehdydriouech.fr](https://www.mehdydriouech.fr)



---

## 📄 Licence

Le code source de **Ergo Mate** est distribué sous licence **Creative Commons Attribution - NonCommercial 4.0 International (CC BY-NC 4.0)**.

Cela signifie que :

- ✅ **Vous pouvez** utiliser, partager, adapter et redistribuer le code, **à condition** de mentionner clairement l’auteur.  
- 🚫 **Vous ne pouvez pas** utiliser ce code à des fins **commerciales** sans autorisation préalable écrite.  
- ⚙️ **Les utilisations commerciales** (vente, intégration dans un produit payant, prestation facturée, etc.) sont **réservées à l’auteur**.

L’auteur reste pleinement propriétaire du code et se réserve le droit de proposer des **licences commerciales séparées** pour des usages professionnels.

👉 Pour toute demande de licence commerciale ou de partenariat, contactez :  
**✉️ contact@mehdydriouech.fr**  
🌐 [www.mehdydriouech.fr](https://www.mehdydriouech.fr)

📜 **Texte complet** : [creativecommons.org/licenses/by-nc/4.0](https://creativecommons.org/licenses/by-nc/4.0/)

---

## 💬 Support & Contact

**Besoin d'aide ou vous avez des questions ?**
- 📧 Email : [contact via le site](https://www.mehdydriouech.fr)
- 🐛 Issues : [GitHub Issues](https://github.com/mehdy-driouech/ErgoMate/issues)
- 💡 Suggestions : Ouvrez une discussion sur GitHub

---

## 🙏 Remerciements

Merci à toutes les personnes qui utilisent et testent cette application. Votre feedback aide à améliorer continuellement l'expérience d'apprentissage.

---

### 🧭 *« L'apprentissage est plus efficace lorsqu'il est actif, progressif et bien conçu. »*

---

**Version** : 2.0.0  
**Dernière mise à jour** : Octobre 2025
