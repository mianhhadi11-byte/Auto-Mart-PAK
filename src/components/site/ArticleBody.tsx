import { Fragment, type ReactNode } from 'react';
import type { ContentBlock, MarkDef, Span } from '@/lib/types';
import { slugify } from '@/lib/utils';

function safeHref(href: string) {
  const value = href.trim();
  if (
    value.startsWith('/') ||
    value.startsWith('#') ||
    value.startsWith('https://') ||
    value.startsWith('http://') ||
    value.startsWith('mailto:')
  ) {
    return value;
  }
  return '#';
}

function InlineSpan({ span, markDefs }: { span: Span; markDefs: MarkDef[] }) {
  let content: ReactNode = span.text;
  if (span.marks.includes('code')) content = <code>{content}</code>;
  if (span.marks.includes('em')) content = <em>{content}</em>;
  if (span.marks.includes('strong')) content = <strong>{content}</strong>;
  const link = markDefs.find((definition) => span.marks.includes(definition._key));
  if (link) {
    const href = safeHref(link.href);
    const external = href.startsWith('http');
    content = (
      <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}>
        {content}
      </a>
    );
  }
  return <Fragment key={span._key}>{content}</Fragment>;
}

function BlockContent({ block }: { block: ContentBlock }) {
  return (
    <>
      {block.children.map((span) => (
        <InlineSpan key={span._key} span={span} markDefs={block.markDefs} />
      ))}
    </>
  );
}

export function ArticleBody({ blocks }: { blocks: ContentBlock[] }) {
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];

    if (block.listItem) {
      const type = block.listItem;
      const items: ContentBlock[] = [];
      while (index < blocks.length && blocks[index].listItem === type) {
        items.push(blocks[index]);
        index += 1;
      }
      const ListTag = type === 'number' ? 'ol' : 'ul';
      nodes.push(
        <ListTag key={`list-${block._key}`}>
          {items.map((item) => (
            <li key={item._key}>
              <BlockContent block={item} />
            </li>
          ))}
        </ListTag>,
      );
      continue;
    }

    index += 1;
    if (block.style === 'h2') {
      const plain = block.children.map((child) => child.text).join('');
      nodes.push(
        <h2 key={block._key} id={slugify(plain)}>
          <BlockContent block={block} />
        </h2>,
      );
    } else if (block.style === 'h3') {
      const plain = block.children.map((child) => child.text).join('');
      nodes.push(
        <h3 key={block._key} id={slugify(plain)}>
          <BlockContent block={block} />
        </h3>,
      );
    } else if (block.style === 'blockquote') {
      nodes.push(
        <blockquote key={block._key}>
          <BlockContent block={block} />
        </blockquote>,
      );
    } else {
      nodes.push(
        <p key={block._key}>
          <BlockContent block={block} />
        </p>,
      );
    }
  }

  return <div className="story-body">{nodes}</div>;
}
