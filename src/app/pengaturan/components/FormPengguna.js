"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
} from "lucide-react";

import { API_URL } from "../../../lib/api";

export default function FormPengguna({
  onClose,
}) {
  const [form, setForm] =
    useState({
      nama: "",
      jabatan: "",
      username: "",
      password: "",
      confirmPassword: "",
      aktif: true,
      role: "Admin",
    });

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const passwordMismatch =
    form.password &&
    form.confirmPassword &&
    form.password !==
      form.confirmPassword;

  function handleChange(
    field,
    value
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordMismatch) {
      alert(
        "Konfirmasi password tidak cocok"
      );
      return;
    }

    try {
      setLoading(true);

      const body =
        new URLSearchParams();

      body.append(
        "nama",
        form.nama
      );

      body.append(
        "jabatan",
        form.jabatan
      );

      body.append(
        "username",
        form.username
      );

      body.append(
        "password",
        form.password
      );

      body.append(
        "aktif",
        String(form.aktif)
      );

      body.append(
        "role",
        form.role
      );

      const res = await fetch(
        `${API_URL}?path=createUser`,
        {
          method: "POST",
          body,
        }
      );

      const json =
        await res.json();

      if (!json.success) {
        alert(json.message);
        setLoading(false);
        return;
      }

      alert(
        "User berhasil ditambahkan"
      );

      onClose();

    } catch (error) {
      console.error(error);
      alert(
        "Gagal terhubung ke server"
      );
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="popup-form"
    >
      <div className="form-grid">

        <div className="form-group">
          <label>
            Nama Lengkap
          </label>

          <input
            value={form.nama}
            onChange={(e) =>
              handleChange(
                "nama",
                e.target.value
              )
            }
            required
          />
        </div>

        <div className="form-group">
          <label>
            Jabatan
          </label>

          <input
            value={form.jabatan}
            onChange={(e) =>
              handleChange(
                "jabatan",
                e.target.value
              )
            }
            required
          />
        </div>

        <div className="form-group">
          <label>
            Username
          </label>

          <input
            value={form.username}
            onChange={(e) =>
              handleChange(
                "username",
                e.target.value
              )
            }
            required
          />
        </div>

        <div className="form-group">
          <label>
            Status Akun
          </label>

          <select
            value={String(form.aktif)}
            onChange={(e) =>
              handleChange(
                "aktif",
                e.target.value ===
                  "true"
              )
            }
          >
            <option value="true">
              Aktif
            </option>

            <option value="false">
              Non Aktif
            </option>
          </select>
        </div>

        <div className="form-group">
          <label>
            Password
          </label>

          <div className="password-field">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={form.password}
              onChange={(e) =>
                handleChange(
                  "password",
                  e.target.value
                )
              }
              required
            />

            <button
              type="button"
              className="toggle-password"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>
            Konfirmasi Password
          </label>

          <div className="password-field">
            <input
              type={
                showConfirm
                  ? "text"
                  : "password"
              }
              value={
                form.confirmPassword
              }
              onChange={(e) =>
                handleChange(
                  "confirmPassword",
                  e.target.value
                )
              }
              required
            />

            <button
              type="button"
              className="toggle-password"
              onClick={() =>
                setShowConfirm(
                  !showConfirm
                )
              }
            >
              {showConfirm ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {passwordMismatch && (
            <small className="field-error">
              Password tidak cocok
            </small>
          )}
        </div>

      </div>

      <div className="form-group">
        <label>Role</label>

        <select
          value={form.role}
          onChange={(e) =>
            handleChange(
              "role",
              e.target.value
            )
          }
        >
          <option>
            System Administrator
          </option>

          <option>
            Admin
          </option>
        </select>
      </div>

      <div className="form-actions">

        <button
          type="button"
          className="btn-secondary"
          onClick={onClose}
        >
          Batal
        </button>

        <button
          type="submit"
          className="btn-primary"
          disabled={
            loading ||
            passwordMismatch
          }
        >
          {loading
            ? "Menyimpan..."
            : "Simpan"}
        </button>

      </div>
    </form>
  );
}