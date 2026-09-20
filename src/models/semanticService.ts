import { pipeline, env } from '@xenova/transformers';

// Configure transformers to run locally within extension sandboxes
env.allowLocalModels = false;
env.useBrowserCache = true;

class SemanticEngine {
  private static extractor: any = null;

  public static async getExtractor() {
    if (!this.extractor) {
      this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
    }
    return this.extractor;
  }

  public static async generateEmbedding(text: string): Promise<number[]> {
    const pipe = await this.getExtractor();
    const cleanText = text.slice(0, 1000).replace(/\s+/g, ' ');
    const output = await pipe(cleanText, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }
}

export { SemanticEngine };