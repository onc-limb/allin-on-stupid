import { createSignal, onCleanup, onMount } from "solid-js";
import { ThreeScene } from "../lib/threeScene";
import "./ScrollTrialGame.css";

export default function ScrollTrialGame() {
  let canvasRef: HTMLCanvasElement | undefined;
  let threeScene: ThreeScene | undefined;
  
  const [scrollDistanceMeters, setScrollDistanceMeters] = createSignal(0);
  const [startTime, setStartTime] = createSignal<number | null>(null);
  const [elapsedTime, setElapsedTime] = createSignal(0);
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [isPaused, setIsPaused] = createSignal(false);
  const [pausedTime, setPausedTime] = createSignal(0);
  const [bestTime, setBestTime] = createSignal<number | null>(null);

  const targetDistance = 200;

  // ディスプレイの物理的なサイズを推定（96 DPI を基準とし、devicePixelRatioを考慮）
  const pixelToMeter = () => {
    const dpi = 96 * window.devicePixelRatio; // 標準DPI × デバイスピクセル比
    const pixelsPerInch = dpi;
    const pixelsPerMeter = pixelsPerInch * 39.3701; // 1メートル = 39.3701インチ
    return 1 / pixelsPerMeter;
  };

  let intervalId: number | undefined;

  // wheelイベント（マウス/トラックパッドのスクロール）を処理
  const handleWheel = (e: WheelEvent) => {
    // スクロール位置の変化を監視
    requestAnimationFrame(() => {
      updateScrollMetrics();
    });
  };

  // スクロール位置に基づいてメトリクスを更新
  const updateScrollMetrics = () => {
    const distance = window.scrollY;
    
    // ピクセルをメートルに変換
    const meters = distance * pixelToMeter();
    setScrollDistanceMeters(meters);

    // Three.jsシーンを更新
    if (threeScene) {
      threeScene.updateByScroll(meters);
    }

    // 一時停止中にスクロールしたら再開
    if (isPaused()) {
      resumeGame();
      return;
    }

    if (!isPlaying() && distance > 0) {
      startGame();
    }

    if (isPlaying() && !isPaused() && meters >= targetDistance) {
      finishGame();
    }
  };

  // キーボードによるスクロールを防止
  const preventKeyboardScroll = (e: KeyboardEvent) => {
    const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
    if (scrollKeys.includes(e.key)) {
      e.preventDefault();
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

  // イベントリスナーの登録
  onMount(() => {
    // wheelイベント（マウス/トラックパッドのスクロールのみ）を監視
    window.addEventListener("wheel", handleWheel, { passive: false });
    
    // キーボードによるスクロールを防止
    window.addEventListener("keydown", preventKeyboardScroll);
    
    // Three.jsの初期化
    if (canvasRef) {
      try {
        threeScene = new ThreeScene(canvasRef);
        threeScene.startAnimation();
        console.log("Three.js シーン初期化完了");
      } catch (error) {
        console.error("Three.js初期化エラー:", error);
      }
    }

    // ウィンドウリサイズ対応
    const handleResize = () => {
      if (threeScene && canvasRef) {
        const width = canvasRef.clientWidth;
        const height = canvasRef.clientHeight;
        threeScene.handleResize(width, height);
      }
    };
    window.addEventListener("resize", handleResize);
    
    onCleanup(() => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", preventKeyboardScroll);
      window.removeEventListener("resize", handleResize);
      if (intervalId) {
        clearInterval(intervalId);
      }
      // Three.jsのクリーンアップ
      if (threeScene) {
        threeScene.dispose();
      }
    });
  });

  return (
    <>
      {/* スクロール開始後に固定表示される統計パネル */}
      <div class={`stats-panel ${isPlaying() ? 'fixed' : ''}`}>
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

      {/* Three.js 3D Canvas - stats-panelの下に固定表示 */}
      <canvas 
        ref={canvasRef}
        class="threejs-canvas"
        style={{
          top: isPlaying() ? '160px' : '200px',
          height: isPlaying() ? 'calc(100vh - 160px)' : 'calc(100vh - 200px)'
        }}
      />

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
          <p>あなたの {formatTime(elapsedTime())} が無駄になりました</p>
          <p style={{ "font-size": "0.9rem", "margin-top": "0.5rem", "color": "#999" }}>
            (遊んでくれてありがとう)
          </p>
          <button class="reset-button" onClick={resetGame}>
            もう一度挑戦
          </button>
        </div>
      )}

      <div class="scroll-content">
        {/* 無限スクロールのための十分な高さを確保 */}
        <div style={{ height: "1000000px" }}></div>
      </div>
    </>
  );
}
