// Doctor Triage Worklist Controller
let cases = [];
let activeFilter = 'all';
let selectedCase = null;
let pollTimer = null;

// DOM Elements
const casesTableBody = document.getElementById('casesTableBody');
const emergencyCount = document.getElementById('emergencyCount');
const promptCount = document.getElementById('promptCount');
const routineCount = document.getElementById('routineCount');
const totalFilterCount = document.getElementById('totalFilterCount');
const filterPills = document.querySelectorAll('.filter-pills .pill-btn');
const refreshBtn = document.getElementById('refreshBtn');

// Drawer Elements
const caseDrawerModal = document.getElementById('caseDrawerModal');
const closeDrawerBtn = document.getElementById('closeDrawerBtn');
const drawerPatientName = document.getElementById('drawerPatientName');
const drawerSubmittedTime = document.getElementById('drawerSubmittedTime');
const drawerAcuityBadge = document.getElementById('drawerAcuityBadge');
const drawerAcuityAlert = document.getElementById('drawerAcuityAlert');
const drawerTriageRationale = document.getElementById('drawerTriageRationale');
const drawerChiefComplaint = document.getElementById('drawerChiefComplaint');
const drawerHpiGrid = document.getElementById('drawerHpiGrid');
const drawerAssocSymptoms = document.getElementById('drawerAssocSymptoms');
const drawerNegatives = document.getElementById('drawerNegatives');
const drawerMeds = document.getElementById('drawerMeds');
const drawerAllergies = document.getElementById('drawerAllergies');
const drawerTranscriptBox = document.getElementById('drawerTranscriptBox');
const transcriptMsgCount = document.getElementById('transcriptMsgCount');
const toggleTranscriptHeader = document.getElementById('toggleTranscriptHeader');
const toggleTranscriptIcon = document.getElementById('toggleTranscriptIcon');
const copyNoteBtn = document.getElementById('copyNoteBtn');
const markReviewedBtn = document.getElementById('markReviewedBtn');

// Fetch Cases from API
async function loadCases() {
  try {
    const res = await fetch('/api/doctor/cases');
    cases = await res.json();
    updateStats();
    renderTable();
  } catch (err) {
    console.error('Failed to load doctor worklist:', err);
  }
}

// Update Stats Cards
function updateStats() {
  const emergencies = cases.filter(c => c.acuity === 'emergency').length;
  const prompts = cases.filter(c => c.acuity === 'prompt').length;
  const routines = cases.filter(c => c.acuity === 'routine').length;

  emergencyCount.textContent = emergencies;
  promptCount.textContent = prompts;
  routineCount.textContent = routines;
  totalFilterCount.textContent = cases.length;
}

// Render Table Rows
function renderTable() {
  const filtered = cases.filter(c => {
    if (activeFilter === 'all') return true;
    return c.acuity === activeFilter;
  });

  if (filtered.length === 0) {
    casesTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-light); padding: 32px;">
          No patient cases found in this category.
        </td>
      </tr>
    `;
    return;
  }

  casesTableBody.innerHTML = filtered.map(c => {
    const timeFormatted = formatTime(c.createdAt);
    const badgeHtml = renderBadge(c.acuity);
    const isEmergency = c.acuity === 'emergency';
    const rowClass = isEmergency ? 'worklist-row emergency-row' : (c.acuity === 'prompt' ? 'worklist-row prompt-row' : 'worklist-row routine-row');

    return `
      <tr class="${rowClass}" onclick="openCaseDrawer('${escapeHtml(c.id)}')">
        <td>${badgeHtml}</td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(c.patientName || 'Anonymous')}</div>
          <div style="font-size: 11px; color: var(--text-light);">${c.patientAge ? `${c.patientAge} yrs` : 'Age unlisted'}</div>
        </td>
        <td>
          <div style="font-weight: 500; max-width: 480px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(c.chiefComplaint || 'Intake summary')}
          </div>
          ${c.isEmergency ? `<div style="font-size: 11px; color: var(--emergency-red); font-weight: 600;">&#9888; ${escapeHtml(c.emergencyReason || 'Critical red-flag escalation')}</div>` : ''}
        </td>
        <td>${c.questionsAnswered || 0} answered</td>
        <td style="color: var(--text-light); font-size: 12px;">${timeFormatted}</td>
        <td>
          <span style="font-size: 11px; text-transform: capitalize; padding: 2px 8px; border-radius: 4px; background: ${c.status === 'reviewed' ? '#ecfdf5; color: #065f46' : '#f1f5f9; color: #475569'};">
            ${c.status === 'reviewed' ? '&#10003; Reviewed' : 'Pending'}
          </span>
        </td>
        <td style="text-align: right;">
          <button class="nav-btn nav-btn-outline" style="font-size: 12px; padding: 4px 10px;">
            Review &rarr;
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Acuity Badge Renderer
function renderBadge(acuity) {
  if (acuity === 'emergency') {
    return `<span class="badge badge-emergency"><span class="pulse-dot"></span> Emergency</span>`;
  }
  if (acuity === 'prompt') {
    return `<span class="badge badge-prompt">Prompt</span>`;
  }
  return `<span class="badge badge-routine">Routine</span>`;
}

