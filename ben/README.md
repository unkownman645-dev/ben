# Clinical Intake & Doctor Triage Prototype

A working full-stack prototype: patient describes their health problem, an AI assistant asks up to 8 targeted follow-ups (onset, severity, location, associated symptoms, etc.), and a structured summary automatically lands on the doctor's triage worklist sorted by clinical acuity.

---

## How It's Built

1. **Patient Check-In (`public/patient.html` & `public/js/patient.js`)**
   - **Journal-Style Intake**: One question in focus at a time.
   - **Quiet Running Record**: Past answers fold neatly into a quiet, collapsible timeline above so patients can review prior answers without screen clutter.
   - **Targeted Follow-Ups**: Up to 8 targeted questions focusing on the classic clinical framework (OLD CARTS: Onset, Location, Duration, Character, Alleviating/Aggravating factors, Radiation, Timing, Severity).
   - **Instant Escalation Screen**: If red-flag emergency symptoms are reported, the questionnaire halts immediately, presenting an emergency alert and dialing prompt.

2. **Doctor Dashboard (`public/doctor.html` & `public/js/doctor.js`)**
   - **Acuity-Sorted Queue**: Worklist dynamically sorted:
     $$\text{Emergency (Red)} \longrightarrow \text{Prompt (Amber)} \longrightarrow \text{Routine (Teal)}$$
   - **Structured Summary Review**: Click any patient row to inspect:
     - Chief Complaint
     - OLD CARTS History of Present Illness (HPI)
     - Pertinent Positives & Negatives
     - Patient-reported medications and allergies
     - Triage justification
   - **Verbatim Transcript**: Collapsible complete conversation history with timestamps for clinician auditing.
   - **Clinical Tools**: One-click "Copy EHR Note" to clipboard and status tracking ("Reviewed" vs. "Pending").
   - **Live Polling**: Worklist refreshes every 5 seconds to catch new intakes automatically.

3. **Backend (`backend/server.js` & `server.py`)**
   - **Express Server**: Exposes REST endpoints for session initialization (`/api/intake/start`), conversation management (`/api/intake/message`), and doctor queue operations (`/api/doctor/cases`).
   - **Claude API Integration**: Calls the Anthropic API (`@anthropic-ai/sdk`) using a strict clinical system prompt.
   - **Smart Clinical Fallback**: Includes a built-in heuristic clinical engine that simulates intelligent follow-ups and emergency detection even without an active API key, allowing immediate end-to-end testing.
   - **JSON Case Store**: Persists case records to `backend/data/cases.json` (ready to be swapped for PostgreSQL / MongoDB in production).
   - **Zero-Dependency Python Server (`server.py`)**: A standalone runner built on Python's standard library so you can launch the prototype immediately on machines where Node.js is not yet installed.

---

## The Clinical Guardrails & System Prompt

### Core Design Rules
* **Pure History-Taking**: The AI is strictly prohibited from suggesting diagnoses, speculating on etiologies, or recommending medications/treatments.
* **No False Reassurance**: The AI will never say "You'll be fine" or "Nothing to worry about".
* **Emergency Escalation Protocol**: If the patient describes anything that could be an acute emergency (crushing chest pain, severe shortness of breath, sudden numbness or slurred speech, syncope/fainting, anaphylaxis, severe hemorrhage, or suicidal thoughts), the AI halts the questionnaire immediately, flags the case as `emergency`, and routes it to the top of the doctor's queue.

### The Complete System Prompt

```markdown
You are a clinical intake assistant for an outpatient medical clinic.
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
}
```

---

## How to Run It

### Option A: Python Standalone Runner (Runs Immediately)
Python 3.14 is installed on your system. Run without installing any packages:
```powershell
python server.py
```
Open your browser:
* **Landing Gateway**: [http://localhost:3000](http://localhost:3000)
* **Patient Check-In**: [http://localhost:3000/patient](http://localhost:3000/patient)
* **Doctor Worklist**: [http://localhost:3000/doctor](http://localhost:3000/doctor)

### Option B: Node.js / Express Backend
To run using Node.js:
1. Ensure Node.js is installed (`winget install OpenJS.NodeJS.LTS` on Windows, or download from [nodejs.org](https://nodejs.org/)).
2. Navigate to the backend directory and install dependencies:
   ```powershell
   cd backend
   npm install
   ```
3. Copy environment variables and set your Anthropic API key:
   ```powershell
   copy .env.example .env
   # Edit .env and enter your ANTHROPIC_API_KEY
   ```
4. Start the server:
   ```powershell
   npm start
   ```
5. Open [http://localhost:3000/patient](http://localhost:3000/patient) and [http://localhost:3000/doctor](http://localhost:3000/doctor) in separate tabs to test the live handoff.

---

## Testing the Clinical Handoff

1. **Test a Routine Case**:
   - Go to [http://localhost:3000/patient](http://localhost:3000/patient).
   - Enter: `"I've had a mild sore throat and a runny nose for 2 days."`
   - Answer the follow-ups (rating pain 3/10, no difficulty breathing, etc.).
   - Notice previous answers folding smoothly into the quiet record above.
   - On completion, switch to [http://localhost:3000/doctor](http://localhost:3000/doctor) to see the case under **Routine**.

2. **Test an Emergency Escalation**:
   - Start a new intake session.
   - Enter: `"I have crushing chest tightness radiating down my left arm and I can't catch my breath."`
   - Observe that the questionnaire **halts immediately**, a high-visibility red emergency escalation banner appears, and the case lands pinned at the top of the Doctor Worklist with a pulsing red **Emergency** badge.

---

## Production Readiness & Compliance Notice

> [!CAUTION]
> This is an architectural and clinical proof-of-concept prototype, not a production-ready medical device. Before deploying with real Protected Health Information (PHI), the following requirements must be addressed:

1. **HIPAA & Data Privacy**: All patient data must be encrypted in transit (TLS 1.3) and at rest (AES-256). User authentication, RBAC (Role-Based Access Control), audit logging, and automated session timeouts are required.
2. **Business Associate Agreement (BAA)**: When utilizing commercial LLM APIs (such as Anthropic Claude or Google Gemini) with identifiable patient data in the United States, an executed BAA is legally required under HIPAA.
3. **Human-in-the-Loop Emergency Paging**: In a production emergency flow, a screen notice alone is insufficient. High-acuity triggers must dispatch automated telephony/pager alerts directly to on-call triage nurses or physician staff.
4. **Clinical Validation**: The question selection, branch logic, and red-flag rules must be reviewed and formally approved by a licensed clinical board for the specific patient population and specialty.
