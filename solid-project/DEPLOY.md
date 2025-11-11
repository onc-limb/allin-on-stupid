# Cloudflare Pages デプロイ手順

このドキュメントでは、SolidStartプロジェクトをCloudflare Pagesにデプロイする手順を説明します。

## 前提条件

- Cloudflareアカウント（無料で作成可能）
- Gitリポジトリ（GitHub、GitLab、Bitbucket）
- Node.js 22以上がインストールされていること

## 1. プロジェクトの準備

### 1.1 依存関係の確認

プロジェクトには既にCloudflare Pages用の設定が含まれています：

- `app.config.ts`に`cloudflare-pages`プリセットが設定済み
- ビルドスクリプトが`package.json`に定義済み

### 1.2 ローカルでビルドテスト

デプロイ前に、ローカルでビルドが成功することを確認してください：

```bash
cd solid-project
pnpm install
pnpm build
```

ビルドが成功すると、`dist`ディレクトリが生成されます（`cloudflare-pages`プリセット使用時）。

## 2. Cloudflare Pagesでのセットアップ

### 2.1 Cloudflare Dashboardにアクセス

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)にログイン
2. 左サイドバーから「Workers & Pages」を選択
3. 「Create application」ボタンをクリック
4. 「Pages」タブを選択
5. 「Connect to Git」をクリック

### 2.2 Gitリポジトリの接続

1. GitHub/GitLab/Bitbucketから、デプロイしたいリポジトリを選択
2. リポジトリ名: `allin-on-stupid` を選択
3. 「Begin setup」をクリック

### 2.3 ビルド設定

以下の設定を入力してください：

| 設定項目 | 値 |
|---------|-----|
| **Project name** | `allin-on-stupid` （任意の名前） |
| **Production branch** | `main` |
| **Build command** | `cd solid-project && pnpm install && pnpm build` |
| **Build output directory** | `solid-project/dist` |
| **Root directory** | `/` （ルートのまま） |

### 2.4 環境変数の設定（必要に応じて）

現在のプロジェクトでは特に必要ありませんが、将来的にAPI KEYなどが必要になった場合：

1. 「Environment variables」セクションを展開
2. 「Add variable」をクリック
3. 変数名と値を入力

例：
```
NODE_VERSION=22
```

### 2.5 デプロイ実行

1. 「Save and Deploy」をクリック
2. ビルドプロセスが開始されます（数分かかります）
3. ビルドログをリアルタイムで確認できます

## 3. デプロイ後の確認

### 3.1 サイトの確認

デプロイが成功すると、以下のようなURLでアクセスできます：

```
https://allin-on-stupid.pages.dev
```

または、カスタムドメインを設定することも可能です。

### 3.2 動作確認

以下のページが正常に表示されることを確認してください：

- トップページ: `/`
- スクロールタイムトライアル: `/scroll-trial`
- バイナリ計算練習: `/binary-calc`
- パスワードタイピング練習: `/password-typing`
- Aboutページ: `/about`

## 4. 継続的デプロイ（CI/CD）

Gitリポジトリに接続している場合、以下の動作が自動化されます：

- **mainブランチへのプッシュ** → 本番環境に自動デプロイ
- **プルリクエスト作成** → プレビュー環境を自動生成
- **プルリクエストマージ** → 本番環境に自動デプロイ

### プレビューデプロイ

各プルリクエストには固有のプレビューURLが生成されます：

```
https://[commit-hash].allin-on-stupid.pages.dev
```

## 5. カスタムドメインの設定（オプション）

独自ドメインを使用する場合：

1. Cloudflare Dashboardの該当プロジェクトページへ移動
2. 「Custom domains」タブを選択
3. 「Set up a custom domain」をクリック
4. ドメイン名を入力（例: `games.example.com`）
5. DNS設定の指示に従ってCNAMEレコードを追加

## 6. トラブルシューティング

### ビルドエラーが発生する場合

**症状**: ビルドが失敗する

**対処法**:
1. ローカルで`pnpm build`が成功することを確認
2. Cloudflareの環境変数で`NODE_VERSION=22`を設定
3. ビルドコマンドを確認: `cd solid-project && pnpm install && pnpm build`

### 404エラーが発生する場合

**症状**: ページ遷移で404エラー

**対処法**:
- SolidStartのCloudflare Pagesプリセットは自動でルーティングを処理します
- `app.config.ts`で`preset: "cloudflare-pages"`が設定されていることを確認

### Three.jsが動作しない場合

**症状**: 3D描画が表示されない

**対処法**:
1. ブラウザのコンソールでエラーを確認
2. WASMやWebGLがCloudflare Pages上で正常に動作することを確認
3. 必要に応じてContent Security Policyを調整

## 7. パフォーマンス最適化

Cloudflare Pagesは以下の最適化を自動で提供します：

- **グローバルCDN**: 世界中のエッジロケーションからコンテンツ配信
- **自動キャッシング**: 静的アセットの最適なキャッシュ
- **HTTP/3サポート**: 最新プロトコルでの高速配信
- **自動圧縮**: Brotli/Gzip圧縮

## 8. コスト

Cloudflare Pagesの無料プランで以下が利用可能：

- **ビルド数**: 月500回まで
- **帯域幅**: 無制限
- **リクエスト数**: 無制限
- **同時ビルド**: 1つ

大規模なプロジェクトの場合は有料プラン（$20/月〜）を検討してください。

## 9. 関連リンク

- [Cloudflare Pages公式ドキュメント](https://developers.cloudflare.com/pages/)
- [SolidStart公式ドキュメント](https://start.solidjs.com/)
- [SolidStart Cloudflare Pages アダプター](https://start.solidjs.com/getting-started/deployment#cloudflare-pages)

## 10. サポート

問題が発生した場合：

1. Cloudflare Dashboardのビルドログを確認
2. [Cloudflare Community](https://community.cloudflare.com/)で質問
3. [SolidJS Discord](https://discord.com/invite/solidjs)で相談
4. GitHub Issuesでバグ報告

---

**最終更新**: 2025年11月11日
