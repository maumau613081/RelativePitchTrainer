const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundBuffers = [];
let currentBuffer = null;
let currentSource = null;
const pitches = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
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

async function loadAllSounds () {
    const promises = pitches.flatMap(pitch =>
        cents.map(async cent =>{
            let filename = `${pitch}${cent}.wav`;
            filename = filename.replace('#', '%23').replace('+', '%2B');
            const res = await fetch(`./${filename}`);
            if (!res.ok) throw new Error(`Not found: ${filename}`);
            const arrayBuffer = await res.arrayBuffer();
            return await audioCtx.decodeAudioData(arrayBuffer);
        })
    );
    return Promise.all(promises);
}

function playSound(buffer) {
    if (!buffer) return;
    if (currentSource) {
        try {
            currentSource.stop();
        } catch (e) {
        }
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    if (audioCtx.state === `suspended`){
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
    if(statusText) {
        statusText.textContent = "ロードエラー (F12キーでコンソールを確認してください)";
        statusText.style.color = "red";
    }
    setButtonsEnabled(false);
});

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
