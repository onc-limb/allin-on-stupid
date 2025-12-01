import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { questionsData } from "./questionsData";

// 問題一覧を取得（答えは含めない）
export async function GET({ request }: APIEvent) {
  try {
    const url = new URL(request.url);
    const count = parseInt(url.searchParams.get("count") || "3");
    
    // ランダムに問題を選択
    const shuffled = [...questionsData].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, questionsData.length));
    
    // クライアントには答えを送らない
    const questionsWithoutAnswers = selected.map(q => ({
      id: q.id,
      src: q.src,
      choices: q.choices
    }));
    
    return json(questionsWithoutAnswers);
  } catch (error) {
    return json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
