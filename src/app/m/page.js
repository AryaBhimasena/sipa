"use client";

import { useRouter } from "next/navigation";

export default function MobileLoginPage() {
  const router = useRouter();

  function handleLogin(e) {
    e.preventDefault();
    router.push("/m/app/dashboard");
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.mobileFrame}>
        <div style={styles.header}>
          <h1 style={styles.title}>Aplikasi Retribusi</h1>
          <p style={styles.subtitle}>Pasar Daerah</p>
        </div>

        <form style={styles.form} onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            style={styles.input}
          />

          <button style={styles.button}>
            Login
          </button>
        </form>

        <div style={styles.footer}>
          <small>© 2026 Retribusi Pasar</small>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  mobileFrame: {
    width: 390,
    height: "100vh",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    padding: "32px 24px",
  },

  header: {
    textAlign: "center",
    marginTop: 48,
    marginBottom: 48,
  },

  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#64748b",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  input: {
    height: 44,
    borderRadius: 8,
    border: "1px solid #cbd5f5",
    padding: "0 12px",
    fontSize: 14,
  },

  button: {
    height: 44,
    marginTop: 8,
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },

  footer: {
    marginTop: "auto",
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
  },
};
