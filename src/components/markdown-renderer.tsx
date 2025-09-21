"use client";

import { useMemo, type ReactNode } from "react";

type MarkdownRendererProps = {
  markdown: string;
};

type OrderedListState = {
  start: number;
  items: string[];
};

type CodeBlockState = {
  language: string;
  lines: string[];
};

const CODE_FENCE = /`{3,}(.*)$/;
const HORIZONTAL_RULE = /^-{3,}$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const UNORDERED_LIST = /^[-*+]\s+(.*)$/;
const ORDERED_LIST = /^(\d+)[.)]\s+(.*)$/;
const INDENTED_LINE = /^\s{2,}(.*)$/;

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  const content = useMemo(() => parseMarkdown(markdown), [markdown]);
  return <article className="markdown-body">{content}</article>;
}

function parseMarkdown(markdown: string): ReactNode[] {
  const elements: ReactNode[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  let keyCounter = 0;
  const nextKey = () => `md-${keyCounter++}`;

  let paragraph: string[] = [];
  let unordered: string[] | null = null;
  let ordered: OrderedListState | null = null;
  let code: CodeBlockState | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }
    const key = nextKey();
    const text = paragraph.join(" ");
    elements.push(<p key={key}>{renderInline(text, key)}</p>);
    paragraph = [];
  };

  const flushUnordered = () => {
    if (!unordered || unordered.length === 0) {
      return;
    }
    const key = nextKey();
    elements.push(
      <ul key={key}>
        {unordered.map((item, index) => (
          <li key={`${key}-li-${index}`}>{renderInline(item.trim(), `${key}-li-${index}`)}</li>
        ))}
      </ul>
    );
    unordered = null;
  };

  const flushOrdered = () => {
    if (!ordered || ordered.items.length === 0) {
      return;
    }
    const key = nextKey();
    elements.push(
      <ol key={key} start={ordered.start}>
        {ordered.items.map((item, index) => (
          <li key={`${key}-li-${index}`}>{renderInline(item.trim(), `${key}-li-${index}`)}</li>
        ))}
      </ol>
    );
    ordered = null;
  };

  const flushCode = () => {
    if (!code) {
      return;
    }
    const key = nextKey();
    const language = code.language ? code.language.toLowerCase() : "";
    const content = code.lines.join("\n");
    elements.push(
      <pre key={key}>
        <code className={language ? `language-${language}` : undefined} data-language={language}>
          {content}
        </code>
      </pre>
    );
    code = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");

    if (code) {
      if (CODE_FENCE.test(line.trim())) {
        flushCode();
      } else {
        code.lines.push(rawLine);
      }
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushUnordered();
      flushOrdered();
      continue;
    }

    if (CODE_FENCE.test(trimmed)) {
      flushParagraph();
      flushUnordered();
      flushOrdered();
      const language = trimmed.replace(/`/g, "").trim();
      code = { language, lines: [] };
      continue;
    }

    if (HORIZONTAL_RULE.test(trimmed)) {
      flushParagraph();
      flushUnordered();
      flushOrdered();
      elements.push(<hr key={nextKey()} />);
      continue;
    }

    const heading = trimmed.match(HEADING);
    if (heading) {
      flushParagraph();
      flushUnordered();
      flushOrdered();
      const level = Math.min(heading[1].length, 6);
      const content = heading[2].trim();
      const key = nextKey();
      elements.push(createHeading(level, renderInline(content, `${key}-heading`), key));
      continue;
    }

    const unorderedMatch = trimmed.match(UNORDERED_LIST);
    if (unorderedMatch) {
      flushParagraph();
      flushOrdered();
      unordered = unordered ?? [];
      unordered.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = trimmed.match(ORDERED_LIST);
    if (orderedMatch) {
      flushParagraph();
      flushUnordered();
      const start = parseInt(orderedMatch[1], 10);
      const value = orderedMatch[2];
      if (!ordered) {
        ordered = { start, items: [] };
      }
      ordered.items.push(value);
      continue;
    }

    if (unordered && INDENTED_LINE.test(rawLine)) {
      unordered[unordered.length - 1] = `${unordered[unordered.length - 1]} ${rawLine.trim()}`;
      continue;
    }

    if (ordered && INDENTED_LINE.test(rawLine)) {
      const lastIndex = ordered.items.length - 1;
      ordered.items[lastIndex] = `${ordered.items[lastIndex]} ${rawLine.trim()}`;
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushUnordered();
  flushOrdered();
  flushCode();

  return elements;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let inlineIndex = 0;
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^\)]+\))/;

  while (remaining.length > 0) {
    const match = remaining.match(pattern);
    if (!match || match.index === undefined) {
      nodes.push(remaining);
      break;
    }

    if (match.index > 0) {
      nodes.push(remaining.slice(0, match.index));
    }

    const token = match[0];

    if (token.startsWith("**")) {
      const key = `${keyPrefix}-strong-${inlineIndex++}`;
      nodes.push(
        <strong key={key}>{renderInline(token.slice(2, -2), `${key}-inner`)}</strong>
      );
    } else if (token.startsWith("*")) {
      const key = `${keyPrefix}-em-${inlineIndex++}`;
      nodes.push(
        <em key={key}>{renderInline(token.slice(1, -1), `${key}-inner`)}</em>
      );
    } else if (token.startsWith("`")) {
      const key = `${keyPrefix}-code-${inlineIndex++}`;
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const key = `${keyPrefix}-link-${inlineIndex++}`;
        nodes.push(
          <a key={key} href={href} target="_blank" rel="noreferrer">
            {renderInline(label, `${key}-inner`)}
          </a>
        );
      } else {
        nodes.push(token);
      }
    }

    remaining = remaining.slice(match.index + token.length);
  }

  return nodes;
}

function createHeading(level: number, children: ReactNode, key: string): ReactNode {
  switch (level) {
    case 1:
      return <h1 key={key}>{children}</h1>;
    case 2:
      return <h2 key={key}>{children}</h2>;
    case 3:
      return <h3 key={key}>{children}</h3>;
    case 4:
      return <h4 key={key}>{children}</h4>;
    case 5:
      return <h5 key={key}>{children}</h5>;
    default:
      return <h6 key={key}>{children}</h6>;
  }
}
