FROM node:20-slim

WORKDIR /app

# 依存関係のコピーとインストール
COPY package*.json ./
RUN npm install

# 全ファイルのコピー
COPY . .

# NodeCGが使用するポート（デフォルトは9090）
EXPOSE 9090

# 起動コマンド
CMD ["npm", "run", "start"]
