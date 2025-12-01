import type { Accessor } from "solid-js";
import type { Question, GameMode } from "./types";
import { formatTime } from "./utils";
import ImageMosaic from "./ImageMosaic";
import PasswordInput from "./PasswordInput";
import ChoicesArea from "./ChoicesArea";
import "./GamePlay.css";

type GamePlayProps = {
  currentQuestion: Accessor<Question>;
  currentQuestionIndex: Accessor<number>;
  gameMode: Accessor<GameMode>;
  totalElapsedTime: Accessor<number>;
  mosaicLevel: Accessor<number>;
  targetPassword: Accessor<string>;
  userInput: Accessor<string>;
  passwordsCleared: Accessor<number>;
  selectedChoice: Accessor<string | null>;
  isAnswerCorrect: Accessor<boolean | null>;
  onPasswordInput: (value: string) => void;
  onChoiceSelect: (choice: string) => void;
};

export default function GamePlay(props: GamePlayProps) {
  return (
    <div class="game-play">
      <div class="progress-header">
        <div class="question-progress">
          問題 {props.currentQuestionIndex() + 1} / {props.gameMode()}
        </div>
        <div class="game-timer">
          ⏱ {formatTime(props.totalElapsedTime())}
        </div>
      </div>

      <div class="game-area">
        {/* モザイク付き画像表示 */}
        <ImageMosaic 
          imageSrc={() => props.currentQuestion().src}
          mosaicLevel={props.mosaicLevel}
        />

        {/* パスワード入力エリア */}
        <PasswordInput 
          targetPassword={props.targetPassword}
          userInput={props.userInput}
          passwordsCleared={props.passwordsCleared}
          disabled={() => props.selectedChoice() !== null}
          onInput={props.onPasswordInput}
        />

        {/* 選択肢エリア */}
        <ChoicesArea 
          choices={() => props.currentQuestion().choices}
          selectedChoice={props.selectedChoice}
          isAnswerCorrect={props.isAnswerCorrect}
          onChoiceSelect={props.onChoiceSelect}
        />
      </div>
    </div>
  );
}
