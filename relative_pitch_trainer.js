//html関連やオーディオを取得
const audioCtx = new AudioContext();
const oscillator = audioCtx.createOscillator();
const gainNode = audioCtx.createGain();
const statusText = document.getElementById('status');
const randomBtn = document.getElementById('randomBtn');
const againBtn = document.getElementById('againBtn');
const playCBtn = document.getElementById('playCBtn');
const answerBtn = document.getElementById('answerBtn');
const usageBtn = document.getElementById('usageBtn');
const answerLi = document.querySelector(`.answer`);

//変数の定義
let soundBuffers = [];
let currentBuffer = null;
let currentSource = null;

function PlaySound(centsFromC4) {
    const baseFreq = 261.63;
    const frequency = baseFreq * Math.pow(2, centsFromC4 / 1200)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.95);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1.0);
}

//ランダムボタン
randomBtn?.addEventListener('click', () => {
    if (soundBuffers.length === 0) return;
    const randomIndex = Math.floor(Math.random() * soundBuffers.length);
    currentBuffer = soundBuffers[randomIndex];
    if (answerLi) answerLi.textContent = "";
    playSound(currentBuffer);
});

//再再生ボタン
againBtn?.addEventListener('click', () => {
    if (!currentBuffer) {
        alert("まずはランダムに音を再生してください。");
        return;
    }
    playSound(currentBuffer);
});

//C再生ボタン
playCBtn?.addEventListener('click', () => {
    if (soundBuffers.length === 0) return;
    //pitchのC4の配列は最初の12この中,centでは6番目であるからインデックスは5番目
    const CBuffer = soundBuffers[5];
    playSound(CBuffer);
});

//回答表示ボタン
answerBtn?.addEventListener('click', () => {
    if (!currentBuffer) {
        alert("まずはランダムに音を再生してください。");
        return;
    }
    const index = soundBuffers.indexOf(currentBuffer);
    const pitchIndex = Math.floor(index / cents.length);
    const centIndex = index % cents.length;
    if (answerLi) answerLi.textContent = `答え : ${pitches[pitchIndex].replace('sharp', '#')} ${cents[centIndex].replace('plus', '+').replace('minus', '-')}`;
});

//使い方ボタン
usageBtn?.addEventListener('click', () => {
    alert("このアプリは相対音程をトレーニングするためのものです。");
});
