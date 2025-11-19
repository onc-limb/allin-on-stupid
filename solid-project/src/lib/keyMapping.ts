// キーマッピングの管理を行うユーティリティ

const STORAGE_KEY = 'typing-game-key-mapping';

// 通常のキーボードの文字キー（小文字）
const KEYS = 'abcdefghijklmnopqrstuvwxyz0123456789';

export type KeyMapping = Record<string, string>;

/**
 * ランダムなキーマッピングを生成
 * 各キーを別のキーにランダムにマッピングする
 */
export function generateRandomKeyMapping(): KeyMapping {
  const keys = KEYS.split('');
  const values = [...keys];
  
  // Fisher-Yates シャッフル
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  
  const mapping: KeyMapping = {};
  keys.forEach((key, index) => {
    mapping[key] = values[index];
  });
  
  return mapping;
}

/**
 * キーマッピングをlocalStorageに保存
 */
export function saveKeyMapping(mapping: KeyMapping): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapping));
  }
}

/**
 * キーマッピングをlocalStorageから読み込み
 * 存在しない場合は新しいマッピングを生成して保存
 */
export function loadKeyMapping(): KeyMapping {
  if (typeof window === 'undefined') {
    return generateRandomKeyMapping();
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse key mapping:', e);
    }
  }
  
  // 保存されたマッピングがない場合は新しく生成
  const newMapping = generateRandomKeyMapping();
  saveKeyMapping(newMapping);
  return newMapping;
}

/**
 * 入力されたキーをマッピングに従って変換
 */
export function applyKeyMapping(key: string, mapping: KeyMapping): string {
  const lowerKey = key.toLowerCase();
  return mapping[lowerKey] || key;
}

/**
 * キーマッピングを削除（開発用）
 */
export function clearKeyMapping(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
