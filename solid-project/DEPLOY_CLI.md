# Wrangler CLIを使ったローカルデプロイ手順

Cloudflare Pagesには、Wrangler CLIを使ってローカルから直接デプロイする方法もあります。

## 前提条件

- Node.js 22以上
- Cloudflareアカウント

## 1. Wranglerのインストール

```bash
# グローバルインストール
npm install -g wrangler

# または、プロジェクト内にインストール
cd solid-project
pnpm add -D wrangler
```

## 2. Cloudflareにログイン

```bash
wrangler login
```

ブラウザが開き、Cloudflareアカウントでの認証を求められます。

## 3. プロジェクトのビルド

```bash
cd solid-project
pnpm install
pnpm build
```

## 4. Cloudflare Pagesにデプロイ

### 初回デプロイ

```bash
wrangler pages deploy dist --project-name=allin-on-stupid
```

### 2回目以降のデプロイ

```bash
wrangler pages deploy dist
```

## 5. デプロイコマンドのショートカット（オプション）

`package.json`にデプロイコマンドを追加すると便利です：

```json
{
  "scripts": {
    "dev": "vinxi dev",
    "build": "vinxi build",
    "start": "vinxi start",
    "deploy": "pnpm build && wrangler pages deploy dist",
    "version": "vinxi version"
  }
}
```

その後は以下のコマンドだけでデプロイできます：

```bash
pnpm deploy
```

## 6. ローカルプレビュー

Cloudflare Pages環境をローカルでエミュレート：

```bash
wrangler pages dev dist
```

## 7. プロジェクト情報の確認

デプロイされたプロジェクトの一覧を表示：

```bash
wrangler pages project list
```

特定のプロジェクトの詳細を表示：

```bash
wrangler pages project get allin-on-stupid
```

## 8. デプロイ履歴の確認

```bash
wrangler pages deployment list --project-name=allin-on-stupid
```

## メリット

- **迅速なデプロイ**: Git経由よりも高速
- **ローカル開発**: ローカルでCloudflare環境をテスト可能
- **CI/CD統合**: GitHub ActionsやGitLab CIに組み込み可能

## デメリット

- **手動デプロイ**: Gitプッシュでの自動デプロイは利用不可
- **プレビュー環境**: プルリクエスト用のプレビュー環境は生成されない

## 推奨される使い方

- **開発中**: Wrangler CLIで迅速にテスト
- **本番運用**: GitリポジトリとCloudflare Pagesを接続して自動デプロイ

---

**詳細**: [Wrangler公式ドキュメント](https://developers.cloudflare.com/workers/wrangler/)
