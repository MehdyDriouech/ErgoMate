# 🧠 Ergo Quiz

**Ergo Quiz** est une application web interactive d’entraînement médical, conçue pour les étudiants et professionnels en **ergothérapie**, **santé** et **sciences du soin**.  
L’objectif : **apprendre, réviser et s’auto-évaluer** à travers des quiz thématiques courts, visuels et accessibles.

---

## ✨ Fonctionnalités principales

- 🎯 **Sélection de thèmes** (ex. Anatomie, Physiologie, Pathologies, etc.)
- 🧩 **Modes de révision variés**
  - Entraînement
  - QCM
  - Examen
  - Révision d’erreurs
- 💾 **Sauvegarde locale des résultats** (aucun compte requis)
- 📈 **Suivi de progression** par thème
- 🌍 **Mode hors-ligne** : toutes les données sont stockées dans le navigateur
- ♿ **Accessibilité soignée (ARIA, contrastes, navigation clavier)**
- 📱 **Responsive design** : expérience fluide sur mobile, tablette et desktop

---

## 💅 UX / UI moderne

Ergo Quiz adopte une interface **inspirée des applications médicales modernes** (Doctolib, Qare) :

| Élément | Description |
|----------|--------------|
| 🎨 Thème clair et apaisant | Palette pastel, fond doux, accent turquoise |
| 🩺 Encart d’accueil | Illustration médicale SVG intégrée |
| 🧠 Conseils pédagogiques | Rappel des méthodes de mémorisation |
| 🔘 Boutons larges et contrastés | Accessibilité mobile renforcée |
| 🪄 Micro-animations | Hover, transitions fluides, ombres légères |
| 🧭 Navigation fluide | Aucune dépendance externe, transitions instantanées |

---

## 🧱 Structure du projet

├── index.html # Page principale (toutes les vues)
├── assets/
│ └── styles.css # Thème graphique et utilitaires (dont .mb-4)
├── js/
│ └── app.js # Logique métier du quiz (navigation, scoring, etc.)
├── data/
│ └── theme-main.json # centralise les fichiers ce trouvant dans le dossier themes
├── data/
│ └── anatonmie-xxx.json # plusieurs vous pouvez ajouter vos propres themes a la volée  (il faut juste modifier le theme-main.json pour que l'application les utilisent)
└── README.md

---

## ⚙️ Technologies utilisées

| Catégorie | Stack |
|------------|--------|
| Frontend | HTML5, CSS3 (custom), JavaScript ES6 (modules) |
| Accessibilité | WAI-ARIA, roles, aria-live |
| Stockage | LocalStorage / IndexedDB |
| Typographie | [Inter](https://fonts.google.com/specimen/Inter) |
| UI | Composants légers, aucun framework requis |

---

## 🧩 Contribution & extensions

Suggestions d’évolutions futures :

🌓 Dark mode automatique
🎧 Ajout d’audio pour certaines questions (ex. reconnaissance de sons, pathologies)
📊 Dashboard enseignant (statistiques par élève)
🩹 Import / export des historiques

---

## 👩‍💻 Développé par

Projet initié par Mehdy Driouech

Engineering Manager & formateur en IA / UX Learning
www.mehdydriouech.fr

--- 

## 📄 Licence

Le code source de **Ergo Quiz** est distribué sous licence  
**Creative Commons Attribution - NonCommercial 4.0 International (CC BY-NC 4.0)**.

Vous êtes libres de :
- Partager — copier, redistribuer le matériel sur tout support
- Adapter — transformer et construire à partir du matériel

Sous les conditions suivantes :
- **Attribution** : vous devez créditer l’auteur (Mehdy Driouech) avec un lien vers [www.mehdydriouech.fr](https://www.mehdydriouech.fr)
- **Pas d’utilisation commerciale** : vous ne pouvez pas utiliser le matériel à des fins commerciales.

ℹ️ Texte complet de la licence :  
[https://creativecommons.org/licenses/by-nc/4.0/](https://creativecommons.org/licenses/by-nc/4.0/) 

🧭 « L’apprentissage est plus efficace lorsqu’il est actif, progressif et bien conçu. »