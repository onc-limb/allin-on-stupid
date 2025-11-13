import type { Accessor } from "solid-js";
import type { Difficulty, GameMode } from "./types";
import { getDifficultyLabel, getDifficultyDescription } from "./utils";

type GameSettingsProps = {
  gameMode: Accessor<GameMode>;
  difficulty: Accessor<Difficulty>;
  onGameModeChange: (mode: GameMode) => void;
  onDifficultyChange: (diff: Difficulty) => void;
  onStartGame: () => void;
};

export default function GameSettings(props: GameSettingsProps) {
  return (
    <div class="selection-screen">
      <div class="game-settings">
        <h2>ゲーム設定</h2>
        
        {/* 難易度選択 */}
        <div class="setting-section">
          <h3>難易度</h3>
          <div class="difficulty-options">
            <button 
              class={`difficulty-option ${props.difficulty() === "easy" ? "selected" : ""}`}
              onClick={() => props.onDifficultyChange("easy")}
            >
              <div class="option-name">{getDifficultyLabel("easy")}</div>
              <div class="option-desc">{getDifficultyDescription("easy")}</div>
            </button>
            <button 
              class={`difficulty-option ${props.difficulty() === "normal" ? "selected" : ""}`}
              onClick={() => props.onDifficultyChange("normal")}
            >
              <div class="option-name">{getDifficultyLabel("normal")}</div>
              <div class="option-desc">{getDifficultyDescription("normal")}</div>
            </button>
            <button 
              class={`difficulty-option ${props.difficulty() === "hard" ? "selected" : ""}`}
              onClick={() => props.onDifficultyChange("hard")}
            >
              <div class="option-name">{getDifficultyLabel("hard")}</div>
              <div class="option-desc">{getDifficultyDescription("hard")}</div>
            </button>
          </div>
        </div>

        {/* 問題数選択 */}
        <div class="setting-section">
          <h3>問題数</h3>
          <div class="mode-options">
            <button 
              class={`mode-option ${props.gameMode() === 1 ? "selected" : ""}`}
              onClick={() => props.onGameModeChange(1)}
            >
              <div class="option-number">1問</div>
              <div class="option-desc">クイック</div>
            </button>
            <button 
              class={`mode-option ${props.gameMode() === 3 ? "selected" : ""}`}
              onClick={() => props.onGameModeChange(3)}
            >
              <div class="option-number">3問</div>
              <div class="option-desc">スタンダード</div>
            </button>
            <button 
              class={`mode-option ${props.gameMode() === 5 ? "selected" : ""}`}
              onClick={() => props.onGameModeChange(5)}
            >
              <div class="option-number">5問</div>
              <div class="option-desc">チャレンジ</div>
            </button>
          </div>
        </div>

        {/* スタートボタン */}
        <button class="start-button" onClick={props.onStartGame}>
          🚀 START
        </button>
      </div>
    </div>
  );
}
