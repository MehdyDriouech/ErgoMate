<?php
/**
 * API Backend PHP pour Ergo Mate
 * Permet d'appeler l'API OpenRouter (Qwen3) de manière sécurisée
 */

// Configuration CORS
header('Access-Control-Allow-Origin: *'); // En production, remplacez * par votre domaine
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Gérer les requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Charger la configuration
require_once 'config.php';

// Vérifier que la clé API est configurée
if (!defined('OPENROUTER_API_KEY') || empty(OPENROUTER_API_KEY) || OPENROUTER_API_KEY === 'votre_clé_openrouter_ici') {
    http_response_code(500);
    echo json_encode([
        'error' => 'Clé API OpenRouter non configurée sur le serveur',
        'message' => 'Veuillez créer le fichier config.php avec votre clé API OpenRouter'
    ]);
    exit();
}

// Route principale
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Endpoint : GET / (test)
if ($requestMethod === 'GET' && preg_match('#/$|/index\.php$|/api\.php$#', $requestUri)) {
    echo json_encode([
        'status' => 'ok',
        'message' => 'Backend Ergo Mate API PHP - Serveur opérationnel',
        'version' => '2.0.0',
        'model' => OPENROUTER_MODEL,
        'timestamp' => date('c')
    ]);
    exit();
}

// Endpoint : POST /generate-questions
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
        'POST /generate-questions' => 'Génération de questions'
    ]
]);
exit();

/**
 * Génère des questions via l'API OpenRouter (Qwen3)
 */
function generateQuestions() {
    // Récupérer les données POST
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Validation des données
    if (!$data) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Données JSON invalides'
        ]);
        return;
    }
    
    if (!isset($data['text']) || !isset($data['config'])) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Données manquantes. "text" et "config" sont requis.'
        ]);
        return;
    }
    
    $text = $data['text'];
    $config = $data['config'];
    $prompt = isset($data['prompt']) ? $data['prompt'] : buildPrompt($text, $config);
    
    // Log de la requête (optionnel)
    error_log("🔥 Génération de {$config['questionCount']} questions avec Qwen3...");
    
    // Appel à l'API OpenRouter
    $openRouterResponse = callOpenRouterAPI($prompt);
    
    if ($openRouterResponse['success']) {
        echo json_encode($openRouterResponse['data']);
    } else {
        http_response_code($openRouterResponse['http_code']);
        echo json_encode([
            'error' => $openRouterResponse['error'],
            'details' => $openRouterResponse['details']
        ]);
    }
}

/**
 * Appelle l'API OpenRouter via cURL
 */
