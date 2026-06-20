import Anthropic from '@anthropic-ai/sdk';
import type { AnalysisCard, Sentiment, Story } from '@/types';

// The product spec (§2, §7.3) pins the analysis model to Sonnet 4.6 — a
// deliberate cost choice for a high-volume ingestion pipeline (~$0.003/story).

const ANALYSIS_MODEL = 'claude-sonnet-4-6';

let cached: Anthropic | null | undefined;

function getClient(): Anthropic | null {
  if (cached !== undefined) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  cached = apiKey ? new Anthropic({ apiKey }) : null;
  return cached;
}

export interface StoryAnalysis {
  overview: string;
  analysis: AnalysisCard[];
  sentiment: Sentiment;
}

/** Strip ```json fences and parse, returning null on failure. */
function safeParse(raw: string): StoryAnalysis | null {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');
  try {
    const obj = JSON.parse(cleaned);
    if (
      typeof obj?.overview === 'string' &&
      Array.isArray(obj?.analysis) &&
      obj?.sentiment &&
      typeof obj.sentiment.pos === 'number'
    ) {
      return obj as StoryAnalysis;
    }
  } catch {
    /* fall through */
  }
  return null;
}

/**
 * Generate an editorial overview, analysis angles, and sentiment summary for a
 * story. Returns null when the API isn't configured or the model output can't
 * be parsed (the caller should treat AI fields as optional).
 */
export async function generateStoryAnalysis(
  story: Pick<Story, 'title' | 'summary'>,
  clusterStories: Array<Pick<Story, 'title'>> = [],
): Promise<StoryAnalysis | null> {
  const client = getClient();
  if (!client) return null;

  const others = clusterStories
    .map((s) => `"${s.title}"`)
    .filter(Boolean)
    .join(', ');

  const prompt = `You are an editorial AI for SPAWN, a gaming news aggregator.

Story: "${story.title}"
Summary: "${story.summary ?? ''}"
Other outlets covering the same story: ${others || '(none)'}

Return ONLY a JSON object (no markdown, no prose) with this exact shape:
{
  "overview": "2-3 sentence editorial overview of what this story means for gaming",
  "analysis": [
    { "tag": "SHORT LABEL IN CAPS", "title": "Analysis card title", "body": "2-3 sentence analysis" },
    { "tag": "SHORT LABEL IN CAPS", "title": "Second angle title", "body": "2-3 sentence analysis" }
  ],
  "sentiment": {
    "pos": 75.6,
    "neg": 24.4,
    "text": "2 sentence summary of how the gaming community is likely reacting to this"
  }
}`;

  try {
    const res = await client.messages.create({
      model: ANALYSIS_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = res.content.find((b) => b.type === 'text');
    if (!text || text.type !== 'text') return null;
    return safeParse(text.text);
  } catch {
    return null;
  }
}
