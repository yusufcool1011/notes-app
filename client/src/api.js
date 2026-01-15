/**
 * Production mode (Nginx):
 *   Frontend and backend share the same origin.
 *   - Nginx proxies /api/* to http://127.0.0.1:4000 (localhost)
 *   - Frontend calls /api/* via relative paths (no hardcoded domain)
 *
 * If you really want to override locally, set VITE_API_BASE.
 * Example dev override:
 *   VITE_API_BASE=http://localhost:4000
 */
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export function makeAuthHeader(username, password) {
  const token = btoa(`${username}:${password}`);
  return { Authorization: `Basic ${token}` };
}

export async function register(username, password) {
  const r = await fetch(`${API_BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Registration failed");
  return data;
}

export async function me(username, password) {
  const r = await fetch(`${API_BASE}/api/me`, { headers: { ...makeAuthHeader(username, password) } });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Auth failed");
  return data;
}

export async function listNotes(username, password) {
  const r = await fetch(`${API_BASE}/api/notes`, { headers: { ...makeAuthHeader(username, password) } });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Failed to load notes");
  return data.notes || [];
}

export async function createNote(username, password, note) {
  const r = await fetch(`${API_BASE}/api/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...makeAuthHeader(username, password) },
    body: JSON.stringify(note)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Failed to create note");
  return data.note;
}

export async function updateNote(username, password, id, note) {
  const r = await fetch(`${API_BASE}/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...makeAuthHeader(username, password) },
    body: JSON.stringify(note)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Failed to update note");
  return data;
}

export async function deleteNote(username, password, id) {
  const r = await fetch(`${API_BASE}/api/notes/${id}`, {
    method: "DELETE",
    headers: { ...makeAuthHeader(username, password) }
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Failed to delete note");
  return data;
}
