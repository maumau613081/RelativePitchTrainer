const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundBuffers = [];
let currentBuffer = null;
let currentSource = null;

const pitches = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
// 注意: ファイル名に「+」が含まれていない場合は、ここの「+」を削除してください
const cents = ['-50ct', '-40ct', '-30ct', '-20ct', '-10ct', '+-0ct', '+10ct', '+20ct', '+30ct', '+40ct'];

const statusText = document.getElementById('status');
const randomBtn = document.getElementById('randomBtn');
const againBtn = document.getElementById('againBtn');
const playCBtn = document.getElementById('playCBtn');
const answerBtn = document.getElementById('answerBtn');
const usageBtn = document.getElementById('usageBtn');
const answerLi = document.querySelector(`.answer`);

function setButtonsEnabled(enabled) {
    const buttons = [randomBtn, againBtn, playCBtn, answerBtn];
    buttons.forEach(btn => btn.disabled = !enabled);
};

async function loadAllSounds() {
    const promises = pitches.flatMap(pitch =>
        cents.map(async cent => {
            // ファイル名のベースを作成
            const baseName = `${pitch}${cent}`;
            const extension = `.wav`; // 実際のファイルが .WAV ならここを書き換える
            
            // 重要: URLとして正しく読み込むためにエンコードする
            // encodeURIComponentを使うと '#' は '%23' に、'+' は '%2B' に変換されます
            // 例: 'C#4+10ct' -> 'C%234%2B10ct'
            const fileNameForUrl = encodeURIComponent(baseName) + extension;

            try {
                const res = await fetch(`./${fileNameForUrl}`);
                if (!res.ok) {
                    // 404などのエラー詳細を投げる
                    throw new Error(`${res.status} ${res.statusText}`);
                }
                const arrayBuffer = await res.arrayBuffer();
                return await audioCtx.decodeAudioData(arrayBuffer);
            } catch (e) {
                // どのファイルで失敗したかログに出す（デバッグ用）
                console.error(`読み込み失敗: ${baseName}${extension} (URL: ${fileNameForUrl})`, e);
                throw e;
            }
        })
    );
    return Promise.all(promises);
}

function playSound(buffer) {
    if (!buffer) return;
    if (currentSource) {
        try {
            currentSource.stop();
        } catch (e) {}
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    source.start(0);
    currentSource = source;
}

loadAllSounds().then(buffers => {
    soundBuffers = buffers;
    if(statusText) {
        statusText.textContent = "準備完了";
        statusText.style.color = "green";
    }
    setButtonsEnabled(true);
}).catch(err => {
    // ユーザーにエラーを通知
    if(statusText) {
        statusText.textContent = "ロードエラー (F12キーでコンソールを確認してください)";
        statusText.style.color = "red";
    }
    setButtonsEnabled(false);
});

// イベントリスナー
randomBtn.addEventListener('click', () => {
    if (soundBuffers.length === 0) return;
    const randomIndex = Math.floor(Math.random() * soundBuffers.length);
    currentBuffer = soundBuffers[randomIndex];
    answerLi.textContent = "";
    playSound(currentBuffer);
});

againBtn.addEventListener('click', () => {
    if (!currentBuffer) {
        alert("まずはランダムに音を再生してください。");
        return;
    }
    playSound(currentBuffer);
});

playCBtn.addEventListener('click', () => {
    if (soundBuffers.length === 0) return;
    const CBuffer = soundBuffers[5];
    playSound(CBuffer);
});

answerBtn.addEventListener('click', () => {
    if (!currentBuffer) {
        alert("まずはランダムに音を再生してください。");
        return;
    }
    const index = soundBuffers.indexOf(currentBuffer);
    const pitchIndex = Math.floor(index / cents.length);
    const centIndex = index % cents.length;
    answerLi.textContent = `答え : ${pitches[pitchIndex]} ${cents[centIndex]}`;
});

usageBtn.addEventListener('click', () => {
    alert("このアプリは相対音程をトレーニングするためのものです。");
});