function callOpenRouterAPI($prompt) {
    $url = 'https://openrouter.ai/api/v1/chat/completions';
    
    $payload = [
        'model' => OPENROUTER_MODEL,
        'messages' => [
            [
                'role' => 'user',
                'content' => $prompt
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
            'HTTP-Referer: ' . APP_URL,
            'X-Title: ' . APP_NAME
        ],
        CURLOPT_TIMEOUT => API_TIMEOUT,
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
            'error' => 'Erreur de connexion à l\'API OpenRouter',
            'details' => $curlError
        ];
    }
    
    // Erreur HTTP
    if ($httpCode !== 200) {
        $errorData = json_decode($response, true);
        error_log("❌ Erreur API OpenRouter (HTTP $httpCode): " . print_r($errorData, true));
        return [
            'success' => false,
            'http_code' => $httpCode,
            'error' => "Erreur API OpenRouter: $httpCode",
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
    
    // Extraire le contenu de la réponse OpenRouter (format OpenAI)
    if (!isset($responseData['choices'][0]['message']['content'])) {
        return [
            'success' => false,
            'http_code' => 500,
            'error' => 'Format de réponse inattendu',
            'details' => 'Le champ choices[0].message.content est manquant'
        ];
    }
    
    $content = $responseData['choices'][0]['message']['content'];
    
    // Nettoyage spécifique pour Qwen3 qui peut ajouter du markdown
    $cleanedContent = cleanQwenResponse($content);
    
    // Vérifier si le contenu nettoyé est du JSON valide
    $jsonTest = json_decode($cleanedContent, true);
    if ($jsonTest === null && json_last_error() !== JSON_ERROR_NONE) {
        error_log("⚠️ Réponse Qwen3 n'est pas du JSON valide après nettoyage");
        error_log("Contenu original: " . substr($content, 0, 500));
        error_log("Contenu nettoyé: " . substr($cleanedContent, 0, 500));
    }
    
    error_log("✅ Questions générées avec succès via Qwen3");
    
    // Adapter le format pour compatibilité avec le frontend (format Anthropic)
    return [
        'success' => true,
        'data' => [
            'content' => [
                [
                    'type' => 'text',
                    'text' => $cleanedContent
                ]
            ],
            'model' => $responseData['model'] ?? OPENROUTER_MODEL,
            'usage' => $responseData['usage'] ?? null
        ]
    ];
}

/**
 * Nettoie la réponse de Qwen3 pour extraire le JSON pur
 * Qwen3 peut parfois ajouter du markdown ou du texte explicatif
 */
function cleanQwenResponse($content) {
    // Supprimer les balises markdown ```json et ```
    $cleaned = preg_replace('/```json\s*/i', '', $content);
    $cleaned = preg_replace('/```\s*$/i', '', $cleaned);
    $cleaned = preg_replace('/```/i', '', $cleaned);
    
    // Supprimer les espaces et retours à la ligne au début et à la fin
    $cleaned = trim($cleaned);
    
    // Chercher le premier { et le dernier }
    $firstBrace = strpos($cleaned, '{');
    $lastBrace = strrpos($cleaned, '}');
    
    if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
        // Extraire uniquement le JSON entre les accolades
        $cleaned = substr($cleaned, $firstBrace, $lastBrace - $firstBrace + 1);
    }
    
    // Supprimer d'éventuels textes explicatifs avant le JSON
    // Exemples: "Voici le JSON :", "D'accord, je génère :", etc.
    $lines = explode("\n", $cleaned);
    $jsonStarted = false;
    $cleanedLines = [];
    
    foreach ($lines as $line) {
        $trimmedLine = trim($line);
        
        // Si la ligne commence par {, le JSON commence
        if (strpos($trimmedLine, '{') === 0) {
            $jsonStarted = true;
        }
        
        // Ne garder que les lignes après le début du JSON
        if ($jsonStarted) {
            $cleanedLines[] = $line;
        }
    }
    
    if (!empty($cleanedLines)) {
        $cleaned = implode("\n", $cleanedLines);
    }
    
    return trim($cleaned);
}

/**
 * Construit le prompt optimisé pour Qwen3
 */
function buildPrompt($text, $config) {
    $typeLabels = [
        'mcq' => 'QCM (Questions à Choix Multiples)',
        'true_false' => 'Vrai/Faux',
        'fill_in' => 'Questions à compléter'
    ];
    
    $difficultyInstructions = [
        'facile' => 'Questions simples, concepts de base, définitions directes',
        'moyen' => 'Questions de compréhension, application des concepts',
        'difficile' => 'Questions complexes, analyse, synthèse, cas pratiques'
    ];
    
    $typesText = array_map(function($type) use ($typeLabels) {
        return "- " . $typeLabels[$type];
    }, $config['types']);
    
    // Limiter le texte si trop long
    $maxChars = 15000;
    $truncatedText = mb_strlen($text) > $maxChars 
        ? mb_substr($text, 0, $maxChars) . "\n\n[...texte tronqué...]" 
        : $text;
    
    $questionCount = $config['questionCount'];
    $difficulty = $config['difficulty'];
    $typesString = implode("\n", $typesText);
    $difficultyText = $difficultyInstructions[$difficulty];
    
    return <<<EOT
Tu es un expert pédagogique spécialisé dans la création de contenus de révision pour étudiants.

Ta mission : Générer un thème de révision complet au format JSON STRICT à partir du texte de cours ci-dessous.

═══════════════════════════════════════════════════════════════════
📚 TEXTE DU COURS :
═══════════════════════════════════════════════════════════════════

$truncatedText

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

✅ RÈGLES DE QUALITÉ OBLIGATOIRES :
1. Chaque question teste UNE connaissance clé du cours
2. Les réponses sont claires, précises et non ambiguës
3. Pour les QCM : 4 choix, 1 ou plusieur bonne réponse, les mauvaises réponses sont plausibles
4. Pour les Vrai/Faux : énoncés clairs et vérifiables
5. Pour les questions à compléter : réponse courte et précise
6. Le champ "rationale" DOIT TOUJOURS être rempli avec une explication pédagogique
7. Les questions couvrent différentes sections du cours
8. Évite les questions pièges, trop spécifiques ou ambiguës
9. Utilise un français correct et professionnel

═══════════════════════════════════════════════════════════════════
🚨 FORMAT DE RÉPONSE - INSTRUCTIONS CRITIQUES 🚨
═══════════════════════════════════════════════════════════════════

⚠️ ATTENTION : CES RÈGLES SONT ABSOLUMENT OBLIGATOIRES ⚠️

✋ INTERDICTIONS STRICTES :
❌ PAS de balises markdown (```json ou ```)
❌ PAS de texte explicatif avant le JSON
❌ PAS de texte explicatif après le JSON
❌ PAS de commentaires dans le JSON
❌ PAS de texte du type "Voici les questions..." ou "J'ai généré..."
❌ PAS de retours à la ligne superflus
❌ PAS de mélange de langues dans les clés JSON (tout en anglais)

✅ OBLIGATIONS STRICTES :
✓ Commence DIRECTEMENT par le caractère {
✓ Termine DIRECTEMENT par le caractère }
✓ JSON valide et parsable
✓ Respecte EXACTEMENT la structure ci-dessous
✓ Tous les champs obligatoires présents
✓ Types de données corrects (string, boolean, array, object)

═══════════════════════════════════════════════════════════════════
📋 STRUCTURE JSON EXACTE À RESPECTER :
═══════════════════════════════════════════════════════════════════

{
  "title": "Titre du thème en français (basé sur le contenu du cours)",
  "description": "Description courte du thème (1-2 phrases maximum)",
  "tags": ["tag1", "tag2", "tag3"],
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "prompt": "Question en français ?",
      "choices": [
        {"id": "a", "label": "Première option de réponse"},
        {"id": "b", "label": "Deuxième option de réponse"},
        {"id": "c", "label": "Troisième option de réponse"},
        {"id": "d", "label": "Quatrième option de réponse"}
      ],
      "answer": "a",
      "rationale": "Explication claire en français de pourquoi 'a' est la bonne réponse"
    },
    {
      "id": "q2",
      "type": "true_false",
      "prompt": "Affirmation à évaluer (vrai ou faux)",
      "answer": true,
      "rationale": "Explication en français de pourquoi c'est vrai ou faux"
    },
    {
      "id": "q3",
      "type": "fill_in",
      "prompt": "Question à compléter avec un ___ dans la phrase",
      "answer": "réponse courte attendue",
      "rationale": "Explication en français de la réponse"
    }
  ]
}

