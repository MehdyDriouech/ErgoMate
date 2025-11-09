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
│   │   ├── mermaid.min.js         # MermaidJS pour les diagrames
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
Theme structure with mermaid · JSON
Copier

{
  "title": "Titre du thème (basé sur le contenu)",
  "description": "Description concise du thème (1-2 phrases)",
  "tags": [
    "tag1",
    "tag2",
    "tag3"
  ],
  "questions": [
    {
      "id": "q001",
      "type": "mcq",
      "prompt": "Question claire et précise ?",
      "choices": [
        {
          "id": "a",
          "label": "Première option"
        },
        {
          "id": "b",
          "label": "Deuxième option"
        },
        {
          "id": "c",
          "label": "Troisième option"
        },
        {
          "id": "d",
          "label": "Quatrième option"
        }
      ],
      "answer": "a",
      "rationale": "Explication pédagogique détaillée de la bonne réponse",
      "tags": [
        "concept",
        "catégorie"
      ]
    },
    {
      "id": "q002",
      "type": "true_false",
      "prompt": "Affirmation à évaluer",
      "answer": true,
      "rationale": "Explication de pourquoi c'est vrai ou faux",
      "tags": [
        "fait",
        "théorie"
      ]
    },
    {
      "id": "q003",
      "type": "fill_in",
      "prompt": "Question avec un ___ à compléter",
      "answer": "réponse courte",
      "rationale": "Explication de la réponse attendue",
      "tags": [
        "définition"
      ]
    }
  ],
  "revision": {
    "sections": [
      {
        "id": "section_001",
        "title": "Titre de la section",
        "order": 1,
        "cards": [
          {
            "id": "rev_summary_001",
            "type": "summary",
            "title": "Titre du résumé",
            "content": "Contenu principal du résumé",
            "items": [
              {
                "title": "Élément 1",
                "content": "Description de l'élément 1"
              },
              {
                "title": "Élément 2",
                "content": "Description de l'élément 2"
              }
            ],
            "keyPoints": [
              "Point clé 1",
              "Point clé 2",
              "Point clé 3"
            ],
            "tags": [
              "synthèse",
              "vue d'ensemble"
            ],
            "relatedQuestions": [
              "q001",
              "q002"
            ]
          },
          {
            "id": "rev_timeline_001",
            "type": "timeline",
            "title": "Titre de la chronologie",
            "timeline": [
              {
                "period": "1900-1920",
                "date": "1917",
                "actors": "Acteur principal",
                "event": "Description de l'événement",
                "description": "Détails supplémentaires"
              },
              {
                "period": "1920-1940",
                "event": "Deuxième événement important"
              }
            ],
            "summary": "Conclusion ou synthèse de la chronologie",
            "tags": [
              "histoire",
              "évolution"
            ],
            "relatedQuestions": [
              "q003"
            ]
          },
          {
            "id": "rev_definition_001",
            "type": "definition",
            "title": "Terme à définir",
            "definition": "Définition claire et précise du terme",
            "examples": [
              "Exemple concret 1",
              "Exemple concret 2"
            ],
            "synonyms": [
              "synonyme1",
              "synonyme2"
            ],
            "keyPoints": [
              "Point important 1",
              "Point important 2"
            ],
            "tags": [
              "vocabulaire",
              "concept"
            ],
            "relatedQuestions": [
              "q001"
            ]
          },
          {
            "id": "rev_comparison_001",
            "type": "comparison",
            "title": "Comparaison entre X et Y",
            "columns": [
              "Critère",
              "Option A",
              "Option B"
            ],
            "rows": [
              {
                "label": "Formation",
                "values": [
                  "3 ans",
                  "5 ans"
                ]
              },
              {
                "label": "Compétences",
                "values": [
                  "Compétence A",
                  "Compétence B"
                ]
              },
              {
                "label": "Domaines",
                "values": [
                  "Domaine 1",
                  "Domaine 2"
                ]
              }
            ],
            "keyDifference": "La différence principale entre A et B est...",
            "tags": [
              "comparaison",
              "différences"
            ],
            "relatedQuestions": [
              "q002"
            ]
          },
          {
            "id": "rev_qna_001",
            "type": "qna",
            "title": "Questions fréquentes sur X",
            "qaPairs": [
              {
                "question": "Question courante 1 ?",
                "answer": "Réponse détaillée à la question 1"
              },
              {
                "question": "Question courante 2 ?",
                "answer": "Réponse détaillée à la question 2"
              },
              {
                "question": "Question courante 3 ?",
                "answer": "Réponse détaillée à la question 3"
              }
            ],
            "tags": [
              "faq",
              "clarification"
            ],
            "relatedQuestions": [
              "q001",
              "q003"
            ]
          },
          {
            "id": "rev_mnemonic_001",
            "type": "mnemonic",
            "title": "Moyens mnémotechniques",
            "mnemonics": [
              {
                "concept": "Concept à retenir",
                "technique": "ACRONYME ou phrase mnémotechnique",
                "breakdown": [
                  "A = Premier élément",
                  "C = Deuxième élément",
                  "R = Troisième élément"
                ]
              }
            ],
            "tags": [
              "mémoire",
              "astuce"
            ],
            "relatedQuestions": [
              "q002"
            ]
          },
          {
            "id": "rev_mermaid_001",
            "type": "diagram_mermaid",
            "title": "Titre du diagramme",
            "mermaid": "flowchart TD\n    A[Début] --> B{Décision}\n    B -->|Oui| C[Action 1]\n    B -->|Non| D[Action 2]\n    C --> E[Fin]\n    D --> E",
            "note": "Note explicative optionnelle sur le diagramme",
            "tags": [
              "processus",
              "schéma",
              "visuel"
            ],
            "relatedQuestions": [
              "q001",
              "q002"
            ]
          },
          {
            "id": "rev_mermaid_002",
            "type": "diagram_mermaid",
            "title": "Carte mentale des concepts",
            "mermaid": "mindmap\n  root((Concept principal))\n    Sous-concept 1\n      Détail 1.1\n      Détail 1.2\n    Sous-concept 2\n      Détail 2.1\n      Détail 2.2\n    Sous-concept 3",
            "note": "Organisation hiérarchique des concepts clés",
            "tags": [
              "organisation",
              "concepts"
            ],
            "relatedQuestions": [
              "q003"
            ]
          },
          {
            "id": "rev_mermaid_003",
            "type": "diagram_mermaid",
            "title": "Chronologie visuelle",
            "mermaid": "timeline\n    title Évolution historique\n    1900 : Événement 1\n    1950 : Événement 2\n    1980 : Événement 3\n    2000 : Événement 4\n    2020 : Événement actuel",
            "tags": [
              "histoire",
              "chronologie"
            ],
            "relatedQuestions": [
              "q003"
            ]
          },
          {
            "id": "rev_mermaid_004",
            "type": "diagram_mermaid",
            "title": "Diagramme de séquence",
            "mermaid": "sequenceDiagram\n    participant P as Patient\n    participant E as Ergothérapeute\n    participant M as Médecin\n    P->>E: Demande d'intervention\n    E->>P: Évaluation initiale\n    E->>M: Rapport d'évaluation\n    M->>E: Prescription\n    E->>P: Plan d'intervention",
            "note": "Interactions typiques dans un parcours de soins",
            "tags": [
              "processus",
              "interactions"
            ],
            "relatedQuestions": [
              "q001"
            ]
          },
          {
            "id": "rev_diagram_textual_001",
            "type": "diagram_textual",
            "title": "Schéma conceptuel (texte)",
            "nodes": [
              {
                "label": "Élément 1",
                "description": "Description de l'élément 1"
              },
              {
                "label": "Élément 2",
                "description": "Description de l'élément 2"
              },
              {
                "label": "Élément 3",
                "description": "Description de l'élément 3"
              }
            ],
            "note": "Relations entre les différents éléments",
            "tags": [
              "schéma",
              "structure"
            ],
            "relatedQuestions": [
              "q002"
            ]
          },
          {
            "id": "rev_focus_001",
            "type": "focus",
            "title": "Focus sur un concept important",
            "content": "Explication détaillée du concept principal",
            "objective": "Objectif d'apprentissage de cette fiche",
            "examples": [
              "Exemple pratique 1",
              "Exemple pratique 2",
              "Exemple pratique 3"
            ],
            "keyPoints": [
              "Point essentiel 1",
              "Point essentiel 2"
            ],
            "tags": [
              "approfondissement",
              "clé"
            ],
            "relatedQuestions": [
              "q001",
              "q002"
            ]
          },
          {
            "id": "rev_key_takeaways_001",
            "type": "key_takeaways",
            "title": "Points essentiels à retenir",
            "takeaways": [
              {
                "point": "Premier point clé",
                "details": "Explication complémentaire du premier point"
              },
              {
                "point": "Deuxième point clé",
                "details": "Explication complémentaire du deuxième point"
              },
              "Troisième point clé (format simple)"
            ],
            "tags": [
              "synthèse",
              "essentiel"
            ],
            "relatedQuestions": [
              "q001",
              "q002",
              "q003"
            ]
          },
          {
            "id": "rev_case_study_001",
            "type": "case_study",
            "title": "Cas clinique : [Nom du cas]",
            "context": "Présentation du patient et de sa situation (âge, diagnostic, contexte de vie)",
            "problem": "Problématique ergothérapique identifiée",
            "intervention": "Description de l'intervention mise en place",
            "outcome": "Résultats obtenus et analyse",
            "tags": [
              "pratique",
              "clinique",
              "cas"
            ],
            "relatedQuestions": [
              "q001",
              "q002"
            ]
          },
          {
            "id": "rev_exercise_001",
            "type": "exercise",
            "title": "Exercice d'application",
            "prompt": "Consigne claire de l'exercice à réaliser",
            "expectedAnswer": "Réponse attendue détaillée",
            "rationale": "Explication pédagogique de la réponse et des concepts sous-jacents",
            "tags": [
              "pratique",
              "application"
            ],
            "relatedQuestions": [
              "q003"
            ]
          }
        ]
      }
    ]
  }
}
```

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
**Dernière mise à jour** : Novembre 2025
