module.exports = function (nodecg) {
    // GASからのダイレクトデータを受け取るためのReplicantを登録
    nodecg.Replicant('rankingDirectData', { defaultValue: [] });
};
