"""
College Survival Score Calculator™
A humorous, beginner-friendly web application built with Flask.
Calculates how likely a student is to survive the semester based on ridiculous college parameters.
"""

import sys

# Ensure UTF-8 output on Windows consoles
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

# -----------------------------------------------------------------------------
# CONSTANTS & SCORING DATA
# -----------------------------------------------------------------------------

COOKING_LEVELS = {
    "Cannot cook": {"score": 0, "desc": "Zomato gold shareholder"},
    "Can boil water": {"score": 1, "desc": "Water enthusiast"},
    "Maggi/eggs": {"score": 2, "desc": "Standard hostel survivalist"},
    "Basic meals": {"score": 3, "desc": "Edible survival food"},
    "Good cook": {"score": 4, "desc": "Wing favorite chef"},
    "Hostel chef": {"score": 5, "desc": "Gordon Ramsay of the hostel"}
}

TECH_LEVELS = {
    "Beginner": {"score": 0, "desc": "Thinks Python is an actual reptile"},
    "Basic": {"score": 1, "desc": "Knows where the laptop power button is"},
    "Intermediate": {"score": 2, "desc": "HTML is my passion"},
    "Good": {"score": 3, "desc": "Writes a for-loop without crying"},
    "Advanced": {"score": 4, "desc": "Stack Overflow copy-paste grandmaster"},
    "Expert": {"score": 5, "desc": "Hackathon menace & terminal wizard"}
}

SOCIAL_LEVELS = {
    "NPC": {"score": 0, "desc": "Only speaks when given a dialogue prompt"},
    "Introvert mode": {"score": 1, "desc": "Hides in the library corner"},
    "Normal": {"score": 2, "desc": "Functional human being"},
    "Social": {"score": 3, "desc": "Regular cafeteria enthusiast"},
    "Very social": {"score": 4, "desc": "Wing extrovert & gossip source"},
    "Campus celebrity": {"score": 5, "desc": "Knows everyone and the security guard"}
}

MOCKING_LEVELS = {
    "Not funny": {"score": 0, "desc": "Laughs 3 business days later"},
    "Occasionally funny": {"score": 1, "desc": "Cracks one joke per semester"},
    "Meme supplier": {"score": 2, "desc": "Distributes memes instead of class notes"},
    "Class comedian": {"score": 3, "desc": "Even the professor chuckles at excuses"},
    "Professional roaster": {"score": 4, "desc": "Leaves no survivors in WhatsApp groups"},
    "Final boss of mocking": {"score": 5, "desc": "Certified emotional damage specialist"}
}

COLLEGE_ADVICE = [
    "Attend at least one class this week. Just one.",
    "Sleep before 3:00 AM. Challenge yourself.",
    "Stop ordering food from Swiggy/Zomato for 24 hours. Your wallet is crying.",
    "Finish an assignment before the deadline. It's revolutionary.",
    "Talk to a real human face-to-face today instead of sending reels.",
    "Check your bank account balance before opening food delivery apps.",
    "Learn something in your degree besides Ctrl+C and Ctrl+V.",
    "Your professor still vaguely remembers that you exist. Keep it that way.",
    "Drinking 3 energy drinks is not equivalent to a healthy 8-hour sleep cycle.",
    "Closing 78 open Chrome tabs will speed up both your laptop and your life.",
    "The proxy attendance you gave for your roommate was recorded on 4K CCTV.",
    "No, staring at unread PDF slides while doomscrolling does not count as studying.",
    "Submit something—anything—to the portal. Even an empty Word doc buys you time.",
    "Clean your desk. The empty Maggi bowls are forming their own civilization.",
    "Remember: A pass mark is still a pass mark. 40% is graduation fuel."
]

