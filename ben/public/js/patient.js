// Patient Intake Journal-Style Flow
let currentSessionId = null;
let currentQuestionText = '';
let questionIndex = 1;
const maxQuestions = 8;
const pastRecord = [];
let isHistoryFolded = false;

// DOM Elements
const questionCard = document.getElementById('questionCard');
const activeQuestionText = document.getElementById('activeQuestionText');
const answerForm = document.getElementById('answerForm');
const patientAnswerInput = document.getElementById('patientAnswerInput');
const submitBtn = document.getElementById('submitBtn');
const progressLabel = document.getElementById('progressLabel');
const progressBarFill = document.getElementById('progressBarFill');

const pastRecordContainer = document.getElementById('pastRecordContainer');
const pastRecordList = document.getElementById('pastRecordList');
const recordCount = document.getElementById('recordCount');
const togglePastRecord = document.getElementById('togglePastRecord');
const recordToggleIcon = document.getElementById('recordToggleIcon');

const emergencyScreen = document.getElementById('emergencyScreen');
const emergencyReasonText = document.getElementById('emergencyReasonText');
const completeScreen = document.getElementById('completeScreen');
const completeMessage = document.getElementById('completeMessage');

const patientNameInput = document.getElementById('patientNameInput');
const patientAgeInput = document.getElementById('patientAgeInput');
const startSessionBtn = document.getElementById('startSessionBtn');

// Helper for quick suggestion chips
window.applyChip = function(text) {
  if (patientAnswerInput.value.trim().length > 0) {
    patientAnswerInput.value += ', ' + text;
  } else {
    patientAnswerInput.value = text;
  }
  patientAnswerInput.focus();
};

// Initialize Intake Session
async function initSession() {
  submitBtn.disabled = true;
  activeQuestionText.textContent = "Connecting to clinical intake assistant...";

  try {
    const res = await fetch('/api/intake/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: patientNameInput.value.trim() || 'Anonymous Patient',
        patientAge: parseInt(patientAgeInput.value) || null
      })
    });

    const data = await res.json();
    currentSessionId = data.sessionId;
    currentQuestionText = data.question;
    questionIndex = data.questionNumber || 1;

    renderActiveQuestion();
  } catch (err) {
    console.error('Failed to initialize intake:', err);
    activeQuestionText.textContent = "Unable to connect to clinic server. Please check backend status.";
  } finally {
    submitBtn.disabled = false;
  }
}

// Render the active question in focus
function renderActiveQuestion() {
  activeQuestionText.textContent = currentQuestionText;
  progressLabel.textContent = `Intake Question ${questionIndex} of up to ${maxQuestions}`;
  
  const percentage = Math.min(100, Math.round((questionIndex / maxQuestions) * 100));
  progressBarFill.style.width = `${percentage}%`;

  patientAnswerInput.value = '';
  patientAnswerInput.focus();
}

// Fold the answered question into the quiet record above
function foldIntoPastRecord(question, answer) {
  pastRecord.push({ question, answer, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
  
  pastRecordContainer.style.display = 'block';
  recordCount.textContent = pastRecord.length;

  const entry = document.createElement('div');
  entry.className = 'record-entry';
  entry.innerHTML = `
    <div class="record-q">Q${pastRecord.length}: ${escapeHtml(question)}</div>
    <div class="record-a">&ldquo;${escapeHtml(answer)}&rdquo;</div>
  `;
  pastRecordList.appendChild(entry);
}

// Toggle folding collapse
togglePastRecord.addEventListener('click', () => {
  isHistoryFolded = !isHistoryFolded;
  if (isHistoryFolded) {
    pastRecordList.style.display = 'none';
    recordToggleIcon.innerHTML = '&#9656; Show History';
  } else {
    pastRecordList.style.display = 'flex';
    recordToggleIcon.innerHTML = '&#9662; Hide History';
  }
});

// Handle form submission
answerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const answer = patientAnswerInput.value.trim();
  if (!answer || !currentSessionId) return;

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Processing...</span>';

  // Fold previous Q&A into quiet history
  foldIntoPastRecord(currentQuestionText, answer);

  try {
    const res = await fetch('/api/intake/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: currentSessionId,
        message: answer
      })
    });

    const data = await res.json();

    // Check 1: Emergency Escalation Triggered
    if (data.isEmergency) {
      handleEmergency(data);
      return;
    }

    // Check 2: Intake Concluded
    if (data.isComplete) {
      handleCompletion(data);
      return;
    }

    // Check 3: Next Follow-up Question
    currentQuestionText = data.question;
    questionIndex = data.questionNumber;
    renderActiveQuestion();

  } catch (err) {
    console.error('Error sending response:', err);
    alert('Communication error with server. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Send Response</span> <span>&rarr;</span>';
  }
});

// Submit on Enter key (Shift+Enter for newline)
patientAnswerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (patientAnswerInput.value.trim().length > 0) {
      answerForm.dispatchEvent(new Event('submit'));
    }
  }
});

// Trigger Emergency Protocol
function handleEmergency(data) {
  questionCard.style.display = 'none';
  emergencyScreen.style.display = 'block';
  emergencyReasonText.innerHTML = `
    <strong>Alert Rationale:</strong> ${escapeHtml(data.emergencyReason || data.message)}
    <br><br>
    Please call 911 immediately or go to the closest hospital Emergency Department.
  `;
}

// Trigger Normal Completion
function handleCompletion(data) {
  questionCard.style.display = 'none';
  completeScreen.style.display = 'block';
  if (data.message) {
    completeMessage.textContent = data.message;
  }
}

// Utility: HTML Escape
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
    }
  });
}

// Restart button
startSessionBtn.addEventListener('click', () => {
  location.reload();
});

// Start on page load
initSession();
