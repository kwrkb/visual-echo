'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import type { GenerationInsert } from '@/types/database';
import { generateImage } from '@/lib/gemini/client';

/**
 * 新しい画像生成リクエストを作成
 */
export async function createGeneration(
  parentId: string | null,
  prompt: string
): Promise<{
  data: { id: string } | null;
  error: string | null;
}> {
  try {
    // バリデーション
    if (!prompt || prompt.trim().length === 0) {
      return {
        data: null,
        error: 'プロンプトを入力してください',
      };
    }

    if (prompt.length > 1000) {
      return {
        data: null,
        error: 'プロンプトは1000文字以内で入力してください',
      };
    }

    const supabase = await createClient();

    // parent_idが指定されている場合、存在確認
    if (parentId) {
      const { data: parent, error: parentError } = await supabase
        .from('generations')
        .select('id')
        .eq('id', parentId)
        .single();

      if (parentError || !parent) {
        return {
          data: null,
          error: '指定された親画像が見つかりません',
        };
      }
    }

    // 新規レコード作成（status: pending, 仮の image_url）
    const newGeneration: GenerationInsert = {
      parent_id: parentId,
      prompt: prompt.trim(),
      status: 'pending',
      image_url: '/images/placeholder.svg', // 仮URL（後で生成画像に置き換え）
    };

    const { data, error } = await supabase
      .from('generations')
      .insert(newGeneration)
      .select('id')
      .single();

    if (error) {
      console.error('Generation creation error:', error);
      return {
        data: null,
        error: 'データベースエラーが発生しました',
      };
    }

    // ギャラリーページのキャッシュを無効化
    revalidatePath('/gallery');

    // after() でレスポンス返却後にバックグラウンド画像生成を実行
    // サーバーレス環境でもランタイムが処理完了まで維持される
    after(async () => {
      try {
        await generateImageInBackground(data.id, prompt.trim());
      } catch (error) {
        console.error('Background image generation failed:', error);
      }
    });

    return {
      data: { id: data.id },
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      data: null,
      error: '予期しないエラーが発生しました',
    };
  }
}

/**
 * バックグラウンドで画像を生成し、DBを更新
 */
async function generateImageInBackground(generationId: string, prompt: string) {
  try {
    console.log(`Starting background image generation for ${generationId}`);

    // Gemini APIで画像を生成
    const imageUrl = await generateImage(prompt);

    // データベースを更新
    const supabase = await createClient();
    const { error } = await supabase
      .from('generations')
      .update({
        image_url: imageUrl,
        status: 'completed',
      })
      .eq('id', generationId);

    if (error) {
      console.error('Failed to update generation status:', error);
      // 失敗ステータスに更新
      await supabase
        .from('generations')
        .update({ status: 'failed' })
        .eq('id', generationId);
      return;
    }

    console.log(`Image generation completed for ${generationId}`);

    // Note: revalidatePath はバックグラウンド関数から呼び出せないため、
    // 次回のページアクセス時に自動的にデータが更新されます
  } catch (error) {
    console.error('Background generation error:', error);

    // エラー時はステータスを failed に更新
    try {
      const supabase = await createClient();
      await supabase
        .from('generations')
        .update({ status: 'failed' })
        .eq('id', generationId);
    } catch (updateError) {
      console.error('Failed to update error status:', updateError);
    }
  }
}

/**
 * テスト用: サンプル画像データを作成
 * 開発中のみ使用
 */
export async function createTestGeneration(
  prompt: string,
  imageUrl: string
): Promise<{
  data: { id: string } | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const newGeneration: GenerationInsert = {
      parent_id: null,
      prompt,
      status: 'completed',
      image_url: imageUrl,
    };

    const { data, error } = await supabase
      .from('generations')
      .insert(newGeneration)
      .select('id')
      .single();

    if (error) {
      return {
        data: null,
        error: error.message,
      };
    }

    revalidatePath('/gallery');

    return {
      data: { id: data.id },
      error: null,
    };
  } catch (error) {
    console.error('Test generation error:', error);
    return {
      data: null,
      error: '予期しないエラーが発生しました',
    };
  }
}
