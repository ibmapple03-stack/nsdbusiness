import type { ReactNode } from "react";

/**
 * Renders the plain-text format used by editable content:
 *   "## Heading", "### Subheading", "- bullet", blank line = new paragraph.
 * No HTML is ever interpreted, so editor content cannot inject markup.
 */
export function RichText({ text, className = "prose-academy" }: { text: string; className?: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) blocks.push(<p key={blocks.length}>{para.join(" ")}</p>);
    para = [];
  };
  const flushList = () => {
    if (list.length)
      blocks.push(
        <ul key={blocks.length}>
          {list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>,
      );
    list = [];
  };

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
    } else if (line.startsWith("### ")) {
      flushPara();
      flushList();
      blocks.push(<h3 key={blocks.length}>{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      flushPara();
      flushList();
      blocks.push(<h2 key={blocks.length}>{line.slice(3)}</h2>);
    } else if (/^[-•*]\s+/.test(line)) {
      flushPara();
      list.push(line.replace(/^[-•*]\s+/, ""));
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return <div className={className}>{blocks}</div>;
}

/** Splits "- item" lines into an array (for custom list layouts). */
export function listItems(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^[-•*]\s+/.test(l))
    .map((l) => l.replace(/^[-•*]\s+/, ""));
}
