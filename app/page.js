'use client';

export default function LoginPage() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.left}>
        <h1 style={styles.brand}>Sistem Aplikasi<br />Retribusi Pasar</h1>
        <p style={styles.tagline}>
          Platform digital untuk pencatatan, monitoring, dan pelaporan retribusi pasar secara terpusat.
        </p>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Masuk ke Sistem</h2>
          <p style={styles.subtitle}>Gunakan akun terdaftar Anda</p>

          <input style={styles.input} placeholder="Username / Email" />
          <input style={styles.input} type="password" placeholder="Password" />

          <button style={styles.primaryBtn}>Login</button>

          <div style={styles.divider}><span>atau</span></div>

          <button style={styles.googleBtn}>
            Login dengan Google Account
          </button>

          <p style={styles.footer}>
            © 2025 Sistem Retribusi Pasar
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f7f8fa',
    fontFamily: 'system-ui, -apple-system',
  },
  left: {
    flex: 1,
    padding: '60px',
    background: 'linear-gradient(135deg, #1f2937, #111827)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brand: {
    fontSize: '36px',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  tagline: {
    marginTop: '16px',
    fontSize: '15px',
    color: '#d1d5db',
    maxWidth: '420px',
  },
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    background: '#fff',
    padding: '36px',
    borderRadius: '18px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '22px',
    fontWeight: 600,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '20px',
  },
  input: {
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    marginBottom: '12px',
    fontSize: '14px',
  },
  primaryBtn: {
    padding: '14px',
    borderRadius: '12px',
    background: '#111827',
    color: '#fff',
    border: 'none',
    fontWeight: 500,
    cursor: 'pointer',
  },
  divider: {
    textAlign: 'center',
    margin: '18px 0',
    fontSize: '12px',
    color: '#9ca3af',
  },
  googleBtn: {
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
  },
  footer: {
    marginTop: '24px',
    fontSize: '11px',
    color: '#9ca3af',
    textAlign: 'center',
  },
};
