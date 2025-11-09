<?php
/**
 * API Backend PHP v3 pour Ergo Mate
 * Génère un format complet avec questions ET fiches de révision
 * Optimisé pour Mistral AI avec support BYOK (Bring Your Own Key)
 */

// Configuration CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Gérer les requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Charger la configuration (optionnelle maintenant avec BYOK)
if (file_exists('config.php')) {
    require_once 'config.php';
}

// ═══════════════════════════════════════════════════════════════════
// SYSTÈME DE LOGGING
// ═══════════════════════════════════════════════════════════════════

/**
 * Enregistre une requête dans les logs JSON
 */
function logRequest($logData) {
    if (!defined('LOGS_DIR')) {
        return; // Pas de logging si pas configuré
    }
    
    $logsDir = LOGS_DIR;
    
    // Créer le dossier logs si nécessaire
    if (!file_exists($logsDir)) {
        mkdir($logsDir, 0755, true);
    }
    
    // Nom du fichier : YYYY-MM-DD.json
    $logFile = $logsDir . '/' . date('Y-m-d') . '.json';
    
    // Ajouter le timestamp ISO 8601
    $logData['timestamp'] = date('c');
    
    // Écrire la ligne JSON (append)
    file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
    
    // Nettoyage périodique (1 chance sur 100)
    if (rand(1, 100) === 1) {
        cleanOldLogs();
    }
}

/**
 * Nettoie les logs de plus de X jours
 */
function cleanOldLogs() {
    if (!defined('LOGS_DIR') || !defined('LOGS_RETENTION_DAYS')) {
        return;
    }
    
    $logsDir = LOGS_DIR;
    $retentionDays = LOGS_RETENTION_DAYS;
    
    if (!is_dir($logsDir)) {
        return;
    }
    
    $files = glob($logsDir . '/*.json');
    $cutoffTime = time() - ($retentionDays * 24 * 60 * 60);
    
    foreach ($files as $file) {
        if (filemtime($file) < $cutoffTime) {
            unlink($file);
        }
    }
}

// Route principale
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Endpoint : GET / (test)
if ($requestMethod === 'GET' && preg_match('#/$|/index\.php$|/api\.php$#', $requestUri)) {
    $defaultModel = defined('MISTRAL_MODEL') ? MISTRAL_MODEL : 'open-mixtral-8x7b';
    $hasServerKey = defined('MISTRAL_API_KEY') && !empty(MISTRAL_API_KEY);
    
    echo json_encode([
        'status' => 'ok',
        'message' => 'Backend Ergo Mate API v3 - Mistral AI avec support BYOK',
        'version' => '3.0.0',
        'provider' => 'Mistral AI',
        'model' => $defaultModel,
        'byok' => true,
        'serverKeyConfigured' => $hasServerKey,
        'endpoints' => [
            'POST /generate-questions' => 'Format simple (legacy)',
            'POST /generate-complete-theme' => 'Format complet avec fiches de révision (recommandé)'
        ],
        'timestamp' => date('c')
    ]);
    exit();
}

// Endpoint : POST /generate-complete-theme (RECOMMANDÉ)
if ($requestMethod === 'POST' && preg_match('#/generate-complete-theme#', $requestUri)) {
    generateCompleteTheme();
    exit();
}

// Endpoint : POST /generate-questions (LEGACY - garde la compatibilité)
if ($requestMethod === 'POST' && preg_match('#/generate-questions#', $requestUri)) {
    generateQuestions();
    exit();
}

// Route non trouvée
http_response_code(404);
echo json_encode([
    'error' => 'Endpoint non trouvé',
    'available_endpoints' => [
        'GET /' => 'Status du serveur',
        'POST /generate-questions' => 'Génération de questions (format simple)',
        'POST /generate-complete-theme' => 'Génération complète avec fiches de révision'
    ]
]);
exit();

/**
 * Génère un thème complet (questions + fiches de révision)
 */
