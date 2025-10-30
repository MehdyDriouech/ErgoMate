# 🧠 Ergo mate

**Ergo mate** est une PWA d'entraînement médical, conçue pour les étudiants et professionnels en ergothérapie, santé et sciences du soin. L'objectif : apprendre, réviser et s'auto-évaluer à travers des quiz thématiques courts, visuels et accessibles, **même hors ligne**.
🌐 [ErgoMate](http://ergo-mate.mehdydriouech.fr/)
---

## ✨ Fonctionnalités principales

### 🎯 Modes d'apprentissage variés
- **Entraînement** : Pratique libre avec feedback immédiat
- **QCM uniquement** : Focus sur les questions à choix multiples
- **Mode Examen** : Simulation d'examen avec notation finale
- **Révision d'erreurs** : Système intelligent qui cible vos points faibles
- **Flashcards** : Apprentissage par répétition espacée

### 📊 Suivi et analytics
- **Dashboard interactif** avec graphiques de progression
- **Historique détaillé** de toutes vos sessions
- **Tracking du temps** moyen par question
- **Statistiques par thème** (taux de réussite, évolution)

### 🎨 Thèmes personnalisés
- **Import de thèmes JSON** : Ajoutez vos propres questions
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

---

## 🏗️ Structure du projet

```
ergo-mate/
├── index.html                      # Page principale (SPA)
├── manifest.webmanifest            # Configuration PWA
├── sw.js                           # Service Worker (cache offline)
│
├── assets/
│   └── styles.css                  # Styles globaux et thèmes
│
├── js/
│   ├── app.js                      # Point d'entrée principal
│   │
│   ├── modules/                    # Modules utilitaires
│   │   ├── render.js               # Rendu des vues
│   │   ├── storage.js              # Gestion localStorage
│   │   ├── timer.js                # Tracking du temps
│   │   └── utils.js                # Fonctions helper
│   │
│   └── features/                   # Fonctionnalités métier
│       ├── features-quiz.js        # Logique des quiz
│       ├── features-flashcards.js  # Système de flashcards
│       ├── features-dashboard.js   # Dashboard & analytics
│       ├── features-export.js      # Export/Import données
│       ├── features-theme-import.js # Import thèmes perso
│       ├── features-theme-validator.js # Validation JSON
│       └── features-custom-themes.js # Gestion thèmes perso
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
  "id": "mon-theme",
  "title": "Mon Thème Personnalisé",
  "locale": "fr-FR",
  "meta": {
    "author": "Votre Nom",
    "source": "Description",
    "updatedAt": "2025-10-30"
  },
  "settings": {
    "shuffleQuestions": true,
    "shuffleChoices": true
  },
  "questions": [
    {
      "id": "q001",
      "type": "mcq",
      "prompt": "Votre question ?",
      "choices": [
        { "id": "A", "label": "Réponse A" },
        { "id": "B", "label": "Réponse B" },
        { "id": "C", "label": "Réponse C" }
      ],
      "answer": "B",
      "rationale": "Explication de la réponse",
      "difficulty": 2,
      "tags": ["anatomie", "membre-superieur"]
    }
  ]
}
```

### Types de questions supportés
- **`mcq`** : Questions à choix multiple (simple ou multiple)
- **`true_false`** : Questions Vrai/Faux
- **`fill_in`** : Questions à compléter

### Import dans l'application
1. Cliquez sur **"➕ Ajouter un thème"**
2. Sélectionnez votre fichier JSON
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

### Vous êtes libre de :
- ✅ **Partager** : copier, redistribuer le matériel
- ✅ **Adapter** : transformer et construire à partir du matériel

### Sous les conditions suivantes :
- 📛 **Attribution** : Créditez l'auteur (Mehdy Driouech) avec un lien vers [www.mehdydriouech.fr](https://www.mehdydriouech.fr)
- 🚫 **Pas d'utilisation commerciale** : Usage non-commercial uniquement

### Pour la mise à disposition par des écoles, me contacter

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
