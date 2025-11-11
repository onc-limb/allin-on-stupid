# Cloudflare Pages デプロイ - クイックリファレンス

## 🚀 簡単デプロイ手順

### 1️⃣ ローカルでテスト
```bash
cd solid-project
pnpm install
pnpm build
```

### 2️⃣ Cloudflare Pages設定

#### ビルド設定
```
Production branch:       main
Build command:          cd solid-project && pnpm install && pnpm build
Build output directory: solid-project/dist
Root directory:         /
```

#### 環境変数（推奨）
```
NODE_VERSION=22
```

### 3️⃣ デプロイ実行
- Gitにプッシュすると自動デプロイ
- 初回は手動で「Save and Deploy」

## 📋 チェックリスト

- [ ] `app.config.ts`にCloudflare Pagesプリセット設定済み
- [ ] ローカルでビルド成功確認
- [ ] Cloudflareアカウント作成
- [ ] Gitリポジトリ接続
- [ ] ビルド設定入力
- [ ] デプロイ実行
- [ ] 全ページの動作確認

## 🔗 重要なリンク

- [詳細手順書](./DEPLOY.md)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [SolidStart Deployment Docs](https://start.solidjs.com/getting-started/deployment#cloudflare-pages)

## 💡 トラブルシューティング

**ビルドエラー**
→ `NODE_VERSION=22`を環境変数に設定

**404エラー**
→ `app.config.ts`のプリセット設定を確認

**Three.jsが動かない**
→ ブラウザコンソールでエラー確認
