# My Companion VTuber 4.0 — Android + VRM + Online AI

## Isi paket
- `public/index.html`: antarmuka mobile/PWA, viewer VRM, ekspresi, rekaman voice lokal, chat AI.
- `server.js`: backend proxy AI. API key hanya dibaca di server.
- `.env.example`: contoh konfigurasi provider.
- `package.json`: dependency server.
- `public/manifest.webmanifest` dan `public/sw.js`: instalasi PWA Android.

## Yang diperlukan
- Node.js 20 atau lebih baru pada komputer/server.
- API key dari penyedia AI yang kompatibel dengan endpoint Chat Completions.
- Hosting HTTPS untuk penggunaan Android dari internet.
- File avatar `.vrm` milikmu sendiri.

## Jalankan di komputer
1. Ekstrak ZIP.
2. Install Node.js 20+ dari https://nodejs.org/
3. Buka terminal di folder proyek.
4. Jalankan `npm install`.
5. Salin `.env.example` menjadi `.env`.
6. Isi `OPENAI_API_KEY` di `.env`. Jangan masukkan key ke HTML, jangan kirim ke siapa pun.
7. Jalankan `npm start`.
8. Buka `http://localhost:3000`.

## Pakai di Android
Cara termudah adalah deploy folder proyek ke server Node.js yang mendukung aplikasi Node (mis. VPS atau platform hosting Node).
1. Upload folder proyek ke server.
2. Atur environment variables di dashboard hosting: `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`, `PORT`.
3. Jalankan `npm install` lalu `npm start` (atau gunakan perintah start dari hosting).
4. Pastikan domain menggunakan HTTPS.
5. Buka domain tersebut lewat Chrome Android.
6. Menu Chrome ⋮ → **Tambahkan ke layar utama** / **Install app**.
7. Tekan **Pilih model VRM** untuk memuat avatar dari penyimpanan HP.

## Konfigurasi provider AI
Default:
- `OPENAI_BASE_URL=https://api.openai.com/v1`
- `OPENAI_MODEL=gpt-4o-mini`

Server memanggil `${OPENAI_BASE_URL}/chat/completions`. Jadi provider lain dapat digunakan jika menyediakan endpoint OpenAI-compatible Chat Completions. Sesuaikan BASE_URL dan nama model menurut provider tersebut.

## Voice
- Rekaman/upload suara disimpan di localStorage browser pada perangkat itu.
- Audio rekaman dapat diputar sebagai voice clip ekspresi.
- Tombol “Bacakan jawaban” memakai text-to-speech bawaan browser (bukan voice clone).
- Untuk semua jawaban AI dibacakan dengan suara kloning milikmu, perlu integrasi API TTS/voice cloning terpisah dan konfigurasi server tambahan. Jangan mengirim sampel suara ke layanan pihak ketiga tanpa memahami kebijakan privasinya.

## Catatan keamanan & batasan
- Jangan pernah commit atau membagikan `.env`.
- Jangan deploy server pribadi tanpa proteksi tambahan jika domain bisa diakses publik. Versi demo ini memakai rate limit sederhana per IP, belum memiliki login, kuota pengguna, atau database.
- Chat AI membutuhkan internet, API key, dan saldo/akses API dari provider.
- Viewer VRM memuat Three.js dan three-vrm dari CDN; koneksi internet diperlukan pertama kali.
- File VRM diproses di browser dan tidak diupload ke server.
- PWA cache hanya shell aplikasi; chat AI tetap online.
- VRM model dan kualitas animasi bergantung pada rig/expressions yang tersedia di file VRM.

## Lisensi dependency
Three.js dan @pixiv/three-vrm memiliki lisensi masing-masing. Periksa lisensi dan ketentuan penggunaan model VRM yang kamu unduh.
