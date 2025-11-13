import type { Accessor } from "solid-js";
import type { Difficulty, GameMode } from "./types";
import { formatTime, getDifficultyLabel } from "./utils";
import "./GameResult.css";

type GameResultProps = {
  gameFinished: Accessor<boolean>;
  gameFailed: Accessor<boolean>;
  totalElapsedTime: Accessor<number>;
  difficulty: Accessor<Difficulty>;
  gameMode: Accessor<GameMode>;
  currentQuestionIndex: Accessor<number>;
  onResetGame: () => void;
};

export default function GameResult(props: GameResultProps) {
  if (props.gameFinished()) {
    return (
      <div class="game-finished">
        <h2>🎉 全問正解！</h2>
        <div class="congratulation-message">
          <p>お疲れ様でした！あなたは<strong>{Math.floor(props.totalElapsedTime() / 1000)}秒を無駄にしました</strong>。</p>
          <p class="thank-you">(遊んでくれてありがとう)</p>
        </div>
        <div class="final-stats">
          <div class="stat-item">
            <span class="stat-label">難易度</span>
            <span class="stat-value">{getDifficultyLabel(props.difficulty())}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">問題数</span>
            <span class="stat-value">{props.gameMode()}問</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">クリアタイム</span>
            <span class="stat-value highlight">{formatTime(props.totalElapsedTime())}</span>
          </div>
        </div>
        <button class="restart-button" onClick={props.onResetGame}>
          最初に戻る
        </button>
      </div>
    );
  }

  if (props.gameFailed()) {
    return (
      <div class="game-failed">
        <h2>😢 残念！不正解</h2>
        <div class="failed-info">
          <div class="sarcasm-message">
            <p>これ以上時間を無駄にしなくてよかったですね</p>
            <p class="thank-you">(遊んでくれてありがとう)</p>
          </div>
          <div class="final-stats">
            <div class="stat-item">
              <span class="stat-label">到達問題数</span>
              <span class="stat-value">{props.currentQuestionIndex() + 1} / {props.gameMode()}問</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">経過時間</span>
              <span class="stat-value">{formatTime(props.totalElapsedTime())}</span>
            </div>
          </div>
        </div>
        <button class="restart-button" onClick={props.onResetGame}>
          最初に戻る
        </button>
      </div>
    );
  }

  return null;
}
