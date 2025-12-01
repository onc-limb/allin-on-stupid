// タイピングゲームの問題文リスト

export const QUESTIONS = [
  'hello',
  'world',
  'typescript',
  'javascript',
  'solid',
  'react',
  'programming',
  'keyboard',
  'computer',
  'developer',
  'function',
  'variable',
  'algorithm',
  'database',
  'network',
  'security',
  'performance',
  'optimization',
  'debugging',
  'testing',
  'framework',
  'library',
  'component',
  'interface',
  'application',
  'system',
  'server',
  'client',
  'frontend',
  'backend',
  'api',
  'rest',
  'json',
  'html',
  'css',
  'design',
  'responsive',
  'mobile',
  'web',
  'browser',
  'chrome',
  'firefox',
  'safari',
  'edge',
  'node',
  'npm',
  'package',
  'module',
  'import',
  'export',
  'class',
  'object',
  'array',
  'string',
  'number',
  'boolean',
  'promise',
  'async',
  'await',
  'callback',
  'event',
];

/**
 * ランダムな問題を取得
 */
export function getRandomQuestion(): string {
  const index = Math.floor(Math.random() * QUESTIONS.length);
  return QUESTIONS[index];
}

/**
 * 前回と異なるランダムな問題を取得
 */
export function getNextQuestion(currentQuestion: string): string {
  let nextQuestion = getRandomQuestion();
  // 同じ問題が連続しないようにする
  while (nextQuestion === currentQuestion && QUESTIONS.length > 1) {
    nextQuestion = getRandomQuestion();
  }
  return nextQuestion;
}
