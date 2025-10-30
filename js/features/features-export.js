// js/features/features-export.js
// US 3.4 - Export et import des données utilisateur

///////////////////////////
// US 3.4 - EXPORT/IMPORT//
///////////////////////////
function exportData() {
  const data = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    history: loadHistory(),
    errors: loadErrors(),
    stats: loadStats(),
    themes: state.themes.map(t => ({ id: t.id, title: t.title }))
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ergo-quiz-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  return data;
}

function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validation basique
        if (!data.version || !data.history || !data.errors) {
          throw new Error('Format de fichier invalide');
        }
        
        // Fusion avec les données existantes (ne pas écraser)
        const currentHistory = loadHistory();
        const currentErrors = loadErrors();
        const currentStats = loadStats();
        
        // Merge history (éviter les doublons par timestamp)
        const mergedHistory = [...currentHistory];
        data.history.forEach(item => {
          if (!mergedHistory.find(h => h.at === item.at)) {
            mergedHistory.push(item);
          }
        });
        mergedHistory.sort((a, b) => b.at - a.at);
        
        // Merge errors (additionner les counts)
        const mergedErrors = { ...currentErrors };
        Object.keys(data.errors).forEach(themeId => {
          if (!mergedErrors[themeId]) {
            mergedErrors[themeId] = {};
          }
          Object.keys(data.errors[themeId]).forEach(qid => {
            mergedErrors[themeId][qid] = (mergedErrors[themeId][qid] || 0) + data.errors[themeId][qid];
          });
        });
        
        // Merge stats
        const mergedStats = { ...currentStats };
        if (data.stats) {
          Object.keys(data.stats).forEach(themeId => {
            if (!mergedStats[themeId]) {
              mergedStats[themeId] = data.stats[themeId];
            } else {
              mergedStats[themeId].sessions = [
                ...mergedStats[themeId].sessions,
                ...data.stats[themeId].sessions
              ].sort((a, b) => b.date - a.date).slice(0, 50);
              
              mergedStats[themeId].totalQuestions += data.stats[themeId].totalQuestions || 0;
              mergedStats[themeId].totalCorrect += data.stats[themeId].totalCorrect || 0;
              mergedStats[themeId].totalTime += data.stats[themeId].totalTime || 0;
            }
          });
        }
        
        // Sauvegarder
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(mergedHistory));
        localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(mergedErrors));
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(mergedStats));
        
        resolve({
          imported: {
            history: data.history.length,
            errors: Object.keys(data.errors).length,
            stats: Object.keys(data.stats || {}).length
          },
          total: {
            history: mergedHistory.length,
            errors: Object.keys(mergedErrors).length
          }
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsText(file);
  });
}
