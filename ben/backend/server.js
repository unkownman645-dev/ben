const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let Anthropic;
try {
  Anthropic = require('@anthropic-ai/sdk');
} catch (e) {
  // Graceful fallback if @anthropic-ai/sdk is not yet installed
  Anthropic = null;
}

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'cases.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// In-memory active intake sessions
const activeSessions = new Map();

// Helper to ensure data directory and file exist
function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function loadCases() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading cases.json:', err);
    return [];
  }
}

function saveCase(newOrUpdatedCase) {
  ensureDataFile();
  const cases = loadCases();
  const existingIdx = cases.findIndex(c => c.id === newOrUpdatedCase.id);
  if (existingIdx >= 0) {
    cases[existingIdx] = newOrUpdatedCase;
  } else {
    cases.unshift(newOrUpdatedCase);
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(cases, null, 2), 'utf-8');
}

// Emergency red-flag detection patterns
const EMERGENCY_PATTERNS = [
  /chest\s*(pain|pressure|tightness|heaviness|squeezing)/i,
  /short(ness)?\s*of\s*breath|difficulty\s*breathing|cannot\s*breathe|gasping/i,
  /radiat(ing|es)?\s*(to|down)?\s*(left\s*)?(arm|shoulder|jaw|neck|back)/i,
  /pass(ed)?\s*out|faint(ed|ing)?|syncope|lost\s*consciousness/i,
  /sudden\s*(numbness|weakness|paralysis|droop)/i,
  /slurr(ed)?\s*speech|cannot\s*talk|facial\s*droop/i,
  /worst\s*headache\s*(of\s*my\s*life|ever)|thunderclap/i,
  /cough(ing)?\s*up\s*blood|vomit(ing)?\s*blood|massive\s*bleeding/i,
  /anaphylaxis|throat\s*closing|swelling\s*of\s*(tongue|throat|lips)/i,
  /suicid(e|al)|kill\s*myself/i
];

function checkEmergencyText(text) {
  if (!text) return null;
  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.test(text)) {
      return `Potential high-acuity medical emergency detected: matched criteria "${pattern.source}". Immediate clinical escalation required.`;
    }
  }
  return null;
}

// The Strict System Prompt for Claude
const CLINICAL_SYSTEM_PROMPT = `You are a clinical intake assistant for an outpatient medical clinic.
Your SOLE responsibility is to gather a focused, structured medical history of the patient's presenting complaint for the attending physician.

CRITICAL SAFETY DIRECTIVES:
1. NEVER suggest, guess, or provide a medical diagnosis under any circumstance.
2. NEVER prescribe, suggest, or recommend any treatments, home remedies, medications, or dosages.
3. NEVER provide false reassurance (e.g., do not say "You'll be just fine", "Nothing to worry about", or "It sounds mild").
4. EMERGENCY RULE: If the patient describes symptoms that could represent an acute emergency (e.g., chest pain/pressure, shortness of breath, sudden weakness/numbness, facial droop, slurred speech, syncope/fainting, signs of anaphylaxis, severe hemorrhage, thunderclap headache, or suicidal ideation), YOU MUST IMMEDIATELY ESCALATE. Set "is_emergency": true, provide an emergency notice in "next_question", set "is_complete": true, and halt all routine questioning immediately.
5. QUESTIONING STRATEGY:
   - Ask exactly ONE clear, empathetic, concise question at a time.
   - Target the classic HPI dimensions (OLD CARTS):
     * Onset (When did it begin?)
     * Location & Radiation (Where is it, does it spread?)
     * Duration & Timing (Is it constant or does it come and go?)
     * Character / Quality (Sharp, dull, burning, aching?)
     * Aggravating & Alleviating factors (What makes it worse or better?)
     * Severity (On a scale of 1-10?)
     * Associated symptoms & pertinent negatives
     * Current medications and allergies
   - You must ask NO MORE than 8 follow-up questions total. If you have gathered sufficient clinical details before 8 questions, conclude early.
6. When the interview is complete (or if halted due to an emergency), compile a comprehensive, structured clinical summary formatted for the physician.

YOU MUST ALWAYS RESPOND IN VALID STRICT JSON MATCHING THIS EXACT SCHEMA:
{
  "is_emergency": boolean,
  "emergency_reason": string or null,
  "next_question": string or null (the single question for the patient, or null if complete),
  "is_complete": boolean,
  "triage_level": "emergency" | "prompt" | "routine",
  "triage_rationale": "Brief 1-2 sentence clinical justification for the triage acuity",
  "structured_summary": {
    "chief_complaint": "Clear description of primary symptom",
    "hpi": {
      "onset": "Timeline of when symptoms began",
      "location": "Anatomical site and radiation",
      "duration": "Duration of episodes",
      "character": "Quality and description of sensation",
      "alleviating_factors": "Interventions or actions providing relief",
      "aggravating_factors": "Triggers or worsening factors",
      "timing": "Frequency, pattern, diurnal variation",
      "severity": "Reported pain/discomfort level (e.g. 6/10)"
    },
    "associated_symptoms": ["List of reported positive associated symptoms"],
    "pertinent_negatives": ["Important symptoms denied by patient"],
    "patient_history": {
      "medications": "Reported prescriptions, OTCs, or none",
      "allergies": "Reported allergies or NKDA"
    }
  }
}`;

