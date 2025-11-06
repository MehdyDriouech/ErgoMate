<?php
/**
 * API Stats Endpoint - Dashboard ErgoMate
 * Lit et agrège les logs JSON pour le monitoring
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Charger la configuration
if (!file_exists('config.php')) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Fichier de configuration manquant'
    ]);
    exit();
}

require_once 'config.php';

// ═══════════════════════════════════════════════════════════════════
// AUTHENTIFICATION HTTP BASIC
// ═══════════════════════════════════════════════════════════════════

function requireAuth() {
    if (!defined('DASHBOARD_LOGIN') || !defined('DASHBOARD_PASSWORD')) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Configuration d\'authentification manquante'
        ]);
        exit();
    }
    
    $validUser = DASHBOARD_LOGIN;
    $validPass = DASHBOARD_PASSWORD;
    
    // ✅ CORRECTION : Parser manuellement le header Authorization
    $user = '';
    $pass = '';
    
    // Méthode 1 : Variables PHP standard (Apache avec mod_php)
    if (isset($_SERVER['PHP_AUTH_USER']) && isset($_SERVER['PHP_AUTH_PW'])) {
        $user = $_SERVER['PHP_AUTH_USER'];
        $pass = $_SERVER['PHP_AUTH_PW'];
    }
    // Méthode 2 : Header Authorization (CGI/FastCGI/Nginx)
    elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['HTTP_AUTHORIZATION'];
        if (strpos($auth, 'Basic ') === 0) {
            $credentials = base64_decode(substr($auth, 6));
            list($user, $pass) = explode(':', $credentials, 2);
        }
    }
    // Méthode 3 : Header Authorization alternatif
    elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        if (strpos($auth, 'Basic ') === 0) {
            $credentials = base64_decode(substr($auth, 6));
            list($user, $pass) = explode(':', $credentials, 2);
        }
    }
    
    // Vérifier les credentials
    if ($user !== $validUser || $pass !== $validPass) {
        header('WWW-Authenticate: Basic realm="ErgoMate Dashboard"');
        http_response_code(401);
        echo json_encode([
            'error' => 'Authentification requise',
            'debug' => [
                'received_user' => $user ? '[HIDDEN]' : 'empty',
                'expected_user' => $validUser,
                'auth_method' => isset($_SERVER['PHP_AUTH_USER']) ? 'PHP_AUTH' : (isset($_SERVER['HTTP_AUTHORIZATION']) ? 'HTTP_AUTHORIZATION' : 'NONE')
            ]
        ]);
        exit();
    }
}

// Vérifier l'authentification
requireAuth();

// ═══════════════════════════════════════════════════════════════════
// LECTURE ET AGRÉGATION DES LOGS
// ═══════════════════════════════════════════════════════════════════

function getStats() {
    if (!defined('LOGS_DIR')) {
        return [
            'error' => 'Répertoire de logs non configuré'
        ];
    }
    
    $logsDir = LOGS_DIR;
    
    if (!is_dir($logsDir)) {
        return [
            'totalRequests' => 0,
            'successRate' => 0,
            'avgExecutionTime' => 0,
            'avgMistralApiTime' => 0,
            'requests' => [],
            'stats' => [
                'byEndpoint' => [],
                'byDifficulty' => [],
                'byType' => [],
                'byModel' => [],
                'byDay' => [],
                'byHour' => [],
                'errors' => []
            ]
        ];
    }
    
    $files = glob($logsDir . '/*.json');
    
    if (empty($files)) {
        return [
            'totalRequests' => 0,
            'successRate' => 0,
            'avgExecutionTime' => 0,
            'avgMistralApiTime' => 0,
            'requests' => [],
            'stats' => [
                'byEndpoint' => [],
                'byDifficulty' => [],
                'byType' => [],
                'byModel' => [],
                'byDay' => [],
                'byHour' => [],
                'errors' => []
            ]
        ];
    }
    
    $allRequests = [];
    $totalExecutionTime = 0;
    $totalMistralTime = 0;
    $successCount = 0;
    
    // Statistiques agrégées
    $statsByEndpoint = [];
    $statsByDifficulty = [];
    $statsByType = [];
    $statsByModel = [];
    $statsByDay = [];
    $statsByHour = [];
    $errors = [];
    $customApiKeyCount = 0;
    $totalTokensInput = 0;
    $totalTokensOutput = 0;
    
    // Lire tous les fichiers
    foreach ($files as $file) {
        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            $request = json_decode($line, true);
            
            if (!$request) {
                continue;
            }
            
            $allRequests[] = $request;
            
            // Compteurs globaux
            $totalExecutionTime += $request['executionTime'] ?? 0;
            $totalMistralTime += $request['mistralApiTime'] ?? 0;
            
            if ($request['success'] ?? false) {
                $successCount++;
            }
            
            if ($request['customApiKey'] ?? false) {
                $customApiKeyCount++;
            }
            
            // Tokens
            if (isset($request['tokensUsed'])) {
                $totalTokensInput += $request['tokensUsed']['prompt_tokens'] ?? 0;
                $totalTokensOutput += $request['tokensUsed']['completion_tokens'] ?? 0;
            }
            
            // Par endpoint
            $endpoint = $request['endpoint'] ?? 'unknown';
            if (!isset($statsByEndpoint[$endpoint])) {
                $statsByEndpoint[$endpoint] = 0;
            }
            $statsByEndpoint[$endpoint]++;
            
            // Par difficulté
            $difficulty = $request['config']['difficulty'] ?? 'unknown';
            if (!isset($statsByDifficulty[$difficulty])) {
                $statsByDifficulty[$difficulty] = 0;
            }
            $statsByDifficulty[$difficulty]++;
            
            // Par type de questions
            $types = $request['config']['types'] ?? [];
            foreach ($types as $type) {
                if (!isset($statsByType[$type])) {
                    $statsByType[$type] = 0;
                }
                $statsByType[$type]++;
            }
            
            // Par modèle
            $model = $request['config']['model'] ?? 'unknown';
            if (!isset($statsByModel[$model])) {
                $statsByModel[$model] = 0;
            }
            $statsByModel[$model]++;
            
            // Par jour
            $timestamp = $request['timestamp'] ?? '';
            if ($timestamp) {
                $date = date('Y-m-d', strtotime($timestamp));
                if (!isset($statsByDay[$date])) {
                    $statsByDay[$date] = 0;
                }
                $statsByDay[$date]++;
                
                // Par heure
                $hour = date('H', strtotime($timestamp));
                if (!isset($statsByHour[$hour])) {
                    $statsByHour[$hour] = 0;
                }
                $statsByHour[$hour]++;
            }
            
            // Erreurs
            if (!($request['success'] ?? false)) {
                $errorType = $request['errorType'] ?? 'unknown';
                if (!isset($errors[$errorType])) {
                    $errors[$errorType] = 0;
                }
                $errors[$errorType]++;
            }
        }
    }
    
    $totalRequests = count($allRequests);
    
    // Trier par jour (ordre chronologique)
    ksort($statsByDay);
    
    // Trier par heure
    ksort($statsByHour);
    
    return [
        'totalRequests' => $totalRequests,
        'successCount' => $successCount,
        'failureCount' => $totalRequests - $successCount,
        'successRate' => $totalRequests > 0 ? round(($successCount / $totalRequests) * 100, 2) : 0,
        'avgExecutionTime' => $totalRequests > 0 ? round($totalExecutionTime / $totalRequests, 3) : 0,
        'avgMistralApiTime' => $totalRequests > 0 ? round($totalMistralTime / $totalRequests, 3) : 0,
        'customApiKeyUsage' => [
            'count' => $customApiKeyCount,
            'percentage' => $totalRequests > 0 ? round(($customApiKeyCount / $totalRequests) * 100, 2) : 0
        ],
        'tokens' => [
            'totalInput' => $totalTokensInput,
            'totalOutput' => $totalTokensOutput,
            'total' => $totalTokensInput + $totalTokensOutput,
            'avgInputPerRequest' => $totalRequests > 0 ? round($totalTokensInput / $totalRequests) : 0,
            'avgOutputPerRequest' => $totalRequests > 0 ? round($totalTokensOutput / $totalRequests) : 0
        ],
        'stats' => [
            'byEndpoint' => $statsByEndpoint,
            'byDifficulty' => $statsByDifficulty,
            'byType' => $statsByType,
            'byModel' => $statsByModel,
            'byDay' => $statsByDay,
            'byHour' => $statsByHour,
            'errors' => $errors
        ],
        'recentRequests' => array_slice(array_reverse($allRequests), 0, 50) // 50 dernières requêtes
    ];
}

// ═══════════════════════════════════════════════════════════════════
// RÉPONSE
// ═══════════════════════════════════════════════════════════════════

$stats = getStats();
echo json_encode($stats, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
