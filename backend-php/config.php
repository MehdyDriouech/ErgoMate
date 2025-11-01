<?php
/**
 * Configuration de l'API Ergo Mate
 * 
 * IMPORTANT : Ne commitez jamais ce fichier sur Git !
 * Ajoutez-le dans .gitignore
 */

// Clé API OpenRouter
// Obtenez-la sur : https://openrouter.ai/keys
define('OPENROUTER_API_KEY', 'sk-or-v1-laclefmagiquecemetsici');

// Modèle à utiliser (gratuit)
define('OPENROUTER_MODEL', 'qwen/qwen3-235b-a22b:free');

// Informations de votre application (requises par OpenRouter)
define('APP_NAME', 'ErgoMate');
define('APP_URL', 'https://ergo-mate.mehdydriouech.fr'); // Remplacez par votre vraie URL

// Configuration optionnelle
define('DEBUG_MODE', false); // Mettre à true pour voir les logs détaillés

// Domaines autorisés pour CORS (en production, remplacez * par votre domaine)
// Exemple : define('ALLOWED_ORIGIN', 'https://votre-site.com');
define('ALLOWED_ORIGIN', 'https://ergo-mate.mehdydriouech.fr');

// Timeout pour les appels API (en secondes)
define('API_TIMEOUT', 60);
?>
