# Live2D Face Tracking (starter)

Web VTuber 2D: karakter Live2D yang ngikutin mulut, mata, alis, dan kepala lu lewat webcam. Bisa diklik buat reaksi.

## Jalanin di laptop
Kamera cuma jalan di **localhost** atau **https**, jadi jangan buka file-nya langsung (file://).

    cd live2d-web
    python3 -m http.server 8000
    # atau: npx serve

Buka http://localhost:8000, klik "Nyalain Kamera".

## Upload ke GitHub
    git init
    git add .
    git commit -m "first commit"
    git branch -M main
    git remote add origin https://github.com/USERNAME/NAMA-REPO.git
    git push -u origin main

## Deploy
- **Vercel:** vercel.com > Add New Project > pilih repo > Deploy (tanpa setting apa-apa).
- **GitHub Pages:** Settings > Pages > Branch: main / root.

## Ganti model
1. Taruh folder model (`.model3.json`, `.moc3`, tekstur, dll) di `model/`.
2. Ubah `MODEL_URL` di `main.js` jadi `"./model/nama.model3.json"`.
3. Kalau nama parameter model beda, sesuaikan ID di `beforeModelUpdate` (`ParamMouthOpenY`, dst).

## Catatan
- Model default (Haru) cuma buat testing, cek lisensi Live2D sebelum dipakai publik/komersial.
- Library dimuat dari CDN, jadi butuh internet.
- Kalau gerakan kepala kebalik, ganti tanda di bagian `track.yaw / pitch / roll` di `main.js`.