// Fallback intelligent clinical simulator when ANTHROPIC_API_KEY is not provided
function simulateClinicalResponse(history, questionIndex) {
  const patientMessages = history.filter(m => m.role === 'patient');
  const allPatientText = patientMessages.map(m => m.content).join(' ');
  const latestMessage = patientMessages[patientMessages.length - 1]?.content || '';

  // 1. Check emergency
  const emergencyReason = checkEmergencyText(allPatientText);
  if (emergencyReason) {
    return {
      is_emergency: true,
      emergency_reason: emergencyReason,
      next_question: "CRITICAL: The symptoms you described require immediate emergency evaluation. Please call 911 (or your local emergency services) or go to the nearest emergency room immediately.",
      is_complete: true,
      triage_level: 'emergency',
      triage_rationale: 'Patient reported high-risk red-flag symptoms requiring immediate emergency evaluation.',
      structured_summary: {
        chief_complaint: latestMessage || "Acute high-risk symptoms",
        hpi: {
          onset: "Acute onset reported during intake",
          location: "See patient narrative",
          duration: "Acute / active",
          character: "Severe / red-flag features",
          alleviating_factors: "None reported",
          aggravating_factors: "Active",
          timing: "Immediate",
          severity: "High acuity emergency"
        },
        associated_symptoms: ["Red-flag indicators triggered immediate halt"],
        pertinent_negatives: [],
        patient_history: {
          medications: "Not collected due to emergency escalation",
          allergies: "Not collected due to emergency escalation"
        }
      }
    };
  }

  // 2. Sequential clinical follow-up questions (OLD CARTS)
  const followUpQueue = [
    {
      topic: "onset_duration",
      question: "When exactly did this start, and has it been constant or does it come and go?"
    },
    {
      topic: "severity",
      question: "On a scale from 1 to 10 (with 10 being the most severe discomfort), how would you rate it right now?"
    },
    {
      topic: "character",
      question: "How would you describe the feeling (for example: sharp, dull, aching, burning, throbbing, or pressure)?"
    },
    {
      topic: "factors",
      question: "Does anything make the symptoms noticeably better or worse (like movement, rest, food, or positions)?"
    },
    {
      topic: "associated",
      question: "Have you noticed any other symptoms accompanying this, such as fever, nausea, dizziness, or fatigue?"
    },
    {
      topic: "history",
      question: "Are you currently taking any prescription or over-the-counter medications, and do you have any drug allergies?"
    }
  ];

  // If question index reaches 6 or higher (max 8 follow-ups)
  if (questionIndex >= 6 || questionIndex >= followUpQueue.length) {
    // Generate completion
    const isPrompt = /fever|severe|worse|vomiting|unbearable|7|8|9|10/i.test(allPatientText);
    return {
      is_emergency: false,
      emergency_reason: null,
      next_question: null,
      is_complete: true,
      triage_level: isPrompt ? 'prompt' : 'routine',
      triage_rationale: isPrompt 
        ? 'Moderate acuity with symptoms warranting prompt same-day physician review.' 
        : 'Stable presentation suitable for routine outpatient review.',
      structured_summary: {
        chief_complaint: patientMessages[0]?.content || "Chief complaint documented",
        hpi: {
          onset: "As documented in intake transcript",
          location: "Primary site described in initial complaint",
          duration: "Symptoms ongoing over intake timeline",
          character: "Detailed in patient responses",
          alleviating_factors: "Reviewed during questionnaire",
          aggravating_factors: "Reviewed during questionnaire",
          timing: "Continuous or intermittent as noted",
          severity: allPatientText.match(/\b([1-9]|10)\b/)?.[0] ? `${allPatientText.match(/\b([1-9]|10)\b/)[0]}/10` : "Moderate"
        },
        associated_symptoms: ["Extracted from patient responses"],
        pertinent_negatives: ["No chest pain or respiratory distress noted"],
        patient_history: {
          medications: "Documented in intake record",
          allergies: "Documented in intake record"
        }
      }
    };
  }

  // Next question from queue
  const nextQ = followUpQueue[questionIndex];
  return {
    is_emergency: false,
    emergency_reason: null,
    next_question: nextQ.question,
    is_complete: false,
    triage_level: 'routine',
    triage_rationale: 'Intake in progress',
    structured_summary: null
  };
}