// Open Detailed Medical Drawer
window.openCaseDrawer = function(caseId) {
  const found = cases.find(c => c.id === caseId);
  if (!found) return;
  selectedCase = found;

  drawerPatientName.textContent = `${found.patientName || 'Anonymous Patient'} ${found.patientAge ? `(${found.patientAge} yo)` : ''}`;
  drawerSubmittedTime.textContent = `Submitted ${formatTime(found.createdAt)}`;
  drawerAcuityBadge.innerHTML = renderBadge(found.acuity);

  // Acuity assessment block
  if (found.acuity === 'emergency' || found.structuredSummary?.triageRationale) {
    drawerAcuityAlert.style.display = 'block';
    drawerTriageRationale.textContent = found.emergencyReason || found.structuredSummary?.triageRationale || 'Immediate evaluation required.';
  } else {
    drawerAcuityAlert.style.display = 'none';
  }

  // Chief Complaint
  drawerChiefComplaint.textContent = found.chiefComplaint || 'Chief complaint documented in transcript.';

  // HPI OLD CARTS
  const hpi = found.structuredSummary?.hpi || {};
  drawerHpiGrid.innerHTML = `
    <div class="hpi-item"><span class="hpi-label">Onset</span><span class="hpi-val">${escapeHtml(hpi.onset || 'Not specified')}</span></div>
    <div class="hpi-item"><span class="hpi-label">Location / Radiation</span><span class="hpi-val">${escapeHtml(hpi.location || 'Not specified')}</span></div>
    <div class="hpi-item"><span class="hpi-label">Duration</span><span class="hpi-val">${escapeHtml(hpi.duration || 'Not specified')}</span></div>
    <div class="hpi-item"><span class="hpi-label">Character / Quality</span><span class="hpi-val">${escapeHtml(hpi.character || 'Not specified')}</span></div>
    <div class="hpi-item"><span class="hpi-label">Alleviating</span><span class="hpi-val">${escapeHtml(hpi.alleviating_factors || hpi.alleviatingFactors || 'None reported')}</span></div>
    <div class="hpi-item"><span class="hpi-label">Aggravating</span><span class="hpi-val">${escapeHtml(hpi.aggravating_factors || hpi.aggravatingFactors || 'None reported')}</span></div>
    <div class="hpi-item"><span class="hpi-label">Timing</span><span class="hpi-val">${escapeHtml(hpi.timing || 'Continuous/Intermittent')}</span></div>
    <div class="hpi-item"><span class="hpi-label">Severity</span><span class="hpi-val" style="color: var(--primary-blue); font-weight: 700;">${escapeHtml(hpi.severity || 'Not rated')}</span></div>
  `;

  // Associated Symptoms & Pertinent Negatives
  const assoc = found.structuredSummary?.associated_symptoms || found.structuredSummary?.associatedSymptoms || [];
  drawerAssocSymptoms.innerHTML = assoc.length > 0 
    ? assoc.map(s => `<li>${escapeHtml(s)}</li>`).join('') 
    : '<li>None reported</li>';

  const negatives = found.structuredSummary?.pertinent_negatives || found.structuredSummary?.pertinentNegatives || [];
  drawerNegatives.innerHTML = negatives.length > 0 
    ? negatives.map(s => `<li>${escapeHtml(s)}</li>`).join('') 
    : '<li>None recorded</li>';

  // Meds & Allergies
  const hist = found.structuredSummary?.patient_history || found.structuredSummary?.patientReportedHistory || {};
  drawerMeds.textContent = hist.medications || 'None reported';
  drawerAllergies.textContent = hist.allergies || 'No known allergies';

  // Verbatim Transcript
  const transcript = found.transcript || [];
  transcriptMsgCount.textContent = transcript.length;
  drawerTranscriptBox.innerHTML = transcript.map(msg => `
    <div class="chat-bubble ${msg.role === 'ai' ? 'ai' : 'patient'}">
      <div class="chat-author">${msg.role === 'ai' ? 'Clinical Assistant' : (found.patientName || 'Patient')} &bull; ${formatTime(msg.timestamp)}</div>
      <div>${escapeHtml(msg.content)}</div>
    </div>
  `).join('');

  // Status button
  markReviewedBtn.textContent = found.status === 'reviewed' ? 'Mark as Pending' : '✓ Mark as Reviewed';

  caseDrawerModal.style.display = 'flex';
};

