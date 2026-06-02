'use strict';
const fetch = require('node-fetch'); // NodeCG環境の標準フェッチを使用

// 🔴 あなたのGASの「ウェブアプリのURL（AKfycby...）」をここに貼り付けてください
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby1KWyNyHrp7gZV2_D3XP7Xlo0txsvySQ6iLSQO_tLVSH3YgkB_ncBuaY_1B6lA41Fu/exec';

module.exports = function (nodecg) {
    // ランキングデータを保持するReplicantを定義
    const rankingDataRep = nodecg.Replicant('rankingDirectData', { defaultValue: [] });

    // GASからデータを定期取得する関数
    async function fetchFromGoogle() {
        try {
            // キャッシュを回避するためにランダムなパラメータを付与
            const response = await fetch(`${GAS_WEB_APP_URL}?cache_bust=${Date.now()}`);
            if (!response.ok) return;

            const data = await response.json();
            if (data && Array.isArray(data)) {
                // Replicantの値を書き換える（これで全画面に自動反映）
                rankingDataRep.value = data;
            }
        } catch (error) {
            nodecg.log.error('Googleからのデータ取得に失敗しました:', error);
        }
    }

    // 起動時に1回実行
    fetchFromGoogle();

    // 🔴 5秒（5000ミリ秒）ごとに、自動でGoogleへデータを読みに行くタイマーを設置
    // 配信負荷に応じて 3000 (3秒) や 10000 (10秒) に調整可能です
    setInterval(fetchFromGoogle, 5000);
};
