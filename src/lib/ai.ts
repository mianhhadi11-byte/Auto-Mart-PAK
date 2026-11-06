import 'server-only';
import { SITE } from './constants';
import { slugify } from './utils';

export type AiTask = 'draft' | 'headlines' | 'summary' | 'grammar' | 'seo' | 'social' | 'readability';

export interface AiSource {
  name: string;
  url: string;
  text: string;
}

export interface AiRequest {
  task: AiTask;
  title?: string;
  text?: string;
  tone?: string;
  sources: AiSource[];
}

export interface AiResponse {
  task: AiTask;
  mode: 'live' | 'demo';
  provider: string;
  model: string;
  text: string;
  items?: string[];
  fields?: Record<string, string>;
  warning?: string;
  disclaimer: string;
}

const DISCLAIMER =
  'AI-assisted draft. Every fact, name, number and quote must be verified by a human editor before publishing. Nothing here is published automatically.';

const SYSTEM_PROMPT = `You are the MIC TECH editorial assistant, a tool used by professional journalists.
Follow these rules without exception:
1. Use ONLY facts present in the supplied source material. Never invent names, numbers, dates, quotes, products, companies, events or outcomes.
2. If a required fact is missing, write [VERIFY] instead of guessing.
3. You may improve structure, clarity and grammar, but you may not add claims.
4. Never publish, schedule or imply publication. A human editor approves everything.
5. Write in a calm, precise, independent newsroom voice. No hype, no clickbait, no promotional language.
6. Return only the format requested for the task.`;

function taskInstruction(task: AiTask) {
  switch (task) {
    case 'draft':
      return `Draft a newsroom article from the verified source notes. Return plain text in this shape:
HED: a specific headline (max 90 characters)
DEK: a one-sentence summary
Then 4-6 short sections, each starting with "## ".
Finish with "Sources:" listing only the supplied source names and URLs.
Use [VERIFY] wherever the notes do not support a detail. Do not add analysis that is not in the notes.`;
    case 'headlines':
      return `Write five headline options from the verified material. Return JSON only: {"headlines":["...","...","...","...","..."]}. Each headline must be under 90 characters, specific, and factually supported by the notes. No clickbait.`;
    case 'summary':
      return `Write a 2-3 sentence summary (maximum 60 words) using only facts in the verified material. Return plain text only.`;
    case 'grammar':
      return `Correct grammar, punctuation, spelling and awkward phrasing in the supplied draft. Preserve every fact, name, number and quote exactly. Do not add new information. Return the corrected text only.`;
    case 'seo':
      return `Create SEO metadata from the verified material. Return JSON only: {"seoTitle":"...","seoDescription":"...","slug":"..."}. seoTitle max 60 characters, seoDescription max 155 characters, slug lowercase hyphenated. Do not invent facts.`;
    case 'social':
      return `Write social posts from the verified material. Return JSON only: {"x":"...","linkedin":"..."}. The X post must be 250 characters or fewer. The LinkedIn post must be 600 characters or fewer. Do not invent facts, quotes or numbers. Use #MICTTech at most once.`;
    case 'readability':
      return `Review the supplied draft for readability. Return 4-6 short bullet points with specific, actionable edits (sentence length, jargon, structure, clarity). Do not rewrite the article and do not add facts.`;
  }
}

function composeUserPrompt(request: AiRequest) {
  const parts: string[] = [];
  if (request.title?.trim()) parts.push(`Working headline: ${request.title.trim()}`);
  if (request.tone?.trim()) parts.push(`Requested tone: ${request.tone.trim()}`);
  if (request.text?.trim()) {
    parts.push(`Current draft or notes:\n${request.text.trim().slice(0, 16000)}`);
  }
  if (request.sources.length > 0) {
    request.sources.forEach((source, index) => {
      parts.push(
        `Verified source ${index + 1} — ${source.name || 'Unnamed'}${source.url ? ` (${source.url})` : ''}:\n${
          source.text.trim().slice(0, 12000) || '(no text supplied)'
        }`,
      );
    });
  }
  if (parts.length === 0) parts.push('No source material was supplied. Return a short request for source material and do not invent facts.');
  return parts.join('\n\n');
}

