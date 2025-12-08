/**
 * Google Gemini API Client
 * 画像生成に使用するGemini APIクライアント
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

// Gemini APIクライアントを初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 画像生成用のモデルを取得
 * デフォルトは gemini-2.0-flash-exp
 */
export function getGenerativeModel() {
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * テキストプロンプトから画像を生成
 * @param prompt - 画像生成用のテキストプロンプト
 * @returns 生成された画像のURL
 */
export async function generateImage(prompt: string): Promise<string> {
  const model = getGenerativeModel();

  // Note: Gemini 2.0のイメージ生成機能を使用する場合は
  // 適切なAPIメソッドを実装してください
  // 以下はプレースホルダーです
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // 実際の実装では、生成された画像のURLを返す必要があります
    // ここでは仮の実装です
    console.log("Generated response:", text);

    // TODO: 実際の画像生成APIエンドポイントを使用する
    throw new Error("Image generation not yet implemented for Gemini");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
