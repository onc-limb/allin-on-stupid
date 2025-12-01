import type { Difficulty } from "./types";

export const generatePassword = (difficulty: Difficulty): string => {
  const length = 12;
  const charsets: Record<Difficulty, string> = {
    easy: "abcdefghijklmnopqrstuvwxyz0123456789", // 英小文字+数字
    normal: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", // 英大小文字+数字
    hard: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?", // 英大小文字+数字+記号
  };
  
  const charset = charsets[difficulty];
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  return password;
};

export const formatTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0").slice(0, 2)}`;
  }
  return `${seconds}.${milliseconds.toString().padStart(3, "0").slice(0, 2)}秒`;
};

export const getDifficultyLabel = (diff: Difficulty): string => {
  const labels: Record<Difficulty, string> = {
    easy: "初級",
    normal: "中級",
    hard: "上級",
  };
  return labels[diff];
};

export const getDifficultyDescription = (diff: Difficulty): string => {
  const descriptions: Record<Difficulty, string> = {
    easy: "英小文字+数字",
    normal: "英大小文字+数字",
    hard: "英大小文字+数字+記号",
  };
  return descriptions[diff];
};

export const getMosaicFilter = (mosaicLevel: number): string => {
  if (mosaicLevel === 0) return "blur(0px)";
  // モザイクレベル100 → 40px blur, 0 → 0px blur
  const blurAmount = (mosaicLevel / 100) * 40;
  return `blur(${blurAmount}px)`;
};