function extractJson(text: string): Record<string, unknown> | null {
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function structured(task: AiTask) {
  return task === 'headlines' || task === 'seo' || task === 'social';
}

function parseStructured(
  task: AiTask,
  raw: string,
  fallbackTitle: string,
  fallbackText: string,
): Pick<AiResponse, 'text' | 'items' | 'fields'> {
  const json = extractJson(raw);
  if (task === 'headlines') {
    const headlines = json?.headlines;
    const list = Array.isArray(headlines)
      ? headlines.filter((item): item is string => typeof item === 'string')
      : raw
          .split('\n')
          .map((line) => line.replace(/^[-*\d.\s]+/, '').trim())
          .filter(Boolean);
    const items = list.slice(0, 6);
    return { text: items.join('\n'), items };
  }
  if (task === 'seo') {
    const fields = {
      seoTitle: String(json?.seoTitle || fallbackTitle).slice(0, 60),
      seoDescription: String(json?.seoDescription || fallbackText).slice(0, 155),
      slug: slugify(String(json?.slug || fallbackTitle)),
    };
    return {
      text: `SEO title: ${fields.seoTitle}\nMeta description: ${fields.seoDescription}\nSlug: ${fields.slug}`,
      fields,
    };
  }
  if (task === 'social') {
    const fields = {
      x: String(json?.x || fallbackTitle).slice(0, 250),
      linkedin: String(json?.linkedin || `${fallbackTitle}\n\n${fallbackText}`).slice(0, 600),
    };
    return { text: `X\n${fields.x}\n\nLinkedIn\n${fields.linkedin}`, fields };
  }
  return { text: raw };
}

async function callOpenAi(request: AiRequest, config: { key: string; baseUrl: string; model: string }) {
  const response = await fetch(`${config.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      max_tokens: 1800,
      ...(structured(request.task) ? { response_format: { type: 'json_object' } } : {}),
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `${taskInstruction(request.task)}\n\n${composeUserPrompt(request)}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`AI provider returned ${response.status}${body ? `: ${body.slice(0, 240)}` : ''}`);
  }
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('AI provider returned an empty response.');
  return text;
}

async function callAnthropic(request: AiRequest, config: { key: string; baseUrl: string; model: string }) {
  const base = config.baseUrl.replace(/\/+$/, '');
  const endpoint = base.endsWith('/v1') ? `${base}/messages` : `${base}/v1/messages`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': config.key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 1800,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${taskInstruction(request.task)}\n\n${composeUserPrompt(request)}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`AI provider returned ${response.status}${body ? `: ${body.slice(0, 240)}` : ''}`);
  }
  const data = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = data.content
    ?.filter((part) => part.type === 'text')
    .map((part) => part.text || '')
    .join('\n')
    .trim();
  if (!text) throw new Error('AI provider returned an empty response.');
  return text;
}

/* ------------------------------------------------------------------ */
/* Deterministic extractive fallback                                   */
/* ------------------------------------------------------------------ */

