

import { QuizMode } from "../types";

/**
 * Generates a "roast" or commentary in the style of "Feng Ge" based on quiz results.
 * Uses the CAIPACITY API (GPT-3.5-Turbo) to produce context-aware toxic/philosophical humor.
 */
export async function generateFengRoast(
  mode: QuizMode,
  scores: Record<string, number>,
  overall: number
) {
  // Use the provided Bearer token directly as requested
  const authToken = "06f6e4be-14d2-47cd-b925-7f0e5749ae8c";

  const scoreSummary = Object.entries(scores)
    .map(([dim, score]) => `${dim}: ${score.toFixed(1)}`)
    .join(", ");

  const prompt = `你现在是网红“峰哥亡命天涯”。用户刚刚完成了一个名为“你压抑吗”的心理测试。
  测试模式: ${mode === QuizMode.NORMAL ? '普通版（抽象梗模式）' : '详细版（SCL-90硬核模式）'}
  综合压抑指数: ${overall.toFixed(0)}/100
  各维度得分: ${scoreSummary}

  请以此写一段约100-150字的点评。
  语气要求：
  1. 必须带有“峰哥”标志性的毒舌、解构、哲思。
  2. 引用以下梗（至少两个）：‘已婚大我8岁’、‘力工盒饭’、‘苹果安卓系统论’、‘大妈对视’、‘底层逻辑’。
  3. 不要官方，要抽象，要让人感觉到那种“失败美学”的救赎。
  4. 如果分数高（>70），说他在库尔勒力工市场都没法立足；如果分数低（<30），嘲讽他生活太滋润，这种压抑是闲出来的。
  
  回复语言为中文。不要带任何Markdown格式，直接输出文字内容。`;

  try {
    const response = await fetch("https://api.caipacity.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        top_p: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.choices?.[0]?.message?.content;

    if (textContent) {
      return textContent.trim();
    }

    return "峰哥欲言又止，看着你的得分陷入了沉思，最后只吃了一口15块钱的盒饭。这种压抑，建议去库尔勒劳动一下。";
  } catch (error) {
    console.error("API Roast Error:", error);
    return "系统逻辑崩溃，底层逻辑受损。你大概是太抽象了，连AI都怕你。收收心，先去路边摊吃个盒饭吧。";
  }
}

