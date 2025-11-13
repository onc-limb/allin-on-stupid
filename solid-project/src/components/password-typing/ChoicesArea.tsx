import { For, type Accessor } from "solid-js";
import "./ChoicesArea.css";

type ChoicesAreaProps = {
  choices: Accessor<string[]>;
  selectedChoice: Accessor<string | null>;
  isAnswerCorrect: Accessor<boolean | null>;
  onChoiceSelect: (choice: string) => void;
};

export default function ChoicesArea(props: ChoicesAreaProps) {
  return (
    <div class="choices-area">
      <h3>この画像は何でしょう？</h3>
      <div class="choices-grid">
        <For each={props.choices()}>
          {(choice) => (
            <button
              class={`choice-btn ${
                props.selectedChoice() === choice
                  ? props.isAnswerCorrect()
                    ? "correct"
                    : "incorrect"
                  : ""
              }`}
              onClick={() => props.onChoiceSelect(choice)}
              disabled={props.selectedChoice() !== null}
            >
              {choice}
            </button>
          )}
        </For>
      </div>
      
      {props.selectedChoice() && (
        <div class={`feedback ${props.isAnswerCorrect() ? "correct" : "incorrect"}`}>
          {props.isAnswerCorrect() 
            ? "✅ 正解！次の問題へ..." 
            : `❌ 不正解...`}
        </div>
      )}
    </div>
  );
}
