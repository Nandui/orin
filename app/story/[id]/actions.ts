'use server';

import { getStoryById } from '@/lib/stories';
import { answerStoryQuestion } from '@/lib/analysis';

export type AskResult = { answer?: string; error?: string };

// Spawn Deeper: answer a reader's question about a specific story via DeepSeek
// (Claude fallback), grounded in the story's own context.
export async function askSpawnDeeper(
  storyId: string,
  question: string,
): Promise<AskResult> {
  const q = (question ?? '').trim();
  if (!q) return { error: 'Type a question first.' };

  const story = await getStoryById(storyId);
  if (!story) return { error: 'Story not found.' };

  const answer = await answerStoryQuestion(
    { title: story.title, summary: story.summary, overview: story.ai_overview },
    q,
  );
  if (!answer) {
    return { error: 'The AI assistant is unavailable right now — try again later.' };
  }
  return { answer };
}