PRESET_STUDENTS = [
    {
        "name": "The Attendance Gambler",
        "attendance": 75.1,
        "cgpa": 7.1,
        "assignments": 6,
        "money": 780,
        "days_left": 14,
        "back_papers": 2,
        "sleep_hours": 4.5,
        "cooking": "Maggi/eggs",
        "tech_level": "Intermediate",
        "social_level": "Social",
        "mocking": "Class comedian"
    },
    {
        "name": "The Academic Weapon",
        "attendance": 98.0,
        "cgpa": 9.6,
        "assignments": 0,
        "money": 420,
        "days_left": 45,
        "back_papers": 0,
        "sleep_hours": 3.0,
        "cooking": "Cannot cook",
        "tech_level": "Expert",
        "social_level": "NPC",
        "mocking": "Not funny"
    },
    {
        "name": "The Last-Minute Legend",
        "attendance": 52.0,
        "cgpa": 6.2,
        "assignments": 11,
        "money": 120,
        "days_left": 5,
        "back_papers": 4,
        "sleep_hours": 2.5,
        "cooking": "Can boil water",
        "tech_level": "Good",
        "social_level": "Campus celebrity",
        "mocking": "Final boss of mocking"
    },
    {
        "name": "The Hostel Masterchef",
        "attendance": 68.0,
        "cgpa": 6.8,
        "assignments": 4,
        "money": 3200,
        "days_left": 30,
        "back_papers": 1,
        "sleep_hours": 8.5,
        "cooking": "Hostel chef",
        "tech_level": "Basic",
        "social_level": "Very social",
        "mocking": "Meme supplier"
    },
    {
        "name": "The Caffeine-Powered Coder",
        "attendance": 81.0,
        "cgpa": 8.4,
        "assignments": 2,
        "money": 6400,
        "days_left": 20,
        "back_papers": 0,
        "sleep_hours": 3.8,
        "cooking": "Maggi/eggs",
        "tech_level": "Advanced",
        "social_level": "Introvert mode",
        "mocking": "Professional roaster"
    },
    {
        "name": "The Final Semester Survivor",
        "attendance": 48.0,
        "cgpa": 5.8,
        "assignments": 8,
        "money": 250,
        "days_left": 3,
        "back_papers": 5,
        "sleep_hours": 2.0,
        "cooking": "Cannot cook",
        "tech_level": "Beginner",
        "social_level": "NPC",
        "mocking": "Occasionally funny"
    }
]


# -----------------------------------------------------------------------------
# HELPER SCORING FUNCTIONS
# -----------------------------------------------------------------------------

def score_attendance(val):
    if val >= 90:
        return 15, "Teacher's favourite"
    elif val >= 75:
        return 12, "Normal human"
    elif val >= 50:
        return 7, "Danger zone"
    else:
        return 2, "Are you even enrolled?"


def score_cgpa(val):
    if val >= 9.0:
        return 15, "Sharma ji ka beta tier"
    elif val >= 8.0:
        return 13, "Placement cell loves you"
    elif val >= 7.0:
        return 10, "The golden middle class"
    elif val >= 6.0:
        return 7, "Living on the edge"
    else:
        return 3, "Degree speedrun (failed)"


def score_assignments(val):
    if val <= 0:
        return 10, "Academic weapon"
    elif val <= 2:
        return 8, "Manageable"
    elif val <= 5:
        return 5, "Professional procrastinator"
    elif val <= 8:
        return 2, "Assignments are now your full-time job"
    else:
        return 0, "The assignments have become your assignments"


def score_money(val):
    if val >= 10000:
        return 10, "Financially stable"
    elif val >= 5000:
        return 8, "Surviving"
    elif val >= 1000:
        return 5, "UPI warrior"
    elif val >= 500:
        return 2, "Ask roommate"
    else:
        return 0, "Financial boss fight"


def score_days_left(val):
    # Closer to ending = higher score, many days remaining = lower score
    if val <= 7:
        return 10, "Freedom is in sight! Almost survived!"
    elif val <= 20:
        return 8, "Final sprint. Don't collapse now."
    elif val <= 45:
        return 6, "Mid-semester crisis mode."
    elif val <= 90:
        return 4, "A long, dark tunnel ahead."
    else:
        return 2, "The semester just started... good luck."


def score_back_papers(val):
    if val <= 0:
        return 10, "Legend"
    elif val <= 2:
        return 7, "Still alive"
    elif val <= 5:
        return 4, "Character development"
    else:
        return 0, "Final boss"


