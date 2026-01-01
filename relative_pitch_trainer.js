//諸々の初期化
// クロスブラウザ対応（iPhone/Safari対応）を含めて定義
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext(); // ここを小文字の audioCtx に統一

//HTML要素を取得
const randomBtn = document.getElementById('randomBtn');
const againBtn = document.getElementById('againBtn');
const playCBtn = document.getElementById('playCBtn');
const answerBtn = document.getElementById('answerBtn');
const answerLi = document.querySelector('.answer');

//データ
const frequencies = [261.63, 269.29, 277.18, 285.30, 293.66, 302.27, 311.13, 320.24, 329.63, 339.29, 349.23, 359.46, 369.99, 380.84, 392.00, 403.48, 415.30, 427.47, 440.00, 452.89, 466.16, 479.82, 493.88, 508.35];
const pitches = ['C4', 'C4+50ct', 'C#4', 'C#4+50ct', 'D4', 'D4+50ct', 'D#4', 'D#4+50ct', 'E4', 'E4+50ct', 'F4', 'F4+50ct', 'F#4', 'F#4+50ct', 'G4', 'G4+50ct', 'G#4', 'G#4+50ct', 'A4', 'A4+50ct', 'A#4', 'A#4+50ct', 'B4', 'B4+50ct'];

//変数
let currentIndex = null;

function playTone(index) {
    if (index < 0 || index >= frequencies.length) return;
    
    // iPhoneなどはユーザー操作時にコンテキスト再開が必要
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
    const fade = 0.05; // 0.5だと長すぎて音が山なりになるため、0.05程度が自然です

    // 音の再生感（エンベロープ）
    gainNode.gain.setValueAtTime(0, now);
    
    // 【修正】liner -> linear
    gainNode.gain.linearRampToValueAtTime(volume, now + fade);
    
    // 【修正】setvalue -> setValue
    gainNode.gain.setValueAtTime(volume, now + duration - fade);
    
    // 【修正】liner -> linear
    gainNode.gain.linearRampToValueAtTime(0.001, now + duration);

    //接続
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // 【修正】再生と停止の命令を追加（これがないと鳴りません）
    oscillator.start(now);
    oscillator.stop(now + duration);

    // 終了後の処理
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

// 回答表示ボタン
answerBtn?.addEventListener('click', () => {
    if (currentIndex === null) {
        alert("まずはランダムに音を再生してください。");
        return;
    }
    const answerText = pitches[currentIndex];
    if (answerLi) answerLi.textContent = `答え : ${answerText}`;
});