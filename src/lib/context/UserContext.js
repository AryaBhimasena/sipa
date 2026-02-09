"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession } from "../session";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem("session");

    if (!session) {
      router.push("/");
      return;
    }

    try {
      const parsed = JSON.parse(session);
      setUser(parsed.user || null);
    } catch {
      clearSession();
      router.push("/");
    }
  }, [router]);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
