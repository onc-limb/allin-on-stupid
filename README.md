# allin-on-stupid
くだらないことに全賭け

## 概要
くだらないウェブゲームを集めた技術実験サイトです。  
遊びながら最新のWeb技術を試せる場所を目指しています。

## 使用技術
- **フロントエンド**: [SolidStart](https://start.solidjs.com/)
- **3Dグラフィック**: [Three.js](https://threejs.org/)
- **物理エンジン**: [Rapier](https://rapier.rs/)
- **ブラウザ上計算**: WASM (Rust)

## プロジェクト構成
```
.
├── solid-project/      # フロントエンドアプリケーション (SolidStart)
│   ├── src/
│   │   ├── routes/     # ページルーティング
│   │   └── components/ # UIコンポーネント
│   └── public/         # 静的ファイル
└── wasm-modules/       # Rust/WASMモジュール (予定)
```

## ゲーム一覧
- **スクロールタイムトライアル** - スクロール速度を競うゲーム
- **バイナリ計算練習** - 2進数計算の練習ツール
- **不規則文字列タイピング練習** - ランダムなパスワード文字列でタイピング練習

## 開発環境セットアップ
```bash
# リポジトリのクローン
git clone https://github.com/onc-limb/allin-on-stupid.git
cd allin-on-stupid

# フロントエンドの起動
cd solid-project
pnpm install
pnpm dev
```

開発サーバーは http://localhost:3000 で起動します。

## 必要環境
- Node.js >= 22
- pnpm
- Rust & wasm-pack (WASM開発時)

## ライセンス
MIT
