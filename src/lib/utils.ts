import type { ContentBlock, MarkDef, Span } from './types';

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function key(prefix = 'k') {
  const value =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}${value}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

export function formatDate(value: string | Date | null | undefined, style: 'long' | 'short' = 'long') {
  if (!value) return 'Not scheduled';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-US', {
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatDateParts(value: string | Date | null | undefined) {
  if (!value) return { date: 'Unscheduled', time: '' };
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return { date: 'Unscheduled', time: '' };
  return {
    date: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date),
    time: new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short',
    }).format(date),
  };
}

export function timeAgo(value: string | Date | null | undefined, now = new Date()) {
  if (!value) return 'Unscheduled';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return 'Unscheduled';
  const diff = Math.max(0, now.getTime() - date.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDate(date, 'short');
}

export function todayLabel() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date());
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function parseInline(text: string) {
  const markDefs: MarkDef[] = [];
  const children: Span[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const push = (value: string, marks: string[]) => {
    if (!value) return;
    children.push({ _type: 'span', _key: key('s'), text: value, marks });
  };

  while ((match = pattern.exec(text)) !== null) {
    push(text.slice(lastIndex, match.index), []);
    const token = match[0];
    if (token.startsWith('**')) {
      push(token.slice(2, -2), ['strong']);
    } else if (token.startsWith('`')) {
      push(token.slice(1, -1), ['code']);
    } else if (token.startsWith('*')) {
      push(token.slice(1, -1), ['em']);
    } else if (token.startsWith('[')) {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link) {
        const linkKey = key('l');
        markDefs.push({ _key: linkKey, _type: 'link', href: link[2] });
        push(link[1], [linkKey]);
      } else {
        push(token, []);
      }
    }
    lastIndex = pattern.lastIndex;
  }
  push(text.slice(lastIndex), []);
  if (children.length === 0) {
    children.push({ _type: 'span', _key: key('s'), text: '', marks: [] });
  }
  return { children, markDefs };
}

export function createBlock(
  style: ContentBlock['style'],
  text: string,
  listItem?: 'bullet' | 'number',
): ContentBlock {
  const { children, markDefs } = parseInline(text);
  return {
    _type: 'block',
    _key: key('b'),
    style,
    listItem,
    level: listItem ? 1 : undefined,
    children,
    markDefs,
  };
}

type BlockRow =
  | ['p' | 'lede' | 'h2' | 'h3' | 'quote', string]
  | ['ul' | 'ol', string[]];

export function blocksFromRows(rows: BlockRow[]): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  for (const row of rows) {
    if (row[0] === 'ul' || row[0] === 'ol') {
      for (const item of row[1]) {
        const block = createBlock('normal', item, row[0] === 'ul' ? 'bullet' : 'number');
        blocks.push(block);
      }
      continue;
    }
    const style =
      row[0] === 'h2' ? 'h2' : row[0] === 'h3' ? 'h3' : row[0] === 'quote' ? 'blockquote' : 'normal';
    blocks.push(createBlock(style, row[1] as string));

  }
  return blocks;
}

export function blockToPlainText(block: ContentBlock) {
  return block.children
    .map((child) => {
      let text = child.text;
      if (child.marks?.includes('strong')) text = `**${text}**`;
      if (child.marks?.includes('em')) text = `*${text}*`;
      if (child.marks?.includes('code')) text = `\`${text}\``;
      const link = block.markDefs.find((def) => child.marks?.includes(def._key));
      if (link) text = `[${text}](${link.href})`;
      return text;
    })
    .join('');
}

export function blocksToPlainText(blocks: ContentBlock[]) {
  return blocks.map(blockToPlainText).join('\n\n');
}

export function blocksToSearchText(blocks: ContentBlock[]) {
  return blocks
    .map((block) => block.children.map((child) => child.text).join(''))
    .join(' ')
    .toLowerCase();
}

export function contentStats(blocks: ContentBlock[]) {
  const plain = blocksToPlainText(blocks).replace(/\[[^\]]+\]\([^)]+\)/g, '$1');
  const words = plain.trim() ? plain.trim().split(/\s+/).length : 0;
  return {
    words,
    minutes: Math.max(1, Math.round(words / 220)),
  };
}

export function makeExcerpt(text: string, max = 165) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

export function normalizeImageUrl(value: string | undefined | null) {
  if (!value) return '/images/editorial/signal-ai-mesh.webp';
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) return value;
  return `/${value}`;
}

export function getEmbedUrl(url: string | undefined | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
      if (parsed.pathname.startsWith('/embed/')) return `https://www.youtube-nocookie.com${parsed.pathname}`;
      if (parsed.pathname.startsWith('/shorts/')) {
        return `https://www.youtube-nocookie.com/embed/${parsed.pathname.split('/')[2]}`;
      }
    }
    if (parsed.hostname === 'youtu.be') {
      return `https://www.youtube-nocookie.com/embed/${parsed.pathname.replace('/', '')}`;
    }
    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

export function initialsColor(seed: string) {
  const colors = [
    'from-lime-300/30 to-cyan-300/10 text-lime-200',
    'from-cyan-300/30 to-blue-400/10 text-cyan-200',
    'from-orange-300/30 to-rose-400/10 text-orange-200',
    'from-violet-300/30 to-fuchsia-400/10 text-violet-200',
    'from-emerald-300/30 to-teal-400/10 text-emerald-200',
  ];
  let total = 0;
  for (const char of seed) total += char.charCodeAt(0);
  return colors[total % colors.length];
}

export function paginate<T>(items: T[], page: number, perPage: number) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pages);
  return {
    items: items.slice((current - 1) * perPage, current * perPage),
    page: current,
    pages,
    total,
  };
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
