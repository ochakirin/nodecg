const timerRep = nodecg.Replicant('streamTimer', { defaultValue: { seconds: 0, r_state: 'stopped' } });
let timerInterval = null;

timerRep.on('change', (newVal) => {
    document.getElementById('dash-time').innerText = formatTime(newVal.seconds);
    
    if (newVal.r_state === 'running' && !timerInterval) {
        startLocalTimer();
    } else if (newVal.r_state === 'stopped' && timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
});

document.getElementById('btn-start').addEventListener('click', () => { timerRep.value.r_state = 'running'; });
document.getElementById('btn-stop').addEventListener('click', () => { timerRep.value.r_state = 'stopped'; });
document.getElementById('btn-reset').addEventListener('click', () => {
    timerRep.value.r_state = 'stopped';
    timerRep.value.seconds = 0;
});

function startLocalTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timerRep.value.r_state === 'running') {
            timerRep.value.seconds++;
        }
    }, 1000);
}

// 秒数を hh:mm:ss 形式の文字列に変換する関数
function formatTime(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}
