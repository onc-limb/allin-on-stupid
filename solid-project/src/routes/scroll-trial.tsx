import { Title } from "@solidjs/meta";
import { createSignal, onCleanup, onMount } from "solid-js";
import "./scroll-trial.css";

export default function ScrollTrial() {
  const [scrollDistanceMeters, setScrollDistanceMeters] = createSignal(0);
  const [startTime, setStartTime] = createSignal<number | null>(null);
  const [elapsedTime, setElapsedTime] = createSignal(0);
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [isPaused, setIsPaused] = createSignal(false);
  const [pausedTime, setPausedTime] = createSignal(0);
  const [bestTime, setBestTime] = createSignal<number | null>(null);

  const targetDistance = 500000;

  // ディスプレイの物理的なサイズを推定（96 DPI を基準とし、devicePixelRatioを考慮）
  const pixelToMeter = () => {
    const dpi = 96 * window.devicePixelRatio; // 標準DPI × デバイスピクセル比
    const pixelsPerInch = dpi;
    const pixelsPerMeter = pixelsPerInch * 39.3701; // 1メートル = 39.3701インチ
    return 1 / pixelsPerMeter;
  };

  let intervalId: number | undefined;

  const handleScroll = () => {
    const distance = window.scrollY;
    
    // ピクセルをメートルに変換
    const meters = distance * pixelToMeter();
    setScrollDistanceMeters(meters);

    // 一時停止中にスクロールしたら再開
    if (isPaused()) {
      resumeGame();
      return;
    }

    if (!isPlaying() && distance > 0) {
      startGame();
    }

    if (isPlaying() && !isPaused() && distance >= targetDistance) {
      finishGame();
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setStartTime(Date.now() - pausedTime());
    
    intervalId = window.setInterval(() => {
      if (startTime() && !isPaused()) {
        setElapsedTime(Date.now() - startTime()!);
      }
    }, 10);
  };

  const pauseGame = () => {
    setIsPaused(true);
    setPausedTime(elapsedTime());
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const resumeGame = () => {
    setIsPaused(false);
    setStartTime(Date.now() - pausedTime());
    
    intervalId = window.setInterval(() => {
      if (startTime() && !isPaused()) {
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
    setScrollDistanceMeters(0);
    setStartTime(null);
    setElapsedTime(0);
    setPausedTime(0);
    setIsPlaying(false);
    setIsPaused(false);
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds}.${milliseconds.toString().padStart(3, "0")}秒`;
  };

  const progress = () => Math.min((scrollDistanceMeters() / targetDistance) * 100, 100);

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
            <span class="stat-value">{scrollDistanceMeters().toFixed(2)}m</span>
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
          {isPlaying() && !isPaused() && (
            <button class="pause-button" onClick={pauseGame}>
              ⏸️ 一時停止
            </button>
          )}
        </div>

        <div class="progress-bar-container">
          <div class="progress-bar" style={{ width: `${progress()}%` }}></div>
        </div>
      </div>

        {!isPlaying() && scrollDistanceMeters() === 0 && (
          <div class="instruction">
            <p>👇 下にスクロールを開始してください</p>
          </div>
        )}

        {isPaused() && (
          <div class="paused-banner">
            <h2>⏸️ 一時停止中</h2>
            <p>スクロールして再開</p>
            <button class="reset-button" onClick={resetGame}>
              🔄 リセット
            </button>
          </div>
        )}

        {scrollDistanceMeters() >= targetDistance && (
          <div class="finish-banner">
            <h2>🎉 ゴール！</h2>
            <p>タイム: {formatTime(elapsedTime())}</p>
            <button class="reset-button" onClick={resetGame}>
              もう一度挑戦
            </button>
          </div>
        )}

        <div class="scroll-content">
          {Array.from({ length: 1000 }, (_, i) => (
            <div class="scroll-marker" data-distance={i * 50}>
              {i * 50}px
            </div>
          ))}
        </div>
    </main>
  );
}
