import { Title } from "@solidjs/meta";
import { createSignal } from "solid-js";
import "./password-typing.css";
import type { Question, GameMode, Difficulty } from "~/components/password-typing/types";
import { generatePassword } from "~/components/password-typing/utils";
import { imagePool } from "~/components/password-typing/constants";
import GameSettings from "~/components/password-typing/GameSettings";
import GamePlay from "~/components/password-typing/GamePlay";
import GameResult from "~/components/password-typing/GameResult";

export default function PasswordTyping() {
  // ゲーム設定
  const [gameMode, setGameMode] = createSignal<GameMode>(3);
  const [difficulty, setDifficulty] = createSignal<Difficulty>("normal");
  const [gameStarted, setGameStarted] = createSignal(false);
  
  // 現在の問題
  const [currentQuestionIndex, setCurrentQuestionIndex] = createSignal(0);
  const [questions, setQuestions] = createSignal<Question[]>([]);
  
  // パスワード入力
  const [targetPassword, setTargetPassword] = createSignal("");
  const [userInput, setUserInput] = createSignal("");
  const [passwordsCleared, setPasswordsCleared] = createSignal(0);
  
  // モザイク
  const [mosaicLevel, setMosaicLevel] = createSignal(100);
  
  // 選択肢
  const [selectedChoice, setSelectedChoice] = createSignal<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = createSignal<boolean | null>(null);
  
  // タイマー
  const [gameStartTime, setGameStartTime] = createSignal<number | null>(null);
  const [totalElapsedTime, setTotalElapsedTime] = createSignal(0);
  const [gameFinished, setGameFinished] = createSignal(false);
  const [gameFailed, setGameFailed] = createSignal(false);

  let intervalId: number | undefined;

  const startGame = () => {
    // 問題をランダムに選択
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
    setTargetPassword(generatePassword(difficulty()));
    setUserInput("");
    setPasswordsCleared(0);
    setMosaicLevel(100);
    setSelectedChoice(null);
    setIsAnswerCorrect(null);
  };

  const handlePasswordInput = (input: string) => {
    setUserInput(input);

    if (input === targetPassword()) {
      // パスワード正解
      const newCount = passwordsCleared() + 1;
      setPasswordsCleared(newCount);
      
      // モザイクレベルを減らす
      const newMosaicLevel = Math.max(0, 100 - newCount * 10);
      setMosaicLevel(newMosaicLevel);
      
      // 次のパスワードを生成
      setTargetPassword(generatePassword(difficulty()));
      setUserInput("");
    }
  };

  const handleChoiceSelect = (choice: string) => {
    if (selectedChoice()) return;
    
    setSelectedChoice(choice);
    const currentQuestion = questions()[currentQuestionIndex()];
    const correct = choice === currentQuestion.answer;
    setIsAnswerCorrect(correct);
    
    if (correct) {
      setTimeout(() => {
        const nextIndex = currentQuestionIndex() + 1;
        if (nextIndex < questions().length) {
          setCurrentQuestionIndex(nextIndex);
          loadNextQuestion();
        } else {
          finishGame();
        }
      }, 1500);
    } else {
      setTimeout(() => {
        setGameFailed(true);
        if (intervalId) {
          clearInterval(intervalId);
        }
      }, 2000);
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
    setGameFailed(false);
    
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  return (
    <main class="password-typing-container">
      <Title>モザイク解除ゲーム - All In On Stupid</Title>

      <div class="game-header">
        <h1>🔐 モザイク解除ゲーム</h1>
        <p>パスワードを入力してモザイクを解除し、画像の内容を当てよう！</p>
      </div>

      {!gameStarted() ? (
        <GameSettings 
          gameMode={gameMode}
          difficulty={difficulty}
          onGameModeChange={setGameMode}
          onDifficultyChange={setDifficulty}
          onStartGame={startGame}
        />
      ) : gameFinished() || gameFailed() ? (
        <GameResult 
          gameFinished={gameFinished}
          gameFailed={gameFailed}
          totalElapsedTime={totalElapsedTime}
          difficulty={difficulty}
          gameMode={gameMode}
          currentQuestionIndex={currentQuestionIndex}
          correctAnswer={() => questions()[currentQuestionIndex()].answer}
          onResetGame={resetGame}
        />
      ) : (
        <GamePlay 
          currentQuestion={() => questions()[currentQuestionIndex()]}
          currentQuestionIndex={currentQuestionIndex}
          gameMode={gameMode}
          totalElapsedTime={totalElapsedTime}
          mosaicLevel={mosaicLevel}
          targetPassword={targetPassword}
          userInput={userInput}
          passwordsCleared={passwordsCleared}
          selectedChoice={selectedChoice}
          isAnswerCorrect={isAnswerCorrect}
          onPasswordInput={handlePasswordInput}
          onChoiceSelect={handleChoiceSelect}
        />
      )}
    </main>
  );
}
