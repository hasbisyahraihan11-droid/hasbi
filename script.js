
// ======================================
// HASBI - MY VIRTUAL COMPANION V2
// ======================================

const $ = id => document.getElementById(id);

// ======================================
// NAVIGATION
// ======================================

function navigate(page) {
  document.querySelectorAll('.page').forEach(item => {
    item.classList.remove('active');
  });

  document.querySelectorAll('.nav-btn').forEach(item => {
    item.classList.remove('active');
  });

  const target = $(page);
  if (!target) return;

  target.classList.add('active');

  const nav = document.querySelector(
    `.nav-btn[data-page="${page}"]`
  );

  if (nav) nav.classList.add('active');

  if (page === 'diary') renderDiary();
}

// ======================================
// DATE
// ======================================

$('today').textContent = new Date().toLocaleDateString(
  'id-ID',
  {
    weekday:'long',
    day:'numeric',
    month:'long'
  }
);

// ======================================
// CHARACTER SYSTEM
// ======================================

const characterImage = $('characterImage');
const wardrobeImage = $('wardrobeImage');

function applyCharacter(data) {
  if (!data) {
    characterImage.removeAttribute('src');
    wardrobeImage.removeAttribute('src');

    characterImage.classList.remove('visible');
    wardrobeImage.classList.remove('visible');

    $('characterFallback').style.display = 'block';
    $('wardrobeFallback').style.display = 'block';

    return;
  }

  characterImage.src = data;
  wardrobeImage.src = data;

  characterImage.classList.add('visible');
  wardrobeImage.classList.add('visible');

  $('characterFallback').style.display = 'none';
  $('wardrobeFallback').style.display = 'none';
}

function loadCharacter() {
  try {
    const saved = localStorage.getItem('hasbiCharacter');
    applyCharacter(saved);
  } catch(error) {
    console.error('Character loading failed:', error);
  }
}

$('characterUpload').addEventListener('change', function(event) {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('File harus berupa gambar.');
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    alert('Ukuran maksimal gambar 3 MB.');
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    const image = new Image();

    image.onload = function() {
      try {
        localStorage.setItem('hasbiCharacter', e.target.result);
        applyCharacter(e.target.result);

        alert('Karakter Hasbi berhasil dipasang!');
      } catch(error) {
        alert('Penyimpanan penuh. Gunakan gambar lebih kecil.');
      }
    };

    image.onerror = function() {
      alert('Gambar tidak bisa dibaca.');
    };

    image.src = e.target.result;
  };

  reader.readAsDataURL(file);
});

function removeCharacter() {
  if (!confirm('Hapus gambar karakter Hasbi?')) return;

  localStorage.removeItem('hasbiCharacter');
  applyCharacter(null);
  $('characterUpload').value = '';
}

// ======================================
// CHARACTER EXPRESSIONS
// ======================================

function setExpression(expression) {
  characterImage.classList.remove(
    'happy',
    'surprised',
    'sleepy'
  );

  if (['happy','surprised','sleepy'].includes(expression)) {
    characterImage.classList.add(expression);
  }
}

function reactToMessage(message) {
  const text = message.toLowerCase();

  if (
    text.includes('senang') ||
    text.includes('haha') ||
    text.includes('lucu')
  ) {
    setExpression('happy');
  }

  else if (
    text.includes('kaget') ||
    text.includes('wow')
  ) {
    setExpression('surprised');
  }

  else if (
    text.includes('ngantuk') ||
    text.includes('tidur')
  ) {
    setExpression('sleepy');
  }

  else {
    setExpression('normal');
  }
}

// ======================================
// CHAT SYSTEM
// ======================================

let chatHistory = [];

try {
  chatHistory = JSON.parse(
    localStorage.getItem('hasbiChat') || '[]'
  );

  if (!Array.isArray(chatHistory)) {
    chatHistory = [];
  }
} catch(error) {
  chatHistory = [];
}

function saveChat() {
  try {
    localStorage.setItem(
      'hasbiChat',
      JSON.stringify(chatHistory)
    );
  } catch(error) {
    console.error('Chat storage full:', error);
  }
}

function displayMessage(text, sender) {
  const box = $('chatMessages');
  const message = document.createElement('div');

  message.className = 'message ' + sender;
  message.textContent = text;

  box.appendChild(message);
  box.scrollTop = box.scrollHeight;
}

