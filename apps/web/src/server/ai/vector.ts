'use server'

import { db } from '@/lib/db';

/**
 * Generates an embedding array for the given text.
 * NOTE: In a true production environment, this would call OpenAI's text-embedding-ada-002
 * or an open-source model via an API endpoint.
 * For this implementation, it returns a stubbed vector of length 1536 (OpenAI standard)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Stub: return a normalized random vector of length 1536
  const vec = Array.from({ length: 1536 }, () => Math.random() - 0.5);
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  return vec.map(v => v / norm);
}

/**
 * Performs a semantic cosine similarity search against Case documents/notes.
 * Because prisma doesn't natively support querying Unsupported("vector") types cleanly via ORM methods,
 * we use raw SQL to calculate the cosine distance (<=>).
 */
export async function semanticSearchCases(queryText: string, limit: number = 5) {
  // 1. Convert search query to vector embedding
  const queryEmbedding = await generateEmbedding(queryText);
  const vectorStr = `[${queryEmbedding.join(',')}]`;

  // 2. Perform raw pgvector Cosine Similarity Search
  // We use the <=> operator which is provided by pgvector for cosine distance
  const results = await db.$queryRawUnsafe(`
    SELECT 
      id, 
      title, 
      status, 
      1 - (embedding <=> $1::vector) as similarity
    FROM "Case"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> $1::vector ASC
    LIMIT $2
  `, vectorStr, limit);

  return results;
}
