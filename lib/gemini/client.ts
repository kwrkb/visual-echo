/**
 * Google Gemini API Client
 * 画像生成に使用するGemini APIクライアント
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

// Gemini APIクライアントを初期化
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * テキストプロンプトから画像を生成
 * @param prompt - 画像生成用のテキストプロンプト
 * @returns 生成された画像のローカルパス（/images/generated/以下）
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    console.log("Generating image with Gemini...", prompt);

    // Gemini 2.5 Flash Image モデルを使用
    // temperatureを高めに設定して、より多様でクリエイティブな画像を生成
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {
        temperature: 1.5, // 0.0-2.0の範囲。高いほどランダム性が増す
        topP: 0.95, // 多様性を高める
        topK: 40, // サンプリングの多様性
      },
    });

    // 生成された画像を取得
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates in response");
    }

    const parts = candidates[0].content?.parts;
    if (!parts) {
      throw new Error("No content parts in response");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        // Base64エンコードされた画像データを取得
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");

        // 画像を保存するディレクトリ
        const publicDir = path.join(process.cwd(), "public", "images", "generated");
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }

        // ファイル名を生成（タイムスタンプ + ランダム文字列）
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
        const filepath = path.join(publicDir, filename);

        // 画像を保存
        fs.writeFileSync(filepath, buffer);

        console.log("Image generated successfully:", filename);

        // 公開URLを返す
        return `/images/generated/${filename}`;
      }
    }

    throw new Error("No image data found in response");
  } catch (error: any) {
    console.error("Error generating image:", error);

    // APIクォータエラーの場合、分かりやすいメッセージを表示
    if (error?.status === 429) {
      throw new Error("API クォータ制限に達しました。しばらく待ってから再試行してください。");
    }

    // その他のエラー
    throw new Error(`画像生成エラー: ${error?.message || "不明なエラー"}`);
  }
}
