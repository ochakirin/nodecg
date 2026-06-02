'use strict';

// あなたのGASの「ウェブアプリのURL」
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby1KWyNyHrp7gZV2_D3XP7Xlo0txsvySQ6iLSQO_tLVSH3YgkB_ncBuaY_1B6lA41Fu/exec';

module.exports = function (nodecg) {
    // 🔴 タイマーが正常に動作するためのReplicantを定義
    nodecg.Replicant('streamTimer', { defaultValue: { seconds: 0, formatted: '00:00:00' } });
    
    // ランキングデータを保持するReplicant
    const rankingDataRep = nodecg.Replicant('rankingDirectData', { defaultValue: [] });

    // 1899年の日時オブジェクトを経過時間(HH:MM:SS)の文字列に変換する関数
    function formatGasTime(timeVal) {
        if (!timeVal || timeVal === '-') return '--:--:--';
        
        if (timeVal instanceof Date || (typeof timeVal === 'string' && timeVal.includes('GMT'))) {
            const d = new Date(timeVal);
            const hrs = d.getHours().toString().padStart(2, '0');
            const mins = d.getMinutes().toString().padStart(2, '0');
            const secs = d.getSeconds().toString().padStart(2, '0');
            return `${hrs}:${mins}:${secs}`;
        }
        
        return timeVal.toString();
    }

    async function fetchFromGoogle() {
        try {
            // 🔴 【超重要修正】NodeCGの内部処理と衝突しないよう「globalThis.fetch」に書き換えました
            const response = await globalThis.fetch(`${GAS_WEB_APP_URL}?cache_bust=${Date.now()}`);
            if (!response.ok) return;

            const data = await response.json();
            if (data && Array.isArray(data)) {
                const formattedData = data.map(team => {
                    return {
                        name: team.name,
                        lapCount: team.lapCount,
                        lastTime: formatGasTime(team.lastTime)
                    };
                });

                rankingDataRep.value = formattedData;
            }
        } catch (error) {
            nodecg.log.error('Googleからのデータ取得に失敗しました:', error);
        }
    }

    // 起動時に実行
    fetchFromGoogle();

    // 5秒ごとに自動実行
    setInterval(fetchFromGoogle, 5000);
};
