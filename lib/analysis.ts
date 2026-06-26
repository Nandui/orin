import Anthropic from '@anthropic-ai/sdk';
import type { AnalysisCard, Sentiment, Story } from '@/types';

// Story analysis provider. Prefers DeepSeek (deepseek-chat) when configured,
// falling back to Anthropic Claude (claude-sonnet-4-6). Both produce the same
// JSON shape; the data layer treats the AI fields as optional, so a failure
// here just leaves them null.

const ANTHROPIC_MODEL = 'claude-sonnet-4-6';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const DEEPSEEK_BASE_URL = (
  process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
).replace(/\/$/, '');

export interface StoryAnalysis {
  overview: string;
  analysis: AnalysisCard[];
  sentiment: Sentiment;
}

export function isAnalysisConfigured(): boolean {
  return Boolean(
    process.env.DEEPSEEK_API_KEY || process.env.ANTHROPIC_API_KEY,
  );
}

function buildPrompt(
  story: Pick<Story, 'title' | 'summary'>,
  clusterStories: Array<Pick<Story, 'title'>>,
  comments: string[],
): string {
  const others = clusterStories
    .map((s) => `"${s.title}"`)
    .filter(Boolean)
    .join(', ');

  const discussion = comments.length
    ? `\n\nTop comments from the original Reddit discussion (base the sentiment on THESE real reactions, not a guess):\n${comments
        .map((c, i) => `${i + 1}. ${c}`)
        .join('\n')}`
    : '';

  return `You are an editorial AI for SPAWN, a gaming news aggregator.

Story: "${story.title}"
Summary: "${story.summary ?? ''}"
Other outlets covering the same story: ${others || '(none)'}${discussion}

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
}

/** Strip ```json fences and validate the parsed shape. */
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

// --- DeepSeek (OpenAI-compatible chat completions + JSON mode) ---
async function viaDeepSeek(prompt: string): Promise<string | null> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 1024,
        temperature: 0.7,
        stream: false,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content : null;
  } catch {
    return null;
  }
}

// --- Anthropic Claude (official SDK) ---
let anthropic: Anthropic | null | undefined;
function getAnthropic(): Anthropic | null {
  if (anthropic !== undefined) return anthropic;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  anthropic = apiKey ? new Anthropic({ apiKey }) : null;
  return anthropic;
}

async function viaAnthropic(prompt: string): Promise<string | null> {
  const client = getAnthropic();
  if (!client) return null;
  try {
    const res = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = res.content.find((b) => b.type === 'text');
    return text && text.type === 'text' ? text.text : null;
  } catch {
    return null;
  }
}

// --- DeepSeek free-form text (no JSON mode), for the Spawn Deeper Q&A ---
async function viaDeepSeekText(prompt: string): Promise<string | null> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.6,
        stream: false,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content : null;
  } catch {
    return null;
  }
}

/**
 * Answer a reader's free-form question about a story (the "Spawn Deeper" widget),
 * grounded in the story's title/summary/overview. Returns null if no provider is
 * configured or the call fails.
 */
export async function answerStoryQuestion(
  story: { title: string; summary: string | null; overview: string | null },
  question: string,
): Promise<string | null> {
  if (!isAnalysisConfigured()) return null;
  const q = question.trim().slice(0, 300);
  if (!q) return null;

  const prompt = `You are SPAWN's gaming editorial assistant. Answer the reader's question about this news story in 2-4 concise sentences, grounded in the context below. If the answer isn't in the context, reason from general gaming knowledge but stay factual and avoid making up specifics.

Story: "${story.title}"
Summary: "${story.summary ?? ''}"
${story.overview ? `Editorial overview: "${story.overview}"` : ''}

Reader's question: ${q}

Answer:`;

  const raw = (await viaDeepSeekText(prompt)) ?? (await viaAnthropic(prompt));
  return raw ? raw.trim() : null;
}

/**
 * Generate an editorial overview, analysis angles, and sentiment for a story.
 * Returns null when no provider is configured or the output can't be parsed.
 */
export async function generateStoryAnalysis(
  story: Pick<Story, 'title' | 'summary'>,
  clusterStories: Array<Pick<Story, 'title'>> = [],
  comments: string[] = [],
): Promise<StoryAnalysis | null> {
  if (!isAnalysisConfigured()) return null;
  const prompt = buildPrompt(story, clusterStories, comments);
  const raw = (await viaDeepSeek(prompt)) ?? (await viaAnthropic(prompt));
  return raw ? safeParse(raw) : null;
}
