"use server";

import { ChatAnthropic } from "@langchain/anthropic";
import { formSchema, FormValues } from "@/lib/validations/roadmap";

export async function generateSteps(data: FormValues) {
  const parsed = formSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input" };
  }

  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL,
  });

  try {
    // モデルにプロンプトを渡して回答を取得
    const systemPrompt = `ロードマップのステップを自動生成してください。
フォーマットはJSONで、以下のサンプル（マッスルアップ達成のロードマップ）のように作ってください。
'''
[
  {
    "id": 1,
    "title": "基礎的な筋力をつける",
    "note": "",
    "type": "0",
    "goals": [
      {"title": "プルアップを連続で10回行える"},
      {"title": "ディップスを連続で10回行える"}
      {"title": "チェストタッチプルアップを連続で5回行える"},
    ]
    "allGoalsRequired": true,
    "parentIds": null
  },
  {
    "id": 2,
    "title": "トランジションの練習",
    "note": "",
    "type": "0",
    "goals": [
      {"title": "ジャンピングマッスルアップが出来る"}
      {"title": "バンドアシストマッスルアップが出来る"}
    ]
    "allGoalsRequired": false,
    "parentIds": [1]
  },
  {
    "id": 3,
    "title": "マッスルアップの練習",
    "note": "",
    "type": "0",
    "goals": [
      {"title": "ストリクトマッスルアップが1回行える"}
      {"title": "キッピングマッスルアップが連続で3回行える"}
    ]
    "allGoalsRequired": false,
    "parentIds": [2]
  },
]
'''
【項目の説明】
id: ステップ番号
title: ステップのタイトル
note: ステップの備考
type: 固定で"0"を入れる
goals: ステップの達成条件 ※毎回行う活動内容ではなくステップ達成のゴール
goals-title: ステップ達成条件のタイトル
allGoalsRequired: ステップ達成条件が複数ある場合、全て必要(true)か、どれか１つだけでよいか(false)
parentIds: 親のステップ番号の配列
【注意事項】
・コードブロックでは囲まないでください。
・装飾やコメントは不要です。
`;

    const userPrompt = `達成目標：${data.title}\n備考：${data.note}`;

    const response = await model.invoke([
      ["system", systemPrompt],
      ["user", userPrompt],
    ]);
    const steps = response.content;

    return {
      ok: true,
      data: JSON.parse(typeof steps == "string" ? steps : ""),
    };
  } catch (error: any) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}
