import { For, type Accessor } from "solid-js";
import "./PasswordInput.css";

type PasswordInputProps = {
  targetPassword: Accessor<string>;
  userInput: Accessor<string>;
  passwordsCleared: Accessor<number>;
  disabled: Accessor<boolean>;
  onInput: (value: string) => void;
};

function getCharacterClass(index: number, targetPassword: string, userInput: string): string {
  if (index >= userInput.length) return "";
  return userInput[index] === targetPassword[index] ? "correct" : "incorrect";
}

export default function PasswordInput(props: PasswordInputProps) {
  return (
    <div class="password-area">
      <div class="password-display">
        <For each={props.targetPassword().split("")}>
          {(char, index) => (
            <span class={`char ${getCharacterClass(index(), props.targetPassword(), props.userInput())}`}>
              {char}
            </span>
          )}
        </For>
      </div>

      <input
        type="text"
        class="password-input"
        value={props.userInput()}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        placeholder="パスワードを入力..."
        disabled={props.disabled()}
        autofocus
      />
      
      <div class="password-stats">
        パスワードクリア: {props.passwordsCleared()} 回
      </div>
    </div>
  );
}
