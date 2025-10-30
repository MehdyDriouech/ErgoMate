// js/features/features-dashboard.js
// US 3.1 - Tableau de bord avec graphiques de progression et statistiques détaillées

///////////////////////////
// US 3.1 - STATISTIQUES //
///////////////////////////
function loadStats() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS)) || {}; }
  catch { return {}; }
}

function saveStats(stats) {
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
}

function updateStats(themeId, sessionData) {
  const stats = loadStats();
  
  if (!stats[themeId]) {
    stats[themeId] = {
      sessions: [],
      totalQuestions: 0,
      totalCorrect: 0,
      totalTime: 0,
      lastPlayed: null
    };
  }
  
  stats[themeId].sessions.push({
    date: sessionData.at,
    score: sessionData.score,
    total: sessionData.total,
    percent: sessionData.percent,
    mode: sessionData.mode,
    avgTime: sessionData.avgTime || 0
  });
  
  stats[themeId].totalQuestions += sessionData.total;
  stats[themeId].totalCorrect += sessionData.score;
  stats[themeId].totalTime += sessionData.totalTime || 0;
  stats[themeId].lastPlayed = sessionData.at;
  
  // Garder seulement les 50 dernières sessions par thème
  if (stats[themeId].sessions.length > 50) {
    stats[themeId].sessions = stats[themeId].sessions.slice(-50);
  }
  
  saveStats(stats);
}

function calculateDashboardData() {
  const history = loadHistory();
  const errors = loadErrors();
  const stats = loadStats();
  
  // Regrouper par thème
  const byTheme = {};
  
  state.themes.forEach(theme => {
    const themeHistory = history.filter(h => h.themeId === theme.id);
    
    // Ne pas inclure les thèmes avec lesquels l'utilisateur n'a jamais joué
    if (themeHistory.length === 0) return;
    
    const themeStats = stats[theme.id] || {
      sessions: [],
      totalQuestions: 0,
      totalCorrect: 0,
      totalTime: 0
    };
    
    const totalSessions = themeHistory.length;
    const totalQuestions = themeHistory.reduce((sum, h) => sum + (h.total || 0), 0);
    const totalCorrect = themeHistory.reduce((sum, h) => sum + (h.score || 0), 0);
    const avgScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    const errorCount = getThemeErrorTotal(theme.id);
    const errorRate = totalQuestions > 0 ? Math.round((errorCount / totalQuestions) * 100) : 0;
    
    // Temps moyen par question (US 3.3)
    const totalTime = themeHistory.reduce((sum, h) => sum + (h.totalTime || 0), 0);
    const avgTimePerQuestion = totalQuestions > 0 ? Math.round(totalTime / totalQuestions / 1000) : 0;
    
    byTheme[theme.id] = {
      title: theme.title,
      totalSessions,
      totalQuestions,
      totalCorrect,
      avgScore,
      errorCount,
      errorRate,
      avgTimePerQuestion,
      lastPlayed: themeStats.lastPlayed,
      history: themeHistory.slice(0, 10), // 10 dernières sessions
      trend: calculateTrend(themeHistory)
    };
  });
  
  return byTheme;
}

function calculateTrend(history) {
  if (history.length < 2) return 'neutral';
  
  const recent = history.slice(0, 5);
  const older = history.slice(5, 10);
  
  if (recent.length === 0) return 'neutral';
  
  const recentAvg = recent.reduce((sum, h) => sum + (h.percent || 0), 0) / recent.length;
  const olderAvg = older.length > 0 
    ? older.reduce((sum, h) => sum + (h.percent || 0), 0) / older.length 
    : recentAvg;
  
  if (recentAvg > olderAvg + 5) return 'up';
  if (recentAvg < olderAvg - 5) return 'down';
  return 'neutral';
}

///////////////////////////////////
// US 3.1 - DASHBOARD/TABLEAU   //
///////////////////////////////////
function renderDashboard() {
  if (!els.dashboardContent) return;
  
  const dashData = calculateDashboardData();
  const themes = Object.keys(dashData);
  
  if (themes.length === 0) {
    els.dashboardContent.innerHTML = `
      <div class="card">
        <p class="muted" style="text-align: center; padding: 40px;">
          📊 Commencez à jouer pour voir vos statistiques !
        </p>
      </div>
    `;
    return;
  }
  
  // Statistiques globales
  const totalSessions = themes.reduce((sum, id) => sum + dashData[id].totalSessions, 0);
  const totalQuestions = themes.reduce((sum, id) => sum + dashData[id].totalQuestions, 0);
  const totalCorrect = themes.reduce((sum, id) => sum + dashData[id].totalCorrect, 0);
  const globalAvg = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  
  let html = `
    <!-- Stats globales -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-value">${totalSessions}</div>
        <div class="stat-label">Sessions totales</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">❓</div>
        <div class="stat-value">${totalQuestions}</div>
        <div class="stat-label">Questions répondues</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-value">${globalAvg}%</div>
        <div class="stat-label">Taux de réussite global</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-value">${themes.length}</div>
        <div class="stat-label">Thèmes pratiqués</div>
      </div>
    </div>
    
    <!-- Stats par thème -->
    <h3 style="margin: 32px 0 16px;">📊 Progression par thème</h3>
  `;
  
  themes.forEach(themeId => {
    const data = dashData[themeId];
    const trendEmoji = data.trend === 'up' ? '📈' : data.trend === 'down' ? '📉' : '➡️';
    const trendColor = data.trend === 'up' ? 'var(--accent)' : data.trend === 'down' ? 'var(--danger)' : 'var(--muted)';
    
    html += `
      <article class="card dashboard-theme-card">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <h4 style="margin: 0; flex: 1;">${data.title}</h4>
          <span class="badge ${data.avgScore >= 70 ? 'success' : 'danger'}">${data.avgScore}%</span>
        </div>
        
        <div class="dashboard-stats">
          <div class="dashboard-stat">
            <span class="stat-label">Sessions</span>
            <span class="stat-value">${data.totalSessions}</span>
          </div>
          
          <div class="dashboard-stat">
            <span class="stat-label">Questions</span>
            <span class="stat-value">${data.totalQuestions}</span>
          </div>
          
          <div class="dashboard-stat">
            <span class="stat-label">Erreurs</span>
            <span class="stat-value">${data.errorCount}</span>
          </div>
          
          <div class="dashboard-stat">
            <span class="stat-label">Temps moy.</span>
            <span class="stat-value">${data.avgTimePerQuestion}s</span>
          </div>
        </div>
        
        <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: ${trendColor}; font-weight: 600;">
            ${trendEmoji} Tendance
          </span>
          ${data.lastPlayed ? `<span class="muted" style="font-size: 0.85rem;">
            Dernière session : ${new Date(data.lastPlayed).toLocaleDateString()}
          </span>` : ''}
        </div>
      </article>
    `;
  });
  
  els.dashboardContent.innerHTML = html;
}

function showDashboard() {
  renderDashboard();
  showView('dashboard');
}
