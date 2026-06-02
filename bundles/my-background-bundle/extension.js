'use strict';

const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby1KWyNyHrp7gZV2_D3XP7Xlo0txsvySQ6iLSQO_tLVSH3YgkB_ncBuaY_1B6lA41Fu/exec';

module.exports = function (nodecg) {
    // 🔴 タイマーが正常に動作するためのReplicantを明示的に定義
    nodecg.Replicant('streamTimer', { defaultValue: { seconds: 0, formatted: '00:00:00' } });
    
    // ランキングデータを保持するReplicant
    const rankingDataRep = nodecg.Replicant('rankingDirectData', { defaultValue: [] });

    // 🔴 1899年の日時オブジェクトを経過時間(HH:MM:SS)の文字列に変換する関数
    function formatGasTime(timeVal) {
        if (!timeVal || timeVal === '-') return '--:--:--';
        
        // 文字列として「GMT」や「Japan Standard Time」が含まれている、またはDate型の場合
        if (timeVal instanceof Date || (typeof timeVal === 'string' && timeVal.includes('GMT'))) {
            const d = new Date(timeVal);
            // 1899年12月30日を基準とした時間・分・秒を抽出
            const hrs = d.getHours().toString().padStart(2, '0');
            const mins = d.getMinutes().toString().padStart(2, '0');
            const secs = d.getSeconds().toString().padStart(2, '0');
            return `${hrs}:${mins}:${secs}`;
        }
        
        return timeVal.toString(); // すでに正常な文字列ならそのまま返す
    }

    async function fetchFromGoogle() {
        try {
            const response = await fetch(`${GAS_WEB_APP_URL}?cache_bust=${Date.now()}`);
            if (!response.ok) return;

            const data = await response.json();
            if (data && Array.isArray(data)) {
                // 🔴 取得した全チームのタイムをチェックし、日時化していたら強制変換
                const毎チームのデータ = data.map(team => {
                    return {
                        name: team.name,
                        lapCount: team.lapCount,
                        lastTime: formatGasTime(team.lastTime) // ここでクレンジング
                    };
                });

                rankingDataRep.value = 毎チームのデータ;
            }
        } catch (error) {
            nodecg.log.error('Googleからのデータ取得に失敗しました:', error);
        }
    }

    // 5秒ごとに自動同期
    fetchFromGoogle();
    setInterval(fetchFromGoogle, 5000);
};
