"use client";

import "../styles/header.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession } from "../lib/session";

export default function Header() {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const session = localStorage.getItem("session");

    if (!session) {
      router.push("/");
      return;
    }

    try {
      const parsed = JSON.parse(session);
      setUserName(parsed.user?.nama || "");
    } catch {
      clearSession();
      router.push("/");
    }
  }, [router]);

  function handleLogout() {
    // hapus session
    clearSession();

    // hapus cookie untuk middleware
    document.cookie = "session=; path=/; max-age=0";

    // kembali ke login
    router.push("/");
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <span className="logo">SIPA</span>
        <span className="app-name">Sistem Informasi Pasar Antasari</span>
      </div>

      <div className="header-right">
        <span className="user-name">
          {userName || "Pengguna"}
        </span>
        <button
          className="btn-ghost"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