═══════════════════════════════════════════════════════════════════
💡 EXEMPLES DE FORMAT :
═══════════════════════════════════════════════════════════════════

✅ CORRECT (ce que tu dois faire) :
{"title":"Biologie cellulaire","description":"Questions sur la structure...","tags":["biologie","cellule"],"questions":[...]}

❌ INCORRECT (ce que tu ne dois PAS faire) :
```json
{"title":"Biologie cellulaire"...}
```
Voici les questions générées pour le cours...

❌ INCORRECT (ce que tu ne dois PAS faire) :
D'accord, je vais générer les questions :
{"title":"Biologie cellulaire"...}

═══════════════════════════════════════════════════════════════════
🎯 CHECKLIST FINALE AVANT DE RÉPONDRE :
═══════════════════════════════════════════════════════════════════

Vérifie que :
☑ Tu as généré EXACTEMENT $questionCount questions
☑ Les types de questions correspondent à ceux demandés
☑ Chaque question a un "id" unique (q1, q2, q3...)
☑ Chaque question a un champ "rationale" rempli
☑ Les QCM ont exactement 4 choix (a, b, c, d)
☑ Les Vrai/Faux ont "answer": true ou "answer": false (boolean)
☑ Le JSON est valide (pas de virgule en trop, guillemets corrects)
☑ Ta réponse commence par { et finit par }
☑ Il n'y a AUCUN texte en dehors du JSON

═══════════════════════════════════════════════════════════════════
🚀 GÉNÈRE MAINTENANT LE JSON :
═══════════════════════════════════════════════════════════════════

Réponds UNIQUEMENT avec le JSON. Commence IMMÉDIATEMENT par le caractère {

EOT;
}
?>
