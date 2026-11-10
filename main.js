// ====== CONFIG ======
// Ganti URL ini ke model kamu sendiri (misal "./model/nama.model3.json") kalau udah punya.
const MODEL_URL = "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json";

import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";

const $ = (id) => document.getElementById(id);
const statusEl = $("status");
const video = $("cam");

// ====== RENDER MODEL ======
const app = new PIXI.Application({
  view: $("stage"), resizeTo: window, backgroundAlpha: 0, autoStart: true,
});
let model;
const track = { mouth: 0, smile: 0, eyeL: 1, eyeR: 1, yaw: 0, pitch: 0, roll: 0, eyeX: 0, eyeY: 0, brow: 0, on: false };

function fit() {
  if (!model) return;
  const s = Math.min(app.screen.width / model.internalModel.width, (app.screen.height * 0.9) / model.internalModel.height);
  model.scale.set(s);
  model.x = (app.screen.width - model.width) / 2;
  model.y = (app.screen.height - model.height) / 2;
}
window.addEventListener("resize", fit);

(async () => {
  model = await PIXI.live2d.Live2DModel.from(MODEL_URL, { autoInteract: false });
  app.stage.addChild(model);
  fit();
  statusEl.textContent = "Model siap. Klik karakter atau nyalain kamera.";

  // Tulis parameter tepat sebelum model di-update (menimpa animasi idle).
  model.internalModel.on("beforeModelUpdate", () => {
    if (!track.on) return;
    const cm = model.internalModel.coreModel;
    const set = (id, v) => { try { cm.setParameterValueById(id, v); } catch (e) {} };
    set("ParamMouthOpenY", track.mouth);
    set("ParamMouthForm", track.smile);
    set("ParamEyeLOpen", track.eyeL);
    set("ParamEyeROpen", track.eyeR);
    set("ParamAngleX", track.yaw);
    set("ParamAngleY", track.pitch);
    set("ParamAngleZ", track.roll);
    set("ParamBodyAngleX", track.yaw * 0.3);
    set("ParamEyeBallX", track.eyeX);
    set("ParamEyeBallY", track.eyeY);
    set("ParamBrowLY", track.brow);
    set("ParamBrowRY", track.brow);
  });

  // Interaksi klik
  model.on("hit", (areas) => {
    if (areas.includes("Head")) model.expression();
    else model.motion("TapBody");
  });
})();

$("btnExp").onclick = () => model && model.expression();
$("btnMotion").onclick = () => model && model.motion("TapBody");

// ====== TRACKING ======
let landmarker, running = false;
const bs = (list, name) => (list.find((c) => c.categoryName === name) || { score: 0 }).score;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

async function startTracking() {
  statusEl.textContent = "Loading tracker...";
  const fileset = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
  landmarker = await FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
    numFaces: 1,
  });
  const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" } });
  video.srcObject = stream;
  await video.play();
  video.style.display = "block";
  running = true;
  track.on = true;
  statusEl.textContent = "Tracking aktif 🎥";
  loop();
}

let lastT = -1;
function loop() {
  if (!running) return;
  if (video.currentTime !== lastT) {
    lastT = video.currentTime;
    const r = landmarker.detectForVideo(video, performance.now());
    if (r.faceBlendshapes && r.faceBlendshapes.length) {
      const c = r.faceBlendshapes[0].categories;
      const flip = $("mirror").checked ? 1 : -1;
      const k = 0.5; // smoothing (0..1, makin besar makin responsif)

      track.mouth = lerp(track.mouth, clamp(bs(c, "jawOpen") * 1.6, 0, 1), k);
      track.smile = lerp(track.smile, clamp((bs(c, "mouthSmileLeft") + bs(c, "mouthSmileRight")) * 1.2 - bs(c, "mouthFrownLeft") - bs(c, "mouthFrownRight"), -1, 1), k);
      // Kiri/kanan ketuker karena kamera ibarat cermin
      track.eyeL = lerp(track.eyeL, clamp(1 - bs(c, "eyeBlinkRight") * 1.4, 0, 1), 0.7);
      track.eyeR = lerp(track.eyeR, clamp(1 - bs(c, "eyeBlinkLeft") * 1.4, 0, 1), 0.7);
      track.brow = lerp(track.brow, clamp((bs(c, "browInnerUp") + bs(c, "browOuterUpLeft") + bs(c, "browOuterUpRight")) / 2 * 2 - 0.3, -1, 1), k);
      track.eyeX = lerp(track.eyeX, clamp((bs(c, "eyeLookOutLeft") - bs(c, "eyeLookInLeft")) * flip, -1, 1), k);
      track.eyeY = lerp(track.eyeY, clamp(bs(c, "eyeLookUpLeft") - bs(c, "eyeLookDownLeft"), -1, 1), k);
    }
    if (r.facialTransformationMatrixes && r.facialTransformationMatrixes.length) {
      const d = r.facialTransformationMatrixes[0].data; // column-major 4x4
      const rad = 180 / Math.PI;
      const pitch = Math.atan2(d[6], d[10]) * rad;
      const yaw = Math.asin(clamp(-d[2], -1, 1)) * rad;
      const roll = Math.atan2(d[1], d[0]) * rad;
      const flip = $("mirror").checked ? -1 : 1;
      // Kalau arah kepala kebalik, ganti tanda (-) di baris bawah
      track.yaw = lerp(track.yaw, clamp(yaw * flip, -30, 30), 0.4);
      track.pitch = lerp(track.pitch, clamp(-pitch, -30, 30), 0.4);
      track.roll = lerp(track.roll, clamp(roll * flip, -30, 30), 0.4);
    }
  }
  requestAnimationFrame(loop);
}

$("btnCam").onclick = async () => {
  if (running) {
    running = false; track.on = false;
    video.srcObject.getTracks().forEach((t) => t.stop());
    video.style.display = "none";
    $("btnCam").textContent = "📷 Nyalain Kamera";
    statusEl.textContent = "Kamera mati.";
    return;
  }
  try {
    await startTracking();
    $("btnCam").textContent = "⏹ Matiin Kamera";
  } catch (e) {
    console.error(e);
    statusEl.textContent = "Gagal: " + e.message;
  }
};
