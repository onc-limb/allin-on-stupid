import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { questionsData } from "./questionsData";

// 答えを検証
export async function POST({ request }: APIEvent) {
  try {
    const body = await request.json();
    const { questionId, userAnswer } = body;
    
    if (!questionId || !userAnswer) {
      return json({ error: "Invalid request" }, { status: 400 });
    }
    
    const question = questionsData.find(q => q.id === questionId);
    
    if (!question) {
      return json({ error: "Question not found" }, { status: 404 });
    }
    
    const isCorrect = question.answer === userAnswer;
    
    return json({ 
      correct: isCorrect,
      // 正解の場合のみ、確認のため正解を返す（オプション）
      answer: isCorrect ? question.answer : undefined
    });
  } catch (error) {
    return json({ error: "Failed to verify answer" }, { status: 500 });
  }
}
