"""
Clinical Intake & Doctor Triage Server (Python Runner)
Zero-dependency standalone server using Python standard library.
Enables immediate execution without requiring npm packages.
"""

import http.server
import socketserver
import json
import os
import re
import uuid
from datetime import datetime, timezone
import urllib.request
import urllib.error

PORT = int(os.environ.get("PORT", 3000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
DATA_FILE = os.path.join(BASE_DIR, "backend", "data", "cases.json")

# In-memory sessions
active_sessions = {}

EMERGENCY_PATTERNS = [
    re.compile(r"chest\s*(pain|pressure|tightness|heaviness|squeezing)", re.I),
    re.compile(r"short(ness)?\s*of\s*breath|difficulty\s*breathing|cannot\s*breathe|gasping", re.I),
    re.compile(r"radiat(ing|es)?\s*(to|down)?\s*(left\s*)?(arm|shoulder|jaw|neck|back)", re.I),
    re.compile(r"pass(ed)?\s*out|faint(ed|ing)?|syncope|lost\s*consciousness", re.I),
    re.compile(r"sudden\s*(numbness|weakness|paralysis|droop)", re.I),
    re.compile(r"slurr(ed)?\s*speech|cannot\s*talk|facial\s*droop", re.I),
    re.compile(r"worst\s*headache\s*(of\s*my\s*life|ever)|thunderclap", re.I),
    re.compile(r"cough(ing)?\s*up\s*blood|vomit(ing)?\s*blood|massive\s*bleeding", re.I),
    re.compile(r"anaphylaxis|throat\s*closing|swelling\s*of\s*(tongue|throat|lips)", re.I),
    re.compile(r"suicid(e|al)|kill\s*myself", re.I),
]

def check_emergency(text):
    if not text:
        return None
    for pattern in EMERGENCY_PATTERNS:
        if pattern.search(text):
            return f"Potential high-acuity medical emergency detected: matched criteria '{pattern.pattern}'. Immediate clinical escalation required."
    return None

def load_cases():
    if not os.path.exists(DATA_FILE):
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading cases: {e}")
        return []

def save_case(case_data):
    cases = load_cases()
    found = False
    for i, c in enumerate(cases):
        if c.get("id") == case_data.get("id"):
            cases[i] = case_data
            found = True
            break
    if not found:
        cases.insert(0, case_data)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(cases, f, indent=2)

def simulate_clinical_turn(history, question_idx):
    patient_msgs = [m["content"] for m in history if m.get("role") == "patient"]
    all_patient_text = " ".join(patient_msgs)
    latest_msg = patient_msgs[-1] if patient_msgs else ""

    emerg = check_emergency(all_patient_text)
    if emerg:
        return {
            "is_emergency": True,
            "emergency_reason": emerg,
            "next_question": "CRITICAL: The symptoms you described require immediate emergency evaluation. Please call 911 or go to the nearest emergency room immediately.",
            "is_complete": True,
            "triage_level": "emergency",
            "triage_rationale": "High-risk red-flag symptoms detected.",
            "structured_summary": {
                "chief_complaint": latest_msg,
                "hpi": {
                    "onset": "Acute",
                    "location": "Cardiovascular / Respiratory / Neurological",
                    "duration": "Immediate",
                    "character": "High-risk red-flag symptoms",
                    "alleviating_factors": "None",
                    "aggravating_factors": "Active",
                    "timing": "Active emergency",
                    "severity": "Emergency acuity"
                },
                "associated_symptoms": ["Red-flag indicators triggered immediate intake halt"],
                "pertinent_negatives": [],
                "patient_history": {"medications": "Not collected", "allergies": "Not collected"}
            }
        }

    follow_ups = [
        "When exactly did this start, and has it been constant or does it come and go?",
        "On a scale from 1 to 10 (with 10 being the most severe discomfort), how would you rate it right now?",
        "How would you describe the feeling (for example: sharp, dull, aching, burning, throbbing, or pressure)?",
        "Does anything make the symptoms noticeably better or worse (like movement, rest, or positions)?",
        "Have you noticed any other symptoms accompanying this, such as fever, nausea, dizziness, or fatigue?",
        "Are you currently taking any prescription or over-the-counter medications, and do you have any drug allergies?"
    ]

    if question_idx >= 6 or question_idx >= len(follow_ups):
        is_prompt = bool(re.search(r"fever|severe|worse|vomiting|unbearable|7|8|9|10", all_patient_text, re.I))
        return {
            "is_emergency": False,
            "emergency_reason": None,
            "next_question": None,
            "is_complete": True,
            "triage_level": "prompt" if is_prompt else "routine",
            "triage_rationale": "Prompt review recommended" if is_prompt else "Routine outpatient review indicated.",
            "structured_summary": {
                "chief_complaint": patient_msgs[0] if patient_msgs else "Documented complaint",
                "hpi": {
                    "onset": "Timeline documented during intake",
                    "location": "Described in initial complaint",
                    "duration": "Ongoing over intake period",
                    "character": "Characterized in patient responses",
                    "alleviating_factors": "Reviewed during questionnaire",
                    "aggravating_factors": "Reviewed during questionnaire",
                    "timing": "Continuous or intermittent as noted",
                    "severity": f"{m.group(0)}/10" if (m := re.search(r"\b([1-9]|10)\b", all_patient_text)) else "Moderate"
                },
                "associated_symptoms": ["Documented in transcript"],
                "pertinent_negatives": ["No chest pain or dyspnea noted"],
                "patient_history": {"medications": "Recorded in transcript", "allergies": "Recorded in transcript"}
            }
        }

    return {
        "is_emergency": False,
        "emergency_reason": None,
        "next_question": follow_ups[question_idx],
        "is_complete": False,
        "triage_level": "routine",
        "triage_rationale": "Intake in progress",
        "structured_summary": None
    }

class ClinicalRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_GET(self):
        # Friendly route mappings
        if self.path in ("/", ""):
            self.path = "/index.html"
            return super().do_GET()
        if self.path == "/patient":
            self.path = "/patient.html"
            return super().do_GET()
        if self.path == "/doctor":
            self.path = "/doctor.html"
            return super().do_GET()

        # API: Doctor cases list
        if self.path == "/api/doctor/cases":
            cases = load_cases()
            acuity_weight = {"emergency": 0, "prompt": 1, "routine": 2}
            cases.sort(key=lambda c: (acuity_weight.get(c.get("acuity", "routine"), 3), c.get("createdAt", "")))
            
            # Sort timestamp descending within priority
            emergency_list = [c for c in cases if c.get("acuity") == "emergency"]
            prompt_list = [c for c in cases if c.get("acuity") == "prompt"]
            routine_list = [c for c in cases if c.get("acuity") == "routine"]
            emergency_list.sort(key=lambda c: c.get("createdAt", ""), reverse=True)
            prompt_list.sort(key=lambda c: c.get("createdAt", ""), reverse=True)
            routine_list.sort(key=lambda c: c.get("createdAt", ""), reverse=True)
            sorted_cases = emergency_list + prompt_list + routine_list

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(sorted_cases).encode("utf-8"))
            return

        # API: Single Case Detail
        if self.path.startswith("/api/doctor/cases/"):
            case_id = self.path.split("/")[-1]
            cases = load_cases()
            found = next((c for c in cases if c.get("id") == case_id), None)
            if found:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(found).encode("utf-8"))
            else:
                self.send_response(404)
                self.end_headers()
            return

        return super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        if self.path == "/api/intake/start":
            session_id = f"session_{int(datetime.now().timestamp()*1000)}_{uuid.uuid4().hex[:5]}"
            patient_name = payload.get("patientName") or "Anonymous Patient"
            patient_age = payload.get("patientAge")

            init_q = "Hello. I'm your clinic's intake assistant. I'll ask you a few targeted questions so your physician has a clear, organized history before seeing you. To begin, what is the main symptom or health concern bringing you in today?"

            session = {
                "id": session_id,
                "patientName": patient_name,
                "patientAge": patient_age,
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "questionCount": 0,
                "isComplete": False,
                "isEmergency": False,
                "transcript": [{"role": "ai", "content": init_q, "timestamp": datetime.now(timezone.utc).isoformat()}]
            }
            active_sessions[session_id] = session

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "sessionId": session_id,
                "question": init_q,
                "questionNumber": 1,
                "maxQuestions": 8
            }).encode("utf-8"))
            return

        if self.path == "/api/intake/message":
            session_id = payload.get("sessionId")
            message = payload.get("message", "").strip()

            session = active_sessions.get(session_id)
            if not session:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Session not found"}).encode("utf-8"))
                return

            session["transcript"].append({
                "role": "patient",
                "content": message,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })

            curr_idx = session["questionCount"]
            session["questionCount"] += 1

            result = simulate_clinical_turn(session["transcript"], curr_idx)

            if result.get("is_emergency"):
                session["isEmergency"] = True
                session["isComplete"] = True
                session["acuity"] = "emergency"
                session["emergencyReason"] = result.get("emergency_reason")
                session["structuredSummary"] = result.get("structured_summary")
                session["transcript"].append({
                    "role": "ai",
                    "content": result.get("next_question"),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })

                case_rec = {
                    "id": session["id"],
                    "patientName": session["patientName"],
                    "patientAge": session["patientAge"],
                    "createdAt": session["createdAt"],
                    "status": "pending",
                    "acuity": "emergency",
                    "chiefComplaint": session["transcript"][1]["content"] if len(session["transcript"]) > 1 else "Emergency Escalation",
                    "isEmergency": True,
                    "emergencyReason": result.get("emergency_reason"),
                    "questionsAnswered": session["questionCount"],
                    "structuredSummary": result.get("structured_summary"),
                    "transcript": session["transcript"]
                }
                save_case(case_rec)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "sessionId": session_id,
                    "isEmergency": True,
                    "emergencyReason": result.get("emergency_reason"),
                    "message": result.get("next_question"),
                    "isComplete": True
                }).encode("utf-8"))
                return

            if result.get("is_complete") or session["questionCount"] >= 8:
                session["isComplete"] = True
                session["acuity"] = result.get("triage_level", "routine")
                session["structuredSummary"] = result.get("structured_summary")

                closing = "Thank you for answering these questions. Your responses have been summarized and automatically routed to your doctor's triage dashboard."
                session["transcript"].append({
                    "role": "ai",
                    "content": closing,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })

                case_rec = {
                    "id": session["id"],
                    "patientName": session["patientName"],
                    "patientAge": session["patientAge"],
                    "createdAt": session["createdAt"],
                    "status": "pending",
                    "acuity": session["acuity"],
                    "chiefComplaint": session["transcript"][1]["content"] if len(session["transcript"]) > 1 else "Routine intake",
                    "isEmergency": False,
                    "questionsAnswered": session["questionCount"],
                    "structuredSummary": result.get("structured_summary"),
                    "transcript": session["transcript"]
                }
                save_case(case_rec)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "sessionId": session_id,
                    "isEmergency": False,
                    "message": closing,
                    "isComplete": True,
                    "caseId": session["id"]
                }).encode("utf-8"))
                return

            # Next question
            session["transcript"].append({
                "role": "ai",
                "content": result.get("next_question"),
                "timestamp": datetime.now(timezone.utc).isoformat()
            })

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "sessionId": session_id,
                "isEmergency": False,
                "isComplete": False,
                "question": result.get("next_question"),
                "questionNumber": session["questionCount"] + 1,
                "maxQuestions": 8
            }).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

    def do_PATCH(self):
        if self.path.startswith("/api/doctor/cases/"):
            case_id = self.path.split("/")[-1]
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
            payload = json.loads(body)

            cases = load_cases()
            case_item = next((c for c in cases if c.get("id") == case_id), None)
            if not case_item:
                self.send_response(404)
                self.end_headers()
                return

            if "status" in payload:
                case_item["status"] = payload["status"]
            case_item["updatedAt"] = datetime.now(timezone.utc).isoformat()
            save_case(case_item)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(case_item).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), ClinicalRequestHandler) as httpd:
        print("=" * 60)
        print("  Clinical Intake & Doctor Triage Server (Python)")
        print(f"  Running on: http://localhost:{PORT}")
        print(f"  Gateway:    http://localhost:{PORT}/")
        print(f"  Patient:    http://localhost:{PORT}/patient")
        print(f"  Doctor:     http://localhost:{PORT}/doctor")
        print("=" * 60)
        httpd.serve_forever()

if __name__ == "__main__":
    run_server()
