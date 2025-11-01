<?php
/**
 * Test rapide de la configuration
 * Visitez ce fichier pour vérifier que config.php est correct
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Configuration - Ergo Mate</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .test {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .success { border-left: 4px solid #28a745; }
        .error { border-left: 4px solid #dc3545; }
        .warning { border-left: 4px solid #ffc107; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 0; }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
        }
        .badge.ok { background: #28a745; color: white; }
        .badge.error { background: #dc3545; color: white; }
        .badge.warning { background: #ffc107; color: black; }
        pre {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
        .solution {
            background: #fff3cd;
            padding: 15px;
            border-radius: 4px;
            margin-top: 15px;
            border: 1px solid #ffc107;
        }
        .solution h3 {
            margin-top: 0;
            color: #856404;
        }
    </style>
</head>
<body>
    <h1>🔧 Test de Configuration Ergo Mate</h1>
    
    <?php
    $allOk = true;
    
    // Test 1: config.php existe
    echo '<div class="test ' . (file_exists('config.php') ? 'success' : 'error') . '">';
    echo '<h2>1. Fichier config.php</h2>';
    
    if (file_exists('config.php')) {
        echo '<span class="badge ok">✓ EXISTE</span>';
        echo '<p>Le fichier config.php est présent dans ' . __DIR__ . '</p>';
        
        require_once 'config.php';
        
        // Test 2: Clé API
        echo '</div><div class="test ' . (defined('OPENROUTER_API_KEY') ? 'success' : 'error') . '">';
        echo '<h2>2. Clé API OpenRouter</h2>';
        
        if (defined('OPENROUTER_API_KEY')) {
            if (OPENROUTER_API_KEY === 'votre_clé_openrouter_ici' || empty(OPENROUTER_API_KEY)) {
                echo '<span class="badge error">✗ NON CONFIGURÉE</span>';
                echo '<p>La clé API est définie mais contient la valeur par défaut.</p>';
                echo '<div class="solution">';
                echo '<h3>💡 Solution</h3>';
                echo '<p>Remplacez dans config.php :</p>';
                echo '<pre>define(\'OPENROUTER_API_KEY\', \'votre_clé_openrouter_ici\');</pre>';
                echo '<p>Par votre vraie clé OpenRouter (commence par sk-or-v1-).</p>';
                echo '<p>Obtenez une clé sur : <a href="https://openrouter.ai/settings/keys" target="_blank">https://openrouter.ai/settings/keys</a></p>';
                echo '</div>';
                $allOk = false;
            } else {
                echo '<span class="badge ok">✓ CONFIGURÉE</span>';
                echo '<p>Clé API : <code>' . substr(OPENROUTER_API_KEY, 0, 15) . '...</code> (longueur: ' . strlen(OPENROUTER_API_KEY) . ' caractères)</p>';
                
                if (strpos(OPENROUTER_API_KEY, 'sk-or-v1-') === 0) {
                    echo '<span class="badge ok">✓ Format valide</span>';
                } else {
                    echo '<span class="badge warning">⚠ Format inhabituel</span>';
                    echo '<p>Les clés OpenRouter commencent normalement par "sk-or-v1-"</p>';
                }
            }
        } else {
            echo '<span class="badge error">✗ NON DÉFINIE</span>';
            echo '<p>La constante OPENROUTER_API_KEY n\'est pas définie.</p>';
            echo '<div class="solution">';
            echo '<h3>💡 Solution</h3>';
            echo '<p>Ajoutez dans config.php :</p>';
            echo '<pre>define(\'OPENROUTER_API_KEY\', \'sk-or-v1-VOTRE_CLÉ_ICI\');</pre>';
            echo '</div>';
            $allOk = false;
        }
        
        // Test 3: Modèle
        echo '</div><div class="test ' . (defined('OPENROUTER_MODEL') ? 'success' : 'warning') . '">';
        echo '<h2>3. Modèle IA</h2>';
        
        if (defined('OPENROUTER_MODEL')) {
            echo '<span class="badge ok">✓ DÉFINI</span>';
            echo '<p>Modèle : <code>' . OPENROUTER_MODEL . '</code></p>';
        } else {
            echo '<span class="badge warning">⚠ NON DÉFINI</span>';
            echo '<p>Le modèle utilisera la valeur par défaut.</p>';
        }
        
        // Test 4: Timeout
        echo '</div><div class="test ' . (defined('API_TIMEOUT') ? 'success' : 'warning') . '">';
        echo '<h2>4. Timeout API</h2>';
        
        if (defined('API_TIMEOUT')) {
            echo '<span class="badge ok">✓ DÉFINI</span>';
            echo '<p>Timeout : <strong>' . API_TIMEOUT . ' secondes</strong></p>';
            
            if (API_TIMEOUT < 90) {
                echo '<span class="badge warning">⚠ Timeout court</span>';
                echo '<p>Recommandé : 120 secondes minimum pour éviter les timeouts lors de la génération.</p>';
            }
        } else {
            echo '<span class="badge warning">⚠ NON DÉFINI</span>';
            echo '<p>Le timeout utilisera la valeur par défaut.</p>';
        }
        
        // Test 5: Extensions PHP
        echo '</div><div class="test success">';
        echo '<h2>5. Extensions PHP</h2>';
        
        $extensions = [
            'curl' => extension_loaded('curl'),
            'json' => extension_loaded('json'),
            'mbstring' => extension_loaded('mbstring')
        ];
        
        foreach ($extensions as $ext => $loaded) {
            if ($loaded) {
                echo '<span class="badge ok">✓ ' . $ext . '</span> ';
            } else {
                echo '<span class="badge error">✗ ' . $ext . '</span> ';
                $allOk = false;
            }
        }
        
        if (!$extensions['curl']) {
            echo '<div class="solution">';
            echo '<h3>💡 Solution</h3>';
            echo '<p>L\'extension PHP curl est requise. Contactez votre hébergeur pour l\'activer.</p>';
            echo '</div>';
        }
        
        // Test 6: Permissions
        echo '</div><div class="test success">';
        echo '<h2>6. Permissions des fichiers</h2>';
        
        $configPerms = substr(sprintf('%o', fileperms('config.php')), -4);
        echo '<p>config.php : <code>' . $configPerms . '</code></p>';
        
        if (file_exists('api.php')) {
            $apiPerms = substr(sprintf('%o', fileperms('api.php')), -4);
            echo '<p>api.php : <code>' . $apiPerms . '</code></p>';
        }
        
    } else {
        echo '<span class="badge error">✗ INTROUVABLE</span>';
        echo '<p>Le fichier config.php n\'existe pas dans ' . __DIR__ . '</p>';
        
        echo '<div class="solution">';
        echo '<h3>💡 Solution</h3>';
        echo '<p>Créez le fichier <strong>config.php</strong> dans /backend-php/ avec ce contenu :</p>';
        echo '<pre>&lt;?php
define(\'OPENROUTER_API_KEY\', \'sk-or-v1-VOTRE_CLÉ_ICI\');
define(\'OPENROUTER_MODEL\', \'qwen/qwen-2.5-72b-instruct\');
define(\'API_TIMEOUT\', 120);
define(\'APP_NAME\', \'Ergo Mate\');
define(\'APP_URL\', \'https://ergo-mate.mehdydriouech.fr\');
?&gt;</pre>';
        echo '<p>Obtenez votre clé API sur : <a href="https://openrouter.ai/settings/keys" target="_blank">https://openrouter.ai/settings/keys</a></p>';
        echo '</div>';
        $allOk = false;
    }
    
    echo '</div>';
    
    // Résumé final
    echo '<div class="test ' . ($allOk ? 'success' : 'error') . '">';
    echo '<h2>📊 Résumé</h2>';
    
    if ($allOk) {
        echo '<span class="badge ok">✓ TOUT EST OK</span>';
        echo '<p>Votre configuration est correcte ! Vous pouvez maintenant utiliser l\'application.</p>';
        echo '<p><strong>Prochaines étapes :</strong></p>';
        echo '<ol>';
        echo '<li>Testez l\'API : <a href="api.php">api.php</a></li>';
        echo '<li>Lancez le diagnostic complet : <a href="diagnostic.html">diagnostic.html</a></li>';
        echo '<li>Testez la génération : <a href="test-api.html">test-api.html</a></li>';
        echo '</ol>';
    } else {
        echo '<span class="badge error">✗ PROBLÈMES DÉTECTÉS</span>';
        echo '<p>Corrigez les erreurs ci-dessus avant de continuer.</p>';
        echo '<p><strong>Les problèmes les plus fréquents :</strong></p>';
        echo '<ol>';
        echo '<li>config.php n\'existe pas → Créez-le</li>';
        echo '<li>Clé API non configurée → Ajoutez votre clé OpenRouter</li>';
        echo '<li>Extension curl manquante → Contactez votre hébergeur</li>';
        echo '</ol>';
    }
    
    echo '</div>';
    ?>
    
    <div style="text-align: center; margin-top: 30px; color: #666;">
        <p>📚 Besoin d'aide ? Consultez <strong>FIX_ERREUR_500.md</strong></p>
        <p style="font-size: 12px;">Test effectué le <?php echo date('d/m/Y à H:i:s'); ?></p>
    </div>
</body>
</html>
