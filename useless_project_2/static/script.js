/**
 * College Survival Score Calculator™
 * Frontend Logic, Calculations, Web Speech Synthesis & Web Audio FX
 */

document.addEventListener("DOMContentLoaded", () => {
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
            // Ascending triad
            playTone(440, "sine", 0.1, 0.0);
            playTone(554.37, "sine", 0.1, 0.08);
            playTone(659.25, "sine", 0.2, 0.16);
            playTone(880, "triangle", 0.35, 0.24);
        } else if (type === "warning") {
            // Minor alarm buzz
            playTone(280, "sawtooth", 0.18, 0.0);
            playTone(240, "sawtooth", 0.25, 0.12);
        } else if (type === "death") {
            // Retro 8-bit game over descending notes
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

    // Toggle sound
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

        // Cancel any existing speech
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = parseFloat(voicePitch.value) || 1.0;
        utterance.rate = parseFloat(voiceRate.value) || 1.05;

        // Try to pick a natural English voice
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
        // Attendance
        const attVal = parseFloat(inputAttendance.value) || 0;
        if (attVal >= 90) badgeAttendance.textContent = `${attVal}% (Safe)`;
        else if (attVal >= 75) badgeAttendance.textContent = `${attVal}% (Borderline)`;
        else if (attVal >= 50) badgeAttendance.textContent = `${attVal}% (Danger)`;
        else badgeAttendance.textContent = `${attVal}% (Debarred)`;

        // CGPA
        const cgpaVal = parseFloat(inputCgpa.value) || 0;
        badgeCgpa.textContent = `${cgpaVal.toFixed(2)}`;

        // Assignments
        const assignVal = parseInt(inputAssignments.value) || 0;
        badgeAssignments.textContent = `${assignVal} ${assignVal === 1 ? 'task' : 'tasks'}`;

        // Money
        const moneyVal = parseFloat(inputMoney.value) || 0;
        badgeMoney.textContent = `₹${moneyVal.toLocaleString('en-IN')}`;

        // Days
        const daysVal = parseInt(inputDaysLeft.value) || 0;
        badgeDays.textContent = `${daysVal} days`;

        // Back papers
        const backVal = parseInt(inputBackPapers.value) || 0;
        badgeBackpapers.textContent = `${backVal} backs`;

        // Sleep
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
        const duration = 1200; // ms
        const startTime = performance.now();

        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            current = Math.round(targetScore * easeOut);

            scoreNumber.textContent = current;

            // Radial progress angle (0 to 360 deg)
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

        // Reveal results container
        resultsSection.classList.remove("hidden");
        resultsSection.scrollIntoView({ behavior: "smooth" });

        // Sound FX based on score
        if (data.total_score <= 19) {
            playSoundEffect("death");
        } else if (data.total_score < 60) {
            playSoundEffect("warning");
        } else {
            playSoundEffect("calculate");
        }

        // Animate counter
        animateScoreCounter(data.total_score, data.tier.color);

        // Update Tier badge
        tierBadge.className = `tier-badge ${data.tier.class}`;
        tierText.textContent = data.tier.badge;
        tierQuote.textContent = `“${data.tier.quote}”`;

        // Update Insights
        insightStrongestName.textContent = data.strongest_skill.name;
        insightStrongestDesc.textContent = data.strongest_skill.desc;
        insightStrongestScore.textContent = `${data.strongest_skill.score} pts`;

        insightThreatName.textContent = data.biggest_threat.name;
        insightThreatDesc.textContent = data.biggest_threat.desc;
        insightThreatScore.textContent = `${data.biggest_threat.score} pts`;

        // Render Breakdown cards
        breakdownGrid.innerHTML = "";
        data.breakdown.forEach((item, index) => {
            const pct = Math.round((item.score / item.max) * 100);
            
            // Choose bar color
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

            // Animate progress bar fill smoothly
            setTimeout(() => {
                const fillEl = document.getElementById(`pb-fill-${index}`);
                if (fillEl) fillEl.style.width = `${pct}%`;
            }, 50 + index * 60);
        });

        // Advice
        adviceContent.textContent = `“${data.random_advice}”`;

        // Roast Display
        roastCategoryTag.textContent = "Full Academic Autopsy";
        roastText.textContent = data.custom_roast;
        speechStateText.textContent = "Ready to speak";
    }

    // -------------------------------------------------------------------------
    // FORM SUBMISSION (CALCULATE)
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

            const data = await res.json();
            if (data.success) {
                displayResults(data);
            } else {
                errorMessage.textContent = data.error || "Failed to calculate score.";
                errorBanner.classList.remove("hidden");
                playSoundEffect("warning");
            }
        } catch (err) {
            console.error("Calculation fetch error:", err);
            errorMessage.textContent = "Connection error. Make sure the Flask server is running.";
            errorBanner.classList.remove("hidden");
            playSoundEffect("warning");
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

        try {
            const res = await fetch("/api/random-student");
            const data = await res.json();
            if (data.success && data.profile) {
                const p = data.profile;
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

                // Automatically calculate score for generated student
                form.dispatchEvent(new Event("submit"));
            }
        } catch (err) {
            console.error("Random student error:", err);
        }
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
            // Trigger calculate first
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

            try {
                const res = await fetch("/api/roast-topic", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    roastCategoryTag.textContent = `Roasting: ${topic.replace('_', ' ').toUpperCase()}`;
                    roastText.textContent = data.roast;
                    speakText(data.roast);
                }
            } catch (e) {
                console.error("Roast topic error:", e);
            }
        });
    });

    // -------------------------------------------------------------------------
    // RANDOM ADVICE GENERATOR
    // -------------------------------------------------------------------------
    btnNewAdvice.addEventListener("click", async () => {
        initAudio();
        playSoundEffect("pop");

        try {
            const res = await fetch("/api/random-advice");
            const data = await res.json();
            if (data.success) {
                adviceContent.textContent = `“${data.advice}”`;
            }
        } catch (e) {
            console.error("Advice error:", e);
        }
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
        // If user presses 'R' outside input fields, trigger Roast Me
        if ((e.key === "r" || e.key === "R") && !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) {
            e.preventDefault();
            btnRoastMe.click();
        }
    });

    // Initial badge update
    updateInputBadges();
});
