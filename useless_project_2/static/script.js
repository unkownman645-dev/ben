/**
 * College Survival Score Calculator™
 * Frontend Logic, Hybrid Calculation Engine (API + Client-Side Fallback),
 * Web Speech Synthesis & Web Audio FX
 */

document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------------------
    // CLIENT-SIDE SCORING & DATA REPOSITORY (FOR STATIC / SERVERLESS HOSTING)
    // -------------------------------------------------------------------------
    const CLIENT_DATA = {
        cooking: {
            "Cannot cook": { score: 0, desc: "Zomato gold shareholder" },
            "Can boil water": { score: 1, desc: "Water enthusiast" },
            "Maggi/eggs": { score: 2, desc: "Standard hostel survivalist" },
            "Basic meals": { score: 3, desc: "Edible survival food" },
            "Good cook": { score: 4, desc: "Wing favorite chef" },
            "Hostel chef": { score: 5, desc: "Gordon Ramsay of the hostel" }
        },
        tech: {
            "Beginner": { score: 0, desc: "Thinks Python is an actual reptile" },
            "Basic": { score: 1, desc: "Knows where the laptop power button is" },
            "Intermediate": { score: 2, desc: "HTML is my passion" },
            "Good": { score: 3, desc: "Writes a for-loop without crying" },
            "Advanced": { score: 4, desc: "Stack Overflow copy-paste grandmaster" },
            "Expert": { score: 5, desc: "Hackathon menace & terminal wizard" }
        },
        social: {
            "NPC": { score: 0, desc: "Only speaks when given a dialogue prompt" },
            "Introvert mode": { score: 1, desc: "Hides in the library corner" },
            "Normal": { score: 2, desc: "Functional human being" },
            "Social": { score: 3, desc: "Regular cafeteria enthusiast" },
            "Very social": { score: 4, desc: "Wing extrovert & gossip source" },
            "Campus celebrity": { score: 5, desc: "Knows everyone and the security guard" }
        },
        mocking: {
            "Not funny": { score: 0, desc: "Laughs 3 business days later" },
            "Occasionally funny": { score: 1, desc: "Cracks one joke per semester" },
            "Meme supplier": { score: 2, desc: "Distributes memes instead of class notes" },
            "Class comedian": { score: 3, desc: "Even the professor chuckles at excuses" },
            "Professional roaster": { score: 4, desc: "Leaves no survivors in WhatsApp groups" },
            "Final boss of mocking": { score: 5, desc: "Certified emotional damage specialist" }
        },
        advice: [
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
        ],
        presets: [
            {
                name: "The Attendance Gambler",
                attendance: 75.1,
                cgpa: 7.1,
                assignments: 6,
                money: 780,
                days_left: 14,
                back_papers: 2,
                sleep_hours: 4.5,
                cooking: "Maggi/eggs",
                tech_level: "Intermediate",
                social_level: "Social",
                mocking: "Class comedian"
            },
            {
                name: "The Academic Weapon",
                attendance: 98.0,
                cgpa: 9.6,
                assignments: 0,
                money: 420,
                days_left: 45,
                back_papers: 0,
                sleep_hours: 3.0,
                cooking: "Cannot cook",
                tech_level: "Expert",
                social_level: "NPC",
                mocking: "Not funny"
            },
            {
                name: "The Last-Minute Legend",
                attendance: 52.0,
                cgpa: 6.2,
                assignments: 11,
                money: 120,
                days_left: 5,
                back_papers: 4,
                sleep_hours: 2.5,
                cooking: "Can boil water",
                tech_level: "Good",
                social_level: "Campus celebrity",
                mocking: "Final boss of mocking"
            },
            {
                name: "The Hostel Masterchef",
                attendance: 68.0,
                cgpa: 6.8,
                assignments: 4,
                money: 3200,
                days_left: 30,
                back_papers: 1,
                sleep_hours: 8.5,
                cooking: "Hostel chef",
                tech_level: "Basic",
                social_level: "Very social",
                mocking: "Meme supplier"
            },
            {
                name: "The Caffeine-Powered Coder",
                attendance: 81.0,
                cgpa: 8.4,
                assignments: 2,
                money: 6400,
                days_left: 20,
                back_papers: 0,
                sleep_hours: 3.8,
                cooking: "Maggi/eggs",
                tech_level: "Advanced",
                social_level: "Introvert mode",
                mocking: "Professional roaster"
            },
            {
                name: "The Final Semester Survivor",
                attendance: 48.0,
                cgpa: 5.8,
                assignments: 8,
                money: 250,
                days_left: 3,
                back_papers: 5,
                sleep_hours: 2.0,
                cooking: "Cannot cook",
                tech_level: "Beginner",
                social_level: "NPC",
                mocking: "Occasionally funny"
            }
        ]
    };

    // -------------------------------------------------------------------------
    // CLIENT-SIDE SCORING HEURISTICS
    // -------------------------------------------------------------------------
    function calculateClientSide(p) {
        // 1. Attendance (15)
        let attScore = 2, attDesc = "Are you even enrolled?";
        if (p.attendance >= 90) { attScore = 15; attDesc = "Teacher's favourite"; }
        else if (p.attendance >= 75) { attScore = 12; attDesc = "Normal human"; }
        else if (p.attendance >= 50) { attScore = 7; attDesc = "Danger zone"; }

        // 2. CGPA (15)
        let cgpaScore = 3, cgpaDesc = "Degree speedrun (failed)";
        if (p.cgpa >= 9.0) { cgpaScore = 15; cgpaDesc = "Sharma ji ka beta tier"; }
        else if (p.cgpa >= 8.0) { cgpaScore = 13; cgpaDesc = "Placement cell loves you"; }
        else if (p.cgpa >= 7.0) { cgpaScore = 10; cgpaDesc = "The golden middle class"; }
        else if (p.cgpa >= 6.0) { cgpaScore = 7; cgpaDesc = "Living on the edge"; }

        // 3. Assignments (10)
        let assignScore = 0, assignDesc = "The assignments have become your assignments";
        if (p.assignments <= 0) { assignScore = 10; assignDesc = "Academic weapon"; }
        else if (p.assignments <= 2) { assignScore = 8; assignDesc = "Manageable"; }
        else if (p.assignments <= 5) { assignScore = 5; assignDesc = "Professional procrastinator"; }
        else if (p.assignments <= 8) { assignScore = 2; assignDesc = "Assignments are now your full-time job"; }

        // 4. Money (10)
        let moneyScore = 0, moneyDesc = "Financial boss fight";
        if (p.money >= 10000) { moneyScore = 10; moneyDesc = "Financially stable"; }
        else if (p.money >= 5000) { moneyScore = 8; moneyDesc = "Surviving"; }
        else if (p.money >= 1000) { moneyScore = 5; moneyDesc = "UPI warrior"; }
        else if (p.money >= 500) { moneyScore = 2; moneyDesc = "Ask roommate"; }

        // 5. Days Left (10)
        let daysScore = 2, daysDesc = "The semester just started... good luck.";
        if (p.days_left <= 7) { daysScore = 10; daysDesc = "Freedom is in sight! Almost survived!"; }
        else if (p.days_left <= 20) { daysScore = 8; daysDesc = "Final sprint. Don't collapse now."; }
        else if (p.days_left <= 45) { daysScore = 6; daysDesc = "Mid-semester crisis mode."; }
        else if (p.days_left <= 90) { daysScore = 4; daysDesc = "A long, dark tunnel ahead."; }

        // 6. Back Papers (10)
        let backScore = 0, backDesc = "Final boss";
        if (p.back_papers <= 0) { backScore = 10; backDesc = "Legend"; }
        else if (p.back_papers <= 2) { backScore = 7; backDesc = "Still alive"; }
        else if (p.back_papers <= 5) { backScore = 4; backDesc = "Character development"; }

        // 7. Sleep (10)
        let sleepScore = 1, sleepDesc = "Operating on Windows 95";
        if (p.sleep_hours >= 7.0 && p.sleep_hours <= 9.0) { sleepScore = 10; sleepDesc = "Healthy human"; }
        else if (p.sleep_hours >= 5.0 && p.sleep_hours < 7.0) { sleepScore = 7; sleepDesc = "Average college student"; }
        else if (p.sleep_hours >= 3.0 && p.sleep_hours < 5.0) { sleepScore = 4; sleepDesc = "Powered by caffeine"; }
        else if (p.sleep_hours > 9.0) { sleepScore = 7; sleepDesc = "Hibernation specialist"; }

        // 8-11. Skills (5 each)
        const cookInfo = CLIENT_DATA.cooking[p.cooking] || CLIENT_DATA.cooking["Cannot cook"];
        const techInfo = CLIENT_DATA.tech[p.tech_level] || CLIENT_DATA.tech["Basic"];
        const socialInfo = CLIENT_DATA.social[p.social_level] || CLIENT_DATA.social["Normal"];
        const mockingInfo = CLIENT_DATA.mocking[p.mocking] || CLIENT_DATA.mocking["Meme supplier"];

        let total = attScore + cgpaScore + assignScore + moneyScore + daysScore + backScore + sleepScore +
                    cookInfo.score + techInfo.score + socialInfo.score + mockingInfo.score;
        total = Math.max(0, Math.min(100, Math.round(total)));

        // Tiers
        let tier;
        if (total >= 90) tier = { tier: "90–100", badge: "🏆 COLLEGE SURVIVAL GOD", quote: "You don't survive college. College survives you.", color: "#ffd700", class: "tier-god" };
        else if (total >= 75) tier = { tier: "75–89", badge: "🟢 SURVIVING COMFORTABLY", quote: "Somehow everything is under control.", color: "#3fb950", class: "tier-comfortable" };
        else if (total >= 60) tier = { tier: "60–74", badge: "🟡 BARELY SURVIVING", quote: "One more assignment could end everything.", color: "#d29922", class: "tier-warning" };
        else if (total >= 40) tier = { tier: "40–59", badge: "🟠 CRITICAL CONDITION", quote: "Attendance, money and sleep are all disappearing.", color: "#f0883e", class: "tier-critical" };
        else if (total >= 20) tier = { tier: "20–39", badge: "🔴 ACADEMIC EMERGENCY", quote: "Contact your friends immediately.", color: "#f85149", class: "tier-danger" };
        else tier = { tier: "0–19", badge: "💀 COLLEGE HAS WON", quote: "Please restart the semester.", color: "#8b949e", class: "tier-dead" };

        const breakdown = [
            { id: "attendance", name: "Attendance", icon: "📅", score: attScore, max: 15, ratio: attScore / 15, val: p.attendance, display_val: `${p.attendance}%`, desc: attDesc },
            { id: "cgpa", name: "CGPA", icon: "🎓", score: cgpaScore, max: 15, ratio: cgpaScore / 15, val: p.cgpa, display_val: `${p.cgpa}`, desc: cgpaDesc },
            { id: "assignments", name: "Pending Assignments", icon: "📝", score: assignScore, max: 10, ratio: assignScore / 10, val: p.assignments, display_val: `${p.assignments} tasks`, desc: assignDesc },
            { id: "money", name: "Money Left", icon: "💰", score: moneyScore, max: 10, ratio: moneyScore / 10, val: p.money, display_val: `₹${Math.round(p.money).toLocaleString('en-IN')}`, desc: moneyDesc },
            { id: "days_left", name: "Semester Countdown", icon: "⏳", score: daysScore, max: 10, ratio: daysScore / 10, val: p.days_left, display_val: `${p.days_left} days`, desc: daysDesc },
            { id: "back_papers", name: "Back Papers", icon: "📜", score: backScore, max: 10, ratio: backScore / 10, val: p.back_papers, display_val: `${p.back_papers} backs`, desc: backDesc },
            { id: "sleep", name: "Sleep Schedule", icon: "😴", score: sleepScore, max: 10, ratio: sleepScore / 10, val: p.sleep_hours, display_val: `${p.sleep_hours} hrs/day`, desc: sleepDesc },
            { id: "cooking", name: "Cooking Ability", icon: "🍳", score: cookInfo.score, max: 5, ratio: cookInfo.score / 5, val: p.cooking, display_val: p.cooking, desc: cookInfo.desc },
            { id: "tech_level", name: "Technical Skill", icon: "💻", score: techInfo.score, max: 5, ratio: techInfo.score / 5, val: p.tech_level, display_val: p.tech_level, desc: techInfo.desc },
            { id: "social_level", name: "Social Skill", icon: "🗣️", score: socialInfo.score, max: 5, ratio: socialInfo.score / 5, val: p.social_level, display_val: p.social_level, desc: socialInfo.desc },
            { id: "mocking", name: "Mocking / Humor", icon: "🎭", score: mockingInfo.score, max: 5, ratio: mockingInfo.score / 5, val: p.mocking, display_val: p.mocking, desc: mockingInfo.desc }
        ];

        const sorted = [...breakdown].sort((a, b) => a.ratio - b.ratio);
        const biggestThreat = sorted[0];
        const strongestSkill = sorted[sorted.length - 1];

        // Roast synthesis
        const roasts = [];
        if (p.attendance < 50) roasts.push("Your attendance is so low that even your student ID card doesn't recognize your face.");
        else if (p.attendance < 75) roasts.push(`At ${p.attendance}%, you are treating college like an optional side-quest.`);

        if (p.cgpa < 6.0) roasts.push(`A ${p.cgpa} CGPA? Even temperature in Antarctica has higher numbers than your transcript.`);
        else if (p.cgpa < 7.5) roasts.push("Your CGPA is surviving purely on the mercy of bell-curve grading.");

        if (p.assignments >= 9) roasts.push(`With ${p.assignments} pending assignments, you don't have pending homework—you have a pending degree.`);
        else if (p.assignments >= 4) roasts.push(`You have ${p.assignments} pending assignments, but here you are calculating your survival score.`);

        if (p.money < 500) roasts.push(`With ₹${p.money} in your account, your bank balance is currently running on pure emotional support.`);
        else if (p.money < 1500) roasts.push(`With ₹${p.money}, you are one Swiggy delivery away from full bankruptcy.`);

        if (p.sleep_hours < 3.0) roasts.push(`${p.sleep_hours} hours of sleep? You don't need an alarm clock, your circadian rhythm is running on Windows 95 blue screen.`);
        else if (p.sleep_hours < 5.0) roasts.push("Your blood type is 90% instant coffee and 10% pure exam panic.");

        if (p.back_papers >= 6) roasts.push(`${p.back_papers} back papers?! Your back papers have officially declared independence and formed their own academic department.`);
        else if (p.back_papers >= 2) roasts.push(`Those ${p.back_papers} back papers are not 'character development', they are an impending boss fight.`);

        if (roasts.length === 0) roasts.push("Surprisingly, your stats aren't completely tragic. You're actually making college look easy, you nerd.");

        const randomAdvice = CLIENT_DATA.advice[Math.floor(Math.random() * CLIENT_DATA.advice.length)];

        return {
            success: true,
            total_score: total,
            tier: tier,
            strongest_skill: { name: `${strongestSkill.icon} ${strongestSkill.name}`, desc: strongestSkill.desc, score: `${strongestSkill.score}/${strongestSkill.max}` },
            biggest_threat: { name: `${biggestThreat.icon} ${biggestThreat.name}`, desc: biggestThreat.desc, score: `${biggestThreat.score}/${biggestThreat.max}` },
            breakdown: breakdown,
            custom_roast: roasts.join(" "),
            random_advice: randomAdvice
        };
    }

    function getTopicRoastClientSide(topic, data) {
        const att = parseFloat(data.attendance) || 75;
        const cgpa = parseFloat(data.cgpa) || 7.5;
        const assign = parseInt(data.assignments) || 2;
        const money = parseFloat(data.money) || 2000;
        const sleep = parseFloat(data.sleep_hours) || 6;
        const backs = parseInt(data.back_papers) || 0;

        if (topic === "attendance") {
            return att < 50 ? `Your attendance is ${att}%! Even your classroom bench forgot how you look. The security guard thinks you're a trespasser.`
                 : att < 75 ? `At ${att}%, the HOD is preparing the debar list with your name in bold comic sans.`
                 : `${att}% attendance? Who hurt you? Stop sitting on the first bench and let the professor breathe.`;
        } else if (topic === "cgpa") {
            return cgpa < 6.0 ? `A ${cgpa} CGPA? The placement coordinators just put your resume in the recycling bin.`
                 : cgpa < 8.0 ? `With a ${cgpa} CGPA, your parents are already searching matrimonial sites instead of job portals.`
                 : `${cgpa} CGPA?! Okay Sharma ji ka beta, save some brain cells for the rest of humanity.`;
        } else if (topic === "money") {
            return money < 500 ? `₹${money} left?! Your UPI app should show an ambulance siren instead of a QR scanner.`
                 : money < 2000 ? `With ₹${money}, you are split-wise requesting your friends for ₹7.50.`
                 : `₹${money}? Are you lending money to the college administration or what?`;
        } else if (topic === "assignments") {
            return assign >= 6 ? `${assign} pending assignments! Even ChatGPT gave up trying to write your introductions.`
                 : assign >= 2 ? `You have ${assign} assignments due in 3 hours and you're reading this text. Priorities 100.`
                 : `Only ${assign} assignments left? Clearly your professors are taking it too easy on you.`;
        } else if (topic === "sleep") {
            return sleep < 3.5 ? `Sleeping ${sleep} hours a day? Your dark circles have their own pin code and gravitational pull.`
                 : sleep > 9 ? `${sleep} hours of sleep?! Are you a college student or a hibernating grizzly bear?`
                 : `${sleep} hours of sleep is surprisingly healthy for someone currently failing college.`;
        } else if (topic === "back_papers") {
            return backs >= 4 ? `${backs} back papers?! The university is building a new wing solely sponsored by your re-exam fees.`
                 : backs >= 1 ? `Those ${backs} back papers are waiting for you at the end of the semester like a Marvel post-credit scene.`
                 : `0 back papers? Either you study legitimately or your cheat sheet origami skills are god-tier.`;
        } else if (topic === "everything") {
            return `To summarize: ${att}% attendance, ${cgpa} CGPA, ${assign} pending tasks, ₹${money} balance, ${sleep}h sleep, and ${backs} backs. Modern science is baffled that you are biologically functioning.`;
        }
        return "College has no words left for your situation. Stay strong soldier.";
    }

    // -------------------------------------------------------------------------
    // DOM ELEMENTS
    // -------------------------------------------------------------------------
    const form = document.getElementById("survival-form");
    const errorBanner = document.getElementById("error-banner");
    const errorMessage = document.getElementById("error-message");

    // Form inputs
    const inputAttendance = document.getElementById("attendance");
    const inputCgpa = document.getElementById("cgpa");
    const inputAssignments = document.getElementById("assignments");
    const inputMoney = document.getElementById("money");
    const inputDaysLeft = document.getElementById("days_left");
    const inputBackPapers = document.getElementById("back_papers");
    const inputSleepHours = document.getElementById("sleep_hours");
    const selectCooking = document.getElementById("cooking");
    const selectTech = document.getElementById("tech_level");
    const selectSocial = document.getElementById("social_level");
    const selectMocking = document.getElementById("mocking");

    // Input badges
    const badgeAttendance = document.getElementById("attendance-badge");
    const badgeCgpa = document.getElementById("cgpa-badge");
    const badgeAssignments = document.getElementById("assignments-badge");
    const badgeMoney = document.getElementById("money-badge");
    const badgeDays = document.getElementById("days-badge");
    const badgeBackpapers = document.getElementById("backpapers-badge");
    const badgeSleep = document.getElementById("sleep-badge");

    // Action buttons
    const btnRandomStudent = document.getElementById("btn-random-student");
    const btnResetTop = document.getElementById("btn-reset-top");
    const btnRecalculate = document.getElementById("btn-recalculate");
    const btnSoundToggle = document.getElementById("btn-sound-toggle");
    const soundIcon = document.getElementById("sound-icon");
    const btnShare = document.getElementById("btn-share");
    const btnNewAdvice = document.getElementById("btn-new-advice");

    // Results elements
    const resultsSection = document.getElementById("results-section");
    const scoreRadial = document.getElementById("score-radial");
    const scoreNumber = document.getElementById("score-number");
    const tierBadge = document.getElementById("tier-badge");
    const tierText = document.getElementById("tier-text");
    const tierQuote = document.getElementById("tier-quote");

    const insightStrongestName = document.getElementById("insight-strongest-name");
    const insightStrongestDesc = document.getElementById("insight-strongest-desc");
    const insightStrongestScore = document.getElementById("insight-strongest-score");

    const insightThreatName = document.getElementById("insight-threat-name");
    const insightThreatDesc = document.getElementById("insight-threat-desc");
    const insightThreatScore = document.getElementById("insight-threat-score");

    const breakdownGrid = document.getElementById("breakdown-grid");
    const adviceContent = document.getElementById("advice-content");

    // Roast & Speech elements
    const btnRoastMe = document.getElementById("btn-roast-me");
    const roastDisplayBox = document.getElementById("roast-display-box");
    const roastCategoryTag = document.getElementById("roast-category-tag");
    const roastText = document.getElementById("roast-text");
    const btnSpeakRoast = document.getElementById("btn-speak-roast");
    const btnStopSpeech = document.getElementById("btn-stop-speech");
    const speechStateText = document.getElementById("speech-state-text");
    const voicePitch = document.getElementById("voice-pitch");
    const voiceRate = document.getElementById("voice-rate");
    const mockingButtons = document.querySelectorAll(".btn-mock");

    // Toast
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");

    // Global state
    let lastCalculationData = null;
    let soundEnabled = true;
    let audioCtx = null;

    // -------------------------------------------------------------------------
    // WEB AUDIO API PROCEDURAL SOUND FX (NO EXTERNAL FILES NEEDED)
    // -------------------------------------------------------------------------
    function initAudio() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }
    }

    function playTone(freq, type, duration, delay = 0) {
        if (!soundEnabled || !audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

            gain.gain.setValueAtTime(0.12, audioCtx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(audioCtx.currentTime + delay);
            osc.stop(audioCtx.currentTime + delay + duration);
        } catch (e) {
            console.debug("Audio play error:", e);
        }
    }

    function playSoundEffect(type) {
        initAudio();
        if (!soundEnabled || !audioCtx) return;

        if (type === "calculate") {
            playTone(440, "sine", 0.1, 0.0);
            playTone(554.37, "sine", 0.1, 0.08);
            playTone(659.25, "sine", 0.2, 0.16);
            playTone(880, "triangle", 0.35, 0.24);
        } else if (type === "warning") {
            playTone(280, "sawtooth", 0.18, 0.0);
            playTone(240, "sawtooth", 0.25, 0.12);
        } else if (type === "death") {
            playTone(392, "sawtooth", 0.15, 0.0);
            playTone(349, "sawtooth", 0.15, 0.15);
            playTone(311, "sawtooth", 0.15, 0.3);
            playTone(261, "sawtooth", 0.45, 0.45);
        } else if (type === "click") {
            playTone(600, "sine", 0.05, 0);
        } else if (type === "pop") {
            playTone(800, "triangle", 0.08, 0);
        }
    }

    btnSoundToggle.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            initAudio();
            btnSoundToggle.classList.remove("btn-outline");
            btnSoundToggle.classList.add("btn-secondary");
            soundIcon.textContent = "🔊";
            btnSoundToggle.innerHTML = `<span class="btn-icon">🔊</span> Sound FX: ON`;
            playSoundEffect("pop");
        } else {
            btnSoundToggle.classList.add("btn-outline");
            btnSoundToggle.classList.remove("btn-secondary");
            soundIcon.textContent = "🔇";
            btnSoundToggle.innerHTML = `<span class="btn-icon">🔇</span> Sound FX: OFF`;
        }
    });

    // -------------------------------------------------------------------------
    // WEB SPEECH API (TEXT-TO-SPEECH)
    // -------------------------------------------------------------------------
    const synth = window.speechSynthesis;
    let currentUtterance = null;

    function speakText(text) {
        if (!synth) {
            speechStateText.textContent = "Speech API not supported in browser";
            return;
        }

        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = parseFloat(voicePitch.value) || 1.0;
        utterance.rate = parseFloat(voiceRate.value) || 1.05;

        const voices = synth.getVoices();
        const englishVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("David") || v.name.includes("Zira")));
        if (englishVoice) {
            utterance.voice = englishVoice;
        }

        utterance.onstart = () => {
            speechStateText.textContent = "Speaking roast...";
            btnSpeakRoast.classList.add("btn-danger");
        };

        utterance.onend = () => {
            speechStateText.textContent = "Finished speaking";
            btnSpeakRoast.classList.remove("btn-danger");
        };

        utterance.onerror = () => {
            speechStateText.textContent = "Speech interrupted";
            btnSpeakRoast.classList.remove("btn-danger");
        };

        currentUtterance = utterance;
        synth.speak(utterance);
    }

    btnSpeakRoast.addEventListener("click", () => {
        const text = roastText.textContent.trim();
        if (text) {
            speakText(text);
        }
    });

    btnStopSpeech.addEventListener("click", () => {
        if (synth) {
            synth.cancel();
            speechStateText.textContent = "Speech stopped";
            btnSpeakRoast.classList.remove("btn-danger");
        }
    });

    // -------------------------------------------------------------------------
    // REAL-TIME INPUT BADGE FEEDBACK
    // -------------------------------------------------------------------------
    function updateInputBadges() {
        const attVal = parseFloat(inputAttendance.value) || 0;
        if (attVal >= 90) badgeAttendance.textContent = `${attVal}% (Safe)`;
        else if (attVal >= 75) badgeAttendance.textContent = `${attVal}% (Borderline)`;
        else if (attVal >= 50) badgeAttendance.textContent = `${attVal}% (Danger)`;
        else badgeAttendance.textContent = `${attVal}% (Debarred)`;

        const cgpaVal = parseFloat(inputCgpa.value) || 0;
        badgeCgpa.textContent = `${cgpaVal.toFixed(2)}`;

        const assignVal = parseInt(inputAssignments.value) || 0;
        badgeAssignments.textContent = `${assignVal} ${assignVal === 1 ? 'task' : 'tasks'}`;

        const moneyVal = parseFloat(inputMoney.value) || 0;
        badgeMoney.textContent = `₹${moneyVal.toLocaleString('en-IN')}`;

        const daysVal = parseInt(inputDaysLeft.value) || 0;
        badgeDays.textContent = `${daysVal} days`;

        const backVal = parseInt(inputBackPapers.value) || 0;
        badgeBackpapers.textContent = `${backVal} backs`;

        const sleepVal = parseFloat(inputSleepHours.value) || 0;
        badgeSleep.textContent = `${sleepVal} hrs`;
    }

    [inputAttendance, inputCgpa, inputAssignments, inputMoney, inputDaysLeft, inputBackPapers, inputSleepHours].forEach(input => {
        input.addEventListener("input", updateInputBadges);
    });

    // -------------------------------------------------------------------------
    // INPUT VALIDATION
    // -------------------------------------------------------------------------
    function validateInputs() {
        const errors = [];
        const clearErrors = () => {
            document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
            errorBanner.classList.add("hidden");
        };
        clearErrors();

        const att = parseFloat(inputAttendance.value);
        if (isNaN(att) || att < 0 || att > 100) {
            errors.push("Attendance percentage must be between 0% and 100%.");
            inputAttendance.classList.add("input-error");
        }

        const cgpa = parseFloat(inputCgpa.value);
        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
            errors.push("CGPA must be between 0.00 and 10.00.");
            inputCgpa.classList.add("input-error");
        }

        const assign = parseInt(inputAssignments.value);
        if (isNaN(assign) || assign < 0) {
            errors.push("Assignments cannot be negative.");
            inputAssignments.classList.add("input-error");
        }

        const money = parseFloat(inputMoney.value);
        if (isNaN(money) || money < 0) {
            errors.push("Money cannot be negative.");
            inputMoney.classList.add("input-error");
        }

        const days = parseInt(inputDaysLeft.value);
        if (isNaN(days) || days < 1) {
            errors.push("Days until semester ends must be at least 1.");
            inputDaysLeft.classList.add("input-error");
        }

        const backs = parseInt(inputBackPapers.value);
        if (isNaN(backs) || backs < 0) {
            errors.push("Back papers count cannot be negative.");
            inputBackPapers.classList.add("input-error");
        }

        const sleep = parseFloat(inputSleepHours.value);
        if (isNaN(sleep) || sleep < 0 || sleep > 24) {
            errors.push("Sleep hours must be between 0 and 24 hours per day.");
            inputSleepHours.classList.add("input-error");
        }

        if (errors.length > 0) {
            errorMessage.textContent = errors[0];
            errorBanner.classList.remove("hidden");
            errorBanner.scrollIntoView({ behavior: "smooth", block: "center" });
            playSoundEffect("warning");
            return false;
        }

        return true;
    }

    // -------------------------------------------------------------------------
    // SCORE ANIMATION & DISPLAY
    // -------------------------------------------------------------------------
    function animateScoreCounter(targetScore, color) {
        let current = 0;
        const duration = 1200;
        const startTime = performance.now();

        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            current = Math.round(targetScore * easeOut);

            scoreNumber.textContent = current;

            const degrees = (current / 100) * 360;
            scoreRadial.style.background = `conic-gradient(${color} ${degrees}deg, rgba(255, 255, 255, 0.06) ${degrees}deg)`;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                scoreNumber.textContent = targetScore;
            }
        }

        requestAnimationFrame(update);
    }

    // -------------------------------------------------------------------------
    // DISPLAY RESULTS
    // -------------------------------------------------------------------------
    function displayResults(data) {
        lastCalculationData = data;

        resultsSection.classList.remove("hidden");
        resultsSection.scrollIntoView({ behavior: "smooth" });

        if (data.total_score <= 19) {
            playSoundEffect("death");
        } else if (data.total_score < 60) {
            playSoundEffect("warning");
        } else {
            playSoundEffect("calculate");
        }

        animateScoreCounter(data.total_score, data.tier.color);

        tierBadge.className = `tier-badge ${data.tier.class}`;
        tierText.textContent = data.tier.badge;
        tierQuote.textContent = `“${data.tier.quote}”`;

        insightStrongestName.textContent = data.strongest_skill.name;
        insightStrongestDesc.textContent = data.strongest_skill.desc;
        insightStrongestScore.textContent = `${data.strongest_skill.score} pts`;

        insightThreatName.textContent = data.biggest_threat.name;
        insightThreatDesc.textContent = data.biggest_threat.desc;
        insightThreatScore.textContent = `${data.biggest_threat.score} pts`;

        breakdownGrid.innerHTML = "";
        data.breakdown.forEach((item, index) => {
            const pct = Math.round((item.score / item.max) * 100);
            
            let barColor = "#58a6ff";
            if (pct >= 80) barColor = "#3fb950";
            else if (pct >= 50) barColor = "#d29922";
            else barColor = "#f85149";

            const card = document.createElement("div");
            card.className = "breakdown-card";
            card.innerHTML = `
                <div class="bc-top-row">
                    <span class="bc-name">${item.icon} ${item.name}</span>
                    <span class="bc-score" style="color: ${barColor}">${item.score}/${item.max} pts</span>
                </div>
                <div class="bc-progress-bar-bg">
                    <div class="bc-progress-bar-fill" id="pb-fill-${index}" style="background: ${barColor}; width: 0%;"></div>
                </div>
                <div class="bc-bottom-row">
                    <span class="bc-desc">"${item.desc}"</span>
                    <span class="bc-val">${item.display_val}</span>
                </div>
            `;
            breakdownGrid.appendChild(card);

            setTimeout(() => {
                const fillEl = document.getElementById(`pb-fill-${index}`);
                if (fillEl) fillEl.style.width = `${pct}%`;
            }, 50 + index * 60);
        });

        adviceContent.textContent = `“${data.random_advice}”`;

        roastCategoryTag.textContent = "Full Academic Autopsy";
        roastText.textContent = data.custom_roast;
        speechStateText.textContent = "Ready to speak";
    }

    // -------------------------------------------------------------------------
    // FORM SUBMISSION (CALCULATE) - HYBRID API & CLIENT-SIDE FALLBACK
    // -------------------------------------------------------------------------
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        initAudio();

        if (!validateInputs()) return;

        const payload = {
            attendance: parseFloat(inputAttendance.value),
            cgpa: parseFloat(inputCgpa.value),
            assignments: parseInt(inputAssignments.value),
            money: parseFloat(inputMoney.value),
            days_left: parseInt(inputDaysLeft.value),
            back_papers: parseInt(inputBackPapers.value),
            sleep_hours: parseFloat(inputSleepHours.value),
            cooking: selectCooking.value,
            tech_level: selectTech.value,
            social_level: selectSocial.value,
            mocking: selectMocking.value
        };

        const calculateBtn = document.getElementById("btn-calculate");
        calculateBtn.disabled = true;
        calculateBtn.style.opacity = "0.7";

        try {
            const res = await fetch("/api/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    displayResults(data);
                    return;
                }
            }
            // If server returns error, fallback to client-side
            const clientResult = calculateClientSide(payload);
            displayResults(clientResult);
        } catch (err) {
            // Static hosting or offline: Compute directly in browser!
            const clientResult = calculateClientSide(payload);
            displayResults(clientResult);
        } finally {
            calculateBtn.disabled = false;
            calculateBtn.style.opacity = "1";
        }
    });

    // -------------------------------------------------------------------------
    // RANDOM STUDENT GENERATOR
    // -------------------------------------------------------------------------
    btnRandomStudent.addEventListener("click", async () => {
        initAudio();
        playSoundEffect("click");

        let p = null;
        try {
            const res = await fetch("/api/random-student");
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.profile) {
                    p = data.profile;
                }
            }
        } catch (err) {
            // Ignore fetch error, use client presets
        }

        if (!p) {
            p = CLIENT_DATA.presets[Math.floor(Math.random() * CLIENT_DATA.presets.length)];
        }

        inputAttendance.value = p.attendance;
        inputCgpa.value = p.cgpa;
        inputAssignments.value = p.assignments;
        inputMoney.value = p.money;
        inputDaysLeft.value = p.days_left;
        inputBackPapers.value = p.back_papers;
        inputSleepHours.value = p.sleep_hours;
        selectCooking.value = p.cooking;
        selectTech.value = p.tech_level;
        selectSocial.value = p.social_level;
        selectMocking.value = p.mocking;

        updateInputBadges();
        showToast(`Generated profile: "${p.name}" 🎲`);

        form.dispatchEvent(new Event("submit"));
    });

    // -------------------------------------------------------------------------
    // RESET / START OVER
    // -------------------------------------------------------------------------
    function resetAll() {
        initAudio();
        playSoundEffect("pop");
        form.reset();
        updateInputBadges();
        document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
        errorBanner.classList.add("hidden");
        resultsSection.classList.add("hidden");
        if (synth) synth.cancel();
        window.scrollTo({ top: 0, behavior: "smooth" });
        showToast("Form reset to defaults. Ready for a new victim 📝");
    }

    btnResetTop.addEventListener("click", resetAll);
    btnRecalculate.addEventListener("click", resetAll);

    // -------------------------------------------------------------------------
    // ROAST ME BUTTON (CUSTOM WEAKNESS ROAST)
    // -------------------------------------------------------------------------
    btnRoastMe.addEventListener("click", () => {
        initAudio();
        playSoundEffect("click");

        if (lastCalculationData && lastCalculationData.custom_roast) {
            roastCategoryTag.textContent = "Savage Roast Analysis";
            roastText.textContent = lastCalculationData.custom_roast;
            speakText(lastCalculationData.custom_roast);
        } else {
            form.dispatchEvent(new Event("submit"));
        }
    });

    // -------------------------------------------------------------------------
    // MOCKING MODE (SPECIFIC CATEGORY ROASTS)
    // -------------------------------------------------------------------------
    mockingButtons.forEach(btn => {
        btn.addEventListener("click", async () => {
            initAudio();
            playSoundEffect("click");

            const topic = btn.dataset.topic;
            const payload = {
                topic: topic,
                attendance: parseFloat(inputAttendance.value) || 75,
                cgpa: parseFloat(inputCgpa.value) || 7.5,
                assignments: parseInt(inputAssignments.value) || 2,
                money: parseFloat(inputMoney.value) || 2000,
                days_left: parseInt(inputDaysLeft.value) || 20,
                back_papers: parseInt(inputBackPapers.value) || 0,
                sleep_hours: parseFloat(inputSleepHours.value) || 6
            };

            let roastResult = null;
            try {
                const res = await fetch("/api/roast-topic", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        roastResult = data.roast;
                    }
                }
            } catch (e) {
                // Ignore and use client-side roast
            }

            if (!roastResult) {
                roastResult = getTopicRoastClientSide(topic, payload);
            }

            roastCategoryTag.textContent = `Roasting: ${topic.replace('_', ' ').toUpperCase()}`;
            roastText.textContent = roastResult;
            speakText(roastResult);
        });
    });

    // -------------------------------------------------------------------------
    // RANDOM ADVICE GENERATOR
    // -------------------------------------------------------------------------
    btnNewAdvice.addEventListener("click", async () => {
        initAudio();
        playSoundEffect("pop");

        let adviceResult = null;
        try {
            const res = await fetch("/api/random-advice");
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    adviceResult = data.advice;
                }
            }
        } catch (e) {
            // Ignore
        }

        if (!adviceResult) {
            adviceResult = CLIENT_DATA.advice[Math.floor(Math.random() * CLIENT_DATA.advice.length)];
        }

        adviceContent.textContent = `“${adviceResult}”`;
    });

    // -------------------------------------------------------------------------
    // SHARE SURVIVAL SCORE
    // -------------------------------------------------------------------------
    btnShare.addEventListener("click", async () => {
        initAudio();
        playSoundEffect("pop");

        if (!lastCalculationData) return;

        const shareTitle = "College Survival Score Calculator™";
        const shareText = `🎓 MY COLLEGE SURVIVAL SCORE: ${lastCalculationData.total_score}/100\n` +
                          `Status: ${lastCalculationData.tier.badge}\n` +
                          `"${lastCalculationData.tier.quote}"\n` +
                          `⭐ Best Skill: ${lastCalculationData.strongest_skill.name}\n` +
                          `⚠️ Biggest Threat: ${lastCalculationData.biggest_threat.name}\n` +
                          `Calculate yours at: ${window.location.origin}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: window.location.href
                });
                showToast("Shared successfully! 🚀");
            } catch (err) {
                if (err.name !== "AbortError") {
                    fallbackCopyToClipboard(shareText);
                }
            }
        } else {
            fallbackCopyToClipboard(shareText);
        }
    });

    function fallbackCopyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast("Survival report copied to clipboard! 📋");
            }).catch(() => {
                promptCopyFallback(text);
            });
        } else {
            promptCopyFallback(text);
        }
    }

    function promptCopyFallback(text) {
        window.prompt("Copy your survival score report:", text);
    }

    function showToast(msg) {
        toastMessage.textContent = msg;
        toast.classList.remove("hidden");
        setTimeout(() => {
            toast.classList.add("hidden");
        }, 3200);
    }

    // -------------------------------------------------------------------------
    // KEYBOARD SHORTCUTS
    // -------------------------------------------------------------------------
    document.addEventListener("keydown", (e) => {
        if ((e.key === "r" || e.key === "R") && !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) {
            e.preventDefault();
            btnRoastMe.click();
        }
    });

    updateInputBadges();
});
