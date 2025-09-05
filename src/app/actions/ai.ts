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
    model: "claude-3-7-sonnet-latest",
  });

  try {
    // モデルにプロンプトを渡して回答を取得
    const systemPrompt = `ロードマップのステップを自動生成してください。
フォーマットはJSONで、以下のサンプル（TOEIC600点達成のロードマップ）のように作ってください。
'''
[
  {
    "id": 1,
    "title": "英語の基本を身につける",
    "note": "",
    "goals": [
      {"title": "基本単語を覚える", "type": "0"},
      {"title": "中学英語の文法を復習", "type": "0"}
    ]
    "allGoalsRequired": true,
    "parentIds": null
  },
  {
    "id": 2,
    "title": "TOEIC形式に慣れる",
    "note": "",
    "goals": [
      {"title": "公式問題を300問やる", "type": "0"}
    ]
    "allGoalsRequired": false,
    "parentIds": [1]
  },
]
'''
【項目の説明】
id: ステップ番号
title: ステップのタイトル
note: ステップの備考
goals: ステップの達成条件 ※毎回行う活動内容ではなくステップ達成のゴール
goals-title: ステップ達成条件のタイトル
goals-type: 固定で"0"を入れる
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
