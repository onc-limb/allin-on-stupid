import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import "./index.css";

export default function Home() {
  const games = [
    {
      title: "スクロールタイムアタック",
      description: "スクロール速度を競うタイムアタックゲーム。Three.jsで3D空間を表現し、Rapierで物理演算を実装予定。",
      path: "/scroll-trial",
      icon: "🏃",
      status: "開発中"
    },
    {
      title: "パスワードタイピング練習",
      description: "ランダムなパスワード文字列でタイピング練習。WASMで高速な文字列生成を実装予定。",
      path: "/password-typing",
      icon: "🔐",
      status: "開発中"
    },
    {
      title: "バイナリ計算練習",
      description: "2進数⇔10進数の変換練習ツール。WASMで高速計算を実装予定。",
      path: "/binary-calc",
      icon: "🔢",
      status: "開発中"
    }
  ];

  return (
    <main class="home-container">
      <Title>All In On Stupid - くだらないゲームで技術を学ぶ</Title>
      
      <section class="hero">
        <h1 class="hero-title">All In On Stupid</h1>
        <p class="hero-subtitle">くだらないゲームで遊ぼう</p>
      </section>

      <section class="games-section">
        <h2 class="section-title">ゲーム一覧</h2>
        <div class="games-grid">
          {games.map((game) => (
            <A href={game.path} class="game-card">
              <div class="game-icon">{game.icon}</div>
              <h3 class="game-title">{game.title}</h3>
              <p class="game-description">{game.description}</p>
              <span class="game-status">{game.status}</span>
            </A>
          ))}
        </div>
      </section>

      <section class="tech-stack">
        <h2 class="section-title">使用技術</h2>
        <div class="tech-grid">
          <div class="tech-item">
            <h3>SolidStart</h3>
            <p>リアクティブなUIフレームワーク</p>
          </div>
          <div class="tech-item">
            <h3>Three.js</h3>
            <p>WebGL 3Dグラフィックス</p>
          </div>
          <div class="tech-item">
            <h3>Rapier</h3>
            <p>高性能な物理エンジン</p>
          </div>
          <div class="tech-item">
            <h3>WebAssembly</h3>
            <p>Rust製の高速計算モジュール</p>
          </div>
        </div>
      </section>
    </main>
  );
}
