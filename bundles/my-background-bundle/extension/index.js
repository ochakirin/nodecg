const { TwitterApi } = require('twitter-api-v2');

module.exports = function (nodecg) {
    // APIキーなどが設定されていない場合はエラーを出して止める（親切設計）
    if (!process.env.TWITTER_APP_KEY || !process.env.TWITTER_APP_SECRET) {
        nodecg.log.warn('X APIのキーが設定されていないため、X投稿機能は無効になります。');
        return;
    }

    // 環境変数（process.env.○○）からキーを読み込む
    const client = new TwitterApi({
        appKey: process.env.TWITTER_APP_KEY,
        appSecret: process.env.TWITTER_APP_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    const rwClient = client.readWrite;

    nodecg.listenFor('postToX', async (text, ack) => {
        try {
            const { data: createdTweet } = await rwClient.v2.tweet(text);
            nodecg.log.info('Xに投稿しました: ', createdTweet.id);
            
            if (ack && !ack.handled) {
                ack(null, createdTweet);
            }
        } catch (error) {
            nodecg.log.error('X投稿エラー:', error);
            if (ack && !ack.handled) {
                ack(new Error('投稿に失敗しました。'));
            }
        }
    });
};
