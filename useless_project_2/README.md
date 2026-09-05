# 🎓 College Survival Score Calculator™

> *“Because surviving college deserves a scientific calculation.”*

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Framework](https://img.shields.io/badge/Framework-Flask%203.x-green.svg)](https://flask.palletsprojects.com/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange.svg)](#technologies-used)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](#)

---

## 1. Project Description

The **College Survival Score Calculator™** is an intentionally useless, humorous, yet technically polished web application built to calculate how likely an undergraduate student is to survive the ongoing academic semester. 

By analyzing 11 ridiculous but painfully relatable college parameters (attendance, CGPA, pending assignments, bank balance, countdown days, back papers, sleep deprivation, cooking skills, coding prowess, social anxiety level, and meme/mockery potential), the application computes a normalized **Survival Score (0–100)**, categorizes the student into an academic survival tier, diagnoses their biggest threats, dishes out customized psychological roasts, and speaks insults aloud via the browser's native Text-to-Speech engine.

---

## 2. Problem Statement

Every semester, millions of college students worldwide encounter an existential crisis characterized by:
1. Vanishing attendance caused by 8:00 AM lectures.
2. An exponential accumulation of pending lab reports and assignments.
3. Bank accounts operating solely on the generosity of roommates and ₹10 UPI transactions.
4. Broken circadian sleep schedules operating on caffeine and adrenaline.

Despite having tools for grade calculation (CGPA/SGPA calculators) and attendance tracking, modern academia completely lacks an empirical, unified metric to evaluate whether a student will physically, mentally, and financially make it to the end of the semester.

---

## 3. Proposed Solution

The **College Survival Score Calculator™** resolves this academic void by providing a unified, multi-variable heuristic scoring model. It accepts qualitative and quantitative student life metrics, applies weighted score calculations across 11 dimensions, provides immediate visual and auditory feedback, highlights critical vulnerability zones, and offers satirical psychological coping mechanisms through automated roasts and useless daily advice.

---

## 4. Objectives

- **Algorithmic Heuristic Scoring:** Implement an extensible weighted mathematical model totaling exactly 100 points across 11 lifestyle and academic parameters.
- **Dynamic Roast Generation:** Synthesize multi-variable text roasts targeting the user's specific weak points.
- **Multimodal Feedback:** Integrate client-side Text-to-Speech (Web Speech API) and procedural synthesizer sound effects (Web Audio API) without requiring external audio files or third-party paid APIs.
- **Clean Responsive Architecture:** Deliver a sleek dark-mode glassmorphic interface accessible across mobile, tablet, and desktop viewports.
- **Beginner-Friendly Codebase:** Provide clean, well-commented Python (Flask) and vanilla JavaScript code suitable for college viva and mini-project demonstrations.

---

## 5. Key Features

1. **11-Dimensional Parameter Analysis:**
   - Attendance percentage (0–100%)
   - CGPA (0.00–10.00)
   - Number of pending assignments
   - Bank balance (₹)
   - Days remaining until semester end
   - Number of back papers (arrears)
   - Average daily sleep hours
   - Cooking ability tier
   - Technical skill level
   - Social interaction level
   - Mocking / Humor capacity

2. **Animated Score Dashboard:**
   - 0–100 real-time score count-up animation.
   - Dynamic SVG/conic-gradient radial gauge.
   - 6 Survival Tiers with custom badge themes and sarcastic quotes.

3. **Survival Diagnostics:**
   - **⭐ Strongest Survival Skill:** Identifies the student's highest relative scoring asset.
   - **⚠️ Biggest Threat:** Pinpoints the single deficiency most likely to ruin the semester.
   - **Progress Breakdown:** Visual progress bars for every parameter with funny status descriptions.

4. **🔥 Savage Roast Engine:**
   - Context-aware roast generator combining multiple weaknesses into a customized paragraph.
   - Speech synthesis integration (`window.speechSynthesis`) to read the roast out loud with adjustable pitch and speed.

5. **🎤 Mocking Mode:**
   - Individual one-click roast triggers:
     - *Roast My Attendance*
     - *Roast My CGPA*
     - *Roast My Bank Balance*
     - *Roast My Assignments*
     - *Roast My Sleep*
     - *Roast My Back Papers*
     - *Roast Everything*

6. **💡 Useless College Advice:**
   - Randomly picks from a curated repository of 15+ satirical college survival tips.

7. **🎲 Random Student Profile Generator:**
   - Instantly populates and calculates profiles such as *"The Attendance Gambler"*, *"The Academic Weapon"*, *"The Last-Minute Legend"*, and *"The Caffeine-Powered Coder"*.

8. **📸 Native Sharing & Clipboard Export:**
   - Uses the browser's Web Share API with an automatic formatted clipboard fallback.

9. **🔊 Synthesized Web Audio FX:**
   - Procedural 8-bit sound effects (celebratory arpeggio, danger buzzers, and retro death chimes) built with Web Audio API.

10. **Robust Validation:**
    - Strict server-side and client-side boundary checks with non-crashing friendly error banners.

---

## 6. Technologies Used

### Programming Language
- **Python 3.10+**: Core backend logic and web server.

### Backend Framework & Libraries
- **Flask**: Lightweight WSGI micro-framework for routing and RESTful JSON endpoints.
- **Werkzeug**: WSGI utility library (bundled with Flask).
- **Jinja2**: Templating engine for serving `index.html`.

### Frontend Stack
- **HTML5**: Semantic document layout with accessible forms and ARIA roles.
- **CSS3**: Custom dark-mode design system, CSS Grid, Flexbox, glassmorphism (`backdrop-filter`), keyframe animations, and media queries.
- **JavaScript (ES6+)**: Asynchronous `fetch()` calls, DOM manipulation, and dynamic state management.
- **Web Speech API (`SpeechSynthesis`)**: In-browser text-to-speech engine.
- **Web Audio API (`AudioContext`)**: Synthesized procedural sound effects without external audio assets.

---

## 7. Folder Structure

```text
college-survival-calculator/
│
├── app.py                  # Main Flask application and scoring logic
├── requirements.txt        # Python package dependencies
├── README.md               # Complete project documentation
│
├── templates/
│   └── index.html          # Frontend HTML template
│
├── static/
│   ├── style.css           # Styling, animations, and dark theme
│   └── script.js           # Client-side validation, audio, and API interactions
│
└── assets/
    └── favicon.svg         # Graduation cap / calculator SVG tab icon
```

---

## 8. Installation (Windows)

Follow these exact steps to set up and run the application on Windows:

### Step 1: Verify Python Installation
Open **Command Prompt** or **PowerShell** and verify that Python is installed:
```powershell
python --version
```
*(Ensure Python version is 3.10 or higher).*

### Step 2: Navigate to Project Directory
```powershell
cd c:\Users\ASUS\Desktop\ULP\useless_project_2
```

### Step 3: Create a Virtual Environment (Recommended)
```powershell
python -m venv venv
```

### Step 4: Activate the Virtual Environment
- In **Command Prompt (cmd)**:
  ```cmd
  venv\Scripts\activate.bat
  ```
- In **PowerShell**:
  ```powershell
  venv\Scripts\Activate.ps1
  ```
*(If PowerShell displays an Execution Policy error, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and rerun the activation script).*

### Step 5: Install Required Packages
```powershell
pip install -r requirements.txt
```

---

## 9. Running the Application

Start the Flask development server:
```powershell
python app.py
```

You will see the console confirmation:
```text
=======================================================
  🎓 COLLEGE SURVIVAL SCORE CALCULATOR™
  Status: Server running locally
  Open your browser at: http://127.0.0.1:5000
=======================================================
```

Open your web browser (Chrome, Edge, Firefox, Brave) and navigate to:
```text
http://127.0.0.1:5000
```

---

## 10. How the Scoring System Works

The application calculates a normalized total score ranging strictly between **0 and 100 points**:

$$\text{Survival Score} = S_{\text{att}} + S_{\text{cgpa}} + S_{\text{assign}} + S_{\text{money}} + S_{\text{days}} + S_{\text{backs}} + S_{\text{sleep}} + S_{\text{cook}} + S_{\text{tech}} + S_{\text{social}} + S_{\text{mock}}$$

### Detailed Weight Breakdown

| Parameter | Max Points | Scoring Brackets | Sarcastic Description |
| :--- | :---: | :--- | :--- |
| **Attendance** | **15 pts** | • 90–100%: 15 pts<br>• 75–89%: 12 pts<br>• 50–74%: 7 pts<br>• &lt; 50%: 2 pts | 90–100%: “Teacher's favourite”<br>75–89%: “Normal human”<br>50–74%: “Danger zone”<br>&lt; 50%: “Are you even enrolled?” |
| **CGPA** | **15 pts** | • 9.0–10.0: 15 pts<br>• 8.0–8.99: 13 pts<br>• 7.0–7.99: 10 pts<br>• 6.0–6.99: 7 pts<br>• &lt; 6.0: 3 pts | 9.0–10.0: “Sharma ji ka beta tier”<br>8.0–8.99: “Placement cell loves you”<br>7.0–7.99: “The golden middle class”<br>6.0–6.99: “Living on the edge”<br>&lt; 6.0: “Degree speedrun (failed)” |
| **Pending Assignments** | **10 pts** | • 0: 10 pts<br>• 1–2: 8 pts<br>• 3–5: 5 pts<br>• 6–8: 2 pts<br>• 9+: 0 pts | 0: “Academic weapon”<br>1–2: “Manageable”<br>3–5: “Professional procrastinator”<br>6–8: “Assignments are now your full-time job”<br>9+: “The assignments have become your assignments” |
| **Money Left (₹)** | **10 pts** | • ₹10,000+: 10 pts<br>• ₹5,000–9,999: 8 pts<br>• ₹1,000–4,999: 5 pts<br>• ₹500–999: 2 pts<br>• &lt; ₹500: 0 pts | ₹10,000+: “Financially stable”<br>₹5,000–9,999: “Surviving”<br>₹1,000–4,999: “UPI warrior”<br>₹500–999: “Ask roommate”<br>&lt; ₹500: “Financial boss fight” |
| **Days Until Sem Ends** | **10 pts** | • ≤ 7 days: 10 pts<br>• 8–20 days: 8 pts<br>• 21–45 days: 6 pts<br>• 46–90 days: 4 pts<br>• &gt; 90 days: 2 pts | Closer to end = Higher odds of escaping intact.<br>Many days left = Prolonged exposure to academic doom. |
| **Back Papers** | **10 pts** | • 0: 10 pts<br>• 1–2: 7 pts<br>• 3–5: 4 pts<br>• 6+: 0 pts | 0: “Legend”<br>1–2: “Still alive”<br>3–5: “Character development”<br>6+: “Final boss” |
| **Sleep Schedule** | **10 pts** | • 7.0–9.0 hrs: 10 pts<br>• 5.0–6.9 hrs: 7 pts<br>• 3.0–4.9 hrs: 4 pts<br>• &lt; 3.0 hrs: 1 pt<br>• &gt; 9.0 hrs: 7 pts | 7–9 hrs: “Healthy human”<br>5–6.9 hrs: “Average college student”<br>3–4.9 hrs: “Powered by caffeine”<br>&lt; 3 hrs: “Operating on Windows 95”<br>&gt; 9 hrs: “Hibernation specialist” |
| **Cooking Ability** | **5 pts** | • Hostel chef: 5 pts<br>• Good cook: 4 pts<br>• Basic meals: 3 pts<br>• Maggi/eggs: 2 pts<br>• Can boil water: 1 pt<br>• Cannot cook: 0 pts | Evaluates immunity against mess food poisoning and midnight starvation. |
| **Technical Skill** | **5 pts** | • Expert: 5 pts<br>• Advanced: 4 pts<br>• Good: 3 pts<br>• Intermediate: 2 pts<br>• Basic: 1 pt<br>• Beginner: 0 pts | Evaluates ability to debug projects 10 minutes before submission. |
| **Social Skill** | **5 pts** | • Campus celebrity: 5 pts<br>• Very social: 4 pts<br>• Social: 3 pts<br>• Normal: 2 pts<br>• Introvert mode: 1 pt<br>• NPC: 0 pts | Evaluates network size for collecting exam notes and arranging proxy attendance. |
| **Mocking / Humor** | **5 pts** | • Final boss of mocking: 5 pts<br>• Professional roaster: 4 pts<br>• Class comedian: 3 pts<br>• Meme supplier: 2 pts<br>• Occasionally funny: 1 pt<br>• Not funny: 0 pts | Critical psychological defense mechanism against semester stress. |
| **TOTAL** | **100 pts** | — | — |

---

### Survival Tiers

- **90–100:** 🏆 **COLLEGE SURVIVAL GOD**  
  *“You don't survive college. College survives you.”*
- **75–89:** 🟢 **SURVIVING COMFORTABLY**  
  *“Somehow everything is under control.”*
- **60–74:** 🟡 **BARELY SURVIVING**  
  *“One more assignment could end everything.”*
- **40–59:** 🟠 **CRITICAL CONDITION**  
  *“Attendance, money and sleep are all disappearing.”*
- **20–39:** 🔴 **ACADEMIC EMERGENCY**  
  *“Contact your friends immediately.”*
- **0–19:** 💀 **COLLEGE HAS WON**  
  *“Please restart the semester.”*

---

## 11. How the Roast System Works

The application features a two-tiered roasting architecture:

1. **Combined Multi-Variable Autopsy (`build_combined_roast`)**:
   - Calculates the ratio $\frac{\text{score}}{\text{max}}$ for each metric.
   - Isolates the bottom three lowest-performing categories.
   - Weaves a continuous narrative roast referencing exact student inputs (e.g., specific bank balance, exact pending tasks count).

2. **Targeted Category Mockery (`/api/roast-topic`)**:
   - Allows students to test roasts on specific areas of vulnerability (*Attendance*, *CGPA*, *Money*, *Assignments*, *Sleep*, *Back Papers*, or *Everything*).

3. **Web Speech Synthesis**:
   - Utterances are dispatched to the browser's `window.speechSynthesis` queue with optimized speech rate ($1.05\times$) and natural pitch tuning for comedic cadence.

---

## 12. Input Validation & Edge Cases

The backend and frontend strictly validate user input to prevent exceptions:
- **Attendance**: Checked for $0 \le x \le 100$.
- **CGPA**: Checked for $0.00 \le x \le 10.00$.
- **Pending Assignments & Back Papers**: Enforces non-negative integers ($x \ge 0$).
- **Money Left**: Enforces non-negative numbers ($x \ge 0$).
- **Days Until Semester Ends**: Enforces $x \ge 1$ (semester must have at least 1 day remaining).
- **Sleep Hours**: Checked for $0.0 \le x \le 24.0$.

Invalid values trigger inline CSS error borders, a sticky error banner, and alert sound effects without crashing the Flask process.

---

## 13. Limitations

- **Subjective Heuristics:** The scoring weights are entirely satirical and cannot legally be used in academic disciplinary appeals.
- **Browser TTS Variation:** Voice quality depends on installed OS voices (Chrome, Edge, and Safari have distinct built-in voice packs).
- **Local Ephemeral Session:** In accordance with specifications, the calculator operates purely in-memory and does not persist student records to an external SQL database.

---

## 14. Future Improvements

1. **Export PDF Survival Certificate:** Generate a downloadable, signed "Certificate of Academic Endangerment" PDF with a fake Dean signature.
2. **Multi-College Preset Profiles:** Add custom presets tailored for Engineering (B.Tech), Medical (MBBS), Law, and Business (MBA) student archetypes.
3. **Multiplayer Room / Leaderboard:** Allow roommates to compare scores on a shared local WiFi leaderboard to crown the "Most Endangered Student".
4. **PWA (Progressive Web App):** Add service workers and offline manifest for mobile home-screen installation.

---

## 15. Conclusion

The **College Survival Score Calculator™** successfully demonstrates that humorous, satirical concepts can be built with production-grade engineering principles. Combining Flask's elegant backend architecture, modern semantic HTML5, dark glassmorphism styling, and native web APIs (Speech & Audio), the project provides an engaging, memorable demonstration suitable for college coursework, mini-projects, and hackathons.
