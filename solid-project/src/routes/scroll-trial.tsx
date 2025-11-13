import { Title } from "@solidjs/meta";
import ScrollTrialGame from "../components/ScrollTrialGame";
import "./scroll-trial.css";

export default function ScrollTrial() {
  return (
    <main class="scroll-trial-container">
      <Title>スクロールタイムアタック - All In On Stupid</Title>

      <div class="game-header">
        <h1>🏃 スクロールタイムアタック</h1>
        <p>できるだけ早く一番下までスクロールしよう！</p>
      </div>

      <ScrollTrialGame />
    </main>
  );
}