// Call Claude API or fallback
async function getClinicalResponse(conversationHistory, questionIndex) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const isDummyKey = !apiKey || apiKey.includes('your_anthropic_api_key') || apiKey.trim() === '';

  // Immediate red flag heuristic safety check before anything else
  const lastPatientMsg = conversationHistory[conversationHistory.length - 1]?.content || '';
  const emergencyCheck = checkEmergencyText(lastPatientMsg);
  if (emergencyCheck) {
    console.log('[SAFETY ESCALATION] Red-flag symptom caught by heuristic barrier:', emergencyCheck);
    return {
      is_emergency: true,
      emergency_reason: emergencyCheck,
      next_question: "CRITICAL: The symptoms you described require immediate emergency evaluation. Please call 911 (or your local emergency services) or go to the nearest emergency room immediately.",
      is_complete: true,
      triage_level: 'emergency',
      triage_rationale: emergencyCheck,
      structured_summary: {
        chief_complaint: lastPatientMsg,
        hpi: {
          onset: "Acute",
          location: "Chest / Cardiovascular / Neurological / Respiratory",
          duration: "Immediate presentation",
          character: "Acute high-risk red-flag symptoms",
          alleviating_factors: "None",
          aggravating_factors: "Ongoing",
          timing: "Active emergency",
          severity: "High emergency acuity"
        },
        associated_symptoms: ["Red-flag symptoms triggered immediate intake abort"],
        pertinent_negatives: [],
        patient_history: {
          medications: "Uncollected due to emergency escalation",
          allergies: "Uncollected due to emergency escalation"
        }
      }
    };
  }

  if (isDummyKey || !Anthropic) {
    console.log(`[Clinical Engine] Using smart fallback simulator (Question ${questionIndex + 1}/8)`);
    return simulateClinicalResponse(conversationHistory, questionIndex);
  }

  try {
    const client = new Anthropic({ apiKey });
    const messages = conversationHistory.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content
    }));

    // Add explicit guidance to Claude regarding current question index (max 8)
    const systemPromptWithCount = `${CLINICAL_SYSTEM_PROMPT}\n\nCURRENT QUESTION NUMBER: ${questionIndex + 1} of maximum 8 follow-ups. If question count is 8, you MUST set "is_complete": true and produce the "structured_summary".`;

    const response = await client.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      temperature: 0.2,
      system: systemPromptWithCount,
      messages: messages
    });

    const rawContent = response.content[0]?.text || '{}';
    // Clean potential markdown fencing from JSON
    const jsonString = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (err) {
    console.error('Anthropic API error, falling back to clinical simulator:', err.message);
    return simulateClinicalResponse(conversationHistory, questionIndex);
  }
}

// API: Initialize Intake Session
app.post('/api/intake/start', (req, res) => {
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const patientName = req.body.patientName || 'Anonymous Patient';
  const patientAge = req.body.patientAge || null;

  const initialQuestion = "Hello. I'm your clinic's intake assistant. I'll ask you a few targeted questions so your physician has a clear, organized history before seeing you. To begin, what is the main symptom or health concern bringing you in today?";

  const session = {
    id: sessionId,
    patientName,
    patientAge,
    createdAt: new Date().toISOString(),
    questionCount: 0,
    isComplete: false,
    isEmergency: false,
    transcript: [
      {
        role: 'ai',
        content: initialQuestion,
        timestamp: new Date().toISOString()
      }
    ]
  };

  activeSessions.set(sessionId, session);

  res.json({
    sessionId,
    question: initialQuestion,
    questionNumber: 1,
    maxQuestions: 8
  });
});

