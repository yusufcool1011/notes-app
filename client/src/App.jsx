import React, { useEffect, useState } from "react";
import AuthCard from "./components/AuthCard.jsx";
import Notes from "./components/Notes.jsx";

export default function App() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("auth");
    if (raw) setAuth(JSON.parse(raw));
  }, []);

  function onAuthed(a) {
    setAuth(a);
    sessionStorage.setItem("auth", JSON.stringify(a));
  }

  function logout() {
    setAuth(null);
    sessionStorage.removeItem("auth");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="px-4 py-10">
        {!auth ? (
          <div className="flex items-center justify-center">
            <AuthCard onAuthed={onAuthed} />
          </div>
        ) : (
          <Notes auth={auth} onLogout={logout} />
        )}
      </div>

      <div className="pb-8 text-center text-xs text-zinc-400">
        Built with React + Express + SQLite + htpasswd (behind Nginx)
      </div>
    </div>
  );
}
