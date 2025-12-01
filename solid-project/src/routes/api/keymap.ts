// キーマッピングAPIエンドポイント
// サーバーサイドでキーマッピングを生成・検証する

import type { APIEvent } from "@solidjs/start/server";

// アルファベット26文字のみをマッピング対象にする（数字は除外）
const ALPHABET_KEYS = 'abcdefghijklmnopqrstuvwxyz';

// シード値からキーマッピングを生成する（固定のマッピング）
// シードによって同じマッピングが再現されるようにする
function generateKeyMappingFromSeed(seed: number): Record<string, string> {
    const keys = ALPHABET_KEYS.split('');
    const values = [...keys];

    // シードを使用した疑似乱数生成器（LCG: Linear Congruential Generator）
    let state = seed;
    const random = () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    };

    // Fisher-Yates シャッフル（シード付き）
    for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }

    const mapping: Record<string, string> = {};
    keys.forEach((key, index) => {
        mapping[key] = values[index];
    });

    // 数字はそのまま（マッピングしない）
    // '0123456789'.split('').forEach(digit => {
    //     mapping[digit] = digit;
    // });

    return mapping;
}

// 固定のシード値（これを変更するとマッピングが変わる）
// 本番環境では環境変数から取得することも可能
const FIXED_SEED = 20241201;

/**
 * POST /api/keymap
 * ユーザーの入力をサーバー側でマッピングして検証する
 */
export async function POST(event: APIEvent): Promise<Response> {
    try {
        const body = await event.request.json();
        const { input, question } = body;

        if (typeof input !== 'string' || typeof question !== 'string') {
            return new Response(
                JSON.stringify({ error: 'Invalid input' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const mapping = generateKeyMappingFromSeed(FIXED_SEED);

        // 入力された各文字をマッピングに従って変換
        const mappedInput = input
            .split('')
            .map(char => {
                const lowerChar = char.toLowerCase();
                return mapping[lowerChar] || char;
            })
            .join('');

        // 正解判定
        const isCorrect = mappedInput === question;

        return new Response(
            JSON.stringify({
                mappedInput,
                isCorrect,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Keymap API error:', error);
        return new Response(
            JSON.stringify({ error: 'Server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

/**
 * GET /api/keymap
 * キーマッピングを取得する
 * ゲーム開始時に一度だけ呼び出され、クライアント側でキャッシュされる
 */
export async function GET(): Promise<Response> {
    const mapping = generateKeyMappingFromSeed(FIXED_SEED);
    
    return new Response(
        JSON.stringify({ mapping }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        }
    );
}
