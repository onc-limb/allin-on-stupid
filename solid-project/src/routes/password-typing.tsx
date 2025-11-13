import { Title } from "@solidjs/meta";
import { createSignal, onMount, For } from "solid-js";
import "./password-typing.css";

type Question = {
  src: string;
  answer: string;
  choices: string[];
};

type GameMode = 1 | 3 | 5;
type Difficulty = "easy" | "normal" | "hard";

export default function PasswordTyping() {
  // ゲーム設定
  const [gameMode, setGameMode] = createSignal<GameMode>(3); // 問題数（デフォルト3問）
  const [difficulty, setDifficulty] = createSignal<Difficulty>("normal"); // 難易度（デフォルト中級）
  const [gameStarted, setGameStarted] = createSignal(false);
  
  // 現在の問題
  const [currentQuestionIndex, setCurrentQuestionIndex] = createSignal(0);
  const [questions, setQuestions] = createSignal<Question[]>([]);
  
  // パスワード入力
  const [targetPassword, setTargetPassword] = createSignal("");
  const [userInput, setUserInput] = createSignal("");
  const [passwordsCleared, setPasswordsCleared] = createSignal(0);
  
  // モザイク
  const [mosaicLevel, setMosaicLevel] = createSignal(100); // 100が最も強いモザイク、0がモザイクなし
  
  // 選択肢
  const [selectedChoice, setSelectedChoice] = createSignal<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = createSignal<boolean | null>(null);
  
  // タイマー
  const [gameStartTime, setGameStartTime] = createSignal<number | null>(null);
  const [totalElapsedTime, setTotalElapsedTime] = createSignal(0);
  const [gameFinished, setGameFinished] = createSignal(false);

  let intervalId: number | undefined;

  // 画像データ（実際の利用時には複数の画像を用意）
  const imagePool: Question[] = [
    { 
      src: "/images/password/fd401322.jpg", 
      answer: "フルーツ",
      choices: ["フルーツ", "野菜", "お菓子", "飲み物"]
    },
    { 
      src: "/images/password/fd401322.jpg", 
      answer: "食べ物",
      choices: ["食べ物", "動物", "建物", "乗り物"]
    },
    { 
      src: "/images/password/fd401322.jpg", 
      answer: "カラフル",
      choices: ["カラフル", "モノクロ", "暗い", "明るい"]
    },
    { 
      src: "/images/password/fd401322.jpg", 
      answer: "健康的",
      choices: ["健康的", "不健康", "高カロリー", "低カロリー"]
    },
    { 
      src: "/images/password/fd401322.jpg", 
      answer: "自然物",
      choices: ["自然物", "人工物", "工業製品", "電子機器"]
    },
  ];

  const generatePassword = () => {
    const length = 12;
    const charsets: Record<Difficulty, string> = {
      easy: "abcdefghijklmnopqrstuvwxyz0123456789", // 英小文字+数字
      normal: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", // 英大小文字+数字
      hard: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?", // 英大小文字+数字+記号
    };
    
    const charset = charsets[difficulty()];
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    return password;
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startGame = () => {
    // 問題をランダムに選択（同じ画像でも良い場合）
    const selectedQuestions: Question[] = [];
    for (let i = 0; i < gameMode(); i++) {
      const randomQuestion = imagePool[Math.floor(Math.random() * imagePool.length)];
      selectedQuestions.push(randomQuestion);
    }
    
    setQuestions(selectedQuestions);
    setCurrentQuestionIndex(0);
    setGameStarted(true);
    setGameStartTime(Date.now());
    
    // タイマー開始
    intervalId = window.setInterval(() => {
      if (gameStartTime()) {
        setTotalElapsedTime(Date.now() - gameStartTime()!);
      }
    }, 10);
    
    loadNextQuestion();
  };

  const loadNextQuestion = () => {
    setTargetPassword(generatePassword());
    setUserInput("");
    setPasswordsCleared(0);
    setMosaicLevel(100);
    setSelectedChoice(null);
    setIsAnswerCorrect(null);
  };

  const handleInput = (e: InputEvent) => {
    const input = (e.target as HTMLInputElement).value;
    setUserInput(input);

    if (input === targetPassword()) {
      // パスワード正解
      const newCount = passwordsCleared() + 1;
      setPasswordsCleared(newCount);
      
      // モザイクレベルを減らす（10回のパスワードで完全に解除）
      const newMosaicLevel = Math.max(0, 100 - newCount * 10);
      setMosaicLevel(newMosaicLevel);
      
      // 次のパスワードを生成
      setTargetPassword(generatePassword());
      setUserInput("");
    }
  };

  const handleChoiceSelect = (choice: string) => {
    if (selectedChoice()) return; // 既に選択済み
    
    setSelectedChoice(choice);
    const currentQuestion = questions()[currentQuestionIndex()];
    const correct = choice === currentQuestion.answer;
    setIsAnswerCorrect(correct);
    
    if (correct) {
      // 正解の場合
      setTimeout(() => {
        const nextIndex = currentQuestionIndex() + 1;
        if (nextIndex < questions().length) {
          // 次の問題へ
          setCurrentQuestionIndex(nextIndex);
          loadNextQuestion();
        } else {
          // 全問正解
          finishGame();
        }
      }, 1500);
    }
  };

  const finishGame = () => {
    setGameFinished(true);
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const resetGame = () => {
    setGameMode(3);
    setDifficulty("normal");
    setGameStarted(false);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setTargetPassword("");
    setUserInput("");
    setPasswordsCleared(0);
    setMosaicLevel(100);
    setSelectedChoice(null);
    setIsAnswerCorrect(null);
    setGameStartTime(null);
    setTotalElapsedTime(0);
    setGameFinished(false);
    
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
  
  const getDifficultyLabel = (diff: Difficulty): string => {
    const labels: Record<Difficulty, string> = {
      easy: "初級",
      normal: "中級",
      hard: "上級",
    };
    return labels[diff];
  };
  
  const getDifficultyDescription = (diff: Difficulty): string => {
    const descriptions: Record<Difficulty, string> = {
      easy: "英小文字+数字",
      normal: "英大小文字+数字",
      hard: "英大小文字+数字+記号",
    };
    return descriptions[diff];
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0").slice(0, 2)}`;
    }
    return `${seconds}.${milliseconds.toString().padStart(3, "0").slice(0, 2)}秒`;
  };

  const getCharacterClass = (index: number) => {
    if (index >= userInput().length) return "";
    return userInput()[index] === targetPassword()[index] ? "correct" : "incorrect";
  };

  const getMosaicFilter = () => {
    if (mosaicLevel() === 0) return "blur(0px)";
    // モザイクレベル100 → 40px blur, 0 → 0px blur
    const blurAmount = (mosaicLevel() / 100) * 40;
    return `blur(${blurAmount}px)`;
  };

  return (
    <main class="password-typing-container">
      <Title>モザイク解除ゲーム - All In On Stupid</Title>

      <div class="game-header">
        <h1>🔐 モザイク解除ゲーム</h1>
        <p>パスワードを入力してモザイクを解除し、画像の内容を当てよう！</p>
      </div>

      {!gameStarted() ? (
        // ゲーム開始前の選択画面
        <div class="selection-screen">
          <div class="game-settings">
            <h2>ゲーム設定</h2>
            
            {/* 難易度選択 */}
            <div class="setting-section">
              <h3>難易度</h3>
              <div class="difficulty-options">
                <button 
                  class={`difficulty-option ${difficulty() === "easy" ? "selected" : ""}`}
                  onClick={() => setDifficulty("easy")}
                >
                  <div class="option-name">{getDifficultyLabel("easy")}</div>
                  <div class="option-desc">{getDifficultyDescription("easy")}</div>
                </button>
                <button 
                  class={`difficulty-option ${difficulty() === "normal" ? "selected" : ""}`}
                  onClick={() => setDifficulty("normal")}
                >
                  <div class="option-name">{getDifficultyLabel("normal")}</div>
                  <div class="option-desc">{getDifficultyDescription("normal")}</div>
                </button>
                <button 
                  class={`difficulty-option ${difficulty() === "hard" ? "selected" : ""}`}
                  onClick={() => setDifficulty("hard")}
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
                  class={`mode-option ${gameMode() === 1 ? "selected" : ""}`}
                  onClick={() => setGameMode(1)}
                >
                  <div class="option-number">1問</div>
                  <div class="option-desc">クイック</div>
                </button>
                <button 
                  class={`mode-option ${gameMode() === 3 ? "selected" : ""}`}
                  onClick={() => setGameMode(3)}
                >
                  <div class="option-number">3問</div>
                  <div class="option-desc">スタンダード</div>
                </button>
                <button 
                  class={`mode-option ${gameMode() === 5 ? "selected" : ""}`}
                  onClick={() => setGameMode(5)}
                >
                  <div class="option-number">5問</div>
                  <div class="option-desc">チャレンジ</div>
                </button>
              </div>
            </div>

            {/* スタートボタン */}
            <button class="start-button" onClick={startGame}>
              🚀 START
            </button>
          </div>
        </div>
      ) : gameFinished() ? (
        // ゲーム終了画面
        <div class="game-finished">
          <h2>🎉 全問正解！</h2>
          <div class="final-stats">
            <div class="stat-item">
              <span class="stat-label">難易度</span>
              <span class="stat-value">{getDifficultyLabel(difficulty()!)}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">問題数</span>
              <span class="stat-value">{gameMode()}問</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">クリアタイム</span>
              <span class="stat-value highlight">{formatTime(totalElapsedTime())}</span>
            </div>
          </div>
          <button class="restart-button" onClick={resetGame}>
            最初に戻る
          </button>
        </div>
      ) : (
        // ゲームプレイ画面
        <div class="game-play">
          <div class="progress-header">
            <div class="question-progress">
              問題 {currentQuestionIndex() + 1} / {gameMode()}
            </div>
            <div class="game-timer">
              ⏱ {formatTime(totalElapsedTime())}
            </div>
          </div>

          <div class="game-area">
            {/* モザイク付き画像表示 */}
            <div class="image-container">
              <img 
                src={questions()[currentQuestionIndex()].src} 
                alt="問題画像" 
                class="puzzle-image"
                style={{
                  filter: getMosaicFilter(),
                  transition: "filter 0.3s ease"
                }}
              />
              <div class="mosaic-info">
                <div class="mosaic-bar">
                  <div 
                    class="mosaic-bar-fill" 
                    style={{ width: `${100 - mosaicLevel()}%` }}
                  />
                </div>
                <div class="mosaic-text">
                  モザイク解除: {Math.round(100 - mosaicLevel())}%
                </div>
              </div>
            </div>

            {/* パスワード入力エリア */}
            <div class="password-area">
              <div class="password-display">
                <For each={targetPassword().split("")}>
                  {(char, index) => (
                    <span class={`char ${getCharacterClass(index())}`}>{char}</span>
                  )}
                </For>
              </div>

              <input
                type="text"
                class="password-input"
                value={userInput()}
                onInput={handleInput}
                placeholder="パスワードを入力..."
                disabled={selectedChoice() !== null}
                autofocus
              />
              
              <div class="password-stats">
                パスワードクリア: {passwordsCleared()} 回
              </div>
            </div>

            {/* 選択肢エリア */}
            <div class="choices-area">
              <h3>この画像は何でしょう？</h3>
              <div class="choices-grid">
                <For each={questions()[currentQuestionIndex()].choices}>
                  {(choice) => (
                    <button
                      class={`choice-btn ${
                        selectedChoice() === choice
                          ? isAnswerCorrect()
                            ? "correct"
                            : "incorrect"
                          : ""
                      } ${selectedChoice() && choice === questions()[currentQuestionIndex()].answer ? "show-answer" : ""}`}
                      onClick={() => handleChoiceSelect(choice)}
                      disabled={selectedChoice() !== null}
                    >
                      {choice}
                    </button>
                  )}
                </For>
              </div>
              
              {selectedChoice() && (
                <div class={`feedback ${isAnswerCorrect() ? "correct" : "incorrect"}`}>
                  {isAnswerCorrect() 
                    ? "✅ 正解！次の問題へ..." 
                    : `❌ 不正解... 正解は「${questions()[currentQuestionIndex()].answer}」でした`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
