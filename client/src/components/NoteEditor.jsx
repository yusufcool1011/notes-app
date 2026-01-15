import React, { useMemo } from "react";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

export default function NoteEditor({ title, setTitle, content, setContent }) {
  const html = useMemo(() => {
    // For production, consider sanitizing output (DOMPurify) before rendering HTML.
    return marked.parse(content || "");
  }, [content]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[70vh]">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-zinc-100">
          <div className="text-sm font-medium text-zinc-700">Editor</div>
        </div>
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          <input
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/10"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
          />
          <textarea
            className="flex-1 w-full rounded-xl border border-zinc-200 px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"# Hello\n\nWrite *Markdown* here...\n\n- Fast\n- Simple\n- Yours"}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100">
          <div className="text-sm font-medium text-zinc-700">Preview</div>
        </div>
        <div className="p-4 overflow-auto prose-lite" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
