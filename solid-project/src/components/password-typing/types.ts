export type Question = {
  src: string;
  answer: string;
  choices: string[];
};

export type GameMode = 1 | 3 | 5;
export type Difficulty = "easy" | "normal" | "hard";

export type GameState = {
  gameMode: GameMode;
  difficulty: Difficulty;
  gameStarted: boolean;
  currentQuestionIndex: number;
  questions: Question[];
  targetPassword: string;
  userInput: string;
  passwordsCleared: number;
  mosaicLevel: number;
  selectedChoice: string | null;
  isAnswerCorrect: boolean | null;
  gameStartTime: number | null;
  totalElapsedTime: number;
  gameFinished: boolean;
  gameFailed: boolean;
};
