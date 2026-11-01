// English Speaking Practice – plain JavaScript, no build step.
const SENTENCES = {
  beginner: [
    { en: "Hello, how are you?", hi: "Namaste, aap kaise hain?" },
    { en: "My name is Rahul.", hi: "Mera naam Rahul hai." },
    { en: "I like to drink tea in the morning.", hi: "Mujhe subah chai peena pasand hai." },
    { en: "Where is the nearest bus stop?", hi: "Sabse paas ka bus stop kahan hai?" },
    { en: "Thank you very much for your help.", hi: "Aapki madad ke liye bahut dhanyavaad." },
    { en: "What time is it now?", hi: "Abhi kitne baje hain?" }
  ],
  intermediate: [
    { en: "I have been learning English for three months.", hi: "Main teen mahine se English seekh raha hoon." },
    { en: "Could you please speak a little slower?", hi: "Kya aap thoda dheere bol sakte hain?" },
    { en: "I would like to schedule a meeting for tomorrow.", hi: "Main kal ke liye ek meeting schedule karna chahta hoon." },
    { en: "The weather is quite pleasant today, isn't it?", hi: "Aaj mausam kaafi suhana hai, hai na?" },
    { en: "I am looking forward to working with you.", hi: "Main aapke saath kaam karne ka intezaar kar raha hoon." },
    { en: "Can you tell me how to get to the railway station?", hi: "Kya aap bata sakte hain railway station kaise pahunchna hai?" }
  ],
  advanced: [
    { en: "Despite the challenges, our team delivered the project ahead of schedule.", hi: "Chunautiyon ke bawajood hamari team ne project samay se pehle pura kiya." },
    { en: "Effective communication is the foundation of every successful business.", hi: "Prabhavi sanchaar har safal business ki neev hai." },
    { en: "I appreciate your feedback and will incorporate it into the next version.", hi: "Main aapke feedback ki sarahna karta hoon aur ise agle version mein shaamil karunga." },
    { en: "Consistency matters more than intensity when you are learning a language.", hi: "Bhasha seekhte samay tivrata se zyada nirantarta mahatvapurn hai." },
    { en: "Would you mind sharing your thoughts on this proposal?", hi: "Kya aap is prastav par apne vichar saajha karenge?" }
  ]
};

const $ = id => document.getElementById(id);
const levelEl = $("level"), accentEl = $("accent");
const sentenceEl = $("sentence"), hintEl = $("hint"), statusEl = $("status");
const resultEl = $("result"), heardEl = $("heard"), wordsEl = $("words"), scoreEl = $("score");
const speakBtn = $("speak"), listenBtn = $("listen"), nextBtn = $("next");

let current = null;
let stats = { attempts: 0, best: 0, streak: 0 };
try { stats = { ...stats, ...JSON.parse(localStorage.getItem("ese-stats") || "{}") }; } catch (e) {}

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SR) { $("unsupported").hidden = false; speakBtn.disabled = true; }

function renderStats() {
  $("attempts").textContent = stats.attempts;
  $("best").textContent = stats.best + "%";
  $("streak").textContent = stats.streak;
  try { localStorage.setItem("ese-stats", JSON.stringify(stats)); } catch (e) {}
}

function pickSentence() {
  const list = SENTENCES[levelEl.value];
  let next;
  do { next = list[Math.floor(Math.random() * list.length)]; } while (list.length > 1 && next === current);
  current = next;
  sentenceEl.textContent = current.en;
  hintEl.textContent = "Matlab: " + current.hi;
  resultEl.hidden = true;
  statusEl.textContent = "";
}

const normalize = s => s.toLowerCase().replace(/[^a-z0-9'\s]/g, "").split(/\s+/).filter(Boolean);

// Longest-common-subsequence on words: marks which target words were spoken in order.
function matchWords(target, spoken) {
  const n = target.length, m = spoken.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = target[i] === spoken[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ok = Array(n).fill(false);
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (target[i] === spoken[j]) { ok[i] = true; i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return ok;
}

function showResult(transcript) {
  const target = normalize(current.en);
  const ok = matchWords(target, normalize(transcript));
  const score = Math.round((ok.filter(Boolean).length / target.length) * 100);

  heardEl.textContent = "You said: “" + transcript + "”";
  wordsEl.innerHTML = "";
  target.forEach((w, i) => {
    const span = document.createElement("span");
    span.className = ok[i] ? "ok" : "bad";
    span.textContent = w;
    wordsEl.appendChild(span);
  });
  scoreEl.textContent = score + "% — " + (score >= 90 ? "Excellent! 🎉" : score >= 80 ? "Great job! 👏" : score >= 50 ? "Good try, practise once more." : "Listen again and repeat slowly.");
  resultEl.hidden = false;

  stats.attempts++;
  stats.best = Math.max(stats.best, score);
  stats.streak = score >= 80 ? stats.streak + 1 : 0;
  renderStats();
}

function listen() {
  if (!("speechSynthesis" in window)) { statusEl.textContent = "Text-to-speech is not supported here."; return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(current.en);
  u.lang = accentEl.value;
  u.rate = 0.9;
  speechSynthesis.speak(u);
}

function speak() {
  const rec = new SR();
  rec.lang = accentEl.value;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  speakBtn.disabled = true;
  statusEl.textContent = "🎙️ Listening… speak the sentence now.";
  rec.onresult = e => showResult(e.results[0][0].transcript);
  rec.onerror = e => {
    statusEl.textContent = e.error === "not-allowed"
      ? "Microphone permission denied. Please allow mic access."
      : e.error === "no-speech" ? "I couldn't hear anything. Try again." : "Error: " + e.error;
  };
  rec.onend = () => { speakBtn.disabled = false; if (statusEl.textContent.startsWith("🎙️")) statusEl.textContent = ""; };
  rec.start();
}

listenBtn.addEventListener("click", listen);
speakBtn.addEventListener("click", speak);
nextBtn.addEventListener("click", pickSentence);
levelEl.addEventListener("change", pickSentence);

renderStats();
pickSentence();
