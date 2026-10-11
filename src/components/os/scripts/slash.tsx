"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  Extension,
  ReactRenderer,
  type Editor,
  type Range,
} from "@tiptap/react";
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from "@tiptap/suggestion";
import {
  CheckSquare,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  LayoutTemplate,
  List,
  ListOrdered,
  Minus,
  Quote,
  Type,
  type LucideIcon,
} from "lucide-react";
import { OS } from "@/lib/os/theme";

type Item = {
  title: string;
  hint: string;
  keywords: string;
  icon: LucideIcon;
  run: (editor: Editor, range: Range) => void;
};

const chain = (editor: Editor, range: Range) =>
  editor.chain().focus().deleteRange(range);

/* Struktura reklamne skripte: kuka u prve 3 sekunde, sadržaj, poziv na akciju. */
const TEMPLATE = `## Hook (0–3s)

## Telo

## CTA

## Kadrovi
- [ ] `;

const ITEMS: Item[] = [
  {
    title: "Šablon skripte",
    hint: "Hook · Telo · CTA · Kadrovi",
    keywords: "sablon template hook cta",
    icon: LayoutTemplate,
    run: (e, r) =>
      chain(e, r).insertContent(TEMPLATE, { contentType: "markdown" }).run(),
  },
  {
    title: "Tekst",
    hint: "Običan pasus",
    keywords: "tekst paragraf text",
    icon: Type,
    run: (e, r) => chain(e, r).setParagraph().run(),
  },
  {
    title: "Naslov 1",
    hint: "#",
    keywords: "naslov h1 heading",
    icon: Heading1,
    run: (e, r) => chain(e, r).setHeading({ level: 1 }).run(),
  },
  {
    title: "Naslov 2",
    hint: "##",
    keywords: "naslov h2 heading",
    icon: Heading2,
    run: (e, r) => chain(e, r).setHeading({ level: 2 }).run(),
  },
  {
    title: "Naslov 3",
    hint: "###",
    keywords: "naslov h3 heading",
    icon: Heading3,
    run: (e, r) => chain(e, r).setHeading({ level: 3 }).run(),
  },
  {
    title: "Lista",
    hint: "-",
    keywords: "lista bullet",
    icon: List,
    run: (e, r) => chain(e, r).toggleBulletList().run(),
  },
  {
    title: "Numerisana lista",
    hint: "1.",
    keywords: "numerisana lista ordered broj",
    icon: ListOrdered,
    run: (e, r) => chain(e, r).toggleOrderedList().run(),
  },
  {
    title: "To-do",
    hint: "[ ]",
    keywords: "todo checkbox zadatak kadar",
    icon: CheckSquare,
    run: (e, r) => chain(e, r).toggleTaskList().run(),
  },
  {
    title: "Citat",
    hint: ">",
    keywords: "citat quote",
    icon: Quote,
    run: (e, r) => chain(e, r).toggleBlockquote().run(),
  },
  {
    title: "Razdelnik",
    hint: "---",
    keywords: "razdelnik linija divider",
    icon: Minus,
    run: (e, r) => chain(e, r).setHorizontalRule().run(),
  },
  {
    title: "Kod",
    hint: "```",
    keywords: "kod code",
    icon: Code2,
    run: (e, r) => chain(e, r).toggleCodeBlock().run(),
  },
];

const fold = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "dj");

type ListHandle = { onKeyDown: (p: SuggestionKeyDownProps) => boolean };
type ListProps = SuggestionProps<Item>;

const SlashList = forwardRef<ListHandle, ListProps>(function SlashList(
  { items, command },
  ref,
) {
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (!items.length) return false;
      if (event.key === "ArrowDown") {
        setActive((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === "ArrowUp") {
        setActive((i) => (i - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        command(items[active]);
        return true;
      }
      return false;
    },
  }));

  if (!items.length) return null;
  return (
    <div
      className="max-h-[320px] w-[260px] overflow-y-auto rounded-xl p-1"
      style={{
        background: "rgba(28,28,33,0.92)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: `1px solid ${OS.lineStrong}`,
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
      }}
    >
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <button
            key={it.title}
            type="button"
            onMouseEnter={() => setActive(i)}
            onMouseDown={(e) => {
              e.preventDefault();
              command(it);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left"
            style={{
              background: i === active ? "rgba(255,255,255,0.08)" : undefined,
            }}
          >
            <span
              className="grid size-8 shrink-0 place-items-center rounded-md"
              style={{
                background: OS.surface,
                border: `1px solid ${OS.line}`,
                color: OS.text,
              }}
            >
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px]" style={{ color: OS.text }}>
                {it.title}
              </span>
              <span
                className="block truncate text-[12px]"
                style={{ color: OS.muted }}
              >
                {it.hint}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
});

export const SlashCommand = Extension.create({
  name: "slashCommand",
  addProseMirrorPlugins() {
    return [
      Suggestion<Item, Item>({
        editor: this.editor,
        char: "/",
        startOfLine: false,
        command: ({ editor, range, props }) => props.run(editor, range),
        items: ({ query }) => {
          const q = fold(query);
          return ITEMS.filter((it) =>
            fold(it.title + " " + it.keywords).includes(q),
          );
        },
        render: () => {
          let renderer: ReactRenderer<ListHandle, ListProps> | null = null;
          let el: HTMLDivElement | null = null;

          const place = (props: ListProps) => {
            const rect = props.clientRect?.();
            if (!rect || !el) return;
            const below = rect.bottom + 6;
            const fitsBelow = below + 330 < window.innerHeight;
            el.style.left = `${Math.min(rect.left, window.innerWidth - 268)}px`;
            el.style.top = fitsBelow ? `${below}px` : "";
            el.style.bottom = fitsBelow
              ? ""
              : `${window.innerHeight - rect.top + 6}px`;
          };

          return {
            onStart: (props) => {
              renderer = new ReactRenderer(SlashList, {
                props,
                editor: props.editor,
              });
              el = document.createElement("div");
              el.style.position = "fixed";
              el.style.zIndex = "60";
              el.appendChild(renderer.element);
              document.body.appendChild(el);
              place(props);
            },
            onUpdate: (props) => {
              renderer?.updateProps(props);
              place(props);
            },
            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                el?.remove();
                return true;
              }
              return renderer?.ref?.onKeyDown(props) ?? false;
            },
            onExit: () => {
              el?.remove();
              renderer?.destroy();
              el = null;
              renderer = null;
            },
          };
        },
      }),
    ];
  },
});
