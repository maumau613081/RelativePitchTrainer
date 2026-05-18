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
const frequencies = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88];
const pitches = ['C4(ド)', 'C#4(ド#)', 'D4(レ)', 'D#4(レ#)', 'E4(ミ)', 'F4(ファ)', 'F#4(ファ#)', 'G4(ソ)', 'G#4(ソ#)', 'A4(ラ)', 'A#4(ラ#)','B4(シ)'];

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
    const duration = 2.0; 
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

//選択音再生ボタン
playAnyBtn?.addEventListener('click', () => {
    playTone(8);//
})

autoToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        intervalId  = setInterval(() => {
            playRandom();
            if (answerLi) answerLi.textContent = `答え : ${pitches[currentIndex]}`;
        }, 2000);
    } else {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }
})

// 回答表示/非表示ボタン
answerBtn?.addEventListener('click', () => {
    if (currentIndex === null) {
        alert("まずはランダムに音を再生してください。");
        return;
    }
    const answerText = pitches[currentIndex];
    if (answerLi) answerLi.textContent = `答え : ${answerText}`;
});