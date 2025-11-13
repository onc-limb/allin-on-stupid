import type { Question } from "./types";

// 画像データ（実際の利用時には複数の画像を用意）
export const imagePool: Question[] = [
  { 
    src: "/images/password/fd401322.jpg", 
    answer: "フルーツ",
    choices: ["フルーツ", "野菜", "お菓子", "飲み物"]
  },
  { 
    src: "/images/password/fd401322.jpg", 
    answer: "食べ物",
    choices: ["食べ物", "動物", "建物", "乗り物"]
  },
  { 
    src: "/images/password/fd401322.jpg", 
    answer: "カラフル",
    choices: ["カラフル", "モノクロ", "暗い", "明るい"]
  },
  { 
    src: "/images/password/fd401322.jpg", 
    answer: "健康的",
    choices: ["健康的", "不健康", "高カロリー", "低カロリー"]
  },
  { 
    src: "/images/password/fd401322.jpg", 
    answer: "自然物",
    choices: ["自然物", "人工物", "工業製品", "電子機器"]
  },
];
