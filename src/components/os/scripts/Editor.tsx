"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { SlashCommand } from "./slash";
import "./editor.css";

/** Notion-like editor. Čuva i vraća markdown. */
export default function Editor({
  initial,
  onChange,
}: {
  initial: string;
  onChange: (markdown: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Piši, ili otkucaj / za blokove…" }),
      Markdown,
      SlashCommand,
    ],
    content: initial,
    contentType: "markdown",
    editorProps: { attributes: { class: "os-prose" } },
    onUpdate: ({ editor }) => onChange(editor.getMarkdown()),
  });

  return <EditorContent editor={editor} />;
}
