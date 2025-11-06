// js/features-view/view-quiz.js
// Web Component pour la vue du quiz

class ViewQuiz extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  connectedCallback() {
    this.classList.add('view');
    this.setAttribute('role', 'region');
    this.setAttribute('aria-labelledby', 'quiz-title');
  }

  render() {
    this.innerHTML = `
      <div class="quiz-header">
        <div>
          <h2 id="quiz-title" style="margin: 0;">Quiz</h2>
          <span id="quiz-theme-title" class="badge" style="margin-top: 8px;"></span>
        </div>
        <div class="quiz-meta">
          <span id="quiz-progress" class="muted"></span>
          <div id="exam-timer" class="exam-timer" hidden></div>
        </div>
      </div>

      <div id="question-container" class="card"></div>

      <div class="quiz-actions">
        <button id="btn-submit" class="btn primary">
          ✓ Valider
        </button>
        <button id="btn-next" class="btn" disabled>
          → Suivant
        </button>
        <button id="btn-quit" class="btn ghost">
          ✕ Quitter
        </button>
      </div>
    `;
  }

  getQuizTitle() {
    return this.querySelector('#quiz-title');
  }

  getThemeTitle() {
    return this.querySelector('#quiz-theme-title');
  }

  getProgress() {
    return this.querySelector('#quiz-progress');
  }

  getTimer() {
    return this.querySelector('#exam-timer');
  }

  getQuestionContainer() {
    return this.querySelector('#question-container');
  }

  getSubmitButton() {
    return this.querySelector('#btn-submit');
  }

  getNextButton() {
    return this.querySelector('#btn-next');
  }

  getQuitButton() {
    return this.querySelector('#btn-quit');
  }
}

customElements.define('view-quiz', ViewQuiz);