function sentences(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function cleanExtract(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

function capFirst(text: string) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function demoDraft(request: AiRequest): string {
  const title = request.title?.trim() || 'Untitled story';
  const sourceText = cleanExtract(
    [request.text, ...request.sources.map((source) => source.text)].filter(Boolean).join(' '),
  );
  const list = sentences(sourceText);
  const dek = list.slice(0, 2).join(' ') || '[VERIFY] Add verified source material before drafting.';
  const sections = Math.max(1, Math.min(4, Math.ceil(list.length / 2)));
  const perSection = Math.max(1, Math.ceil(list.length / Math.max(1, sections)));
  const body: string[] = [];
  for (let index = 0; index < sections; index += 1) {
    const chunk = list.slice(index * perSection, (index + 1) * perSection);
    if (chunk.length === 0) continue;
    body.push(`## ${index === 0 ? 'What happened' : index === 1 ? 'Why it matters' : `Context ${index - 1}`}\n\n${chunk.join(' ')}`);
  }
  if (body.length === 0) {
    body.push('## What happened\n\n[VERIFY] Add source notes to generate a draft.');
  }
  const sourceList = request.sources.length
    ? request.sources
        .map((source) => `- ${source.name || 'Source'}${source.url ? ` — ${source.url}` : ''}`)
        .join('\n')
    : '- [VERIFY] No source supplied.';
  return `HED: ${title}\nDEK: ${dek}\n\n${body.join('\n\n')}\n\nSources:\n${sourceList}`;
}

function demoHeadlines(request: AiRequest): string[] {
  const title = capFirst(request.title?.trim() || sentences(request.text || '')[0] || 'Untitled story');
  const base = title.replace(/[.?!]$/, '');
  return [
    base,
    `Inside the story: ${base}`,
    `${base} — what we know`,
    `Explained: ${base}`,
    `The verified facts behind ${base.charAt(0).toLowerCase()}${base.slice(1)}`,
  ].map((headline) => headline.slice(0, 89));
}

function demoSummary(request: AiRequest): string {
  const text = request.text || request.sources.map((source) => source.text).join(' ');
  const extract = sentences(cleanExtract(text)).slice(0, 3).join(' ');
  return extract || '[VERIFY] No source material supplied for a summary.';
}

function demoGrammar(request: AiRequest): string {
  const text = request.text || '';
  if (!text.trim()) return '[VERIFY] Add a draft to check.';
  return sentences(text)
    .map((sentence) => capFirst(sentence))
    .join(' ')
    .replace(/\bi\b/g, 'I')
    .replace(/\s+/g, ' ')
    .trim();
}

function demoSeo(request: AiRequest) {
  const title = request.title?.trim() || sentences(request.text || '')[0] || 'MIC TECH report';
  const description =
    request.text?.trim().slice(0, 155) ||
    `${title} — reporting and context from the MIC TECH newsroom.`;
  return {
    seoTitle: title.slice(0, 60),
    seoDescription: cleanExtract(description).slice(0, 155),
    slug: slugify(title),
  };
}

function demoSocial(request: AiRequest) {
  const title = request.title?.trim() || 'MIC TECH report';
  const summary = demoSummary(request);
  const link = `${SITE.url.replace(/\/$/, '')}/latest`;
  return {
    x: `${title}\n\n${summary}`.slice(0, 220) + `\n\n${link} #MICTTech`,
    linkedin: `${title}\n\n${summary}\n\nRead the full report from the MIC TECH newsroom: ${link}`.slice(0, 600),
  };
}

function demoReadability(request: AiRequest) {
  const text = cleanExtract(request.text || request.sources.map((source) => source.text).join(' '));
  const list = sentences(text);
  const words = text ? text.split(/\s+/).length : 0;
  const average = list.length ? Math.round(words / list.length) : 0;
  const long = list.filter((sentence) => sentence.split(/\s+/).length > 28).length;
  const passive = (text.match(/\b(was|were|is|are|been|being)\s+\w+ed\b/gi) || []).length;
  return [
    `Average sentence length is ${average} words. Aim for 15–22 words per sentence.`,
    long > 0
      ? `${long} sentence${long === 1 ? '' : 's'} exceed 28 words. Split the longest ones at the main clause.`
      : 'Sentence length is within a readable range.',
    passive > 0
      ? `Found ${passive} likely passive construction${passive === 1 ? '' : 's'}. Name the actor where it matters.`
      : 'No obvious passive constructions were detected.',
    'Move the single most important verified fact into the first two paragraphs.',
    'Keep attribution close to each claim; link primary sources where available.',
  ];
}

export function runDemoAi(request: AiRequest): AiResponse {
  const title = request.title?.trim() || '';
  const text = cleanExtract(request.text || '');
  let response: AiResponse;

  switch (request.task) {
    case 'draft':
      response = { task: request.task, mode: 'demo', provider: 'local', model: 'extractive-v1', text: demoDraft(request), disclaimer: DISCLAIMER };
      break;
    case 'headlines':
      response = {
        task: request.task,
        mode: 'demo',
        provider: 'local',
        model: 'extractive-v1',
        disclaimer: DISCLAIMER,
        text: demoHeadlines(request).join('\n'),
        items: demoHeadlines(request),
      };
      break;
    case 'summary':
      response = { task: request.task, mode: 'demo', provider: 'local', model: 'extractive-v1', text: demoSummary(request), disclaimer: DISCLAIMER };
      break;
    case 'grammar':
      response = { task: request.task, mode: 'demo', provider: 'local', model: 'extractive-v1', text: demoGrammar(request), disclaimer: DISCLAIMER };
      break;
    case 'seo': {
      const fields = demoSeo(request);
      response = {
        task: request.task,
        mode: 'demo',
        provider: 'local',
        model: 'extractive-v1',
        disclaimer: DISCLAIMER,
        text: `SEO title: ${fields.seoTitle}\nMeta description: ${fields.seoDescription}\nSlug: ${fields.slug}`,
        fields,
      };
      break;
    }
    case 'social': {
      const fields = demoSocial(request);
      response = {
        task: request.task,
        mode: 'demo',
        provider: 'local',
        model: 'extractive-v1',
        disclaimer: DISCLAIMER,
        text: `X\n${fields.x}\n\nLinkedIn\n${fields.linkedin}`,
        fields,
      };
      break;
    }
    case 'readability': {
      const items = demoReadability(request);
      response = {
        task: request.task,
        mode: 'demo',
        provider: 'local',
        model: 'extractive-v1',
        disclaimer: DISCLAIMER,
        text: items.join('\n'),
        items,
      };
      break;
    }
  }

  response.warning = title || text ? undefined : 'Add source notes or a draft to get a more useful result.';
  response.disclaimer = DISCLAIMER;
  return response;
}

export async function runAi(request: AiRequest): Promise<AiResponse> {
  const key = process.env.AI_API_KEY?.trim();
  if (!key) return runDemoAi(request);

  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
  const baseUrl = process.env.AI_BASE_URL?.trim() || 'https://api.openai.com/v1';
  const model = process.env.AI_MODEL?.trim() || 'gpt-4.1-mini';

  try {
    const raw =
      provider === 'anthropic'
        ? await callAnthropic(request, { key, baseUrl, model })
        : await callOpenAi(request, { key, baseUrl, model });
    const parsed = structured(request.task)
      ? parseStructured(request.task, raw, request.title || '', request.text || '')
      : { text: raw.trim() };
    return {
      task: request.task,
      mode: 'live',
      provider,
      model,
      ...parsed,
      disclaimer: DISCLAIMER,
    };
  } catch (error) {
    const demo = runDemoAi(request);
    return {
      ...demo,
      warning: `Live AI request failed, so this is the deterministic extractive preview. ${
        error instanceof Error ? error.message.slice(0, 200) : 'Unknown provider error.'
      }`,
    };
  }
}
