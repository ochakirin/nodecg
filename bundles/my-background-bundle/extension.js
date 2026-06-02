'use strict';

// 🔴 1行目にあった const fetch = require('node-fetch'); を削除しました
// NodeCG(Node.js v18以降)は標準で fetch が使えるため、何も読み込まなくて大丈夫です

// あなたのGASの「ウェブアプリのURL」
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby1KWyNyHrp7gZV2_D3XP7Xlo0txsvySQ6iLSQO_tLVSH3YgkB_ncBuaY_1B6lA41Fu/exec';

module.exports = function (nodecg) {
    const rankingDataRep = nodecg.Replicant('rankingDirectData', { defaultValue: [] });

    async function fetchFromGoogle() {
        try {
            // 標準の global.fetch をそのまま使用します
            const response = await fetch(`${GAS_WEB_APP_URL}?cache_bust=${Date.now()}`);
            if (!response.ok) return;

            const data = await response.json();
            if (data && Array.isArray(data)) {
                rankingDataRep.value = data;
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
