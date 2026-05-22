// frontend/lib/auth.ts
import { useState, useEffect } from "react";

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

export interface Session {
  user: SessionUser;
  token: string;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setSession({ user, token });
        setStatus("authenticated");
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setStatus("unauthenticated");
      }
    } else {
      setStatus("unauthenticated");
    }
  }, []);

  const login = (token: string, user: SessionUser) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setSession({ user, token });
    setStatus("authenticated");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setSession(null);
    setStatus("unauthenticated");
  };

  return { session, status, login, logout };
}
