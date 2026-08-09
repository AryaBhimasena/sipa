"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_URL } from "../lib/api";

import "../styles/login.css";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const url =
        `${API_URL}` +
        `?path=login` +
        `&username=${encodeURIComponent(username)}` +
        `&password=${encodeURIComponent(password)}`;

      const res = await fetch(url);
      const json = await res.json();

      setLoading(false);

      if (!json.success) {
        alert(json.message);
        return;
      }

      /* ==========================
         SIMPAN SESSION
      ========================== */

      localStorage.setItem(
        "session",
        JSON.stringify({
          token: json.data.token,

          user: {
            id: json.data.user.id,
            nama: json.data.user.nama,
            jabatan: json.data.user.jabatan,
            username: json.data.user.username,
            aktif: json.data.user.aktif,
            role: json.data.user.role,
          },
        })
      );

      /* ==========================
         COOKIE
      ========================== */

      document.cookie =
        `session=${json.data.token}; path=/`;

      document.cookie =
        `role=${encodeURIComponent(
          json.data.user.role
        )}; path=/`;

      router.push("/dashboard");

    } catch (err) {
      setLoading(false);

      alert("Gagal koneksi ke server");
      console.error(err);
    }
  }

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>SIPA</h2>
        <p>Sistem Informasi Pasar Antasari</p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
