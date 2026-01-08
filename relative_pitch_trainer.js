//諸々の初期化
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

//HTML要素を取得
const randomBtn = document.getElementById('randomBtn');
const againBtn = document.getElementById('againBtn');
const playCBtn = document.getElementById('playCBtn');
const autoToggle = document.getElementById('autoToggle')
const answerBtn = document.getElementById('answerBtn');
const answerLi = document.querySelector('.answer');

//データ
const frequencies = [261.63, 269.29, 277.18, 285.30, 293.66, 302.27, 311.13, 320.24, 329.63, 339.29, 349.23, 359.46, 369.99, 380.84, 392.00, 403.48, 415.30, 427.47, 440.00, 452.89, 466.16, 479.82, 493.88, 508.35];
const pitches = ['C4(ド)', 'C4+50ct(ド+50ct)', 'C#4(ド#)', 'C#4+50ct(ド#+50ct)', 'D4(レ)', 'D4+50ct(レ+50ct)', 'D#4(レ#)', 'D#4+50ct(レ#+50ct)', 'E4(ミ)', 'E4+50ct(ミ+50ct)', 'F4(ファ)', 'F4+50ct(ファ+50ct)', 'F#4(ファ#)', 'F#4+50ct(ファ#+50ct)', 'G4(ソ)', 'G4+50ct(ソ+50ct)', 'G#4(ソ#)', 'G#4+50ct(ソ#+50ct)', 'A4(ラ)', 'A4+50ct(ラ+50ct)', 'A#4(ラ#)', 'A#4+50ct(ラ#+50ct)', 'B4(シ)', 'B4+50ct(シ+50ct)'];

//変数
let currentIndex = null;
let intervalId = null;

function playTone(index) {
    if (index < 0 || index >= frequencies.length) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    //オスシレーター・ゲインノード作成
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    //サイン波設定
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequencies[index], audioCtx.currentTime);

    //音量変化設定
    const now = audioCtx.currentTime;
    const volume = 0.2;
    const duration = 1.0; 
    const fade = 0.05;

    // 音の再生感
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + fade);
    gainNode.gain.setValueAtTime(volume, now + duration - fade);
    gainNode.gain.linearRampToValueAtTime(0.001, now + duration);

    //接続
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    //スタート/ストップ
    oscillator.start(now);
    oscillator.stop(now + duration);

    // 終了後の処理
    oscillator.onended = () => {
        gainNode.disconnect();
        oscillator.disconnect();
    };
}

//ランダムに再生する関数
function playRandom() {
    currentIndex = Math.floor(Math.random() * frequencies.length);
    if (answerLi) answerLi.textContent = "";
    playTone(currentIndex);
}

//ランダムボタン
randomBtn?.addEventListener('click', () => {
    playRandom();
})

// 再再生ボタン
againBtn?.addEventListener('click', () => {
    if (currentIndex === null) {
        alert("まずはランダムに音を再生してください。");
        return;
    }
    playTone(currentIndex);
});

// C再生ボタン
playCBtn?.addEventListener('click', () => {
    playTone(0); // 配列の0番目(C4)を鳴らす
});

autoToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        intervalId  = setInterval(() => {
            playRandom();
        }, 1000);
    } else {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }
})

// 回答表示ボタン
answerBtn?.addEventListener('click', () => {
    if (currentIndex === null) {
        alert("まずはランダムに音を再生してください。");
        return;
    }
    const answerText = pitches[currentIndex];
    if (answerLi) answerLi.textContent = `答え : ${answerText}`;
});