function generateCompleteTheme() {
    // Début du timer
    $startTime = microtime(true);
    $logData = [
        'endpoint' => '/generate-complete-theme',
        'method' => 'POST',
        'success' => false,
        'httpCode' => 200,
        'executionTime' => 0,
        'mistralApiTime' => 0,
        'config' => [],
        'textLength' => 0,
        'wordCount' => 0,
        'customApiKey' => false,
        'errorType' => null,
        'errorDetails' => null,
        'tokensUsed' => null
    ];
    
    // Récupérer les données POST
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Validation des données
    if (!$data) {
        $logData['success'] = false;
        $logData['httpCode'] = 400;
        $logData['errorType'] = 'invalid_json';
        $logData['errorDetails'] = 'Données JSON invalides';
        $logData['executionTime'] = microtime(true) - $startTime;
        logRequest($logData);
        
        http_response_code(400);
        echo json_encode([
            'error' => 'Données JSON invalides'
        ]);
        return;
    }
    
    if (!isset($data['text']) || !isset($data['config'])) {
        $logData['success'] = false;
        $logData['httpCode'] = 400;
        $logData['errorType'] = 'missing_params';
        $logData['errorDetails'] = 'Données manquantes. "text" et "config" sont requis.';
        $logData['executionTime'] = microtime(true) - $startTime;
        logRequest($logData);
        
        http_response_code(400);
        echo json_encode([
            'error' => 'Données manquantes. "text" et "config" sont requis.'
        ]);
        return;
    }
    
    $text = $data['text'];
    $config = $data['config'];
    
    // Capturer les métriques
    $logData['textLength'] = mb_strlen($text);
    $logData['wordCount'] = str_word_count($text);
    $logData['config'] = [
        'questionCount' => $config['questionCount'] ?? 0,
        'difficulty' => $config['difficulty'] ?? 'unknown',
        'types' => $config['types'] ?? [],
        'model' => isset($data['model']) ? $data['model'] : getDefaultModel()
    ];
    
    // Récupérer la clé API (BYOK ou serveur)
    $apiKey = getApiKey($data);
    $logData['customApiKey'] = isset($data['apiKey']) && !empty($data['apiKey']);
    
    if (!$apiKey) {
        $logData['success'] = false;
        $logData['httpCode'] = 401;
        $logData['errorType'] = 'missing_api_key';
        $logData['errorDetails'] = 'Clé API manquante';
        $logData['executionTime'] = microtime(true) - $startTime;
        logRequest($logData);
        
        http_response_code(401);
        echo json_encode([
            'error' => 'Clé API manquante',
            'message' => 'Veuillez fournir une clé API Mistral dans le champ "apiKey" ou configurer une clé serveur dans config.php'
        ]);
        return;
    }
    
    // Récupérer le modèle (utilisateur ou défaut)
    $model = isset($data['model']) ? $data['model'] : getDefaultModel();
    
    // Récupérer les métadonnées optionnelles
    $metadata = isset($data['metadata']) ? $data['metadata'] : [];
    $fileName = isset($metadata['fileName']) ? $metadata['fileName'] : 'document.pdf';
    $pdfAuthor = isset($metadata['author']) ? $metadata['author'] : null;
    
    // Log de la requête
    error_log("🔥 Génération complète : {$config['questionCount']} questions + fiches de révision (Modèle: $model)");
    
    // Construire le prompt pour le format complet
    $prompt = buildCompleteThemePrompt($text, $config, $fileName, $pdfAuthor);
    
    // Appel à l'API Mistral avec mesure du temps
    $mistralStartTime = microtime(true);
    $mistralResponse = callMistralAPI($prompt, $apiKey, $model);
    $mistralEndTime = microtime(true);
    
    $logData['mistralApiTime'] = $mistralEndTime - $mistralStartTime;
    
    if ($mistralResponse['success']) {
        $logData['success'] = true;
        $logData['httpCode'] = 200;
        $logData['tokensUsed'] = $mistralResponse['tokens'] ?? null;
        $logData['executionTime'] = microtime(true) - $startTime;
        logRequest($logData);
        
        echo json_encode($mistralResponse['data']);
    } else {
        $logData['success'] = false;
        $logData['httpCode'] = $mistralResponse['http_code'];
        $logData['errorType'] = 'mistral_api_error';
        $logData['errorDetails'] = $mistralResponse['error'];
        $logData['executionTime'] = microtime(true) - $startTime;
        logRequest($logData);
        
        http_response_code($mistralResponse['http_code']);
        echo json_encode([
            'error' => $mistralResponse['error'],
            'details' => $mistralResponse['details']
        ]);
    }
}

/**
 * Génère des questions (format simple - legacy)
 */
