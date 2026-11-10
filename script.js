const canvas = document.getElementById('vtuberCanvas');
const ctx = canvas.getContext('2d');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let currentExpr = 'normal';
let breathTime = 0;
let isSpeaking = false;
let speakTimer = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

const exprButtons = document.querySelectorAll('.expr-btn');
const dialogueText = document.getElementById('dialogueText');

exprButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        exprButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const expr = btn.dataset.expression;
        currentExpr = expr;
        
        if (expr === 'normal') dialogueText.textContent = "Hai! Aku Hasbi. Aku di sini buat nemenin kamu ngobrol. ♡";
        else if (expr === 'happy') dialogueText.textContent = "Wah, aku seneng banget hari ini! Kamu gimana? 😄";
        else if (expr === 'sad') dialogueText.textContent = "Jangan cuekin aku dong... aku kangen ngobrol. 🥺";
        else if (expr === 'angry') dialogueText.textContent = "Ih! Kamu usil banget sih, jangan bikin aku ngambek ya! 😫";
        else if (expr === 'shy') dialogueText.textContent = "Kamu ngeliatin aku gitu banget... jadi malu deh. ☺️";
        else if (expr === 'surprised') dialogueText.textContent = "Eh?! Seriusan? Kaget banget aku! 😳";
        
        triggerSpeaking();
    });
});

document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('userInput');
    const val = input.value.trim();
    if (!val) return;

    dialogueText.textContent = `Hasbi: "Makasih udah ngobrol sama aku tentang '${val}'! ♡"`;
    input.value = '';
    triggerSpeaking();
});

function triggerSpeaking() {
    isSpeaking = true;
    clearTimeout(speakTimer);
    speakTimer = setTimeout(() => { isSpeaking = false; }, 2500);
}

function drawBackground() {
    const w = canvas.width;
    const h = canvas.height;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#100926');
    grad.addColorStop(1, '#080314');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
}

function drawAvatar() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 80;
    breathTime += 0.04;
    const breathOffsetY = Math.sin(breathTime) * 4;

    const lookX = (mouseX - canvas.width / 2) / (canvas.width / 2);
    const lookY = (mouseY - canvas.height / 2) / (canvas.height / 2);
    
    const headX = centerX + lookX * 12;
    const headY = centerY - 140 + breathOffsetY + lookY * 6;

    // Body
    ctx.fillStyle = '#1e1a24';
    ctx.beginPath();
    ctx.ellipse(headX, headY + 220, 150, 160, 0, 0, Math.PI * 2);
    ctx.fill();

    // Face Base
    ctx.fillStyle = '#fff0eb';
    ctx.beginPath();
    ctx.ellipse(headX, headY, 80, 90, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    function drawEye(ex, ey) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(ex, ey, 18, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#7e22ce';
        ctx.beginPath();
        ctx.ellipse(ex + lookX * 6, ey + lookY * 4, 11, 15, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawEye(headX - 32, headY - 5);
    drawEye(headX + 32, headY - 5);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawAvatar();
    requestAnimationFrame(render);
}

render();
