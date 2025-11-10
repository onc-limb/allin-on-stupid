import { Title } from "@solidjs/meta";
import { createSignal, onMount } from "solid-js";
import "./password-typing.css";

export default function PasswordTyping() {
  const [targetPassword, setTargetPassword] = createSignal("");
  const [userInput, setUserInput] = createSignal("");
  const [startTime, setStartTime] = createSignal<number | null>(null);
  const [elapsedTime, setElapsedTime] = createSignal(0);
  const [isComplete, setIsComplete] = createSignal(false);
  const [difficulty, setDifficulty] = createSignal<"easy" | "medium" | "hard">("medium");
  const [stats, setStats] = createSignal({
    accuracy: 100,
    wpm: 0,
    totalAttempts: 0,
    bestTime: null as number | null,
  });

  let intervalId: number | undefined;

  const generatePassword = (level: "easy" | "medium" | "hard") => {
    const lengths = { easy: 8, medium: 12, hard: 16 };
    const charSets = {
      easy: "abcdefghijklmnopqrstuvwxyz0123456789",
      medium: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      hard: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?",
    };

    const length = lengths[level];
    const charset = charSets[level];
    let password = "";

    for (let i = 0; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    return password;
  };

  const startNewGame = () => {
    const newPassword = generatePassword(difficulty());
    setTargetPassword(newPassword);
    setUserInput("");
    setStartTime(null);
    setElapsedTime(0);
    setIsComplete(false);
  };

  const handleInput = (e: InputEvent) => {
    const input = (e.target as HTMLInputElement).value;
    setUserInput(input);

    if (!startTime() && input.length > 0) {
      setStartTime(Date.now());
      intervalId = window.setInterval(() => {
        if (startTime()) {
          setElapsedTime(Date.now() - startTime()!);
        }
      }, 10);
    }

    if (input === targetPassword()) {
      finishGame();
    }
  };

  const finishGame = () => {
    setIsComplete(true);
    if (intervalId) {
      clearInterval(intervalId);
    }

    const time = elapsedTime();
    const chars = targetPassword().length;
    const minutes = time / 60000;
    const wpm = Math.round(chars / 5 / minutes);

    setStats({
      accuracy: 100,
      wpm,
      totalAttempts: stats().totalAttempts + 1,
      bestTime: !stats().bestTime || time < stats().bestTime! ? time : stats().bestTime,
    });
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds}.${milliseconds.toString().padStart(3, "0")}秒`;
  };

  const getCharacterClass = (index: number) => {
    if (index >= userInput().length) return "";
    return userInput()[index] === targetPassword()[index] ? "correct" : "incorrect";
  };

  onMount(() => {
    startNewGame();
  });

  return (
    <main class="password-typing-container">
      <Title>パスワードタイピング練習 - All In On Stupid</Title>

      <div class="game-header">
        <h1>🔐 パスワードタイピング練習</h1>
        <p>表示されたパスワードを正確に入力しよう！</p>
      </div>

      <div class="difficulty-selector">
        <label>難易度:</label>
        <button
          class={`difficulty-btn ${difficulty() === "easy" ? "active" : ""}`}
          onClick={() => {
            setDifficulty("easy");
            startNewGame();
          }}
        >
          初級 (8文字)
        </button>
        <button
          class={`difficulty-btn ${difficulty() === "medium" ? "active" : ""}`}
          onClick={() => {
            setDifficulty("medium");
            startNewGame();
          }}
        >
          中級 (12文字)
        </button>
        <button
          class={`difficulty-btn ${difficulty() === "hard" ? "active" : ""}`}
          onClick={() => {
            setDifficulty("hard");
            startNewGame();
          }}
        >
          上級 (16文字)
        </button>
      </div>

      <div class="stats-panel">
        <div class="stat-item">
          <span class="stat-label">タイム</span>
          <span class="stat-value">{formatTime(elapsedTime())}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">WPM</span>
          <span class="stat-value">{stats().wpm}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">挑戦回数</span>
          <span class="stat-value">{stats().totalAttempts}</span>
        </div>
        {stats().bestTime && (
          <div class="stat-item">
            <span class="stat-label">ベストタイム</span>
            <span class="stat-value best">{formatTime(stats().bestTime!)}</span>
          </div>
        )}
      </div>

      <div class="game-area">
        <div class="password-display">
          {targetPassword()
            .split("")
            .map((char, index) => (
              <span class={`char ${getCharacterClass(index)}`}>{char}</span>
            ))}
        </div>

        <input
          type="text"
          class="password-input"
          value={userInput()}
          onInput={handleInput}
          placeholder="ここに入力..."
          disabled={isComplete()}
          autofocus
        />

        {isComplete() && (
          <div class="complete-message">
            <h2>🎉 完了！</h2>
            <p>タイム: {formatTime(elapsedTime())}</p>
            <p>WPM: {stats().wpm}</p>
            <button class="next-button" onClick={startNewGame}>
              次の問題
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