function generateQuestions() {
    // Début du timer
    $startTime = microtime(true);
    $logData = [
        'endpoint' => '/generate-questions',
        'method' => 'POST',
        'success' => false,
        'httpCode' => 200,
        'executionTime' => 0,
        'mistralApiTime' => 0,
        'config' => [],
        'textLength' => 0,
        'wordCount' => 0,
        'customApiKey' => false,
        'errorType' => null,
        'errorDetails' => null,
        'tokensUsed' => null
    ];
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        $logData['success'] = false;
        $logData['httpCode'] = 400;
        $logData['errorType'] = 'invalid_json';
        $logData['errorDetails'] = 'Données JSON invalides';
        $logData['executionTime'] = microtime(true) - $startTime;
        logRequest($logData);
        
        http_response_code(400);
        echo json_encode(['error' => 'Données JSON invalides']);
        return;
    }
    
    if (!isset($data['text']) || !isset($data['config'])) {
        $logData['success'] = false;
        $logData['httpCode'] = 400;
        $logData['errorType'] = 'missing_params';
        $logData['errorDetails'] = 'Données manquantes';
        $logData['executionTime'] = microtime(true) - $startTime;
        logRequest($logData);
        
        http_response_code(400);
        echo json_encode(['error' => 'Données manquantes. "text" et "config" sont requis.']);
        return;
    }
    
    $text = $data['text'];
    $config = $data['config'];
    
    // Capturer les métriques
    $logData['textLength'] = mb_strlen($text);
    $logData['wordCount'] = str_word_count($text);
    $logData['config'] = [
        'questionCount' => $config['questionCount'] ?? 0,
        'difficulty' => $config['difficulty'] ?? 'unknown',
        'types' => $config['types'] ?? [],
        'model' => isset($data['model']) ? $data['model'] : getDefaultModel()
    ];
    
    // Récupérer la clé API
    $apiKey = getApiKey($data);
    $logData['customApiKey'] = isset($data['apiKey']) && !empty($data['apiKey']);
    
    if (!$apiKey) {
        $logData['success'] = false;
        $logData['httpCode'] = 401;
        $logData['errorType'] = 'missing_api_key';
        $logData['errorDetails'] = 'Clé API manquante';
        $logData['executionTime'] = microtime(true) - $startTime;
        logRequest($logData);
        
        http_response_code(401);
        echo json_encode([
            'error' => 'Clé API manquante',
            'message' => 'Veuillez fournir une clé API Mistral dans le champ "apiKey" ou configurer une clé serveur dans config.php'
        ]);
        return;
    }
    
    // Récupérer le modèle
    $model = isset($data['model']) ? $data['model'] : getDefaultModel();
    
    $prompt = isset($data['prompt']) ? $data['prompt'] : buildPrompt($text, $config);
    
    error_log("🔥 Génération simple : {$config['questionCount']} questions (Modèle: $model)");
    
    // Appel à l'API Mistral avec mesure du temps
    $mistralStartTime = microtime(true);
    $mistralResponse = callMistralAPI($prompt, $apiKey, $model);
    $mistralEndTime = microtime(true);
    
    $logData['mistralApiTime'] = $mistralEndTime - $mistralStartTime;
    
    if ($mistralResponse['success']) {
        $logData['success'] = true;
        $logData['httpCode'] = 200;
        $logData['tokensUsed'] = $mistralResponse['tokens'] ?? null;
        $logData['executionTime'] = microtime(true) - $startTime;
        logRequest($logData);
        
        echo json_encode($mistralResponse['data']);
    } else {
        $logData['success'] = false;
        $logData['httpCode'] = $mistralResponse['http_code'];
        $logData['errorType'] = 'mistral_api_error';
        $logData['errorDetails'] = $mistralResponse['error'];
        $logData['executionTime'] = microtime(true) - $startTime;
        logRequest($logData);
        
        http_response_code($mistralResponse['http_code']);
        echo json_encode([
            'error' => $mistralResponse['error'],
            'details' => $mistralResponse['details']
        ]);
    }
}

/**
 * Récupère la clé API (BYOK prioritaire, sinon serveur)
 */
function getApiKey($data) {
    // Priorité 1 : Clé fournie par l'utilisateur (BYOK)
    if (isset($data['apiKey']) && !empty($data['apiKey'])) {
        return $data['apiKey'];
    }
    
    // Priorité 2 : Clé serveur (config.php)
    if (defined('MISTRAL_API_KEY') && !empty(MISTRAL_API_KEY)) {
        return MISTRAL_API_KEY;
    }
    
    return null;
}

/**
 * Récupère le modèle par défaut
 */
function getDefaultModel() {
    if (defined('MISTRAL_MODEL') && !empty(MISTRAL_MODEL)) {
        return MISTRAL_MODEL;
    }
    return 'open-mixtral-8x7b'; // Modèle gratuit par défaut
}

/**
 * Appelle l'API Mistral AI via cURL
 */
