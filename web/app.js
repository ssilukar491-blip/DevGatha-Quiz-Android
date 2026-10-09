const questions = [
  {
    q: "भगवद्गीता में श्रीकृष्ण ने उपदेश किसे दिया?",
    a: ["अर्जुन", "भीष्म", "द्रोणाचार्य", "विदुर"],
    correct: 0
  },
  {
    q: "रामायण के रचयिता किसे माना जाता है?",
    a: ["तुलसीदास", "महर्षि वाल्मीकि", "वेदव्यास", "कालिदास"],
    correct: 1
  },
  {
    q: "महाभारत में पांडव कितने भाई थे?",
    a: ["तीन", "चार", "पाँच", "छह"],
    correct: 2
  },
  {
    q: "हनुमान जी को किसका परम भक्त माना जाता है?",
    a: ["श्रीराम", "श्रीकृष्ण", "ब्रह्मा", "इंद्र"],
    correct: 0
  },
  {
    q: "भगवद्गीता किस महाकाव्य का हिस्सा है?",
    a: ["रामायण", "महाभारत", "ऋग्वेद", "अर्थशास्त्र"],
    correct: 1
  }
];

let current = 0;
let points = 0;
let answered = false;

const $ = id => document.getElementById(id);

function getBest() {
  try {
    return Number(localStorage.getItem("devgathaBest") || 0);
  } catch {
    return 0;
  }
}

function showBest() {
  $("best").textContent = getBest();
}

function renderQuestion() {
  answered = false;
  const item = questions[current];

  $("progress").textContent =
    `सवाल ${current + 1} / ${questions.length}`;

  $("question").textContent = item.q;
  $("feedback").textContent = "";
  $("next").hidden = true;
  $("answers").replaceChildren();

  item.a.forEach((answer, index) => {
    const button = document.createElement("button");
    button.textContent = answer;
    button.addEventListener("click", () => chooseAnswer(index));
    $("answers").appendChild(button);
  });
}

function chooseAnswer(index) {
  if (answered) return;
  answered = true;

  const item = questions[current];
  const buttons = $("answers").querySelectorAll("button");

  buttons.forEach(button => button.disabled = true);

  if (index === item.correct) {
    points++;
    $("feedback").textContent = "✅ सही जवाब!";
  } else {
    $("feedback").textContent =
      "❌ सही जवाब: " + item.a[item.correct];
  }

  $("next").textContent =
    current === questions.length - 1
      ? "रिज़ल्ट देखें"
      : "अगला सवाल";

  $("next").hidden = false;
}

function finishQuiz() {
  $("quiz").hidden = true;
  $("result").hidden = false;
  $("score").textContent =
    `तुम्हारा स्कोर: ${points} / ${questions.length}`;

  const best = Math.max(getBest(), points);

  try {
    localStorage.setItem("devgathaBest", String(best));
  } catch {}

  showBest();
}

$("next").addEventListener("click", () => {
  if (!answered) return;

  if (current < questions.length - 1) {
    current++;
    renderQuestion();
  } else {
    finishQuiz();
  }
});

$("restart").addEventListener("click", () => {
  current = 0;
  points = 0;
  $("result").hidden = true;
  $("quiz").hidden = false;
  renderQuestion();
});

showBest();
renderQuestion();
