# Live2D Lip Sync (tanpa tracking wajah)

Mulut karakter Live2D gerak mengikuti suara. Ada 3 sumber:
- **Mic:** ngomong langsung, mulut ngikutin volume suara lu.
- **Audio:** upload file mp3/wav, mulut ngikutin lagu atau voice-nya.
- **Bicara:** ketik teks, browser bacain pakai TTS, mulut gerak otomatis.

Karakter juga kedip dan gerak idle sendiri (dari motion bawaan model). Klik kepala buat ganti ekspresi, klik badan buat gerakan.

## Jalanin di laptop
Mic butuh **localhost** atau **https**, jangan buka file langsung.

    python3 -m http.server 8000
    # buka http://localhost:8000

## Deploy
Push ke GitHub, lalu Vercel: Add New Project > pilih repo > Deploy.

## Atur
- Sensitivitas mic: angka `9` di fungsi `pump()` di `main.js`.
- Bahasa TTS: `u.lang` (id-ID, en-US, ja-JP).
- Model sendiri: taruh di `model/`, ubah `MODEL_URL`.
