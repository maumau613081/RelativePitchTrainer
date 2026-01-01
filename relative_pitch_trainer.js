//html関連やオーディオを取得
const audioCtx = new AudioContext();
const randomBtn = document.getElementById('randomBtn');
const againBtn = document.getElementById('againBtn');
const playCBtn = document.getElementById('playCBtn');
const answerBtn = document.getElementById('answerBtn');
const usageBtn = document.getElementById('usageBtn');
const answerLi = document.querySelector(`.answer`);

const frequencies = [261.63, 269.29, 277.18, 285.30, 293.66, 302.27, 311.13, 320.24, 329.63, 339.29, 349.23, 359.46, 369.99, 380.84, 392.00, 403.48, 415.30, 427.47, 440.00, 452.89, 466.16, 479.82, 493.88, 508.35];
const pitches = ['C4', 'C4+50ct', 'C#4', 'C#4+50ct', 'D4', 'D4+50ct', 'D#4', 'D#4+50ct', 'E4', 'E4+50ct', 'F4', 'F4+50ct', 'F#4', 'F#4+50ct', 'G4', 'G4+50ct', 'G#4', 'G#4+50ct', 'A4', 'A4+50ct', 'A#4', 'A#4+50ct', 'B4', 'B4+50ct'];

let currentIndex = null;

function playTone(index) {
    if (index < 0 || index >= frequencies.length) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequencies[index], audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1.0);

    oscillator.onended = () => {
        gainNode.disconnect();
        oscillator.disconnect();
    };
}

//ランダムボタン
randomBtn?.addEventListener('click', () => {
    currentIndex = Math.floor(Math.random() * frequencies.length);
    if (answerLi) answerLi.textContent = "";
    playTone(currentIndex);
});

//再再生ボタン
againBtn?.addEventListener('click', () => {
    if (currentIndex === null) {
        alert("まずはランダムに音を再生してください。");
        return;
    }
    playTone(currentIndex);
});

//C再生ボタン
playCBtn?.addEventListener('click', () => {
    playTone(0);
});

//回答表示ボタン
answerBtn?.addEventListener('click', () => {
    if (currentIndex === null) {
        alert("まずはランダムに音を再生してください。");
        return;
    }
    const answerText = pitches[currentIndex];
    if (answerLi) answerLi.textContent = `答え: ${answerText}`;
});

//使い方ボタン
usageBtn?.addEventListener('click', () => {
    alert("このアプリは相対音程をトレーニングするためのものです。");
});
