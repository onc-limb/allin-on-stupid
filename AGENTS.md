# AGENTS.md

## プロジェクト概要
このプロジェクトは、くだらないウェブゲームを集めた技術実験サイトです。  
最新のWeb技術を活用し、遊びながら学べるインタラクティブなゲーム体験を提供します。

## 技術スタック

### フロントエンド
- **SolidStart**: リアクティブなUIフレームワーク
- **TypeScript**: 型安全な開発
- **Vinxi**: モダンなビルドツール

### グラフィックス・物理演算
- **Three.js**: WebGL 3Dグラフィックスライブラリ
- **Rapier**: 高性能な物理エンジン (Rust製、WASM対応)

### パフォーマンス
- **WebAssembly (WASM)**: Rustで記述した高速計算モジュール
- ブラウザネイティブの高速処理を実現

## ディレクトリ構成

```
allin-on-stupid/
├── solid-project/          # メインのフロントエンドアプリケーション
│   ├── src/
│   │   ├── routes/         # ページルーティング
│   │   │   ├── index.tsx         # トップページ（ゲーム一覧）
│   │   │   ├── scroll-trial.tsx  # スクロールタイムトライアル
│   │   │   ├── binary-calc.tsx   # バイナリ計算練習
│   │   │   └── password-typing.tsx # パスワードタイピング練習
│   │   ├── components/     # 共通UIコンポーネント
│   │   └── lib/            # ユーティリティ関数
│   ├── public/             # 静的アセット
│   └── package.json
│
└── wasm-modules/           # WASM計算モジュール (将来的に追加)
    ├── binary-calc/        # バイナリ計算用WASMモジュール
    └── password-gen/       # パスワード生成用WASMモジュール
```

## ゲーム詳細

### 1. スクロールタイムトライアル
- **概要**: スクロール速度を競うタイムアタックゲーム
- **技術**: Three.js で3D空間を表現、Rapierで物理演算
- **特徴**: スムーズなスクロール体験と視覚エフェクト

### 2. バイナリ計算練習
- **概要**: 2進数⇔10進数の変換練習ツール
- **技術**: WASM (Rust) で高速計算、SolidJSでリアクティブUI
- **特徴**: 即座のフィードバック、難易度調整機能

### 3. 不規則文字列タイピング練習
- **概要**: ランダムなパスワード文字列でタイピング練習
- **技術**: WASM (Rust) でランダム文字列生成、精密なタイピング判定
- **特徴**: 実践的なパスワード入力の練習、統計表示

## 開発ガイドライン

### コーディング規約
- TypeScriptの厳格な型チェックを使用
- SolidJSのリアクティブパターンに従う
- コンポーネントは小さく、再利用可能に保つ

### パフォーマンス最適化
- 重い計算処理はWASMモジュールに委譲
- Three.jsのレンダリングは60fps維持を目標
- Lazy loadingで初期読み込みを最適化

### テスト
- コンポーネントの単体テスト
- WASMモジュールのRustテスト
- E2Eテストでゲームプレイの検証

## セットアップ手順

### フロントエンド
```bash
cd solid-project
pnpm install
pnpm dev
```

### WASM モジュール (将来的)
```bash
cd wasm-modules/binary-calc
cargo build --target wasm32-unknown-unknown
wasm-pack build --target web
```

## デプロイ
- **推奨**: Vercel / Netlify
- SolidStartのSSR対応
- 静的アセットのCDN配信

## 今後の拡張予定
- [ ] Three.js統合
- [ ] Rapier物理エンジン統合
- [ ] WASMモジュールの実装
- [ ] 追加ゲームの開発
- [ ] スコアランキング機能
- [ ] PWA対応

## コントリビューション
プルリクエスト歓迎です！  
バグ報告や新しいゲームのアイデアもお待ちしています。

## 連絡先
GitHub Issues でお気軽にご連絡ください。
