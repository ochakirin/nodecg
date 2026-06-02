'use strict';

// 🔴 ここに「デプロイを管理」からコピーした、正しい【ウェブアプリURL】を貼り付けてください
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby1KWyNyHrp7gZV2_D3XP7Xlo0txsvySQ6iLSQO_tLVSH3YgkB_ncBuaY_1B6lA41Fu/exec';

module.exports = function (nodecg) {
    
    const rankingDataRep = nodecg.Replicant('rankingDirectData', { defaultValue: [] });

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
            // 🔴 redirect: 'follow' を追加し、Googleサーバー間の転送を確実に追跡させます
            const response = await globalThis.fetch(`${GAS_WEB_APP_URL}?cache_bust=${Date.now()}`, {
                method: 'GET',
                redirect: 'follow'
            });
            
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

    // 初回実行と5秒周期タイマー
    fetchFromGoogle();
    setInterval(fetchFromGoogle, 5000);
};
