import { Title } from "@solidjs/meta";
import { createSignal, onCleanup, onMount } from "solid-js";
import "./scroll-trial.css";

export default function ScrollTrial() {
  const [scrollDistance, setScrollDistance] = createSignal(0);
  const [startTime, setStartTime] = createSignal<number | null>(null);
  const [elapsedTime, setElapsedTime] = createSignal(0);
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [bestTime, setBestTime] = createSignal<number | null>(null);

  const targetDistance = 10000; // 10000px

  let intervalId: number | undefined;

  const handleScroll = () => {
    const distance = window.scrollY;
    setScrollDistance(distance);

    if (!isPlaying() && distance > 0) {
      startGame();
    }

    if (isPlaying() && distance >= targetDistance) {
      finishGame();
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setStartTime(Date.now());
    
    intervalId = window.setInterval(() => {
      if (startTime()) {
        setElapsedTime(Date.now() - startTime()!);
      }
    }, 10);
  };

  const finishGame = () => {
    setIsPlaying(false);
    if (intervalId) {
      clearInterval(intervalId);
    }

    const time = elapsedTime();
    if (!bestTime() || time < bestTime()!) {
      setBestTime(time);
    }
  };

  const resetGame = () => {
    window.scrollTo(0, 0);
    setScrollDistance(0);
    setStartTime(null);
    setElapsedTime(0);
    setIsPlaying(false);
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds}.${milliseconds.toString().padStart(3, "0")}秒`;
  };

  const progress = () => Math.min((scrollDistance() / targetDistance) * 100, 100);

  // イベントリスナーの登録
  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    
    onCleanup(() => {
      window.removeEventListener("scroll", handleScroll);
      if (intervalId) {
        clearInterval(intervalId);
      }
    });
  });

  return (
    <main class="scroll-trial-container">
      <Title>スクロールタイムアタック - All In On Stupid</Title>

      <div class="fixed-header">
        <div class="game-header">
          <h1>🏃 スクロールタイムアタック</h1>
          <p>できるだけ早く一番下までスクロールしよう！</p>
        </div>

        <div class="stats-panel">
          <div class="stat-item">
            <span class="stat-label">距離</span>
            <span class="stat-value">{(scrollDistance() / 1000).toFixed(1)}m</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">タイム</span>
            <span class="stat-value">{formatTime(elapsedTime())}</span>
          </div>
          {bestTime() && (
            <div class="stat-item">
              <span class="stat-label">ベストタイム</span>
              <span class="stat-value best">{formatTime(bestTime()!)}</span>
            </div>
          )}
        </div>

        <div class="progress-bar-container">
          <div class="progress-bar" style={{ width: `${progress()}%` }}></div>
        </div>
      </div>

        {!isPlaying() && scrollDistance() === 0 && (
          <div class="instruction">
            <p>👇 下にスクロールを開始してください</p>
          </div>
        )}

        {scrollDistance() >= targetDistance && (
          <div class="finish-banner">
            <h2>🎉 ゴール！</h2>
            <p>タイム: {formatTime(elapsedTime())}</p>
            <button class="reset-button" onClick={resetGame}>
              もう一度挑戦
            </button>
          </div>
        )}

        <div class="scroll-content">
          {Array.from({ length: 200 }, (_, i) => (
            <div class="scroll-marker" data-distance={i * 50}>
              {i * 50}px
            </div>
          ))}
        </div>
    </main>
  );
}
