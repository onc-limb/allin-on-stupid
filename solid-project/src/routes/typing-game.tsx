import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import { Title } from '@solidjs/meta';
import { loadKeyMapping, applyKeyMapping, type KeyMapping } from '~/lib/keyMapping';
import { getRandomQuestion, getNextQuestion } from '~/lib/questions';
import './typing-game.css';

export default function TypingGame() {
    const [keyMapping, setKeyMapping] = createSignal<KeyMapping>({});
    const [currentQuestion, setCurrentQuestion] = createSignal('');
    const [userInput, setUserInput] = createSignal('');
    const [score, setScore] = createSignal(0);
    const [timeLeft, setTimeLeft] = createSignal(60);
    const [isGameActive, setIsGameActive] = createSignal(false);
    const [isGameOver, setIsGameOver] = createSignal(false);

    let intervalId: number | undefined;

    onMount(() => {
        // キーマッピングを読み込み
        const mapping = loadKeyMapping();
        setKeyMapping(mapping);

        // 最初の問題を設定
        setCurrentQuestion(getRandomQuestion());
    });

    onCleanup(() => {
        if (intervalId !== undefined) {
            clearInterval(intervalId);
        }
    });

    const startGame = () => {
        setScore(0);
        setTimeLeft(60);
        setUserInput('');
        setIsGameActive(true);
        setIsGameOver(false);
        setCurrentQuestion(getRandomQuestion());

        // タイマーを開始
        intervalId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000) as unknown as number;
    };

    const endGame = () => {
        setIsGameActive(false);
        setIsGameOver(true);
        if (intervalId !== undefined) {
            clearInterval(intervalId);
            intervalId = undefined;
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isGameActive()) return;

        // 特殊キーは無視
        if (e.key.length > 1 && e.key !== 'Backspace') return;

        e.preventDefault();

        if (e.key === 'Backspace') {
            setUserInput((prev) => prev.slice(0, -1));
            return;
        }

        // キーマッピングを適用
        const mappedKey = applyKeyMapping(e.key, keyMapping());
        const newInput = userInput() + mappedKey;
        setUserInput(newInput);

        // 正解判定
        if (newInput === currentQuestion()) {
            setScore((prev) => prev + 1);
            setUserInput('');
            setCurrentQuestion(getNextQuestion(currentQuestion()));
        }
    };

    return (
        <div class="typing-game-container">
            <Title>Typing Game - Remapped Keyboard</Title>

            <div class="game-header">
                <h1>キーマップ変更タイピングゲーム</h1>
                <p class="game-description">
                    キーボードの配列が変更されています！普段と違うキーで正しく入力しよう
                </p>
            </div>

            <Show when={!isGameActive() && !isGameOver()}>
                <div class="start-screen">
                    <button class="start-button" onClick={startGame}>
                        ゲームスタート
                    </button>
                    <div class="instructions">
                        <h2>遊び方</h2>
                        <ul>
                            <li>画面に表示される文字列を入力してください</li>
                            <li>キーボードのキーが通常とは異なる文字にマッピングされています</li>
                            <li>制限時間は60秒です</li>
                            <li>できるだけ多くの問題を正解しましょう！</li>
                        </ul>
                    </div>
                </div>
            </Show>

            <Show when={isGameActive()}>
                <div class="game-area">
                    <div class="game-stats">
                        <div class="stat-box">
                            <div class="stat-label">スコア</div>
                            <div class="stat-value">{score()}</div>
                        </div>
                        <div class="stat-box timer">
                            <div class="stat-label">残り時間</div>
                            <div class="stat-value">{timeLeft()}秒</div>
                        </div>
                    </div>

                    <div class="question-area">
                        <div class="question-label">問題文</div>
                        <div class="question-text">{currentQuestion()}</div>
                    </div>

                    <div class="input-area">
                        <div class="input-label">あなたの入力</div>
                        <input
                            type="text"
                            class="input-field"
                            value={userInput()}
                            onKeyDown={handleKeyDown}
                            autocomplete="off"
                            autocorrect="off"
                            autocapitalize="off"
                            spellcheck={false}
                            autofocus
                        />
                        <div class="input-hint">
                            キーボードで入力してください（マッピングが適用されています）
                        </div>
                    </div>
                </div>
            </Show>

            <Show when={isGameOver()}>
                <div class="game-over-screen">
                    <h2>ゲーム終了！</h2>
                    <div class="final-score">
                        <div class="final-score-label">最終スコア</div>
                        <div class="final-score-value">{score()}</div>
                    </div>
                    <button class="restart-button" onClick={startGame}>
                        もう一度プレイ
                    </button>
                </div>
            </Show>

            <div class="admin-link">
                <a href="/typing-game-admin">管理者画面へ</a>
            </div>
        </div>
    );
}
