"use client";

import "../styles/header.css";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { clearSession } from "../lib/session";
import { API_URL } from "../lib/api";

export default function Header() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("session");

    if (!session) {
      router.push("/");
      return;
    }

    try {
      const parsed = JSON.parse(session);

      setUserId(parsed.user?.id || "");
	  setUserName(parsed.user?.nama || "");
      setUserRole(parsed.user?.role || "");
    } catch {
      clearSession();
      router.push("/");
    }
  }, [router]);

  function handleLogout() {
    // hapus session
    clearSession();

    // hapus cookie untuk middleware
    document.cookie =
      "session=; path=/; max-age=0";

    // kembali ke login
    router.push("/");
  }

  async function handleChangePassword(e) {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      alert("Semua field wajib diisi");
      return;
    }

    if (!userId) {
      alert("Session user tidak ditemukan");
      return;
    }

    setLoadingPassword(true);

    try {
      const formData = new URLSearchParams();

      formData.append(
        "path",
        "changePassword"
      );

      formData.append(
        "id",
        userId
      );

      formData.append(
        "password_lama",
        currentPassword
      );

      formData.append(
        "password_baru",
        newPassword
      );

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      setLoadingPassword(false);

      if (!json.success) {
        alert(json.message);
        return;
      }

      alert("Password berhasil diperbarui");

      setCurrentPassword("");
      setNewPassword("");
      setShowProfileMenu(false);

    } catch (error) {
      setLoadingPassword(false);

      alert("Gagal koneksi ke server");
      console.error(error);
    }
  }

  return (
    <header className="app-header">

      <div className="header-left">
        <span className="logo">SIPA</span>

        <span className="app-name">
          Sistem Informasi Pasar Antasari
        </span>
      </div>

      <div className="header-right">

        <div
          className="user-profile"
          onClick={() =>
            setShowProfileMenu(!showProfileMenu)
          }
          style={{
            position: "relative",
            cursor: "pointer",
          }}
        >

          <div className="user-name-wrapper">

            <span className="user-name">
              {userName || "Pengguna"}
            </span>

            <small
              style={{
                display: "block",
                fontSize: "11px",
                color: "#64748b",
                marginTop: "2px",
              }}
            >
              {userRole || "-"}
            </small>

          </div>

          {showProfileMenu && (
            <div
              className="profile-dropdown"
              style={{
                position: "absolute",
                top: "55px",
                right: 0,
                width: "300px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "18px",
                boxShadow:
                  "0 10px 25px rgba(0,0,0,.08)",
                zIndex: 999,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <h4
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "14px",
                }}
              >
                Ganti Password
              </h4>

              <form
                onSubmit={handleChangePassword}
              >

                <input
                  type="password"
                  placeholder="Password sekarang"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    height: "40px",
                    marginBottom: "10px",
                    padding: "0 12px",
                    border:
                      "1px solid #cbd5e1",
                    borderRadius: "8px",
                  }}
                />

                <input
                  type="password"
                  placeholder="Password baru"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    height: "40px",
                    marginBottom: "12px",
                    padding: "0 12px",
                    border:
                      "1px solid #cbd5e1",
                    borderRadius: "8px",
                  }}
                />

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loadingPassword}
                  style={{
                    width: "100%",
                  }}
                >
                  {loadingPassword
                    ? "Memproses..."
                    : "Submit Ganti Password"}
                </button>

              </form>

            </div>
          )}

        </div>

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