import { createSignal, onMount, onCleanup, Show, For } from 'solid-js';
import { Title } from '@solidjs/meta';
import { getRandomQuestion, getNextQuestion } from '~/lib/questions';
import { TypingPolygonScene } from '~/lib/typingPolygonScene';
import './typing-game.css';

// 問題数の選択肢
const QUESTION_COUNTS = [1, 2, 3];

// キーマッピングの型
type KeyMapping = Record<string, string>;

export default function TypingGame() {
    const [currentQuestion, setCurrentQuestion] = createSignal('');
    const [userInput, setUserInput] = createSignal('');
    const [mappedInput, setMappedInput] = createSignal('');
    const [correctCount, setCorrectCount] = createSignal(0);
    const [questionNumber, setQuestionNumber] = createSignal(0);
    const [totalQuestions, setTotalQuestions] = createSignal(10);
    const [isGameActive, setIsGameActive] = createSignal(false);
    const [isGameOver, setIsGameOver] = createSignal(false);
    const [isLoadingMapping, setIsLoadingMapping] = createSignal(false);
    const [startTime, setStartTime] = createSignal<number | null>(null);
    const [endTime, setEndTime] = createSignal<number | null>(null);
    const [keyMapping, setKeyMapping] = createSignal<KeyMapping>({});
    const [polygonSides, setPolygonSides] = createSignal(4);
    const [mistypeCount, setMistypeCount] = createSignal(0);

    let inputRef: HTMLInputElement | undefined;
    let canvasRef: HTMLCanvasElement | undefined;
    let threeScene: TypingPolygonScene | null = null;

    // Three.jsシーンを初期化する関数
    const initThreeScene = () => {
        // 既存のシーンがあれば破棄
        if (threeScene) {
            threeScene.dispose();
            threeScene = null;
        }

        // 少し遅延させてDOMが確実にレンダリングされた後に初期化
        setTimeout(() => {
            if (canvasRef) {
                threeScene = new TypingPolygonScene(canvasRef);
                threeScene.startAnimation();
                setPolygonSides(3);

                // リサイズハンドラー
                const handleResize = () => {
                    if (canvasRef && threeScene) {
                        const container = canvasRef.parentElement;
                        if (container) {
                            threeScene.handleResize(container.clientWidth, container.clientHeight);
                        }
                    }
                };

                window.addEventListener('resize', handleResize);
            }
        }, 50);
    };

    onCleanup(() => {
        if (threeScene) {
            threeScene.dispose();
        }
    });

    // キーマッピングをサーバーから取得
    const fetchKeyMapping = async () => {
        try {
            const response = await fetch('/api/keymap');
            if (!response.ok) throw new Error('Failed to fetch mapping');
            const data = await response.json();
            setKeyMapping(data.mapping);
            return data.mapping;
        } catch (error) {
            console.error('Failed to fetch key mapping:', error);
            return {};
        }
    };

    // 入力をマッピングに従って変換
    const applyMapping = (input: string, mapping: KeyMapping): string => {
        return input
            .split('')
            .map(char => {
                const lowerChar = char.toLowerCase();
                return mapping[lowerChar] || char;
            })
            .join('');
    };

    const startGame = async (questionCount: number) => {
        setIsLoadingMapping(true);

        // マッピングをサーバーから取得
        const mapping = await fetchKeyMapping();

        setTotalQuestions(questionCount);
        setCorrectCount(0);
        setQuestionNumber(1);
        setUserInput('');
        setMappedInput('');
        setIsGameActive(true);
        setIsGameOver(false);
        setCurrentQuestion(getRandomQuestion());
        setStartTime(Date.now());
        setEndTime(null);
        setIsLoadingMapping(false);

        // キャンバスがDOMに追加された後にThree.jsシーンを初期化
        initThreeScene();

        // フォーカスを入力フィールドに移動
        setTimeout(() => {
            inputRef?.focus();
        }, 100);
    };

    const endGame = () => {
        // ゲーム終了時にポリゴンの面数とミスタイプ数を取得
        if (threeScene) {
            setPolygonSides(threeScene.getSides());
            setMistypeCount(threeScene.getMistypeCount());
        }
        setIsGameActive(false);
        setIsGameOver(true);
        setEndTime(Date.now());
    };

    const getElapsedTime = () => {
        const start = startTime();
        const end = endTime();
        if (!start || !end) return 0;
        return Math.floor((end - start) / 1000);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isGameActive() || isLoadingMapping()) return;

        // 特殊キーは無視
        if (e.key.length > 1 && e.key !== 'Backspace') return;

        e.preventDefault();

        const mapping = keyMapping();

        if (e.key === 'Backspace') {
            const newInput = userInput().slice(0, -1);
            setUserInput(newInput);
            // バックスペース時もマッピング結果を更新
            setMappedInput(newInput.length > 0 ? applyMapping(newInput, mapping) : '');
            return;
        }

        const newInput = userInput() + e.key;
        setUserInput(newInput);

        // クライアント側でマッピングを適用（即座に反映）
        const mapped = applyMapping(newInput, mapping);
        setMappedInput(mapped);

        // タイピング時にThree.jsシーンを更新
        if (threeScene) {
            threeScene.onKeyTyped();
        }

        // 正解判定
        if (mapped === currentQuestion()) {
            setCorrectCount((prev) => prev + 1);

            // Three.jsシーンで正解エフェクト（問題文の文字数分角を減らす）
            if (threeScene) {
                threeScene.onCorrect(currentQuestion().length);
            }

            // 次の問題へ
            if (questionNumber() >= totalQuestions()) {
                endGame();
            } else {
                setQuestionNumber((prev) => prev + 1);
                setUserInput('');
                setMappedInput('');
                setCurrentQuestion(getNextQuestion(currentQuestion()));
            }
        }
    };

    return (
        <div class="typing-game-container">
            <Title>Typing Game - Mystery Keyboard</Title>

            <div class="game-header">
                <h1>謎キーボードタイピングゲーム</h1>
                <p class="game-description">
                    キーボードの配列が秘密のマッピングで変更されています！<br />
                    どのキーがどの文字になるか、推理しながらタイピングしよう
                </p>
            </div>

            <Show when={!isGameActive() && !isGameOver()}>
                <div class="start-screen">
                    <div class="question-count-selector">
                        <h2>問題数を選んでスタート</h2>
                        <div class="question-count-buttons">
                            <For each={QUESTION_COUNTS}>
                                {(count) => (
                                    <button
                                        class="question-count-button"
                                        onClick={() => startGame(count)}
                                    >
                                        {count}問
                                    </button>
                                )}
                            </For>
                        </div>
                    </div>
                    <div class="instructions">
                        <h2>遊び方</h2>
                        <ul>
                            <li>画面に表示される文字列を入力してください</li>
                            <li>キーボードのキーが通常とは異なる文字にマッピングされています</li>
                            <li>マッピングは固定なので、パターンを覚えれば高速入力できます</li>
                            <li>できるだけ早く全問正解を目指しましょう！</li>
                        </ul>
                    </div>
                </div>
            </Show>

            <Show when={isGameActive()}>
                <div class="game-area">
                    <div class="game-stats">
                        <div class="stat-box">
                            <div class="stat-label">正解数</div>
                            <div class="stat-value">{correctCount()}</div>
                        </div>
                        <div class="stat-box progress">
                            <div class="stat-label">進捗</div>
                            <div class="stat-value">{questionNumber()} / {totalQuestions()}</div>
                        </div>
                    </div>

                    <div class="canvas-container">
                        <canvas ref={canvasRef} class="polygon-canvas"></canvas>
                    </div>

                    <div class="question-area">
                        <div class="question-label">問題文 (これを入力)</div>
                        <div class="question-text">{currentQuestion()}</div>
                    </div>

                    <div class="mapped-area">
                        <div class="mapped-label">変換後の文字</div>
                        <div class="mapped-text">{mappedInput() || '...'}</div>
                        <div class="input-hint">
                            マッピングされた結果がここに表示されます
                        </div>
                    </div>

                    {/* 非表示の入力フィールド（キーイベント受け取り用） */}
                    <input
                        ref={inputRef}
                        type="text"
                        class="hidden-input"
                        value={userInput()}
                        onKeyDown={handleKeyDown}
                        autocomplete="off"
                        autocorrect="off"
                        autocapitalize="off"
                        spellcheck={false}
                        autofocus
                        readonly
                    />
                </div>
            </Show>

            <Show when={isGameOver()}>
                <div class="game-over-screen">
                    <h2>ゲーム終了！</h2>
                    <div class="final-stats">
                        <div class="final-score">
                            <div class="final-score-label">正解数</div>
                            <div class="final-score-value">{correctCount()} / {totalQuestions()}</div>
                        </div>
                        <div class="final-time">
                            <div class="final-time-label">クリアタイム</div>
                            <div class="final-time-value">{getElapsedTime()}秒</div>
                        </div>
                        <div class="final-mistype">
                            <div class="final-mistype-label">ミスタイプ数</div>
                            <div class="final-mistype-value">{mistypeCount()}</div>
                        </div>
                    </div>
                    <div class="question-count-selector">
                        <h3>もう一度プレイ</h3>
                        <div class="question-count-buttons">
                            <For each={QUESTION_COUNTS}>
                                {(count) => (
                                    <button
                                        class="question-count-button restart"
                                        onClick={() => startGame(count)}
                                    >
                                        {count}問
                                    </button>
                                )}
                            </For>
                        </div>
                    </div>
                </div>
            </Show>
        </div>
    );
}
