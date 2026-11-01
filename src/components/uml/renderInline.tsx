import { Fragment } from "react";

const TOKEN = /(`[^`]+`|\{\{\w+\|[^}]+\}\})/;

/** Tekst sa `inline kodom` i {{ton|isticanjem}} iz fajla sa sadržajem. */
export function renderInline(text: string) {
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith("`")) {
      return (
        <code key={i} className="uml-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("{{")) {
      const [tone, content] = part.slice(2, -2).split("|");
      return (
        <span key={i} className="uml-hl" data-tone={tone}>
          {content}
        </span>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
