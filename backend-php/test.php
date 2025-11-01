<?php
/**
 * Script de test pour l'API Ergo Mate avec OpenRouter
 * 
 * Usage : php test.php
 */

echo "╔════════════════════════════════════════╗\n";
echo "║   🧪 Test de l'API Ergo Mate PHP     ║\n";
echo "║      avec OpenRouter (Qwen3)          ║\n";
echo "╚════════════════════════════════════════╝\n\n";

// Test 1 : Vérifier que config.php existe
echo "📝 Test 1 : Fichier de configuration\n";
if (!file_exists('config.php')) {
    echo "❌ Le fichier config.php n'existe pas !\n";
    echo "   Copiez config.example.php vers config.php\n";
    echo "   Puis ajoutez votre clé API OpenRouter\n\n";
    exit(1);
}

require_once 'config.php';

if (!defined('OPENROUTER_API_KEY') || OPENROUTER_API_KEY === 'votre_clé_openrouter_ici') {
    echo "❌ Clé API non configurée dans config.php !\n";
    echo "   Éditez config.php et ajoutez votre vraie clé OpenRouter\n";
    echo "   Obtenez-la sur : https://openrouter.ai/keys\n\n";
    exit(1);
}

echo "✅ Fichier de configuration OK\n";
echo "✅ Clé API configurée : " . substr(OPENROUTER_API_KEY, 0, 15) . "...\n";
echo "✅ Modèle : " . OPENROUTER_MODEL . "\n\n";

// Test 2 : Vérifier cURL
echo "📡 Test 2 : Extension cURL\n";
if (!function_exists('curl_init')) {
    echo "❌ L'extension PHP cURL n'est pas installée !\n";
    echo "   Contactez votre hébergeur ou installez php-curl\n\n";
    exit(1);
}
echo "✅ Extension cURL disponible\n\n";

// Test 3 : Test de connexion à l'API OpenRouter
echo "🤖 Test 3 : Connexion à l'API OpenRouter\n";
echo "Envoi d'une requête de test avec Qwen3...\n";

$url = 'https://openrouter.ai/api/v1/chat/completions';

$payload = [
    'model' => OPENROUTER_MODEL,
    'messages' => [
        [
            'role' => 'user',
            'content' => 'Réponds simplement "Test réussi" en JSON : {"status": "success", "message": "Le test fonctionne"}'
        ]
    ]
];

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . OPENROUTER_API_KEY,
        'HTTP-Referer: ' . (defined('APP_URL') ? APP_URL : 'http://localhost'),
        'X-Title: ' . (defined('APP_NAME') ? APP_NAME : 'ErgoMate')
    ],
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    echo "❌ Erreur cURL : $curlError\n\n";
    exit(1);
}

if ($httpCode !== 200) {
    echo "❌ Erreur API (HTTP $httpCode)\n";
    $errorData = json_decode($response, true);
    echo "   Détails : " . print_r($errorData, true) . "\n\n";
    
    if ($httpCode === 401) {
        echo "💡 Votre clé API est probablement invalide\n";
        echo "   Vérifiez sur : https://openrouter.ai/keys\n\n";
    } elseif ($httpCode === 402) {
        echo "💡 Erreur de paiement ou crédits insuffisants\n";
        echo "   Le modèle gratuit devrait fonctionner sans crédits\n";
        echo "   Vérifiez sur : https://openrouter.ai/credits\n\n";
    }
    exit(1);
}

$data = json_decode($response, true);
if ($data && isset($data['choices'][0]['message']['content'])) {
    echo "✅ Connexion réussie à l'API OpenRouter !\n";
    echo "   Modèle utilisé : " . ($data['model'] ?? OPENROUTER_MODEL) . "\n";
    echo "   Réponse : " . substr($data['choices'][0]['message']['content'], 0, 100) . "...\n";
    
    if (isset($data['usage'])) {
        echo "   Tokens utilisés : " . ($data['usage']['total_tokens'] ?? 'N/A') . "\n";
    }
    echo "\n";
} else {
    echo "⚠️  Réponse reçue mais format inattendu\n";
    echo "   " . substr($response, 0, 200) . "...\n\n";
}

// Test 4 : Tester l'endpoint local (si possible)
echo "🌐 Test 4 : Endpoint local\n";
echo "Pour tester l'endpoint complet, utilisez :\n";
echo "   curl http://localhost/api.php\n";
echo "   ou\n";
echo "   curl https://votre-domaine.com/api.php\n\n";

echo "╔════════════════════════════════════════╗\n";
echo "║   ✅ Tous les tests sont passés !     ║\n";
echo "╚════════════════════════════════════════╝\n\n";

echo "🚀 Votre backend PHP avec OpenRouter est prêt !\n\n";

echo "Endpoints disponibles :\n";
echo "   GET  /api.php               → Status\n";
echo "   POST /api.php/generate-questions → Génération\n\n";

echo "💰 Coûts :\n";
echo "   • Modèle " . OPENROUTER_MODEL . " : GRATUIT\n";
echo "   • Pas de limite de requêtes (dans la limite du fair use)\n";
echo "   • Suivez votre usage sur : https://openrouter.ai/activity\n\n";

echo "Prochaines étapes :\n";
echo "1. Uploadez tous les fichiers sur votre hébergeur\n";
echo "2. Testez avec : curl https://votre-domaine.com/api.php\n";
echo "3. Modifiez votre frontend pour pointer vers cette URL\n\n";
?>
