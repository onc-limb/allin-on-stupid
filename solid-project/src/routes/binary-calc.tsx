import { Title } from "@solidjs/meta";
import { createSignal, onMount } from "solid-js";
import "./binary-calc.css";

export default function BinaryCalc() {
  const [mode, setMode] = createSignal<"bin-to-dec" | "dec-to-bin">("bin-to-dec");
  const [question, setQuestion] = createSignal("");
  const [answer, setAnswer] = createSignal("");
  const [userAnswer, setUserAnswer] = createSignal("");
  const [feedback, setFeedback] = createSignal<"correct" | "incorrect" | null>(null);
  const [difficulty, setDifficulty] = createSignal<"easy" | "medium" | "hard">("medium");
  const [stats, setStats] = createSignal({
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0,
  });

  const generateQuestion = () => {
    const levels = {
      easy: { min: 0, max: 15 },
      medium: { min: 0, max: 255 },
      hard: { min: 0, max: 65535 },
    };

    const { min, max } = levels[difficulty()];
    const decimal = Math.floor(Math.random() * (max - min + 1)) + min;
    const binary = decimal.toString(2);

    if (mode() === "bin-to-dec") {
      setQuestion(binary);
      setAnswer(decimal.toString());
    } else {
      setQuestion(decimal.toString());
      setAnswer(binary);
    }

    setUserAnswer("");
    setFeedback(null);
  };

  const checkAnswer = () => {
    if (!userAnswer().trim()) return;

    const isCorrect = userAnswer().trim() === answer();
    setFeedback(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      const newCorrect = stats().correct + 1;
      const newStreak = stats().streak + 1;
      setStats({
        correct: newCorrect,
        incorrect: stats().incorrect,
        streak: newStreak,
        bestStreak: Math.max(newStreak, stats().bestStreak),
      });

      setTimeout(() => {
        generateQuestion();
      }, 1000);
    } else {
      setStats({
        correct: stats().correct,
        incorrect: stats().incorrect + 1,
        streak: 0,
        bestStreak: stats().bestStreak,
      });
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  };

  const changeDifficulty = (level: "easy" | "medium" | "hard") => {
    setDifficulty(level);
    generateQuestion();
  };

  const changeMode = (newMode: "bin-to-dec" | "dec-to-bin") => {
    setMode(newMode);
    generateQuestion();
  };

  const resetStats = () => {
    setStats({
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0,
    });
    generateQuestion();
  };

  onMount(() => {
    generateQuestion();
  });

  return (
    <main class="binary-calc-container">
      <Title>バイナリ計算練習 - All In On Stupid</Title>

      <div class="game-header">
        <h1>🔢 バイナリ計算練習</h1>
        <p>2進数と10進数の変換を練習しよう！</p>
      </div>

      <div class="controls">
        <div class="mode-selector">
          <label>変換モード:</label>
          <button
            class={`mode-btn ${mode() === "bin-to-dec" ? "active" : ""}`}
            onClick={() => changeMode("bin-to-dec")}
          >
            2進数 → 10進数
          </button>
          <button
            class={`mode-btn ${mode() === "dec-to-bin" ? "active" : ""}`}
            onClick={() => changeMode("dec-to-bin")}
          >
            10進数 → 2進数
          </button>
        </div>

        <div class="difficulty-selector">
          <label>難易度:</label>
          <button
            class={`difficulty-btn ${difficulty() === "easy" ? "active" : ""}`}
            onClick={() => changeDifficulty("easy")}
          >
            初級 (0-15)
          </button>
          <button
            class={`difficulty-btn ${difficulty() === "medium" ? "active" : ""}`}
            onClick={() => changeDifficulty("medium")}
          >
            中級 (0-255)
          </button>
          <button
            class={`difficulty-btn ${difficulty() === "hard" ? "active" : ""}`}
            onClick={() => changeDifficulty("hard")}
          >
            上級 (0-65535)
          </button>
        </div>
      </div>

      <div class="stats-panel">
        <div class="stat-item">
          <span class="stat-label">正解</span>
          <span class="stat-value correct">{stats().correct}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">不正解</span>
          <span class="stat-value incorrect">{stats().incorrect}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">連続正解</span>
          <span class="stat-value streak">{stats().streak}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">最高連続</span>
          <span class="stat-value best-streak">{stats().bestStreak}</span>
        </div>
      </div>

      <div class="game-area">
        <div class="question-card">
          <div class="question-label">
            {mode() === "bin-to-dec" ? "2進数" : "10進数"}
          </div>
          <div class="question-value">{question()}</div>
        </div>

        <div class="arrow">↓</div>

        <div class={`answer-section ${feedback() || ""}`}>
          <label class="answer-label">
            {mode() === "bin-to-dec" ? "10進数" : "2進数"}
          </label>
          <input
            type="text"
            class="answer-input"
            value={userAnswer()}
            onInput={(e) => setUserAnswer(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            placeholder="答えを入力..."
            autofocus
          />
          <button class="check-button" onClick={checkAnswer}>
            チェック
          </button>
        </div>

        {feedback() && (
          <div class={`feedback-message ${feedback()}`}>
            {feedback() === "correct" ? (
              <>
                <span class="feedback-icon">✅</span>
                <span>正解！</span>
              </>
            ) : (
              <>
                <span class="feedback-icon">❌</span>
                <span>不正解。正解は {answer()} です。</span>
                <button class="next-button" onClick={() => generateQuestion()}>
                  次の問題
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div class="helper-section">
        <h3>変換早見表</h3>
        <div class="conversion-table">
          <div class="table-header">
            <span>10進数</span>
            <span>2進数</span>
          </div>
          {Array.from({ length: 16 }, (_, i) => (
            <div class="table-row">
              <span>{i}</span>
              <span>{i.toString(2).padStart(4, "0")}</span>
            </div>
          ))}
        </div>
        <button class="reset-button" onClick={resetStats}>
          統計をリセット
        </button>
      </div>
    </main>
  );
}
