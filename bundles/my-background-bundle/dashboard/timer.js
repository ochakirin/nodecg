// タイマーのデータを保持するReplicantを作成 (初期値: 秒数0、停止状態)
const timerRep = nodecg.Replicant('streamTimer', { defaultValue: { seconds: 0, r_state: 'stopped' } });

let timerInterval = null;

// Replicantの値が変更されたら、管理画面上の数字も更新する
timerRep.on('change', (newVal) => {
    document.getElementById('dash-time').innerText = formatTime(newVal.seconds);
    
    // 別のブラウザタブで開いたときなどのために、状態を同期してタイマーを動かす/止める
    if (newVal.r_state === 'running' && !timerInterval) {
        startLocalTimer();
    } else if (newVal.r_state === 'stopped' && timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
});

// ボタンのクリックイベント
document.getElementById('btn-start').addEventListener('click', () => {
    timerRep.value.r_state = 'running';
});

document.getElementById('btn-stop').addEventListener('click', () => {
    timerRep.value.r_state = 'stopped';
});

document.getElementById('btn-reset').addEventListener('click', () => {
    timerRep.value.r_state = 'stopped';
    timerRep.value.seconds = 0;
});

// 1秒ごとにカウントアップする関数
function startLocalTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timerRep.value.r_state === 'running') {
            timerRep.value.seconds++;
        }
    }, 1000);
}

// 秒数を「00:00」の形式に変換するヘルパー関数
function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}
