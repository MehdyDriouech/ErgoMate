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
 * Construit le prompt complet optimisé pour Mistral AI
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
Tu es un expert pédagogique spécialisé dans la création de contenus éducatifs de haute qualité.

Ta mission : Analyser le contenu ci-dessous et générer un thème de révision complet au format JSON STRICT comprenant :
1. Des questions de révision variées et pertinentes
2. Des fiches de révision structurées et complètes

═══════════════════════════════════════════════════════════════════
📚 DOCUMENT SOURCE :
═══════════════════════════════════════════════════════════════════

📄 Nom du fichier : $fileName$authorInfo

CONTENU :
---
$truncatedText
---

═══════════════════════════════════════════════════════════════════
⚙️ PARAMÈTRES DE GÉNÉRATION :
═══════════════════════════════════════════════════════════════════

📊 QUANTITÉ EXACTE REQUISE :
→ Tu DOIS générer EXACTEMENT $questionCount questions (ni plus, ni moins)
→ Répartis-les équitablement entre les types demandés

🎯 TYPES DE QUESTIONS À GÉNÉRER :
$typesString

📈 NIVEAU DE DIFFICULTÉ : $difficulty
→ $difficultyText

═══════════════════════════════════════════════════════════════════
📋 FORMAT JSON EXACT À RESPECTER :
═══════════════════════════════════════════════════════════════════

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
        {"id": "a", "label": "Première option"},
        {"id": "b", "label": "Deuxième option"},
        {"id": "c", "label": "Troisième option"},
        {"id": "d", "label": "Quatrième option"}
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
      "sectionTitle": "Section thématique 1",
      "cards": [
        {
          "id": "rev_001",
          "type": "introduction",
          "title": "Titre de la carte",
          "content": "Contenu synthétique de la carte",
          "keyPoints": ["Point clé 1", "Point clé 2"],
          "tags": ["introduction"],
          "relatedQuestions": ["q001"]
        },
        {
          "id": "rev_002",
          "type": "detailed_concept",
          "title": "Concept détaillé",
          "content": "Description du concept",
          "historicalContext": {
            "author": "Auteur",
            "period": "Période",
            "location": "Lieu"
          },
          "keyConcepts": [
            {
              "name": "Concept 1",
              "definition": "Définition"
            }
          ],
          "therapeuticDevice": {
            "participants": "Description",
            "objective": "Objectif",
            "techniques": ["Technique 1"],
            "constraint": "Contraintes"
          },
          "tags": ["concept"],
          "relatedQuestions": ["q002"]
        },
        {
          "id": "rev_003",
          "type": "comparison",
          "title": "Comparaison d'éléments",
          "content": "Introduction",
          "professionals": [
            {
              "title": "Élément A",
              "formation": "Caractéristique",
              "status": "Statut",
              "canPrescribe": false,
              "reimbursement": false,
              "specificities": ["Spécificité 1"]
            }
          ],
          "keyDifference": "Différence principale",
          "tags": ["comparaison"],
          "relatedQuestions": ["q003"]
        },
        {
          "id": "rev_004",
          "type": "focus",
          "title": "Focus sur un aspect",
          "content": "Description",
          "intervention": "Type",
          "objective": "Objectif",
          "formation": "Formation",
          "examples": ["Exemple 1"],
          "tags": ["focus"]
        },
        {
          "id": "rev_005",
          "type": "key_takeaways",
          "title": "Points essentiels",
          "takeaways": [
            {
              "topic": "Sujet 1",
              "point": "Point essentiel"
            }
          ],
          "tags": ["synthèse"]
        },
        {
          "id": "rev_006",
          "type": "mnemonic",
          "title": "Moyens mnémotechniques",
          "mnemonics": [
            {
              "concept": "Concept",
              "technique": "Acronyme",
              "breakdown": ["Élément 1"]
            }
          ],
          "tags": ["mnémotechnique"]
        }
      ]
    }
  ]
}

═══════════════════════════════════════════════════════════════════
✅ RÈGLES ABSOLUES :
═══════════════════════════════════════════════════════════════════

1. QUESTIONS :
   ☑ Exactement $questionCount questions
   ☑ Chaque question a un "rationale" détaillé et pédagogique
   ☑ Les QCM ont 4 choix (A, B, C, D)
   ☑ Les IDs sont séquentiels (q001, q002, q003...)
   ☑ Les tags sont pertinents et descriptifs
   ☑ Les questions couvrent l'ensemble du document

2. FICHES DE RÉVISION :
   ☑ Créer 2-6 sections thématiques selon le contenu
   ☑ Chaque section contient 2-5 cartes minimum
   ☑ Utiliser TOUS les types de cartes disponibles
   ☑ Les cartes sont riches et complètes
   ☑ Les relatedQuestions font référence aux IDs existants

3. QUALITÉ DU CONTENU :
   ☑ Français correct et professionnel
   ☑ Contenu précis et factuel
   ☑ Explications claires et pédagogiques
   ☑ Vocabulaire adapté au niveau

4. FORMAT TECHNIQUE :
   ☑ JSON valide et strictement conforme
   ☑ Commence par { et finit par }
   ☑ AUCUN texte avant ou après le JSON
   ☑ PAS de balises markdown (```json)
   ☑ Tous les champs obligatoires présents
   ☑ Encodage UTF-8 correct

═══════════════════════════════════════════════════════════════════
🚀 GÉNÉRATION :
═══════════════════════════════════════════════════════════════════

Réponds UNIQUEMENT avec le JSON complet et valide.
Commence IMMÉDIATEMENT par le caractère {
Aucun texte explicatif, aucune balise markdown.

EOT;
}

/**
 * Construit le prompt simple (legacy) optimisé pour Mistral
 */
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
