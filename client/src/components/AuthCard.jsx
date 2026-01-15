import React, { useState } from "react";
import { register, me } from "../api.js";

export default function AuthCard({ onAuthed }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "signup") {
        await register(username, password);
      }
      await me(username, password);
      onAuthed({ username, password });
    } catch (ex) {
      setErr(ex.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-lg ring-1 ring-zinc-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xl font-semibold text-zinc-900">Markdown Notes</div>
          <div className="text-sm text-zinc-500">Simple. Fast. Yours.</div>
        </div>
        <div className="inline-flex rounded-xl bg-zinc-100 p-1 text-sm">
          <button
            className={`px-3 py-1.5 rounded-lg ${mode === "login" ? "bg-white shadow" : "text-zinc-600"}`}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg ${mode === "signup" ? "bg-white shadow" : "text-zinc-600"}`}
            onClick={() => setMode("signup")}
            type="button"
          >
            Sign up
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-sm font-medium text-zinc-700">Username</label>
          <input
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/10"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="maria.talib"
            autoComplete="username"
          />
          <div className="text-xs text-zinc-500 mt-1">3–32 chars: letters, numbers, . _ -</div>
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-700">Password</label>
          <input
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
          <div className="text-xs text-zinc-500 mt-1">8–72 characters</div>
        </div>

        {err ? (
          <div className="rounded-xl bg-red-50 text-red-700 text-sm p-3 ring-1 ring-red-100">{err}</div>
        ) : null}

        <button
          disabled={busy}
          className="w-full rounded-xl bg-zinc-900 text-white py-2.5 font-medium hover:bg-zinc-800 disabled:opacity-60"
        >
          {busy ? "Working..." : mode === "signup" ? "Create account" : "Login"}
        </button>

        <div className="text-xs text-zinc-500">
          Uses HTTP Basic Auth + <span className="font-mono">.htpasswd</span>. Use HTTPS in production.
        </div>
      </form>
    </div>
  );
}
