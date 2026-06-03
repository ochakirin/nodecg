<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 15px; background: #f0f2f5; margin: 0; }
        .timer-display { font-size: 36px; font-family: 'Courier New', Courier, monospace; font-weight: bold; text-align: center; background: #222; color: #00ff66; padding: 15px; border-radius: 6px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); margin-bottom: 15px; }
        .btn-main-group { display: flex; gap: 8px; margin-bottom: 20px; }
        button { flex: 1; padding: 12px 0; font-size: 14px; font-weight: bold; border: none; border-radius: 5px; cursor: pointer; color: white; transition: background 0.1s; }
        #btn-start { background: #2ea44f; }
        #btn-start:hover { background: #22863a; }
        #btn-stop { background: #df3e3e; }
        #btn-stop:hover { background: #b92929; }
        #btn-reset { background: #52575c; }
        #btn-reset:hover { background: #3a3f44; }
        
        .set-container { background: white; border: 1px solid #e1e4e8; border-radius: 6px; padding: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .set-title { font-size: 12px; font-weight: bold; color: #555; margin-bottom: 8px; }
        .input-group { display: flex; align-items: center; gap: 4px; margin-bottom: 10px; }
        input[type="number"] { width: 50px; padding: 6px; font-size: 14px; border: 1px solid #ccd1d9; border-radius: 4px; text-align: center; }
        .input-label { font-size: 12px; color: #666; margin-right: 6px; }
        #btn-set { background: #009688; font-size: 12px; padding: 8px 0; }
        #btn-set:hover { background: #00796b; }
        button:disabled, input:disabled { opacity: 0.4; cursor: not-allowed; }
    </style>
</head>
<body>

    <div class="timer-display" id="time-string">00:00:00</div>

    <div class="btn-main-group">
        <button id="btn-start">スタート</button>
        <button id="btn-stop">ストップ</button>
        <button id="btn-reset">リセット</button>
    </div>

    <div class="set-container">
        <div class="set-title">⏱ 任意の時間をセット（停止時のみ）</div>
        <div class="input-group">
            <input type="number" id="input-h" min="0" max="99" value="0">
            <span class="input-label">時</span>
            <input type="number" id="input-m" min="0" max="59" value="0">
            <span class="input-label">分</span>
            <input type="number" id="input-s" min="0" max="59" value="0">
            <span class="input-label">秒</span>
        </div>
        <button id="btn-set">この時間をタイマーにセットする</button>
    </div>

    <script>
        const timerRep = nodecg.Replicant('streamTimer');

        const display = document.getElementById('time-string');
        const btnStart = document.getElementById('btn-start');
        const btnStop = document.getElementById('btn-stop');
        const btnReset = document.getElementById('btn-reset');
        const btnSet = document.getElementById('btn-set');
        
        const inputH = document.getElementById('input-h');
        const inputM = document.getElementById('input-m');
        const inputS = document.getElementById('input-s');

        // タイマーの状態変更をリアルタイムに反映
        timerRep.on('change', (newVal) => {
            if (!newVal) return;
            
            display.innerText = newVal.formatted;

            // 状態（動いているか・止まっているか）に合わせてボタンを活性・非活性化
            if (newVal.state === 'running') {
                btnStart.disabled = true;
                btnStop.disabled = false;
                btnSet.disabled = true;
                inputH.disabled = true;
                inputM.disabled = true;
                inputS.disabled = true;
            } else {
                btnStart.disabled = false;
                btnStop.disabled = true;
                btnSet.disabled = false;
                inputH.disabled = false;
                inputM.disabled = false;
                inputS.disabled = false;
            }
        });

        // 各種ボタンクリックイベント（サーバーの extension.js へメッセージを発射）
        btnStart.addEventListener('click', () => nodecg.sendMessage('startTimer'));
        btnStop.addEventListener('click', () => nodecg.sendMessage('stopTimer'));
        btnReset.addEventListener('click', () => nodecg.sendMessage('resetTimer'));

        // 時間セットボタン
        btnSet.addEventListener('click', () => {
            const h = parseInt(inputH.value) || 0;
            const m = parseInt(inputM.value) || 0;
            const s = parseInt(inputS.value) || 0;

            // すべてを秒数に換算
            const totalSeconds = (h * 3600) + (m * 60) + s;
            
            // サーバーへ「この秒数をセットして！」と送信
            nodecg.sendMessage('setTimer', totalSeconds);
        });
    </script>
</body>
</html>