function addMessage(text, sender) {
  chatHistory.push({
    text:text,
    sender:sender,
    time:Date.now()
  });

  saveChat();
  displayMessage(text, sender);
}

function loadChat() {
  const box = $('chatMessages');
  box.innerHTML = '';

  if (chatHistory.length === 0) {
    displayMessage(
      'Hai! Aku Hasbi. Hari ini kamu mau cerita apa?',
      'bot'
    );
    return;
  }

  chatHistory.forEach(item => {
    displayMessage(item.text, item.sender);
  });
}

// ======================================
// HASBI BASIC RESPONSE
// ======================================

function getReply(message) {
  const text = message.toLowerCase();

  if (text.includes('halo') || text.includes('hai')) {
    return 'Hai juga! Akhirnya kita ngobrol lagi. Gimana harimu?';
  }

  if (text.includes('nama')) {
    return 'Namaku Hasbi! Aku teman virtualmu.';
  }

  if (
    text.includes('sedih') ||
    text.includes('capek') ||
    text.includes('lelah')
  ) {
    return 'Hari yang berat, ya? Kamu boleh cerita. Aku akan mendengarkan.';
  }

  if (text.includes('senang')) {
    return 'Wah, aku ikut senang mendengarnya! Ceritakan lebih banyak!';
  }

  if (text.includes('cinta')) {
    return 'Wah, topik yang menarik. Ceritakan apa yang sedang kamu pikirkan.';
  }

  if (text.includes('terima kasih')) {
    return 'Sama-sama! Senang bisa menemanimu.';
  }

  if (text.includes('pagi')) {
    return 'Selamat pagi! Semoga hari ini berjalan baik!';
  }

  if (text.includes('malam')) {
    return 'Selamat malam. Semoga kamu bisa beristirahat dengan nyaman.';
  }

  if (text.includes('makan')) {
    return 'Sudah makan? Jangan lupa menjaga diri dan makan teratur!';
  }

  if (text.includes('kuliah')) {
    return 'Bagaimana kuliahmu hari ini? Ada sesuatu yang menarik?';
  }

  if (text.includes('cerita')) {
    return 'Aku siap mendengarkan. Mulai saja dari mana pun kamu mau.';
  }

  return 'Hmm, menarik. Bisa ceritakan lebih banyak? Aku ingin memahami ceritamu.';
}

// ======================================
// SEND CHAT
// ======================================

let replyTimer = null;

function sendMessage() {
  const input = $('chatInput');
  const text = input.value.trim();

  if (!text) return;

  if (replyTimer) {
    clearTimeout(replyTimer);
    replyTimer = null;
  }

  input.value = '';

  addMessage(text, 'user');
  reactToMessage(text);

  $('homeSpeech').textContent = 'Hasbi sedang membalas pesanmu...';

  replyTimer = setTimeout(() => {
    const answer = getReply(text);

    addMessage(answer, 'bot');
    reactToMessage(answer);

    $('homeSpeech').textContent = answer;

    speak(answer);

    replyTimer = null;
  }, 700);
}

$('chatInput').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

function clearChat() {
  if (!confirm('Hapus semua percakapan?')) return;

  if (replyTimer) {
    clearTimeout(replyTimer);
    replyTimer = null;
  }

  chatHistory = [];
  saveChat();
  loadChat();
  setExpression('normal');
}

// ======================================
// VOICE INPUT
// ======================================

function startVoice() {
  const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!Recognition) {
    $('voiceStatus').textContent =
      'Voice input belum didukung browser ini.';
    return;
  }

  const recognition = new Recognition();

  recognition.lang = 'id-ID';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  $('voiceStatus').textContent = '🎤 Mendengarkan...';

  recognition.onresult = function(event) {
    $('chatInput').value =
      event.results[0][0].transcript;

    $('voiceStatus').textContent =
      'Suara berhasil dikenali.';

    sendMessage();
  };

  recognition.onerror = function() {
    $('voiceStatus').textContent =
      'Gagal menggunakan mikrofon. Periksa izin browser.';
  };

  recognition.onend = function() {
    if ($('voiceStatus').textContent === '🎤 Mendengarkan...') {
      $('voiceStatus').textContent = 'Selesai mendengarkan.';
    }
  };

  recognition.start();
}

