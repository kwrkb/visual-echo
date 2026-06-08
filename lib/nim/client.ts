/**
 * NVIDIA NIM API Client
 * 画像生成に使用する NVIDIA NIM (FLUX.1-schnell) クライアント
 */

import * as fs from "fs/promises";
import * as path from "path";

if (!process.env.NVIDIA_NIM_API_KEY) {
  throw new Error("NVIDIA_NIM_API_KEY is not set in environment variables");
}

const API_KEY = process.env.NVIDIA_NIM_API_KEY;

/**
 * テキストプロンプトから画像を生成
 * @param prompt - 画像生成用のテキストプロンプト
 * @returns 生成された画像のローカルパス（/images/generated/以下）
 */
export async function generateImage(prompt: string): Promise<string> {
  // モデルは環境変数で上書き可能（code-quality.md ルール5: 外部サービス設定値は環境変数で管理）
  const model =
    process.env.NVIDIA_NIM_MODEL || "black-forest-labs/flux.1-schnell";
  const invokeUrl = `https://ai.api.nvidia.com/v1/genai/${model}`;

  try {
    console.log(
      "Generating image with NVIDIA NIM (FLUX.1-schnell)...",
      prompt.substring(0, 80)
    );

    const response = await fetch(invokeUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        width: 1024,
        height: 1024,
        // seed をリクエストごとにランダム化して多様な出力を得る
        seed: Math.floor(Math.random() * 0xffffffff),
        steps: 4,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          "API クォータ制限に達しました。しばらく待ってから再試行してください。"
        );
      }
      const body = await response.text().catch(() => "");
      throw new Error(`NIM API エラー: HTTP ${response.status} - ${body}`);
    }

    const json = (await response.json()) as Record<string, unknown>;

    // レスポンス形式: artifacts[0].base64 (NVIDIA NIM 標準) または data[0].b64_json (OpenAI 互換フォールバック)
    const artifacts = json.artifacts as
      | Array<{ base64?: string; finishReason?: string }>
      | undefined;
    const data = json.data as Array<{ b64_json?: string }> | undefined;
    const base64 = artifacts?.[0]?.base64 ?? data?.[0]?.b64_json;

    if (!base64) {
      // 形式が想定外の場合は応答本体をログして調査できるようにする
      console.error(
        "Unexpected NIM response shape:",
        JSON.stringify(json).substring(0, 500)
      );
      throw new Error("レスポンスに画像データが見つかりませんでした");
    }

    // base64 → Buffer → ローカル保存
    const buffer = Buffer.from(base64, "base64");

    // FLUX.1-schnell は JPEG を返すため、マジックバイトで実フォーマットを判定して拡張子を決める
    const ext =
      buffer[0] === 0xff && buffer[1] === 0xd8
        ? "jpg"
        : buffer[0] === 0x89 && buffer[1] === 0x50
          ? "png"
          : "png";

    const publicDir = path.join(process.cwd(), "public", "images", "generated");
    await fs.mkdir(publicDir, { recursive: true });

    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filepath = path.join(publicDir, filename);
    await fs.writeFile(filepath, buffer);

    console.log("Image generated successfully:", filename);

    // 公開URLを返す
    return `/images/generated/${filename}`;
  } catch (error: unknown) {
    console.error("Error generating image:", error);
    // Error インスタンスはメッセージを保持したまま再スロー
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("画像生成エラー: 不明なエラー");
  }
}