function callMistralAPI($prompt, $apiKey, $model) {
    $url = 'https://api.mistral.ai/v1/chat/completions';
    
    $payload = [
        'model' => $model,
        'messages' => [
            [
                'role' => 'user',
                'content' => $prompt
            ]
        ],
        'temperature' => 0.7,
        'max_tokens' => 16000
    ];
    
    $ch = curl_init($url);
    
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey
        ],
        CURLOPT_TIMEOUT => defined('API_TIMEOUT') ? API_TIMEOUT : 60,
        CURLOPT_SSL_VERIFYPEER => true
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    // Erreur cURL
    if ($curlError) {
        error_log("❌ Erreur cURL: $curlError");
        return [
            'success' => false,
            'http_code' => 500,
            'error' => 'Erreur de connexion à l\'API Mistral',
            'details' => $curlError
        ];
    }
    
    // Erreur HTTP
    if ($httpCode !== 200) {
        $errorData = json_decode($response, true);
        error_log("❌ Erreur API Mistral (HTTP $httpCode): " . print_r($errorData, true));
        return [
            'success' => false,
            'http_code' => $httpCode,
            'error' => "Erreur API Mistral: $httpCode",
            'details' => $errorData
        ];
    }
    
    // Succès
    $responseData = json_decode($response, true);
    
    if (!$responseData) {
        return [
            'success' => false,
            'http_code' => 500,
            'error' => 'Réponse API invalide',
            'details' => 'Impossible de parser la réponse JSON'
        ];
    }
    
    // Extraire le contenu de la réponse Mistral
    if (!isset($responseData['choices'][0]['message']['content'])) {
        return [
            'success' => false,
            'http_code' => 500,
            'error' => 'Format de réponse inattendu',
            'details' => 'Le champ choices[0].message.content est manquant'
        ];
    }
    
    $content = $responseData['choices'][0]['message']['content'];
    
    // Nettoyer le contenu (enlever les balises markdown potentielles)
    $content = preg_replace('/^```json\s*/m', '', $content);
    $content = preg_replace('/\s*```$/m', '', $content);
    $content = trim($content);
    
    // Parser le JSON
    $parsedContent = json_decode($content, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return [
            'success' => false,
            'http_code' => 500,
            'error' => 'Réponse JSON invalide du modèle',
            'details' => [
                'json_error' => json_last_error_msg(),
                'content_preview' => substr($content, 0, 500)
            ]
        ];
    }
    
    // Extraire les tokens utilisés si disponibles
    $tokens = null;
    if (isset($responseData['usage'])) {
        $tokens = [
            'prompt_tokens' => $responseData['usage']['prompt_tokens'] ?? 0,
            'completion_tokens' => $responseData['usage']['completion_tokens'] ?? 0,
            'total_tokens' => $responseData['usage']['total_tokens'] ?? 0
        ];
    }
    
    return [
        'success' => true,
        'data' => $parsedContent,
        'tokens' => $tokens
    ];
}


/**
 * Construit le prompt complet (questions + fiches de révision) optimisé pour Mistral
 * VERSION 2 : Avec support Mermaid et structure revision.sections
 */