def score_sleep(val):
    if 7.0 <= val <= 9.0:
        return 10, "Healthy human"
    elif 5.0 <= val < 7.0:
        return 7, "Average college student"
    elif 3.0 <= val < 5.0:
        return 4, "Powered by caffeine"
    elif val > 9.0:
        return 7, "Hibernation specialist"
    else:
        return 1, "Operating on Windows 95"


def get_survival_tier(total_score):
    if total_score >= 90:
        return {
            "tier": "90–100",
            "badge": "🏆 COLLEGE SURVIVAL GOD",
            "quote": "You don't survive college. College survives you.",
            "color": "#ffd700",
            "class": "tier-god"
        }
    elif total_score >= 75:
        return {
            "tier": "75–89",
            "badge": "🟢 SURVIVING COMFORTABLY",
            "quote": "Somehow everything is under control.",
            "color": "#3fb950",
            "class": "tier-comfortable"
        }
    elif total_score >= 60:
        return {
            "tier": "60–74",
            "badge": "🟡 BARELY SURVIVING",
            "quote": "One more assignment could end everything.",
            "color": "#d29922",
            "class": "tier-warning"
        }
    elif total_score >= 40:
        return {
            "tier": "40–59",
            "badge": "🟠 CRITICAL CONDITION",
            "quote": "Attendance, money and sleep are all disappearing.",
            "color": "#f0883e",
            "class": "tier-critical"
        }
    elif total_score >= 20:
        return {
            "tier": "20–39",
            "badge": "🔴 ACADEMIC EMERGENCY",
            "quote": "Contact your friends immediately.",
            "color": "#f85149",
            "class": "tier-danger"
        }
    else:
        return {
            "tier": "0–19",
            "badge": "💀 COLLEGE HAS WON",
            "quote": "Please restart the semester.",
            "color": "#8b949e",
            "class": "tier-dead"
        }


# -----------------------------------------------------------------------------
# ROAST GENERATION ENGINE
# -----------------------------------------------------------------------------

def build_combined_roast(metrics, weakest_metrics):
    roasts = []

    att = metrics["attendance"]["val"]
    cgpa = metrics["cgpa"]["val"]
    assign = metrics["assignments"]["val"]
    money = metrics["money"]["val"]
    sleep = metrics["sleep"]["val"]
    backs = metrics["back_papers"]["val"]

    # Target attendance
    if att < 50:
        roasts.append("Your attendance is so low that even your student ID card doesn't recognize your face.")
    elif att < 75:
        roasts.append(f"At {att}%, you are treating college like an optional side-quest.")

    # Target CGPA
    if cgpa < 6.0:
        roasts.append(f"A {cgpa} CGPA? Even temperature in Antarctica has higher numbers than your transcript.")
    elif cgpa < 7.5:
        roasts.append("Your CGPA is surviving purely on the mercy of bell-curve grading.")

    # Target assignments
    if assign >= 9:
        roasts.append(f"With {assign} pending assignments, you don't have pending homework—you have a pending degree.")
    elif assign >= 4:
        roasts.append(f"You have {assign} pending assignments, but here you are calculating your survival score.")

    # Target money
    if money < 500:
        roasts.append(f"With ₹{money} in your account, your bank balance is currently running on pure emotional support.")
    elif money < 1500:
        roasts.append(f"With ₹{money}, you are one Swiggy delivery away from full bankruptcy.")

    # Target sleep
    if sleep < 3.0:
        roasts.append(f"{sleep} hours of sleep? You don't need an alarm clock, your circadian rhythm is running on Windows 95 blue screen.")
    elif sleep < 5.0:
        roasts.append("Your blood type is 90% instant coffee and 10% pure exam panic.")

    # Target back papers
    if backs >= 6:
        roasts.append(f"{backs} back papers?! Your back papers have officially declared independence and formed their own academic department.")
    elif backs >= 2:
        roasts.append(f"Those {backs} back papers are not 'character development', they are an impending boss fight.")

    if not roasts:
        roasts.append("Surprisingly, your stats aren't completely tragic. You're actually making college look easy, you nerd.")

    return " ".join(roasts)


