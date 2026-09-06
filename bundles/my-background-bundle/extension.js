'use strict';

// 1. ファイルの一番上に require を配置する
const { TwitterApi } = require('twitter-api-v2');

// 2. module.exports はファイル内で1回だけにする
module.exports = function (nodecg) {
    
    // ==========================================
    // タイマー関連のコード
    // ==========================================
    // タイマーの状態を管理するReplicant
    // state: 'stop' (停止中) / 'running' (動作中)
    const timerRep = nodecg.Replicant('streamTimer', { 
        defaultValue: { 
            seconds: 0, 
            formatted: '00:00:00',
            state: 'stop',
            baseSeconds: 0 // セットされた開始秒数を記憶
        } 
    });

    let timerInterval = null;
    let startTime = 0; // スタートした瞬間のJSTタイムスタンプ

    // 秒数を「HH:MM:SS」の文字列に変換するヘルパー
    function formatTime(totalSeconds) {
        const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    }

    // 🔴 外部（パネル）から命令を受け取るリスナー
    // タイマー開始
    nodecg.listenFor('startTimer', () => {
        if (timerRep.value.state === 'running') return;

        timerRep.value.state = 'running';
        // スタートした「今」のJSTタイムスタンプ(ミリ秒)を記録
        startTime = Date.now();

        // 100ミリ秒ごとに超高頻度でチェック・JST時間と補正同期
        timerInterval = setInterval(() => {
            const now = Date.now();
            // スタートしてからの実際の経過時間（秒）をミリ秒から逆算
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            
            // 🔴 経過時間 ＋ 開始時にセットされていたベース時間を足す（これでJSTと完全連動）
            timerRep.value.seconds = timerRep.value.baseSeconds + elapsedSeconds;
            timerRep.value.formatted = formatTime(timerRep.value.seconds);
        }, 100);
    });

    // タイマー停止
    nodecg.listenFor('stopTimer', () => {
        if (timerRep.value.state === 'stop') return;

        clearInterval(timerInterval);
        timerRep.value.state = 'stop';
        // 停止した時点の秒数を、次回のベース秒数として保存
        timerRep.value.baseSeconds = timerRep.value.seconds;
    });

    // タイマーリセット
    nodecg.listenFor('resetTimer', () => {
        clearInterval(timerInterval);
        timerRep.value.state = 'stop';
        timerRep.value.seconds = 0;
        timerRep.value.baseSeconds = 0;
        timerRep.value.formatted = '00:00:00';
    });

    // 🔴 任意の時間をセットする命令
    nodecg.listenFor('setTimer', (customSeconds) => {
        if (timerRep.value.state === 'running') return; // 動いている時は変更不可

        timerRep.value.seconds = customSeconds;
        timerRep.value.baseSeconds = customSeconds;
        timerRep.value.formatted = formatTime(customSeconds);
    });

    // ==========================================
    // X投稿用のコード
    // ==========================================
    if (process.env.TWITTER_APP_KEY && process.env.TWITTER_APP_SECRET) {
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
    } else {
        nodecg.log.warn('X APIのキーが設定されていないため、X投稿機能は無効になります。');
    }
};