function buildCompleteThemePrompt($text, $config, $fileName, $pdfAuthor) {
    $typeLabels = [
        'mcq' => 'QCM (Questions à Choix Multiples)',
        'true_false' => 'Vrai/Faux',
        'fill_in' => 'Questions à compléter'
    ];
    
    $difficultyInstructions = [
        'facile' => 'Questions simples testant la mémorisation et la compréhension de base',
        'moyen' => 'Questions de compréhension approfondie et d\'application des concepts',
        'difficile' => 'Questions complexes nécessitant analyse, synthèse et raisonnement critique'
    ];
    
    $typesText = array_map(function($type) use ($typeLabels) {
        return "- " . $typeLabels[$type];
    }, $config['types']);
    
    // Tronquer le texte si nécessaire
    $maxChars = 30000;
    $truncatedText = mb_strlen($text) > $maxChars 
        ? mb_substr($text, 0, $maxChars) . "\n\n[...texte tronqué pour optimisation...]" 
        : $text;
    
    $questionCount = $config['questionCount'];
    $difficulty = $config['difficulty'];
    $typesString = implode("\n", $typesText);
    $difficultyText = $difficultyInstructions[$difficulty];
    
    $authorInfo = $pdfAuthor ? "\n📝 Auteur du document : $pdfAuthor" : "";
    
    return <<<EOT
u es un expert pédagogique spécialisé dans la création de contenus éducatifs de haute qualité.

Ta mission : Analyser le contenu ci-dessous et générer un thème de révision complet au format JSON STRICT comprenant des questions de révision variées et des fiches de révision structurées avec support des diagrammes Mermaid.js.

═══════════════════════════════════════════════════════════════════
📚 DOCUMENT SOURCE
═══════════════════════════════════════════════════════════════════

📄 Nom du fichier : $fileName$authorInfo

CONTENU :
---
$truncatedText
---

═══════════════════════════════════════════════════════════════════
⚙️ PARAMÈTRES
═══════════════════════════════════════════════════════════════════

→ EXACTEMENT $questionCount questions (ni plus, ni moins)
→ Types : $typesString
→ Niveau : $difficulty ($difficultyText)

═══════════════════════════════════════════════════════════════════
⚠️⚠️⚠️ ATTENTION MISTRAL - RÈGLE CRITIQUE N°1 ⚠️⚠️⚠️
═══════════════════════════════════════════════════════════════════

🚨 DOUBLE BACKSLASH OBLIGATOIRE POUR LES RETOURS À LA LIGNE 🚨

Dans les chaînes JSON, pour les retours à la ligne tu DOIS utiliser :
→ DEUX backslashes suivis de n : \\n
→ PAS un seul backslash : \n

RÉPÈTE MENTALEMENT : "double backslash n" = \\n

❌ FAUX (ne fonctionne PAS) :
"mermaid": "flowchart TD\n    A --> B"
           ↑ UN SEUL backslash = ERREUR

✅ JUSTE (ce que tu DOIS écrire) :
"mermaid": "flowchart TD\\n    A --> B"
           ↑↑ DEUX backslashes = CORRECT

VÉRIFIE SYSTÉMATIQUEMENT : Est-ce que j'ai mis DEUX backslashes (\\n) ?

═══════════════════════════════════════════════════════════════════
✅ RÈGLES ABSOLUES
═══════════════════════════════════════════════════════════════════

QUESTIONS :
☑ Exactement $questionCount questions avec IDs séquentiels (q001, q002...)
☑ Chaque question a un "rationale" détaillé et pédagogique
☑ QCM = 4 choix (a, b, c, d)
☑ Tags pertinents et descriptifs

STRUCTURE REVISION :
☑ Utiliser "revision" avec "sections" (PAS "revisionCards")
☑ 2-6 sections avec order séquentiel (1, 2, 3...)
☑ 3-8 cartes variées par section
☑ IDs format : rev_[type]_[numéro]
☑ 2-4 cartes diagram_mermaid par thème pour visualisation

FORMAT TECHNIQUE :
☑ JSON valide : commence par { finit par }
☑ AUCUN texte avant/après le JSON
☑ PAS de balises markdown (```json)
☑ Encodage UTF-8, caractères spéciaux échappés
☑ DOUBLE BACKSLASH pour \n dans les diagrammes : \\n

═══════════════════════════════════════════════════════════════════
📊 DIAGRAMMES MERMAID - FORMAT JSON CRITIQUE
═══════════════════════════════════════════════════════════════════

RÈGLE ABSOLUE :
Dans une chaîne JSON, un retour à la ligne s'écrit avec DEUX backslashes :

Exemple concret dans ton JSON :
{
  "mermaid": "flowchart TD\\n    A[Début]"
}

Ce que le système verra après parsing JSON :
flowchart TD
    A[Début]

TYPES DISPONIBLES (tous supportés) :
• mindmap → Hiérarchie de concepts, taxonomie
• flowchart TD/LR/BT/RL → Processus, décisions, workflows  
• graph LR/TD → Relations simples entre éléments
• sequenceDiagram → Interactions temporelles
• pie → Proportions, statistiques
• stateDiagram-v2 → États, transitions, cycles
• classDiagram → Structures, classifications

RÈGLE TECHNIQUE RÉPÉTÉE :
☑ Toujours \\n (deux backslashes + n)
☑ JAMAIS de vraies nouvelles lignes dans la valeur "mermaid"
☑ Code complet dans UNE chaîne de caractères
☑ Indentation cohérente : 2 ou 4 espaces (pas de mélange)

═══════════════════════════════════════════════════════════════════
🧠 TYPE 1 : MINDMAP - Règles détaillées
═══════════════════════════════════════════════════════════════════

☑ Chaque nœud sur UNE SEULE ligne (séparer avec \\n)
☑ Un seul root : root((Texte))
☑ Labels multi-mots : Noeud (Label avec espaces)
☑ Indentation : 2 ou 4 espaces par niveau, COHÉRENT

❌ FAUX - Deux niveaux pour un concept :
{
  "mermaid": "mindmap\\n  root((Psychologie))\\n    TCC\\n      Thérapies cognitivo-comportementales"
}

✅ JUSTE - Tout sur une ligne :
{
  "mermaid": "mindmap\\n  root((Psychologie))\\n    TCC (Thérapies Cognitivo-Comportementales)"
}

EXEMPLE COMPLET VALIDE (à copier ce pattern) :
{
  "id": "rev_mermaid_001",
  "type": "diagram_mermaid",
  "title": "Carte Mentale des Concepts",
  "mermaid": "mindmap\\n  root((Concept Central))\\n    Branche A\\n      Sous-concept 1\\n      Sous-concept 2\\n    Branche B\\n      Sous-concept 3\\n    Branche C (Label multi-mots)",
  "note": "Description du diagramme",
  "tags": ["mindmap", "concepts"],
  "relatedQuestions": ["q001"]
}

RAPPEL : \\n = DEUX backslashes + n

═══════════════════════════════════════════════════════════════════
📈 TYPE 2 : FLOWCHART - Règles détaillées
═══════════════════════════════════════════════════════════════════

☑ Déclarer type : flowchart TD (ou LR, BT, RL)
  • TD = haut vers bas (Top-Down)
  • LR = gauche vers droite (Left-Right)
  • BT = bas vers haut (Bottom-Top)
  • RL = droite vers gauche (Right-Left)

☑ IDs courts : A, B, C, D, E...

☑ Formes de nœuds :
  • [Texte] = Rectangle
  • (Texte) = Rectangle arrondi
  • {Texte} = Losange (pour décisions)
  • ((Texte)) = Cercle

☑ Types de flèches :
  • --> = Flèche normale
  • ==> = Flèche épaisse
  • -.-> = Flèche pointillée
  • -->|Label| = Flèche avec texte

EXEMPLE COMPLET VALIDE (à copier ce pattern) :
{
  "id": "rev_mermaid_002",
  "type": "diagram_mermaid",
  "title": "Processus de Décision",
  "mermaid": "flowchart TD\\n    A[Étape initiale] --> B{Question décisive?}\\n    B -->|Oui| C[Action positive]\\n    B -->|Non| D[Action alternative]\\n    C --> E[Résultat final]\\n    D --> E",
  "note": "Description du processus",
  "tags": ["flowchart", "processus"],
  "relatedQuestions": ["q002"]
}

RAPPEL : \\n = DEUX backslashes + n (pas un seul)

═══════════════════════════════════════════════════════════════════
🔗 TYPE 3 : GRAPH - Règles détaillées
═══════════════════════════════════════════════════════════════════

☑ Syntaxe : graph LR (ou TD, BT, RL)
☑ Pour montrer relations simples entre éléments
☑ Même syntaxe nœuds/flèches que flowchart

EXEMPLE COMPLET VALIDE :
{
  "id": "rev_mermaid_003",
  "type": "diagram_mermaid",
  "title": "Relations entre Concepts",
  "mermaid": "graph LR\\n    A[Concept A] --> B[Concept B]\\n    A --> C[Concept C]\\n    B --> D[Résultat]\\n    C --> D",
  "note": "Relations et dépendances",
  "tags": ["graph", "relations"],
  "relatedQuestions": ["q003"]
}

RAPPEL : Vérifie que tu as bien écrit \\n (deux backslashes)

═══════════════════════════════════════════════════════════════════
⏱️ TYPE 4 : SEQUENCE DIAGRAM - Règles détaillées
═══════════════════════════════════════════════════════════════════

☑ Syntaxe : sequenceDiagram
☑ Déclarer participants : participant X as Nom Complet
☑ Messages : A->>B: Texte du message
☑ Retours : B-->>A: Réponse
☑ Notes : Note right of A: Texte

EXEMPLE COMPLET VALIDE :
{
  "id": "rev_mermaid_004",
  "type": "diagram_mermaid",
  "title": "Séquence d'Interaction",
  "mermaid": "sequenceDiagram\\n    participant U as Utilisateur\\n    participant S as Système\\n    participant D as Base de données\\n    U->>S: Demande\\n    S->>D: Requête\\n    D-->>S: Données\\n    S-->>U: Réponse\\n    Note right of U: Processus terminé",
  "note": "Déroulement des interactions",
  "tags": ["sequence", "interaction"],
  "relatedQuestions": ["q004"]
}

RAPPEL IMPORTANT : \\n signifie DEUX backslashes suivis de n

═══════════════════════════════════════════════════════════════════
🥧 TYPE 5 : PIE - Règles détaillées
═══════════════════════════════════════════════════════════════════

☑ Syntaxe : pie title Titre du diagramme
☑ Format : "Label" : valeur_numérique
☑ ATTENTION : Échapper les guillemets avec backslash : \\"Label\\"

EXEMPLE COMPLET VALIDE :
{
  "id": "rev_mermaid_005",
  "type": "diagram_mermaid",
  "title": "Répartition Statistique",
  "mermaid": "pie title Distribution des catégories\\n    \\"Catégorie A\\" : 40\\n    \\"Catégorie B\\" : 30\\n    \\"Catégorie C\\" : 20\\n    \\"Autres\\" : 10",
  "note": "Proportions en pourcentage",
  "tags": ["pie", "statistiques"],
  "relatedQuestions": ["q005"]
}

DEUX RAPPELS :
1. \\n = deux backslashes + n (pour les retours à la ligne)
2. \\" = backslash + guillemet (pour les labels dans pie)

═══════════════════════════════════════════════════════════════════
🔄 TYPE 6 : STATE DIAGRAM - Règles détaillées
═══════════════════════════════════════════════════════════════════

☑ Syntaxe : stateDiagram-v2 (noter le -v2)
☑ États début/fin : [*]
☑ Transitions : État1 --> État2 : Label de transition
☑ Pour montrer cycles et évolutions

EXEMPLE COMPLET VALIDE :
{
  "id": "rev_mermaid_006",
  "type": "diagram_mermaid",
  "title": "Cycle d'États",
  "mermaid": "stateDiagram-v2\\n    [*] --> ÉtatInitial\\n    ÉtatInitial --> ÉtatIntermédiaire : Transition 1\\n    ÉtatIntermédiaire --> ÉtatFinal : Transition 2\\n    ÉtatIntermédiaire --> ÉtatInitial : Retour\\n    ÉtatFinal --> [*]",
  "note": "Évolution et transitions d'états",
  "tags": ["state", "transitions"],
  "relatedQuestions": ["q006"]
}

RAPPEL : N'oublie pas les DEUX backslashes pour \\n

═══════════════════════════════════════════════════════════════════
🏗️ TYPE 7 : CLASS DIAGRAM - Règles détaillées
═══════════════════════════════════════════════════════════════════

☑ Syntaxe : classDiagram
☑ Définir classes : class NomClasse{ +attributs +méthodes() }
☑ Relations :
  • --> = association
  • --|> = héritage (is-a)
  • --* = composition (has-a)

EXEMPLE COMPLET VALIDE :
{
  "id": "rev_mermaid_007",
  "type": "diagram_mermaid",
  "title": "Structure de Classes",
  "mermaid": "classDiagram\\n    class ClasseParent{\\n        +attribut1\\n        +attribut2\\n        +méthode()\\n    }\\n    class ClasseEnfant1{\\n        +attributSpécifique\\n        +action()\\n    }\\n    class ClasseEnfant2{\\n        +autrAttribut\\n        +fonction()\\n    }\\n    ClasseParent <|-- ClasseEnfant1\\n    ClasseParent <|-- ClasseEnfant2",
  "note": "Hiérarchie et relations entre classes",
  "tags": ["class", "structure"],
  "relatedQuestions": ["q007"]
}

RAPPEL FINAL : \\n = DEUX backslashes + n (c'est crucial !)

═══════════════════════════════════════════════════════════════════
❌ PIÈGES SPÉCIFIQUES MISTRAL - À ÉVITER ABSOLUMENT
═══════════════════════════════════════════════════════════════════

PIÈGE #1 : Un seul backslash
❌ "mermaid": "flowchart TD\n    A --> B"
✅ "mermaid": "flowchart TD\\n    A --> B"
→ TOUJOURS vérifier : ai-je bien DEUX backslashes ?

PIÈGE #2 : Mindmap multi-lignes
❌ "mindmap\\n  root((R))\\n    Concept\\n      Sa description"
✅ "mindmap\\n  root((R))\\n    Concept (Sa description)"
→ UN concept = UNE ligne

PIÈGE #3 : Indentation incohérente
❌ Mélanger 2 espaces et 4 espaces
✅ Choisir 2 ou 4 espaces et rester cohérent
→ Exemple : toujours 2 espaces par niveau

PIÈGE #4 : Guillemets non échappés dans pie
❌ "pie title T\\n    "Label" : 50"
✅ "pie title T\\n    \\"Label\\" : 50"
→ Dans pie, échapper les guillemets : \\"

PIÈGE #5 : Oublier -v2 dans stateDiagram
❌ "stateDiagram\\n    [*] --> État"
✅ "stateDiagram-v2\\n    [*] --> État"
→ La version moderne est stateDiagram-v2

═══════════════════════════════════════════════════════════════════
📋 STRUCTURE JSON ATTENDUE
═══════════════════════════════════════════════════════════════════

{
  "title": "Titre du thème",
  "description": "Description concise (1-2 phrases)",
  "tags": ["tag1", "tag2", "tag3"],
  "questions": [
    {
      "id": "q001",
      "type": "mcq",
      "prompt": "Question ?",
      "choices": [
        {"id": "a", "label": "Option A"},
        {"id": "b", "label": "Option B"},
        {"id": "c", "label": "Option C"},
        {"id": "d", "label": "Option D"}
      ],
      "answer": "a",
      "rationale": "Explication détaillée",
      "tags": ["concept"]
    },
    {
      "id": "q002",
      "type": "true_false",
      "prompt": "Affirmation",
      "answer": true,
      "rationale": "Explication",
      "tags": ["fait"]
    }
  ],
  "revision": {
    "sections": [
      {
        "id": "section_001",
        "title": "Titre section",
        "order": 1,
        "cards": [
          {
            "id": "rev_summary_001",
            "type": "summary",
            "title": "Titre résumé",
            "content": "Contenu",
            "items": [{"title": "Item", "content": "Description"}],
            "keyPoints": ["Point 1", "Point 2"],
            "tags": ["synthèse"],
            "relatedQuestions": ["q001"]
          },
          {
            "id": "rev_mermaid_001",
            "type": "diagram_mermaid",
            "title": "Titre diagramme",
            "mermaid": "mindmap\\n  root((Concept))\\n    Branche 1\\n      Sous A\\n    Branche 2",
            "note": "Explication",
            "tags": ["visuel"],
            "relatedQuestions": ["q001"]
          }
        ]
      }
    ]
  }
}

TYPES DE CARTES DISPONIBLES :
summary, definition, timeline, comparison, qna, mnemonic, diagram_mermaid,
diagram_textual, focus, key_takeaways, case_study, exercise

═══════════════════════════════════════════════════════════════════
🎯 CHECKLIST FINALE AVANT DE RÉPONDRE
═══════════════════════════════════════════════════════════════════

Vérifie IMPÉRATIVEMENT :

☑ J'ai généré EXACTEMENT $questionCount questions (pas plus, pas moins)
☑ Tous les IDs sont séquentiels : q001, q002, q003...
☑ Dans TOUS mes diagrammes Mermaid, j'ai utilisé \\n (DEUX backslashes)
☑ Pour mindmap : chaque concept est sur UNE seule ligne
☑ L'indentation est cohérente (2 ou 4 espaces, pas de mélange)
☑ Dans les pie charts, les guillemets sont échappés : \\"Label\\"
☑ J'ai utilisé stateDiagram-v2 (pas stateDiagram)
☑ Mon JSON est valide et commence par {
☑ Aucun texte avant { ou après }
☑ Pas de balises markdown ```json
☑ Les relatedQuestions référencent des IDs existants
☑ J'ai inclus 2-4 diagrammes Mermaid dans le thème

VÉRIFICATION SPÉCIALE MISTRAL :
→ Relis tous tes champs "mermaid"
→ Confirme que CHAQUE retour à la ligne est écrit \\n
→ Compte les backslashes : dois-je en voir 2 avant chaque n ? OUI !

═══════════════════════════════════════════════════════════════════
🚀 GÉNÉRATION
═══════════════════════════════════════════════════════════════════

Réponds UNIQUEMENT avec le JSON complet et valide.
Commence IMMÉDIATEMENT par le caractère {
AUCUN texte explicatif.
AUCUNE balise markdown.

DERNIÈRE VÉRIFICATION : Ai-je bien utilisé \\n partout ? (DEUX backslashes)
EOT;
}
function buildPrompt($text, $config) {
    $typeLabels = [
        'mcq' => 'QCM (Questions à Choix Multiples)',
        'true_false' => 'Vrai/Faux',
        'fill_in' => 'Questions à compléter'
    ];
    
    $difficultyInstructions = [
        'facile' => 'Questions simples testant la mémorisation de base',
        'moyen' => 'Questions de compréhension et d\'application',
        'difficile' => 'Questions complexes nécessitant analyse et synthèse'
    ];
    
    $typesText = array_map(function($type) use ($typeLabels) {
        return "- " . $typeLabels[$type];
    }, $config['types']);
    
    $maxChars = 20000;
    $truncatedText = mb_strlen($text) > $maxChars 
        ? mb_substr($text, 0, $maxChars) . "\n\n[...texte tronqué...]" 
        : $text;
    
    $questionCount = $config['questionCount'];
    $difficulty = $config['difficulty'];
    $typesString = implode("\n", $typesText);
    $difficultyText = $difficultyInstructions[$difficulty];
    
    return <<<EOT
Tu es un expert pédagogique spécialisé dans la création de questions de révision.

Ta mission : Générer des questions au format JSON STRICT à partir du contenu ci-dessous.

═══════════════════════════════════════════════════════════════════
📚 CONTENU DU COURS :
═══════════════════════════════════════════════════════════════════

$truncatedText

═══════════════════════════════════════════════════════════════════
⚙️ PARAMÈTRES :
═══════════════════════════════════════════════════════════════════

📊 QUANTITÉ : Exactement $questionCount questions

🎯 TYPES :
$typesString

📈 DIFFICULTÉ : $difficulty
→ $difficultyText

═══════════════════════════════════════════════════════════════════
📋 FORMAT JSON :
═══════════════════════════════════════════════════════════════════

{
  "title": "Titre du thème",
  "description": "Description (1-2 phrases)",
  "tags": ["tag1", "tag2"],
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "prompt": "Question ?",
      "choices": [
        {"id": "a", "label": "Option A"},
        {"id": "b", "label": "Option B"},
        {"id": "c", "label": "Option C"},
        {"id": "d", "label": "Option D"}
      ],
      "answer": "a",
      "rationale": "Explication détaillée"
    },
    {
      "id": "q2",
      "type": "true_false",
      "prompt": "Affirmation",
      "answer": true,
      "rationale": "Explication"
    },
    {
      "id": "q3",
      "type": "fill_in",
      "prompt": "Question avec ___",
      "answer": "réponse",
      "rationale": "Explication"
    }
  ]
}

✅ RÈGLES :
- Exactement $questionCount questions
- JSON valide sans balises markdown
- Commence par { immédiatement
- Rationale obligatoire pour chaque question

Réponds UNIQUEMENT avec le JSON.

EOT;
}
?>
