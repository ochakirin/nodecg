'use strict';

module.exports = function (nodecg) {
    // サーバー起動時に安全にReplicantを定義
    nodecg.Replicant('rankingDirectData', { defaultValue: [] });
};
