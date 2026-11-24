MY COMPANION — HASBI 2D V2
============================

UPLOAD KE GITHUB
1. Ekstrak ZIP.
2. Upload semua isi folder ini ke root repository GitHub (jangan upload folder ZIP-nya).
3. Pastikan susunan:
   api/chat.js
   public/index.html
   public/manifest.webmanifest
   package.json
   vercel.json
4. Hubungkan repository ke Vercel atau tunggu auto-deploy.

AKTIFKAN AI ONLINE
1. Vercel > Project > Settings > Environment Variables.
2. Tambahkan OPENAI_API_KEY dengan API key milikmu.
3. Opsional: OPENAI_MODEL (default gpt-4o-mini).
4. Opsional: OPENAI_BASE_URL jika memakai endpoint kompatibel OpenAI.
5. Redeploy project.

TANPA API KEY
Website tetap bisa dibuka. Chat memakai balasan lokal sederhana.
Fitur suara memakai dukungan browser/perangkat.

CATATAN
Avatar 2D digambar sebagai SVG langsung di HTML, jadi tidak perlu upload
file gambar karakter terpisah. Background kamar dibuat dengan CSS.
Ekspresi wajah dan animasi idle dapat berjalan tanpa aset eksternal.
