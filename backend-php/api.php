<?php
/**
 * API Backend PHP v2 pour Ergo Mate
 * Génère un format complet avec questions ET fiches de révision
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
        'message' => 'Backend Ergo Mate API v2 - Format complet avec fiches de révision',
        'version' => '2.1.0',
        'model' => OPENROUTER_MODEL,
        'endpoints' => [
            'POST /generate-questions' => 'Format simple (legacy)',
            'POST /generate-complete-theme' => 'Format complet avec fiches de révision (nouveau)'
        ],
        'timestamp' => date('c')
    ]);
    exit();
}

// Endpoint : POST /generate-complete-theme (NOUVEAU)
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
    
    // Récupérer les métadonnées optionnelles
    $metadata = isset($data['metadata']) ? $data['metadata'] : [];
    $fileName = isset($metadata['fileName']) ? $metadata['fileName'] : 'document.pdf';
    $pdfAuthor = isset($metadata['author']) ? $metadata['author'] : null;
    
    // Log de la requête
    error_log("🔥 Génération complète : {$config['questionCount']} questions + fiches de révision");
    
    // Construire le prompt pour le format complet
    $prompt = buildCompleteThemePrompt($text, $config, $fileName, $pdfAuthor);
    
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
 * Génère des questions (format simple - legacy)
 */