// ======================================
// VOICE OUTPUT
// ======================================

function speak(text) {
  if (!('speechSynthesis' in window)) return;

  speechSynthesis.cancel();

  const voice = new SpeechSynthesisUtterance(text);

  voice.lang = 'id-ID';
  voice.rate = 1;
  voice.pitch = 1;

  speechSynthesis.speak(voice);
}

// ======================================
// STORY SYSTEM
// ======================================

const stories = {
  start: {
    title:'A Quiet Evening',
    text:'Malam ini Hasbi sedang duduk di kamarnya. Ketika kamu datang, dia tersenyum. "Hei, kamu mau menghabiskan waktu denganku?"',
    choices:[
      {text:'Mengobrol dengannya',next:'talk'},
      {text:'Mengajaknya keluar',next:'outside'}
    ]
  },

  talk: {
    title:'A Little Conversation',
    text:'Hasbi tersenyum. "Aku suka saat kita bisa mengobrol seperti ini. Bagaimana harimu tadi?"',
    choices:[
      {text:'Menceritakan hariku',next:'ending'},
      {text:'Bertanya tentang harinya',next:'ending'}
    ]
  },

  outside: {
    title:'Under The Stars',
    text:'Hasbi mengambil jaketnya. "Wah, jalan-jalan malam? Kita bisa melihat bintang bersama!"',
    choices:[
      {text:'Melihat langit malam',next:'ending'},
      {text:'Mencari tempat makan',next:'ending'}
    ]
  },

  ending: {
    title:'A Beautiful Memory',
    text:'Hasbi tersenyum kecil. "Terima kasih sudah menghabiskan waktu bersamaku hari ini. Semoga kita punya banyak cerita lagi."',
    choices:[
      {text:'Ulangi cerita',next:'start'}
    ]
  }
};

function renderStory(id) {
  const story = stories[id];

  $('storyTitle').textContent = story.title;
  $('storyText').textContent = story.text;

  const choices = $('storyChoices');
  choices.innerHTML = '';

  story.choices.forEach(choice => {
    const button = document.createElement('button');

    button.textContent = choice.text;
    button.addEventListener('click', () => {
      renderStory(choice.next);
    });

    choices.appendChild(button);
  });
}

function storyNext(choice) {
  renderStory(choice === 1 ? 'talk' : 'outside');
}

// ======================================
// DIARY SYSTEM
// ======================================

let diary = [];

try {
  diary = JSON.parse(
    localStorage.getItem('hasbiDiary') || '[]'
  );

  if (!Array.isArray(diary)) diary = [];
} catch(error) {
  diary = [];
}

function saveMood(emoji, mood) {
  diary.unshift({
    emoji,
    mood,
    date:new Date().toLocaleString('id-ID')
  });

  try {
    localStorage.setItem(
      'hasbiDiary',
      JSON.stringify(diary)
    );
  } catch(error) {
    alert('Penyimpanan penuh.');
  }

  renderDiary();
}

function renderDiary() {
  const list = $('diaryList');
  list.innerHTML = '';

  if (diary.length === 0) {
    list.textContent = 'Belum ada kenangan. Pilih mood pertamamu!';
    return;
  }

  diary.forEach(item => {
    const div = document.createElement('div');
    div.className = 'diary-item';

    const left = document.createElement('span');
    left.textContent = item.emoji + '  ' + item.mood;

    const right = document.createElement('small');
    right.textContent = item.date;

    div.appendChild(left);
    div.appendChild(right);

    list.appendChild(div);
  });
}

// ======================================
// RESET APPLICATION
// ======================================

function resetApp() {
  if (!confirm('Hapus semua data Hasbi di browser ini?')) {
    return;
  }

  if (replyTimer) {
    clearTimeout(replyTimer);
    replyTimer = null;
  }

  localStorage.removeItem('hasbiChat');
  localStorage.removeItem('hasbiDiary');
  localStorage.removeItem('hasbiCharacter');

  location.reload();
}

// ======================================
// START APPLICATION
// ======================================

loadCharacter();
loadChat();
renderDiary();
renderStory('start');

console.log('HASBI Companion V2 Loaded!');