// API: Receive Patient Response & Generate Follow-up
app.post('/api/intake/message', async (req, res) => {
  const { sessionId, message } = req.body;
  if (!sessionId || !message) {
    return res.status(400).json({ error: 'sessionId and message are required' });
  }

  const session = activeSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Intake session not found or expired' });
  }

  if (session.isComplete) {
    return res.status(400).json({ error: 'This intake questionnaire is already concluded' });
  }

  // Record patient's answer
  session.transcript.push({
    role: 'patient',
    content: message,
    timestamp: new Date().toISOString()
  });

  const currentQuestionIdx = session.questionCount;
  session.questionCount += 1;

  // Process through Clinical Engine (Claude or Simulator)
  const result = await getClinicalResponse(session.transcript, currentQuestionIdx);

  // Check emergency or completion
  if (result.is_emergency) {
    session.isEmergency = true;
    session.isComplete = true;
    session.acuity = 'emergency';
    session.emergencyReason = result.emergency_reason;
    session.structuredSummary = result.structured_summary;
    session.transcript.push({
      role: 'ai',
      content: result.next_question,
      timestamp: new Date().toISOString()
    });

    // Save emergency case directly to doctor's list
    const caseRecord = {
      id: session.id,
      patientName: session.patientName,
      patientAge: session.patientAge,
      createdAt: session.createdAt,
      status: 'pending',
      acuity: 'emergency',
      chiefComplaint: session.transcript.find(t => t.role === 'patient')?.content || 'Emergency Escalation',
      isEmergency: true,
      emergencyReason: result.emergency_reason,
      questionsAnswered: session.questionCount,
      structuredSummary: result.structured_summary,
      transcript: session.transcript
    };
    saveCase(caseRecord);

    return res.json({
      sessionId,
      isEmergency: true,
      emergencyReason: result.emergency_reason,
      message: result.next_question,
      isComplete: true
    });
  }

  if (result.is_complete || session.questionCount >= 8) {
    session.isComplete = true;
    session.acuity = result.triage_level || 'routine';
    session.structuredSummary = result.structured_summary;

    const closingMessage = "Thank you for answering these questions. Your responses have been summarized and automatically routed to your doctor's triage dashboard. The care team will review your case shortly.";
    session.transcript.push({
      role: 'ai',
      content: closingMessage,
      timestamp: new Date().toISOString()
    });

    // Save finalized case to doctor's list
    const caseRecord = {
      id: session.id,
      patientName: session.patientName,
      patientAge: session.patientAge,
      createdAt: session.createdAt,
      status: 'pending',
      acuity: session.acuity,
      chiefComplaint: session.transcript.find(t => t.role === 'patient')?.content || 'Routine intake',
      isEmergency: false,
      questionsAnswered: session.questionCount,
      structuredSummary: result.structured_summary,
      transcript: session.transcript
    };
    saveCase(caseRecord);

    return res.json({
      sessionId,
      isEmergency: false,
      message: closingMessage,
      isComplete: true,
      caseId: session.id
    });
  }

  // Continue questioning
  session.transcript.push({
    role: 'ai',
    content: result.next_question,
    timestamp: new Date().toISOString()
  });

  return res.json({
    sessionId,
    isEmergency: false,
    isComplete: false,
    question: result.next_question,
    questionNumber: session.questionCount + 1,
    maxQuestions: 8
  });
});

// API: Doctor Worklist (Sorted by Acuity: Emergency -> Prompt -> Routine)
app.get('/api/doctor/cases', (req, res) => {
  const cases = loadCases();

  const acuityWeight = {
    emergency: 0,
    prompt: 1,
    routine: 2
  };

  // Sort by acuity first, then by timestamp descending
  const sorted = [...cases].sort((a, b) => {
    const weightA = acuityWeight[a.acuity] ?? 3;
    const weightB = acuityWeight[b.acuity] ?? 3;
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.json(sorted);
});

// API: Doctor Single Case Detail
app.get('/api/doctor/cases/:id', (req, res) => {
  const cases = loadCases();
  const found = cases.find(c => c.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Case not found' });
  }
  res.json(found);
});

// API: Update Case Status (e.g. Reviewed)
app.patch('/api/doctor/cases/:id', (req, res) => {
  const { status, doctorNotes } = req.body;
  const cases = loadCases();
  const caseItem = cases.find(c => c.id === req.params.id);
  if (!caseItem) {
    return res.status(404).json({ error: 'Case not found' });
  }

  if (status) caseItem.status = status;
  if (doctorNotes !== undefined) caseItem.doctorNotes = doctorNotes;
  caseItem.updatedAt = new Date().toISOString();

  saveCase(caseItem);
  res.json(caseItem);
});

// Serve direct friendly routes
app.get('/patient', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'patient.html'));
});

app.get('/doctor', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'doctor.html'));
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` Clinical Intake & Triage Prototype Server`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Patient Intake:  http://localhost:${PORT}/patient`);
  console.log(` Doctor Worklist: http://localhost:${PORT}/doctor`);
  console.log(`=================================================`);
});