function generateQuestions() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Données JSON invalides']);
        return;
    }
    
    if (!isset($data['text']) || !isset($data['config'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Données manquantes. "text" et "config" sont requis.']);
        return;
    }
    
    $text = $data['text'];
    $config = $data['config'];
    $prompt = isset($data['prompt']) ? $data['prompt'] : buildPrompt($text, $config);
    
    error_log("🔥 Génération simple : {$config['questionCount']} questions");
    
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
    
    // Extraire le contenu de la réponse OpenRouter
    if (!isset($responseData['choices'][0]['message']['content'])) {
        return [
            'success' => false,
            'http_code' => 500,
            'error' => 'Format de réponse inattendu',
            'details' => 'Le champ choices[0].message.content est manquant'
        ];
    }
    
    $content = $responseData['choices'][0]['message']['content'];
    
    // Nettoyage du contenu
    $cleanedContent = cleanQwenResponse($content);
    
    // Vérifier si le contenu nettoyé est du JSON valide
    $jsonTest = json_decode($cleanedContent, true);
    if ($jsonTest === null && json_last_error() !== JSON_ERROR_NONE) {
        error_log("⚠️ Réponse Qwen3 n'est pas du JSON valide après nettoyage");
        error_log("Contenu nettoyé: " . substr($cleanedContent, 0, 500));
    }
    
    error_log("✅ Thème généré avec succès via Qwen3");
    
    // Adapter le format pour compatibilité avec le frontend
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
 */
function cleanQwenResponse($content) {
    // Supprimer les balises markdown
    $cleaned = preg_replace('/```json\s*/i', '', $content);
    $cleaned = preg_replace('/```\s*$/i', '', $cleaned);
    $cleaned = preg_replace('/```/i', '', $cleaned);
    $cleaned = trim($cleaned);
    
    // Chercher le premier { et le dernier }
    $firstBrace = strpos($cleaned, '{');
    $lastBrace = strrpos($cleaned, '}');
    
    if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
        $cleaned = substr($cleaned, $firstBrace, $lastBrace - $firstBrace + 1);
    }
    
    // Supprimer d'éventuels textes explicatifs avant le JSON
    $lines = explode("\n", $cleaned);
    $jsonStarted = false;
    $cleanedLines = [];
    
    foreach ($lines as $line) {
        $trimmedLine = trim($line);
        if (strpos($trimmedLine, '{') === 0) {
            $jsonStarted = true;
        }
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
 * Construit le prompt pour générer un thème complet (NOUVEAU)
 */
function buildCompleteThemePrompt($text, $config, $fileName, $pdfAuthor) {
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
    
    // Déterminer l'auteur
    $author = !empty($pdfAuthor) ? $pdfAuthor : "LLM-AI";
    
    return <<<EOT
Tu es un expert pédagogique spécialisé dans la création de contenus éducatifs complets.

Ta mission : Générer un MODULE DE RÉVISION COMPLET au format JSON STRICT comprenant :
1. Des questions de quiz (QCM, Vrai/Faux, Complétion)
2. Des fiches de révision détaillées avec différents types de cartes pédagogiques

═══════════════════════════════════════════════════════════════════
📚 TEXTE DU COURS À ANALYSER :
═══════════════════════════════════════════════════════════════════

$truncatedText

═══════════════════════════════════════════════════════════════════
⚙️ PARAMÈTRES DE GÉNÉRATION :
═══════════════════════════════════════════════════════════════════

📊 QUESTIONS :
→ EXACTEMENT $questionCount questions (ni plus, ni moins)
→ Types : $typesString
→ Niveau : $difficulty ($difficultyText)

📝 FICHES DE RÉVISION :
→ Créer des sections thématiques couvrant tout le contenu
→ Utiliser différents types de cartes : introduction, detailed_current, comparison, focus, key_takeaways, mnemonic
→ Chaque section doit avoir 2-4 cartes minimum

═══════════════════════════════════════════════════════════════════
📋 STRUCTURE JSON EXACTE À RESPECTER :
═══════════════════════════════════════════════════════════════════

{
  "id": "theme-slug-genere-automatiquement",
  "title": "Titre du thème en français (basé sur le contenu)",
  "locale": "fr-FR",
  "meta": {
    "author": "$author",
    "source": "$fileName",
    "updatedAt": "2025-11-01"
  },
  "settings": {
    "shuffleQuestions": true,
    "shuffleChoices": true
  },
  "questions": [
    {
      "id": "q001",
      "type": "mcq",
      "prompt": "Question en français ?",
      "choices": [
        {"id": "A", "label": "Première option"},
        {"id": "B", "label": "Deuxième option"},
        {"id": "C", "label": "Troisième option"},
        {"id": "D", "label": "Quatrième option"}
      ],
      "answer": "B",
      "rationale": "Explication pédagogique détaillée",
      "difficulty": 1,
      "tags": ["tag1", "tag2"]
    },
    {
      "id": "q002",
      "type": "true_false",
      "prompt": "Affirmation à évaluer",
      "answer": true,
      "rationale": "Explication de pourquoi c'est vrai/faux",
      "difficulty": 1,
      "tags": ["tag1"]
    }
  ],
  "revision": {
    "sections": [
      {
        "id": "section_01",
        "title": "Titre de la section",
        "order": 1,
        "cards": [
          {
            "id": "rev_001",
            "type": "introduction",
            "title": "Vue d'ensemble",
            "content": "Introduction générale au thème",
            "keyPoints": [
              "Point clé 1",
              "Point clé 2",
              "Point clé 3"
            ],
            "tags": ["introduction"],
            "relatedQuestions": ["q001", "q002"]
          },
          {
            "id": "rev_002",
            "type": "detailed_current",
            "title": "Concept principal",
            "mainConcept": "Nom du concept",
            "definition": "Définition claire et précise",
            "historicalContext": {
              "founder": "Nom du fondateur",
              "period": "Période historique",
              "location": "Lieu"
            },
            "keyConcepts": [
              {
                "name": "Concept 1",
                "definition": "Définition du concept 1"
              },
              {
                "name": "Concept 2",
                "definition": "Définition du concept 2"
              }
            ],
            "therapeuticDevice": {
              "participants": "Description des participants",
              "objective": "Objectif principal",
              "techniques": ["Technique 1", "Technique 2"],
              "constraint": "Contraintes éventuelles"
            },
            "tags": ["concept", "théorie"],
            "relatedQuestions": ["q003"]
          },
          {
            "id": "rev_003",
            "type": "comparison",
            "title": "Comparaison de concepts",
            "content": "Introduction à la comparaison",
            "professionals": [
              {
                "title": "Élément A",
                "formation": "Caractéristique 1",
                "status": "Statut",
                "canPrescribe": false,
                "reimbursement": false,
                "specificities": ["Spécificité 1", "Spécificité 2"]
              },
              {
                "title": "Élément B",
                "formation": "Caractéristique 1",
                "status": "Statut",
                "canPrescribe": true,
                "reimbursement": true,
                "specificities": ["Spécificité 1"]
              }
            ],
            "keyDifference": "Différence principale entre A et B",
            "tags": ["comparaison"],
            "relatedQuestions": ["q004"]
          },
          {
            "id": "rev_004",
            "type": "focus",
            "title": "Focus sur un aspect",
            "content": "Description détaillée",
            "intervention": "Type d'intervention",
            "objective": "Objectif principal",
            "formation": "Formation requise",
            "examples": ["Exemple 1", "Exemple 2"],
            "tags": ["focus"]
          },
          {
            "id": "rev_005",
            "type": "key_takeaways",
            "title": "Points essentiels à retenir",
            "takeaways": [
              {
                "topic": "Sujet 1",
                "point": "Point essentiel à retenir"
              },
              {
                "topic": "Sujet 2",
                "point": "Autre point important"
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
                "concept": "Concept à mémoriser",
                "technique": "Acronyme ou phrase",
                "breakdown": [
                  "Première lettre = Premier élément",
                  "Deuxième lettre = Deuxième élément"
                ]
              }
            ],
            "tags": ["mnémotechnique"]
          }
        ]
      }
    ]
  }
}

═══════════════════════════════════════════════════════════════════
✅ RÈGLES ABSOLUES :
═══════════════════════════════════════════════════════════════════

1. QUESTIONS :
   ☑ Exactement $questionCount questions
   ☑ Chaque question a un "rationale" détaillé
   ☑ Les QCM ont 4 choix (A, B, C, D)
   ☑ Les IDs sont uniques (q001, q002, q003...)
   ☑ Les tags sont pertinents

2. FICHES DE RÉVISION :
   ☑ Créer 2-6 sections thématiques selon le contenu
   ☑ Chaque section contient 2-4 cartes minimum
   ☑ Utiliser TOUS les types de cartes disponibles (introduction, detailed_current, comparison, focus, key_takeaways, mnemonic)
   ☑ Les cartes "detailed_current" doivent avoir historicalContext, keyConcepts et therapeuticDevice
   ☑ Les cartes "comparison" comparent 2 éléments minimum
   ☑ Les cartes "key_takeaways" résument les points essentiels
   ☑ Les cartes "mnemonic" proposent des moyens mnémotechniques
   ☑ Les relatedQuestions font référence aux IDs de questions existantes

3. FORMAT :
   ☑ JSON valide et parsable
   ☑ Commence par { et finit par }
   ☑ AUCUN texte en dehors du JSON
   ☑ PAS de markdown (```json)
   ☑ Tous les champs obligatoires présents

═══════════════════════════════════════════════════════════════════
🚀 GÉNÈRE MAINTENANT LE JSON COMPLET :
═══════════════════════════════════════════════════════════════════

Réponds UNIQUEMENT avec le JSON. Commence IMMÉDIATEMENT par {

EOT;
}

/**
 * Construit le prompt simple (legacy)
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
3. Pour les QCM : 4 choix, 1 bonne réponse, les mauvaises réponses sont plausibles
4. Pour les Vrai/Faux : énoncés clairs et vérifiables
5. Pour les questions à compléter : réponse courte et précise
6. Le champ "rationale" DOIT TOUJOURS être rempli avec une explication pédagogique
7. Les questions couvrent différentes sections du cours
8. Évite les questions pièges, trop spécifiques ou ambiguës
9. Utilise un français correct et professionnel

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

IMPORTANT : Réponds UNIQUEMENT avec le JSON. Commence IMMÉDIATEMENT par {
PAS de markdown (```json), PAS de texte explicatif.

EOT;
}
?>
