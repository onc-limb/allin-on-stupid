import { createSignal, onMount, For } from 'solid-js';
import { Title } from '@solidjs/meta';
import {
    loadKeyMapping,
    generateRandomKeyMapping,
    saveKeyMapping,
    clearKeyMapping,
    type KeyMapping,
} from '~/lib/keyMapping';
import './typing-game-admin.css';

export default function TypingGameAdmin() {
    const [keyMapping, setKeyMapping] = createSignal<KeyMapping>({});
    const [message, setMessage] = createSignal('');

    onMount(() => {
        loadCurrentMapping();
    });

    const loadCurrentMapping = () => {
        const mapping = loadKeyMapping();
        setKeyMapping(mapping);
    };

    const generateNewMapping = () => {
        const newMapping = generateRandomKeyMapping();
        setKeyMapping(newMapping);
        saveKeyMapping(newMapping);
        showMessage('新しいキーマッピングを生成しました');
    };

    const resetMapping = () => {
        clearKeyMapping();
        const newMapping = generateRandomKeyMapping();
        setKeyMapping(newMapping);
        saveKeyMapping(newMapping);
        showMessage('キーマッピングをリセットしました');
    };

    const showMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const getMappingEntries = () => {
        const mapping = keyMapping();
        return Object.entries(mapping).sort((a, b) => a[0].localeCompare(b[0]));
    };

    return (
        <div class="admin-container">
            <Title>Admin - Typing Game Key Mapping</Title>

            <div class="admin-header">
                <h1>キーマッピング管理画面</h1>
                <p class="admin-description">
                    タイピングゲームのキーマッピングを管理します
                </p>
            </div>

            <div class="admin-actions">
                <button class="action-button primary" onClick={generateNewMapping}>
                    新しいマッピングを生成
                </button>
                <button class="action-button secondary" onClick={resetMapping}>
                    マッピングをリセット
                </button>
                <a href="/typing-game" class="action-button tertiary">
                    ゲーム画面へ戻る
                </a>
            </div>

            {message() && (
                <div class="message-box">
                    {message()}
                </div>
            )}

            <div class="mapping-container">
                <h2>現在のキーマッピング</h2>
                <div class="mapping-info">
                    <p>左側のキーを押すと、右側の文字が入力されます</p>
                </div>

                <div class="mapping-grid">
                    <For each={getMappingEntries()}>
                        {([key, value]) => (
                            <div class="mapping-item">
                                <div class="mapping-key">
                                    <span class="key-label">入力</span>
                                    <span class="key-value">{key}</span>
                                </div>
                                <div class="mapping-arrow">→</div>
                                <div class="mapping-value">
                                    <span class="value-label">出力</span>
                                    <span class="value-text">{value}</span>
                                </div>
                            </div>
                        )}
                    </For>
                </div>
            </div>

            <div class="admin-note">
                <h3>注意事項</h3>
                <ul>
                    <li>新しいマッピングを生成すると、既存のマッピングは上書きされます</li>
                    <li>マッピングはブラウザのlocalStorageに保存されます</li>
                    <li>ゲーム中にマッピングを変更した場合、ページをリロードすると反映されます</li>
                </ul>
            </div>
        </div>
    );
}
