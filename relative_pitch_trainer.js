const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundBuffers = [];
let currentBuffer = null;
let currentSource = null;
    const pitches = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
    const cents = ['-50ct', '-40ct', '-30ct', '-20ct', '-10ct', '+-0ct', '10ct', '20ct', '30ct', '40ct'];

async function loadAllSounds () {

    const promises = pitches.flatMap(pitch =>
        cents.map(async cent =>{
            const res = await fetch(`./${pitch}${cent}ct.wav`);
            if (!res.ok) throw new Error(`Not found: ${pitch}${cent}`);
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
            console.log(`音声の停止に失敗しました: ${e}`);
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
    console.log("全ての音源のロードが完了しました");
}).catch(err => console.error(`ロードエラー: ${err}`));


const randomBtn = document.getElementById('randomBtn');
const againBtn = document.getElementById('againBtn');
const playCBtn = document.getElementById('playCBtn');
const answerBtn = document.getElementById('answerBtn');
const usageBtn = document.getElementById('usageBtn');
const answerLi = document.querySelector(`.answer`);

randomBtn.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * soundBuffers.length);
    currentBuffer = soundBuffers[randomIndex];
    answerLi.textContent = "";
    playSound(currentBuffer);
});

againBtn.addEventListener('click', () => {
    playSound(currentBuffer);
});

playCBtn.addEventListener('click', () => {
    if (soundBuffers.length === 0) return;
    currentBuffer = soundBuffers[5];
    playSound(currentBuffer);
});

answerBtn.addEventListener('click', () => {
    if (!currentBuffer) {
        alert("まずは音を再生してください。");
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
