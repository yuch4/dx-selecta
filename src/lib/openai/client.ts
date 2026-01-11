import OpenAI from "openai";

// OpenAI クライアント（シングルトン）
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * テキストをEmbeddingベクトルに変換
 * @param text - 埋め込み対象のテキスト
 * @returns 1536次元のベクトル
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    throw new Error(
      `Embedding生成に失敗しました: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * 複数テキストを一括でEmbeddingベクトルに変換
 * @param texts - 埋め込み対象のテキスト配列
 * @returns 1536次元のベクトル配列
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  if (texts.length === 0) {
    return [];
  }

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });

    return response.data.map((d) => d.embedding);
  } catch (error) {
    console.error("Batch embedding generation failed:", error);
    throw new Error(
      `バッチEmbedding生成に失敗しました: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
