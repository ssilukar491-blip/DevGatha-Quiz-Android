


(() => {
  "use strict";

  const root = document.getElementById("devgatha-features");
  if (!root) return;

  const KEY = "devgatha_features_v1";
  const defaults = {
    name: "Player",
    score: 0,
    xp: 0,
    streak: 0,
    lastReward: "",
    language: "hi-IN",
    rate: 1,
    sound: true,
    theme: "dark",
    scores: []
  };

  let data;
  try {
    data = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    data = { ...defaults };
  }

  const questions = [
    { q: "भारत की राजधानी क्या है?",
      a: ["मुंबई", "नई दिल्ली", "भोपाल", "जयपुर"], correct: 1 },
    { q: "भारत का राष्ट्रीय पशु कौन है?",
      a: ["शेर", "हाथी", "बाघ", "घोड़ा"], correct: 2 },
    { q: "एक सप्ताह में कितने दिन होते हैं?",
      a: ["5", "6", "7", "8"], correct: 2 },
    { q: "सूर्य किस दिशा से उगता है?",
      a: ["उत्तर", "दक्षिण", "पश्चिम", "पूर्व"], correct: 3 },
    { q: "भारत का संविधान कब लागू हुआ?",
      a: ["15 अगस्त 1947", "26 जनवरी 1950",
        "2 अक्टूबर 1948", "26 नवंबर 1949"], correct: 1 }
  ];

  let order = [];
  let current = 0;
  let runScore = 0;
  let answered = false;

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Local save unavailable", e);
    }
    render();
  }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, c => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;",
      '"':"&quot;", "'":"&#39;"
    }[c]));
  }

  function card(title, body) {
    return `<section class="card"><h2>${title}</h2>${body}</section>`;
  }

  function render() {
    document.body.style.background =
      data.theme === "light" ? "#f1f2ff" : "#101027";
    document.body.style.color =
      data.theme === "light" ? "#17172c" : "#ffffff";

    root.innerHTML =
      card("👤 प्रोफ़ाइल", `
        <p>नाम: <b>${esc(data.name)}</b></p>
        <p>स्कोर: ${data.score} | XP: ${data.xp}</p>
        <p>दैनिक स्ट्रीक: ${data.streak} दिन</p>
        <input id="playerName" maxlength="30"
          placeholder="अपना नाम लिखो">
        <button id="saveName">नाम सेव करो</button>
      `) +
      card("🧠 Quiz", `
        <p>सामान्य ज्ञान के सवाल खेलो और XP कमाओ।</p>
        <button id="startQuiz">Quiz शुरू करो</button>
        <div id="quizArea"></div>
      `) +
      card("🎁 Daily Reward", `
        <p>हर दिन एक बार 10 XP का बोनस लो।</p>
        <button id="dailyReward">आज का रिवॉर्ड लो</button>
        <p id="rewardStatus" class="muted"></p>
      `) +
      card("🏆 लीडरबोर्ड", `
        <p class="muted">यह इसी डिवाइस पर सेव स्कोर दिखाता है;
        ऑनलाइन खिलाड़ियों की रैंकिंग नहीं।</p>
        <ol>${[...data.scores]
          .sort((a,b) => b.score-a.score).slice(0,10)
          .map(s => `<li>${esc(s.name)} — ${s.score}</li>`).join("")}
        </ol>
      `) +
      card("🔊 Voice Studio", `
        <textarea id="voiceText" rows="3"
          placeholder="यहाँ टेक्स्ट लिखो"
          style="width:100%;padding:10px"></textarea>
        <label>भाषा</label>
        <select id="voiceLang">
          <option value="hi-IN">हिंदी</option>
          <option value="en-IN">English India</option>
          <option value="en-US">English US</option>
        </select>
        <label>आवाज़ की गति</label>
        <input id="voiceRate" type="range" min="0.6"
          max="1.5" step="0.1" value="${data.rate}">
        <div class="actions">
          <button id="speak">बोलकर सुनाओ</button>
          <button id="stopVoice">रोकें</button>
        </div>
        <p class="muted">आवाज़ डिवाइस के उपलब्ध speech engine पर निर्भर है।
        यह अपने-आप MP3 नहीं बनाता।</p>
      `) +
      card("⚙️ Settings", `
        <label>इंटरफ़ेस भाषा</label>
        <select id="settingLang">
          <option value="hi-IN">हिंदी</option>
          <option value="en-IN">English India</option>
          <option value="en-US">English US</option>
        </select>
        <label>थीम</label>
        <select id="settingTheme">
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
        <button id="saveSettings">सेटिंग्स सेव करो</button>
      `) +
      card("💰 Monetization", `
        <p>AdMob integration अभी सक्रिय नहीं है।</p>
        <p class="muted">अभी कोई विज्ञापन नहीं दिखाया जा रहा।
        वास्तविक Banner और Rewarded Ads के लिए Android SDK/plugin,
        AdMob App ID और Ad Unit IDs जोड़ने होंगे।</p>
        <button id="adInfo">विज्ञापन सेटअप की जानकारी</button>
      `) +
      card("🔒 Privacy & About", `
        <p>DevGatha Quiz — शुरुआती फीचर डेमो।</p>
        <p class="muted">नाम, स्कोर और सेटिंग्स इस डिवाइस के
        localStorage में रखे जाते हैं। ऐप डेटा साफ़ करने या ब्राउज़र
        डेटा हटाने पर ये मिट सकते हैं। ऑनलाइन बैकअप नहीं है।</p>
        <button id="resetData">सारा स्थानीय डेटा मिटाओ</button>
      `) +
      `<p id="message" role="status" aria-live="polite"></p>`;

    document.getElementById("settingLang").value = data.language;
    document.getElementById("settingTheme").value = data.theme;
    bindEvents();
  }

  function msg(text) {
    const el = document.getElementById("message");
    if (el) el.textContent = text;
  }

  function bindEvents() {
    document.getElementById("saveName").onclick = () => {
      const value = document.getElementById("playerName").value.trim();
      if (!value) return msg("पहले अपना नाम लिखो।");
      data.name = value;
      save();
      msg("नाम सेव हो गया।");
    };

    document.getElementById("startQuiz").onclick = startQuiz;

    document.getElementById("dailyReward").onclick = () => {
      const today = new Date().toLocaleDateString("en-CA");
      if (data.lastReward === today) {
        return msg("आज का रिवॉर्ड पहले ही ले चुके हो।");
      }
      const yesterday = new Date(Date.now() - 86400000)
        .toLocaleDateString("en-CA");
      data.streak = data.lastReward === yesterday ? data.streak + 1 : 1;
      data.lastReward = today;
      data.xp += 10;
      save();
      msg("मुबारक हो! 10 XP मिल गए।");
    };

    document.getElementById("speak").onclick = () => {
      if (!("speechSynthesis" in window)) {
        return msg("इस WebView में आवाज़ उपलब्ध नहीं है।");
      }
      const text = document.getElementById("voiceText").value.trim();
      if (!text) return msg("पहले टेक्स्ट लिखो।");
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = document.getElementById("voiceLang").value;
      utterance.rate = Number(document.getElementById("voiceRate").value);
      speechSynthesis.speak(utterance);
      data.rate = utterance.rate;
      data.language = utterance.lang;
      save();
    };

    document.getElementById("stopVoice").onclick = () => {
      if ("speechSynthesis" in window) speechSynthesis.cancel();
    };

    document.getElementById("saveSettings").onclick = () => {
      data.language = document.getElementById("settingLang").value;
      data.theme = document.getElementById("settingTheme").value;
      save();
      msg("सेटिंग्स सेव हो गईं।");
    };

    document.getElementById("adInfo").onclick = () => {
      msg("पहले AdMob अकाउंट और ऐप सेटअप करो। अभी केवल टेस्ट विज्ञापन इस्तेमाल करना।");
    };

    document.getElementById("resetData").onclick = () => {
      if (!confirm("क्या सच में इस डिवाइस का सारा स्थानीय डेटा मिटाना है?")) return;
      localStorage.removeItem(KEY);
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      data = { ...defaults };
      save();
      msg("स्थानीय डेटा मिटा दिया गया।");
    };
  }

  function startQuiz() {
    order = questions.map((_, i) => i)
      .sort(() => Math.random() - 0.5);
    current = 0;
    runScore = 0;
    showQuestion();
  }

  function showQuestion() {
    answered = false;
    const q = questions[order[current]];
    const area = document.getElementById("quizArea");
    if (!area) return;

    area.innerHTML = `
      <p>सवाल ${current + 1}/${order.length}</p>
      <p class="question">${esc(q.q)}</p>
      ${q.a.map((a,i) => `<button data-answer="${i}"
        style="display:block;width:100%;margin:7px 0">${esc(a)}</button>`).join("")}
      <p id="answerFeedback" aria-live="polite"></p>
      <button id="nextQuestion" disabled>अगला सवाल</button>
    `;

    area.querySelectorAll("[data-answer]").forEach(btn => {
      btn.onclick = () => {
        if (answered) return;
        answered = true;
        const correct = Number(btn.dataset.answer) === q.correct;
        if (correct) runScore += 10;
        area.querySelectorAll("[data-answer]").forEach(b => b.disabled = true);
        document.getElementById("answerFeedback").textContent =
          correct ? "सही जवाब! +10 अंक" :
          "सही जवाब: " + q.a[q.correct];
        document.getElementById("nextQuestion").disabled = false;
      };
    });

    document.getElementById("nextQuestion").onclick = () => {
      if (!answered) return;
      current++;
      if (current < order.length) return showQuestion();

      data.score += runScore;
      data.xp += runScore;
      data.scores.push({ name: data.name, score: data.score });
      data.scowres = data.scores.slice(-50);
      save();
      const resultArea = document.getElementById("quizArea");
if (resultArea) {
  resultArea.innerHTML =
    `<h3>Quiz पूरा हुआ!</h3><p>इस Quiz के अंक: ${runScore}/${order.length * 10}</p>`;
}
      area.innerHTML = `<h3>Quiz पूरा हुआ!</h3>
        <p>इस Quiz के अंक: ${runScore}/${order.length * 10}</p>`;
    };
  }

  render();
})();