def get_single_topic_roast(topic, data):
    att = float(data.get("attendance", 75))
    cgpa = float(data.get("cgpa", 7.5))
    assign = int(data.get("assignments", 2))
    money = float(data.get("money", 2000))
    sleep = float(data.get("sleep_hours", 6))
    backs = int(data.get("back_papers", 0))

    if topic == "attendance":
        if att < 50:
            return f"Your attendance is {att}%! Even your classroom bench forgot how you look. The security guard thinks you're a trespasser."
        elif att < 75:
            return f"At {att}%, the HOD is preparing the debar list with your name in bold comic sans."
        else:
            return f"{att}% attendance? Who hurt you? Stop sitting on the first bench and let the professor breathe."

    elif topic == "cgpa":
        if cgpa < 6.0:
            return f"A {cgpa} CGPA? The placement coordinators just put your resume in the recycling bin."
        elif cgpa < 8.0:
            return f"With a {cgpa} CGPA, your parents are already searching matrimonial sites instead of job portals."
        else:
            return f"{cgpa} CGPA?! Okay Sharma ji ka beta, save some brain cells for the rest of humanity."

    elif topic == "money":
        if money < 500:
            return f"₹{money} left?! Your UPI app should show an ambulance siren instead of a QR scanner."
        elif money < 2000:
            return f"With ₹{money}, you are split-wise requesting your friends for ₹7.50."
        else:
            return f"₹{money}? Are you lending money to the college administration or what?"

    elif topic == "assignments":
        if assign >= 6:
            return f"{assign} pending assignments! Even ChatGPT gave up trying to write your introductions."
        elif assign >= 2:
            return f"You have {assign} assignments due in 3 hours and you're reading this text. Priorities 100."
        else:
            return f"Only {assign} assignments left? Clearly your professors are taking it too easy on you."

    elif topic == "sleep":
        if sleep < 3.5:
            return f"Sleeping {sleep} hours a day? Your dark circles have their own pin code and gravitational pull."
        elif sleep > 9:
            return f"{sleep} hours of sleep?! Are you a college student or a hibernating grizzly bear?"
        else:
            return f"{sleep} hours of sleep is surprisingly healthy for someone currently failing college."

    elif topic == "back_papers":
        if backs >= 4:
            return f"{backs} back papers?! The university is building a new wing solely sponsored by your re-exam fees."
        elif backs >= 1:
            return f"Those {backs} back papers are waiting for you at the end of the semester like a Marvel post-credit scene."
        else:
            return "0 back papers? Either you study legitimately or your cheat sheet origami skills are god-tier."

    elif topic == "everything":
        return f"To summarize: {att}% attendance, {cgpa} CGPA, {assign} pending tasks, ₹{money} balance, {sleep}h sleep, and {backs} backs. Modern science is baffled that you are biologically functioning."

    return "College has no words left for your situation. Stay strong soldier."


# -----------------------------------------------------------------------------
# APPLICATION ROUTES
# -----------------------------------------------------------------------------

@app.route("/")
def index():
    """Renders the main application homepage."""
    return render_template("index.html")