// Toggle Transcript View
let isTranscriptOpen = false;
toggleTranscriptHeader.addEventListener('click', () => {
  isTranscriptOpen = !isTranscriptOpen;
  drawerTranscriptBox.style.display = isTranscriptOpen ? 'block' : 'none';
  toggleTranscriptIcon.innerHTML = isTranscriptOpen ? '&#9652; Hide' : '&#9662; Show';
});

// Close Drawer
closeDrawerBtn.addEventListener('click', () => {
  caseDrawerModal.style.display = 'none';
});

caseDrawerModal.addEventListener('click', (e) => {
  if (e.target === caseDrawerModal) {
    caseDrawerModal.style.display = 'none';
  }
});

// Mark as Reviewed
markReviewedBtn.addEventListener('click', async () => {
  if (!selectedCase) return;
  const newStatus = selectedCase.status === 'reviewed' ? 'pending' : 'reviewed';

  try {
    const res = await fetch(`/api/doctor/cases/${selectedCase.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const updated = await res.json();
    selectedCase.status = updated.status;
    markReviewedBtn.textContent = updated.status === 'reviewed' ? 'Mark as Pending' : '✓ Mark as Reviewed';
    loadCases();
  } catch (err) {
    console.error('Failed to update case status:', err);
  }
});

// Copy EHR Clinical Note to Clipboard
copyNoteBtn.addEventListener('click', () => {
  if (!selectedCase) return;
  const s = selectedCase.structuredSummary || {};
  const hpi = s.hpi || {};
  
  const note = `
CLINICAL INTAKE NOTE
Patient: ${selectedCase.patientName || 'Anonymous'} (Age: ${selectedCase.patientAge || 'N/A'})
Intake Date: ${new Date(selectedCase.createdAt).toLocaleString()}
Triage Acuity: ${selectedCase.acuity ? selectedCase.acuity.toUpperCase() : 'ROUTINE'}

CHIEF COMPLAINT:
${selectedCase.chiefComplaint || 'N/A'}

HISTORY OF PRESENT ILLNESS (OLD CARTS):
- Onset: ${hpi.onset || 'N/A'}
- Location: ${hpi.location || 'N/A'}
- Duration: ${hpi.duration || 'N/A'}
- Character: ${hpi.character || 'N/A'}
- Alleviating Factors: ${hpi.alleviating_factors || hpi.alleviatingFactors || 'None'}
- Aggravating Factors: ${hpi.aggravating_factors || hpi.aggravatingFactors || 'None'}
- Timing: ${hpi.timing || 'N/A'}
- Severity: ${hpi.severity || 'N/A'}

ASSOCIATED SYMPTOMS:
${(s.associated_symptoms || s.associatedSymptoms || ['None recorded']).map(x => `- ${x}`).join('\n')}

PERTINENT NEGATIVES:
${(s.pertinent_negatives || s.pertinentNegatives || ['None recorded']).map(x => `- ${x}`).join('\n')}

REPORTED MEDICATIONS: ${(s.patient_history?.medications || s.patientReportedHistory?.medications || 'None')}
REPORTED ALLERGIES: ${(s.patient_history?.allergies || s.patientReportedHistory?.allergies || 'NKDA')}

TRIAGE RATIONALE:
${selectedCase.emergencyReason || s.triageRationale || 'Routine review'}
  `.trim();

  navigator.clipboard.writeText(note).then(() => {
    const orig = copyNoteBtn.innerHTML;
    copyNoteBtn.innerHTML = '&#10003; Copied to Clipboard!';
    setTimeout(() => { copyNoteBtn.innerHTML = orig; }, 2000);
  });
});

// Filter Pill Tabs
filterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    filterPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeFilter = pill.getAttribute('data-filter');
    renderTable();
  });
});

// Refresh Button
refreshBtn.addEventListener('click', () => {
  loadCases();
});

// Helper: Format Time
function formatTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ')';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
    }
  });
}

// Initial load + poll every 5s for live triage queue updates
loadCases();
pollTimer = setInterval(loadCases, 5000);
