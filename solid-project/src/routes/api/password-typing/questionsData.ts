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
    src: "/images/password/001.png", 
    answer: "砂時計",
    choices: ["花瓶", "砂時計", "地球儀", "ランプ"]
  },
  { 
    id: "q2",
    src: "/images/password/002.png", 
    answer: "地球儀",
    choices: ["地球儀", "スノードーム", "バスケットボール", "置き時計"]
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
