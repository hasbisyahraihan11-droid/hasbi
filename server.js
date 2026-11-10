import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const API_KEY = process.env.OPENAI_API_KEY || "";
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

// Small in-memory per-IP throttle for a personal prototype. Use a proper
// shared limiter/authentication before making a public multi-user service.
const hits = new Map();
function rateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const entry = hits.get(key) || { count: 0, start: now };
  if (now - entry.start > 60_000) { entry.count = 0; entry.start = now; }
  entry.count++;
  hits.set(key, entry);
  if (entry.count > 20) return res.status(429).json({ error: "Terlalu banyak pesan. Coba lagi sebentar." });
  next();
}
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(API_KEY), model: MODEL });
});
app.post("/api/chat", rateLimit, async (req, res) => {
  if (!API_KEY) return res.status(503).json({ error: "API key belum diatur. Isi OPENAI_API_KEY di file .env pada server." });
  const { message, history = [], name = "Hasbi", personality = "" } = req.body || {};
  if (typeof message !== "string" || !message.trim()) return res.status(400).json({ error: "Pesan kosong." });
  if (message.length > 1500) return res.status(400).json({ error: "Pesan terlalu panjang (maksimum 1500 karakter)." });
  const safeHistory = Array.isArray(history)
    ? history.filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
        .slice(-12).map(m => ({ role: m.role, content: m.content.slice(0, 2000) }))
    : [];
  const system = `Kamu adalah ${String(name).slice(0, 40)}, karakter companion VTuber virtual. ${String(personality).slice(0, 1200)}
Balas dalam bahasa Indonesia secara hangat, natural, tidak terlalu panjang (1-4 kalimat), dan sesuai konteks. Jangan mengklaim sebagai manusia nyata. Hindari konten seksual eksplisit, kekerasan grafis, atau instruksi berbahaya.
Di akhir, pilih satu ekspresi dengan format internal JSON? Jangan tampilkan JSON. Cukup jawab percakapan secara natural.`;
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: system }, ...safeHistory.filter(m => m.content !== message).slice(-10), { role: "user", content: message }],
        temperature: 0.8,
        max_tokens: 350
      }),
      signal: AbortSignal.timeout(45_000)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data?.error?.message || `Provider mengembalikan HTTP ${response.status}`;
      return res.status(502).json({ error: detail });
    }
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) return res.status(502).json({ error: "AI tidak mengirim teks balasan." });
    res.json({ reply: reply.trim(), expression: "neutral" });
  } catch (err) {
    console.error("AI request failed:", err.message);
    res.status(502).json({ error: "Tidak bisa menghubungi provider AI. Periksa internet, base URL, dan model." });
  }
});
app.listen(PORT, "0.0.0.0", () => console.log(`My Companion aktif: http://localhost:${PORT}`));