@app.route("/api/calculate", methods=["POST"])
def calculate():
    """
    Receives form parameters, validates them, calculates scores,
    and returns a comprehensive JSON response.
    """
    try:
        data = request.get_json() or {}

        # 1. Attendance Validation (0 - 100)
        attendance = float(data.get("attendance", 75))
        if not (0 <= attendance <= 100):
            return jsonify({"success": False, "error": "Attendance percentage must be between 0 and 100."}), 400

        # 2. CGPA Validation (0.0 - 10.0)
        cgpa = float(data.get("cgpa", 7.0))
        if not (0 <= cgpa <= 10):
            return jsonify({"success": False, "error": "CGPA must be between 0.0 and 10.0."}), 400

        # 3. Pending Assignments (>= 0)
        assignments = int(data.get("assignments", 0))
        if assignments < 0:
            return jsonify({"success": False, "error": "Assignments count cannot be negative."}), 400

        # 4. Money Left (>= 0)
        money = float(data.get("money", 0))
        if money < 0:
            return jsonify({"success": False, "error": "Money cannot be negative (even if your soul is broke)."}), 400

        # 5. Days until semester ends (>= 1)
        days_left = int(data.get("days_left", 30))
        if days_left < 1:
            return jsonify({"success": False, "error": "Days until semester ends must be at least 1."}), 400

        # 6. Back Papers (>= 0)
        back_papers = int(data.get("back_papers", 0))
        if back_papers < 0:
            return jsonify({"success": False, "error": "Back papers cannot be negative."}), 400

        # 7. Sleep Hours (0 - 24)
        sleep_hours = float(data.get("sleep_hours", 6.0))
        if not (0 <= sleep_hours <= 24):
            return jsonify({"success": False, "error": "Sleep hours must be between 0 and 24 hours per day."}), 400

        # 8. Cooking Ability
        cooking_choice = data.get("cooking", "Cannot cook")
        cooking_info = COOKING_LEVELS.get(cooking_choice, COOKING_LEVELS["Cannot cook"])

        # 9. Technical Skill
        tech_choice = data.get("tech_level", "Basic")
        tech_info = TECH_LEVELS.get(tech_choice, TECH_LEVELS["Basic"])

        # 10. Social Skill
        social_choice = data.get("social_level", "Normal")
        social_info = SOCIAL_LEVELS.get(social_choice, SOCIAL_LEVELS["Normal"])

        # 11. Mocking Ability
        mocking_choice = data.get("mocking", "Meme supplier")
        mocking_info = MOCKING_LEVELS.get(mocking_choice, MOCKING_LEVELS["Meme supplier"])

    except (ValueError, TypeError) as e:
        return jsonify({"success": False, "error": f"Invalid numerical input format: {str(e)}"}), 400

    # Calculate subscores
    att_score, att_desc = score_attendance(attendance)
    cgpa_score, cgpa_desc = score_cgpa(cgpa)
    assign_score, assign_desc = score_assignments(assignments)
    money_score, money_desc = score_money(money)
    days_score, days_desc = score_days_left(days_left)
    backs_score, backs_desc = score_back_papers(back_papers)
    sleep_score, sleep_desc = score_sleep(sleep_hours)

    cook_score = cooking_info["score"]
    cook_desc = cooking_info["desc"]

    tech_score = tech_info["score"]
    tech_desc = tech_info["desc"]

    social_score = social_info["score"]
    social_desc = social_info["desc"]

    mocking_score = mocking_info["score"]
    mocking_desc = mocking_info["desc"]

    # Sum total score (0 to 100)
    total_score = (
        att_score + cgpa_score + assign_score + money_score +
        days_score + backs_score + sleep_score + cook_score +
        tech_score + social_score + mocking_score
    )
    total_score = max(0, min(100, round(total_score)))

    tier_info = get_survival_tier(total_score)

    # Detailed parameter breakdown
    breakdown = [
        {
            "id": "attendance",
            "name": "Attendance",
            "icon": "📅",
            "score": att_score,
            "max": 15,
            "ratio": att_score / 15.0,
            "val": attendance,
            "display_val": f"{attendance}%",
            "desc": att_desc
        },
        {
            "id": "cgpa",
            "name": "CGPA",
            "icon": "🎓",
            "score": cgpa_score,
            "max": 15,
            "ratio": cgpa_score / 15.0,
            "val": cgpa,
            "display_val": f"{cgpa}",
            "desc": cgpa_desc
        },
        {
            "id": "assignments",
            "name": "Pending Assignments",
            "icon": "📝",
            "score": assign_score,
            "max": 10,
            "ratio": assign_score / 10.0,
            "val": assignments,
            "display_val": f"{assignments} tasks",
            "desc": assign_desc
        },
        {
            "id": "money",
            "name": "Money Left",
            "icon": "💰",
            "score": money_score,
            "max": 10,
            "ratio": money_score / 10.0,
            "val": money,
            "display_val": f"₹{int(money):,}",
            "desc": money_desc
        },
        {
            "id": "days_left",
            "name": "Semester Countdown",
            "icon": "⏳",
            "score": days_score,
            "max": 10,
            "ratio": days_score / 10.0,
            "val": days_left,
            "display_val": f"{days_left} days",
            "desc": days_desc
        },
        {
            "id": "back_papers",
            "name": "Back Papers",
            "icon": "📜",
            "score": backs_score,
            "max": 10,
            "ratio": backs_score / 10.0,
            "val": back_papers,
            "display_val": f"{back_papers} backs",
            "desc": backs_desc
        },
        {
            "id": "sleep",
            "name": "Sleep Schedule",
            "icon": "😴",
            "score": sleep_score,
            "max": 10,
            "ratio": sleep_score / 10.0,
            "val": sleep_hours,
            "display_val": f"{sleep_hours} hrs/day",
            "desc": sleep_desc
        },
        {
            "id": "cooking",
            "name": "Cooking Ability",
            "icon": "🍳",
            "score": cook_score,
            "max": 5,
            "ratio": cook_score / 5.0,
            "val": cooking_choice,
            "display_val": cooking_choice,
            "desc": cook_desc
        },
        {
            "id": "tech_level",
            "name": "Technical Skill",
            "icon": "💻",
            "score": tech_score,
            "max": 5,
            "ratio": tech_score / 5.0,
            "val": tech_choice,
            "display_val": tech_choice,
            "desc": tech_desc
        },
        {
            "id": "social_level",
            "name": "Social Skill",
            "icon": "🗣️",
            "score": social_score,
            "max": 5,
            "ratio": social_score / 5.0,
            "val": social_choice,
            "display_val": social_choice,
            "desc": social_desc
        },
        {
            "id": "mocking",
            "name": "Mocking / Humor",
            "icon": "🎭",
            "score": mocking_score,
            "max": 5,
            "ratio": mocking_score / 5.0,
            "val": mocking_choice,
            "display_val": mocking_choice,
            "desc": mocking_desc
        }
    ]

    # Identify Strongest Skill & Biggest Threat
    sorted_by_ratio = sorted(breakdown, key=lambda x: x["ratio"])
    biggest_threat = sorted_by_ratio[0]
    strongest_skill = sorted_by_ratio[-1]

    # Metrics dictionary for custom roast generator
    metrics_map = {item["id"]: item for item in breakdown}
    custom_roast = build_combined_roast(metrics_map, sorted_by_ratio[:3])

    # Random college advice
    advice = random.choice(COLLEGE_ADVICE)

    return jsonify({
        "success": True,
        "total_score": total_score,
        "tier": tier_info,
        "strongest_skill": {
            "name": f"{strongest_skill['icon']} {strongest_skill['name']}",
            "desc": strongest_skill["desc"],
            "score": f"{strongest_skill['score']}/{strongest_skill['max']}"
        },
        "biggest_threat": {
            "name": f"{biggest_threat['icon']} {biggest_threat['name']}",
            "desc": biggest_threat["desc"],
            "score": f"{biggest_threat['score']}/{biggest_threat['max']}"
        },
        "breakdown": breakdown,
        "custom_roast": custom_roast,
        "random_advice": advice
    })


