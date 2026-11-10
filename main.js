// Ganti ke model kamu sendiri, misal "./model/nama.model3.json"
const MODEL_URL = "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json";

const $ = (id) => document.getElementById(id);
const statusEl = $("status");

// ===== RENDER =====
const app = new PIXI.Application({ view: $("stage"), resizeTo: window, backgroundAlpha: 0 });
let model;
let mouth = 0;        // nilai mulut sekarang (0..1)
let mouthTarget = 0;  // nilai target dari sumber suara

function fit() {
  if (!model) return;
  const s = Math.min(app.screen.width / model.internalModel.width, (app.screen.height * 0.88) / model.internalModel.height);
  model.scale.set(s);
  model.x = (app.screen.width - model.width) / 2;
  model.y = (app.screen.height * 0.92 - model.height) / 2;
}
window.addEventListener("resize", fit);

(async () => {
  model = await PIXI.live2d.Live2DModel.from(MODEL_URL, { autoInteract: false });
  app.stage.addChild(model);
  fit();
  statusEl.textContent = "Siap. Pilih Mic, Audio, atau ketik teks.";

  model.internalModel.on("beforeModelUpdate", () => {
    mouth += (mouthTarget - mouth) * 0.5; // smoothing
    const cm = model.internalModel.coreModel;
    try { cm.setParameterValueById("ParamMouthOpenY", mouth); } catch (e) {}
    try { cm.setParameterValueById("ParamMouthForm", mouth > 0.1 ? 0.3 : 0); } catch (e) {}
  });

  model.on("hit", (areas) => {
    if (areas.includes("Head")) model.expression();
    else model.motion("TapBody");
  });
})();
$("btnExp").onclick = () => model && model.expression();

// ===== LIP SYNC DARI AUDIO (mic / file) =====
let audioCtx, analyser, buf, raf, activeBtn;

function ensureCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    buf = new Uint8Array(analyser.fftSize);
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function pump() {
  analyser.getByteTimeDomainData(buf);
  let sum = 0;
  for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
  const rms = Math.sqrt(sum / buf.length);
  mouthTarget = Math.min(1, Math.max(0, (rms - 0.02) * 9)); // atur 9 = sensitivitas
  raf = requestAnimationFrame(pump);
}
function stopAll() {
  cancelAnimationFrame(raf);
  clearInterval(ttsTimer);
  mouthTarget = 0;
  speechSynthesis.cancel();
  if (micStream) { micStream.getTracks().forEach((t) => t.stop()); micStream = null; }
  if (audioEl) { audioEl.pause(); audioEl = null; }
  if (activeBtn) activeBtn.classList.remove("on");
  activeBtn = null;
}

// Mic
let micStream, micSrc;
$("btnMic").onclick = async (e) => {
  if (micStream) { stopAll(); statusEl.textContent = "Mic mati."; return; }
  stopAll();
  try {
    ensureCtx();
    micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    micSrc = audioCtx.createMediaStreamSource(micStream);
    micSrc.connect(analyser); // JANGAN connect ke speaker, biar ga feedback
    activeBtn = e.target; activeBtn.classList.add("on");
    statusEl.textContent = "Mic aktif, ngomong aja 🎤";
    pump();
  } catch (err) { statusEl.textContent = "Gagal akses mic: " + err.message; }
};

// File audio
let audioEl, fileSrcCache = new WeakMap();
$("btnFile").onclick = () => $("file").click();
$("file").onchange = (e) => {
  const f = e.target.files[0];
  if (!f) return;
  stopAll();
  ensureCtx();
  audioEl = new Audio(URL.createObjectURL(f));
  const src = audioCtx.createMediaElementSource(audioEl);
  src.connect(analyser);
  analyser.connect(audioCtx.destination);
  audioEl.onended = () => { stopAll(); statusEl.textContent = "Selesai."; };
  audioEl.play();
  statusEl.textContent = "Muter: " + f.name;
  pump();
  e.target.value = "";
};

// ===== TEKS KE SUARA (TTS browser) =====
// Audio TTS browser ga bisa dianalisis, jadi mulut digerakin simulasi selama suara jalan.
let ttsTimer;
$("btnSpeak").onclick = () => {
  const text = $("text").value.trim();
  if (!text) return;
  stopAll();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "id-ID"; // ganti ke "en-US" / "ja-JP" sesuai kebutuhan
  u.pitch = 1.3;
  u.onstart = () => {
    let t = 0;
    ttsTimer = setInterval(() => {
      t += 0.35;
      mouthTarget = Math.max(0, 0.45 + 0.4 * Math.sin(t * 3) + (Math.random() - 0.5) * 0.3);
    }, 70);
  };
  const done = () => { clearInterval(ttsTimer); mouthTarget = 0; statusEl.textContent = "Siap."; };
  u.onend = done; u.onerror = done;
  statusEl.textContent = "Ngomong... 💬";
  speechSynthesis.speak(u);
};
