// サーバーサイドのみで保持する正解データ
// このファイルはクライアント側にバンドルされないよう、API routes内に配置

export type QuestionData = {
  id: string;
  src: string;
  answer: string;
  choices: string[];
};

export const questionsData: QuestionData[] = [
  { 
    id: "q1",
    src: "/images/password/fd401322.jpg", 
    answer: "フルーツ",
    choices: ["フルーツ", "野菜", "お菓子", "飲み物"]
  },
  { 
    id: "q2",
    src: "/images/password/fd401322.jpg", 
    answer: "食べ物",
    choices: ["食べ物", "動物", "建物", "乗り物"]
  },
  { 
    id: "q3",
    src: "/images/password/fd401322.jpg", 
    answer: "カラフル",
    choices: ["カラフル", "モノクロ", "暗い", "明るい"]
  },
  { 
    id: "q4",
    src: "/images/password/fd401322.jpg", 
    answer: "健康的",
    choices: ["健康的", "不健康", "高カロリー", "低カロリー"]
  },
  { 
    id: "q5",
    src: "/images/password/fd401322.jpg", 
    answer: "自然物",
    choices: ["自然物", "人工物", "工業製品", "電子機器"]
  },
];