@app.route("/api/roast-topic", methods=["POST"])
def roast_topic():
    """Returns a focused roast for a single topic or 'everything'."""
    data = request.get_json() or {}
    topic = data.get("topic", "everything")
    roast_text = get_single_topic_roast(topic, data)
    return jsonify({
        "success": True,
        "topic": topic,
        "roast": roast_text
    })


@app.route("/api/random-student", methods=["GET"])
def random_student():
    """Returns a random humorous student profile preset."""
    profile = random.choice(PRESET_STUDENTS)
    return jsonify({
        "success": True,
        "profile": profile
    })


@app.route("/api/random-advice", methods=["GET"])
def random_advice():
    """Returns another random college advice."""
    advice = random.choice(COLLEGE_ADVICE)
    return jsonify({
        "success": True,
        "advice": advice
    })


# -----------------------------------------------------------------------------
# MAIN ENTRY POINT
# -----------------------------------------------------------------------------

if __name__ == "__main__":
    try:
        print("\n=======================================================")
        print("  [+] COLLEGE SURVIVAL SCORE CALCULATOR (TM)")
        print("  Status: Server running locally")
        print("  Open your browser at: http://127.0.0.1:5000")
        print("=======================================================\n")
    except Exception:
        pass
    app.run(debug=True, host="127.0.0.1", port=5000)
