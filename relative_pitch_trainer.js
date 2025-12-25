//html関連やオーディオを取得
const audioCtx = new AudioContext();
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
const pitches = ['C4', 'Csharp4', 'D4', 'D4sharp', 'E4', 'F4', 'Fsharp4', 'G4', 'Gsharp4', 'A4', 'A4sharp', 'B4'];
const cents = ['minus50ct', 'minus40ct', 'minus30ct', 'minus20ct', 'minus10ct', 'plusminus0ct', 'plus10ct', 'plus20ct', 'plus30ct', 'plus40ct'];
const extension = '.wav';


//ボタンのオン/オフの設定
/**@param {boolean} enabled*/
function setButtonsEnabled(enabled) {
    const buttons = [randomBtn, againBtn, playCBtn, answerBtn];
    buttons.forEach(btn => {
        if (btn) {
            btn.disabled = !enabled;
        }
    });
}

async function loadAllSounds() {
    const promises = pitches.flatMap(pitch =>
        cents.map(async cent => {
            const baseName = `${pitch}${cent}`;
            const fileNameForUrl = baseName + extension;
            console.log(`読み込み中: ${baseName}${extension} (URL: ${fileNameForUrl})`);

            try {
                const res = await fetch(`./${fileNameForUrl}`);
                if (!res.ok) {
                    throw new Error(`${res.status} ${res.statusText}`);
                }
                const arrayBuffer = await res.arrayBuffer();
                return await audioCtx.decodeAudioData(arrayBuffer);
            } catch (e) {
                console.error(`読み込み失敗: ${baseName}${extension} (URL: ${fileNameForUrl})`, e);
                throw e;
            }
        })
    );
    return Promise.all(promises);
}

//音を再生
/**@param {AudioBuffer} buffer*/
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

//初期化
loadAllSounds().then(buffers => {
    soundBuffers = buffers;
    if(statusText) {
        statusText.textContent = "準備完了";
        statusText.style.color = "green";
    }
    setButtonsEnabled(true);
}).catch(err => {
    if(statusText) {
        statusText.textContent = "ロードエラー (opt + cmd + Cキーでコンソールを確認してください)";
        statusText.style.color = "red";
    }
    setButtonsEnabled(false);
});

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
