import React, { useEffect, useMemo, useState } from "react";
import { createNote, deleteNote, listNotes, updateNote } from "../api.js";
import NoteEditor from "./NoteEditor.jsx";

export default function Notes({ auth, onLogout }) {
  const { username, password } = auth;

  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const n = await listNotes(username, password);
    setNotes(n);
    if (!activeId && n[0]) {
      setActiveId(n[0].id);
      setTitle(n[0].title);
      setContent(n[0].content);
    }
  }

  useEffect(() => {
    refresh().catch((e) => setStatus(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return notes;
    return notes.filter((n) => (n.title + "\n" + n.content).toLowerCase().includes(s));
  }, [notes, q]);

  function selectNote(n) {
    setActiveId(n.id);
    setTitle(n.title);
    setContent(n.content);
    setStatus("");
  }

  async function newNote() {
    setBusy(true);
    setStatus("");
    try {
      const note = await createNote(username, password, { title: "Untitled", content: "" });
      setNotes((prev) => [note, ...prev]);
      selectNote(note);
    } catch (e) {
      setStatus(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!activeId) return;
    setBusy(true);
    setStatus("");
    try {
      await updateNote(username, password, activeId, { title, content });
      setNotes((prev) =>
        prev
          .map((n) => (n.id === activeId ? { ...n, title, content, updated_at: new Date().toISOString() } : n))
          .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
      );
      setStatus("Saved");
      setTimeout(() => setStatus(""), 1200);
    } catch (e) {
      setStatus(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!activeId) return;
    setBusy(true);
    setStatus("");
    try {
      await deleteNote(username, password, activeId);
      const remaining = notes.filter((n) => n.id !== activeId);
      setNotes(remaining);
      if (remaining[0]) selectNote(remaining[0]);
      else {
        setActiveId(null);
        setTitle("");
        setContent("");
      }
    } catch (e) {
      setStatus(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between mb-4">
        <div>
          <div className="text-2xl font-semibold text-zinc-900">Your notes</div>
          <div className="text-sm text-zinc-500">
            Signed in as <span className="font-medium">{username}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={newNote}
            disabled={busy}
            className="rounded-xl bg-zinc-900 text-white px-4 py-2 font-medium hover:bg-zinc-800 disabled:opacity-60"
          >
            New note
          </button>
          <button
            onClick={save}
            disabled={busy || !activeId}
            className="rounded-xl bg-white px-4 py-2 font-medium ring-1 ring-zinc-200 hover:bg-zinc-50 disabled:opacity-60"
          >
            Save
          </button>
          <button
            onClick={remove}
            disabled={busy || !activeId}
            className="rounded-xl bg-white px-4 py-2 font-medium ring-1 ring-zinc-200 hover:bg-zinc-50 disabled:opacity-60"
          >
            Delete
          </button>
          <button
            onClick={onLogout}
            className="rounded-xl bg-white px-4 py-2 font-medium ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 overflow-hidden">
          <div className="p-3 border-b border-zinc-100">
            <input
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/10"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search notes..."
            />
          </div>

          <div className="max-h-[70vh] overflow-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-sm text-zinc-500">No notes yet. Create one.</div>
            ) : (
              filtered.map((n) => (
                <button
                  key={n.id}
                  onClick={() => selectNote(n)}
                  className={`w-full text-left p-4 border-b border-zinc-100 hover:bg-zinc-50 ${
                    n.id === activeId ? "bg-zinc-50" : ""
                  }`}
                >
                  <div className="font-medium text-zinc-900 truncate">{n.title}</div>
                  <div className="text-xs text-zinc-500 mt-1 truncate">
                    Updated {new Date(n.updated_at).toLocaleString()}
                  </div>
                </button>
              ))
            )}
          </div>

          {status ? (
            <div className="p-3 text-sm border-t border-zinc-100 text-zinc-600">{status}</div>
          ) : null}
        </div>

        <div className="lg:col-span-8">
          <NoteEditor title={title} setTitle={setTitle} content={content} setContent={setContent} />
        </div>
      </div>
    </div>
  );
}
