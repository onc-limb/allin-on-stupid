import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import "./index.css";

export default function Home() {
  const games = [
    {
      title: "スクロールタイムアタック",
      description: "スクロール速度を競うタイムアタックゲーム。",
      path: "/scroll-trial",
      icon: "🏃",
      status: "開発中"
    },
    {
      title: "パスワードタイピング練習",
      description: "ランダムなパスワード文字列でタイピング練習。",
      path: "/password-typing",
      icon: "🔐",
      status: "開発中"
    },
    {
      title: "バイナリ計算練習",
      description: "進数変換/16進数四則演算練習ツール。",
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
    </main>
  );
}
