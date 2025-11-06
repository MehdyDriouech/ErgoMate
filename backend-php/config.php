<?php
/**
 * Configuration de l'API Ergo Mate v3
 * Optimisé pour Mistral AI avec support BYOK
 * 
 * IMPORTANT : Ne commitez jamais ce fichier sur Git !
 * Ajoutez-le dans .gitignore
 */

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION MISTRAL AI
// ═══════════════════════════════════════════════════════════════════

// Clé API Mistral (OPTIONNELLE avec BYOK)
// Obtenez-la sur : https://console.mistral.ai/
// Si vide, les utilisateurs devront fournir leur propre clé (BYOK)
define('MISTRAL_API_KEY', 'clefmagiqueici');

// Modèle à utiliser par défaut
// Options gratuites recommandées :
// - 'open-mistral-7b' : Rapide et léger
// - 'open-mixtral-8x7b' : Plus puissant, excellent pour le français (RECOMMANDÉ)
// Options payantes :
// - 'mistral-small-latest' : Bon rapport qualité/prix
// - 'mistral-large-latest' : Le plus performant
define('MISTRAL_MODEL', 'open-mixtral-8x7b');

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION APPLICATION
// ═══════════════════════════════════════════════════════════════════

// Informations de votre application
define('APP_NAME', 'ErgoMate');
define('APP_URL', 'https://ergo-mate.mehdydriouech.fr');

// Configuration optionnelle
define('DEBUG_MODE', false); // Mettre à true pour voir les logs détaillés

// Domaines autorisés pour CORS
// En production, remplacez * par votre domaine spécifique
define('ALLOWED_ORIGIN', 'https://ergo-mate.mehdydriouech.fr');

// Timeout pour les appels API (en secondes)
// Mistral peut prendre du temps pour générer du contenu long
define('API_TIMEOUT', 240);

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION DASHBOARD
// ═══════════════════════════════════════════════════════════════════

// Authentification pour accéder au dashboard de monitoring
define('DASHBOARD_LOGIN', 'admin');
define('DASHBOARD_PASSWORD', 'admin');

// Répertoire de stockage des logs
define('LOGS_DIR', __DIR__ . '/logs-api');

// Durée de rétention des logs (en jours)
define('LOGS_RETENTION_DAYS', 30); 

// ═══════════════════════════════════════════════════════════════════
// NOTES IMPORTANTES
// ═══════════════════════════════════════════════════════════════════

/*
 * BYOK (Bring Your Own Key) :
 * ------------------------------
 * Si MISTRAL_API_KEY est vide, l'API acceptera les clés fournies
 * par les utilisateurs via le champ "apiKey" dans les requêtes.
 * 
 * Exemple de requête avec BYOK :
 * {
 *   "apiKey": "sk-...",
 *   "text": "Contenu du document...",
 *   "config": { ... }
 * }
 * 
 * Modèles gratuits :
 * ------------------
 * Mistral offre un tier gratuit généreux avec :
 * - 1 requête/seconde
 * - 500k tokens/minute
 * - 1 milliard tokens/mois
 * 
 * Parfait pour un usage personnel ou de petites équipes !
 * 
 * Documentation :
 * ---------------
 * https://docs.mistral.ai/
 */
?>
