# Node.js の軽量版イメージを使用
FROM node:22-alpine

# 作業ディレクトリ
WORKDIR /app

# 先に依存関係の定義ファイルをコピー
COPY package*.json ./

# 必要なパッケージをインストール
RUN npm install

# Express のソースコードをコピー
COPY server.js ./

# Express のポート
EXPOSE 3000

# 開発用サーバーを起動
CMD ["npm", "start"]
