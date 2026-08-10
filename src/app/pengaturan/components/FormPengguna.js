"use client";

import { useEffect, useState } from "react";

import {
  Eye,
  EyeOff,
  X,
} from "lucide-react";

import { API_URL } from "../../../lib/api";
import "../../../styles/components/form-pengguna.css";

const ROLE_OPTIONS = [
  "Kasir",
  "Admin",
  "System Administrator",
];

const EMPTY_FORM = {
  id: "",
  nama: "",
  jabatan: "",
  username: "",
  password: "",
  confirmPassword: "",
  aktif: true,
  role: "Admin",
};

export default function FormPengguna({
  onClose,
  onSuccess,
  initialData = null,
}) {
  const isEdit = Boolean(initialData);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  /*
   * ==========================================
   * LOAD DATA FORM
   * ==========================================
   */

  useEffect(() => {
    if (!initialData) {
      setForm(EMPTY_FORM);
      return;
    }

    setForm({
      id: initialData.id || "",
      nama: initialData.nama || "",
      jabatan: initialData.jabatan || "",
      username: initialData.username || "",
      password: "",
      confirmPassword: "",
      aktif:
        initialData.aktif === true ||
        initialData.aktif === "true" ||
        initialData.aktif === "TRUE" ||
        initialData.aktif === 1 ||
        initialData.aktif === "1",
      role: initialData.role || "Admin",
    });
  }, [initialData]);

  /*
   * ==========================================
   * PASSWORD VALIDATION
   * ==========================================
   */

  const passwordMismatch =
    form.password &&
    form.confirmPassword &&
    form.password !== form.confirmPassword;

  function handleChange(
    field,
    value
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  /*
   * ==========================================
   * SUBMIT
   * ==========================================
   */

  async function handleSubmit(e) {
    e.preventDefault();

    /*
     * ------------------------------------------
     * VALIDASI DATA DASAR
     * ------------------------------------------
     */

    if (!form.nama.trim()) {
      alert("Nama lengkap wajib diisi");
      return;
    }

    if (!form.jabatan.trim()) {
      alert("Jabatan wajib diisi");
      return;
    }

    if (!form.username.trim()) {
      alert("Username wajib diisi");
      return;
    }

    if (!form.role) {
      alert("Role pengguna wajib dipilih");
      return;
    }

    /*
     * ------------------------------------------
     * VALIDASI PASSWORD
     *
     * Saat tambah:
     * Password wajib.
     *
     * Saat edit:
     * Password boleh kosong.
     * Jika diisi, konfirmasi wajib cocok.
     * ------------------------------------------
     */

    if (!isEdit && !form.password) {
      alert("Password wajib diisi");
      return;
    }

    if (
      !isEdit &&
      !form.confirmPassword
    ) {
      alert(
        "Konfirmasi password wajib diisi"
      );
      return;
    }

    if (passwordMismatch) {
      alert(
        "Konfirmasi password tidak cocok"
      );
      return;
    }

    /*
     * Jika password diisi ketika edit,
     * maka konfirmasi juga harus diisi.
     */

    if (
      isEdit &&
      form.password &&
      !form.confirmPassword
    ) {
      alert(
        "Konfirmasi password wajib diisi"
      );
      return;
    }

    try {
      setLoading(true);

      const body =
        new URLSearchParams();

      /*
       * ------------------------------------------
       * FIELD UMUM
       * ------------------------------------------
       */

      if (isEdit) {
        body.append(
          "id",
          form.id
        );
      }

      body.append(
        "nama",
        form.nama.trim()
      );

      body.append(
        "jabatan",
        form.jabatan.trim()
      );

      body.append(
        "username",
        form.username.trim()
      );

      body.append(
        "aktif",
        String(form.aktif)
      );

      body.append(
        "role",
        form.role
      );

      /*
       * ------------------------------------------
       * PASSWORD
       *
       * Saat tambah selalu dikirim.
       *
       * Saat edit hanya dikirim jika
       * pengguna memang mengubah password.
       * ------------------------------------------
       */

      if (
        form.password
      ) {
        body.append(
          "password",
          form.password
        );
      }

      /*
       * ------------------------------------------
       * ENDPOINT
       * ------------------------------------------
       */

      const endpoint = isEdit
        ? "updateUser"
        : "createUser";

      const res = await fetch(
        `${API_URL}?path=${endpoint}`,
        {
          method: "POST",
          body,
        }
      );

      const json =
        await res.json();

      /*
       * ------------------------------------------
       * RESPONSE ERROR
       * ------------------------------------------
       */

      if (!json.success) {
        alert(
          json.message ||
            (
              isEdit
                ? "Gagal memperbarui data pengguna"
                : "User gagal ditambahkan"
            )
        );

        return;
      }

      /*
       * ------------------------------------------
       * SUCCESS
       * ------------------------------------------
       */

      alert(
        isEdit
          ? "Data pengguna berhasil diperbarui"
          : "User berhasil ditambahkan"
      );

      /*
       * Beritahu parent agar
       * mengambil data terbaru.
       */

      if (onSuccess) {
        await onSuccess();
      }

      onClose();

    } catch (error) {
      console.error(error);

      alert(
        "Gagal terhubung ke server"
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-pengguna-overlay">

      <div className="form-pengguna-modal">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="form-pengguna-header">

          <div className="form-pengguna-header-content">

            <h2 className="form-pengguna-title">
              {isEdit
                ? "Edit Pengguna"
                : "Tambah Pengguna"}
            </h2>

            <p className="form-pengguna-subtitle">
              {isEdit
                ? "Perbarui informasi dan hak akses pengguna."
                : "Tambahkan pengguna baru dan tentukan hak aksesnya."}
            </p>

          </div>

          <button
            type="button"
            className="form-pengguna-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup"
          >
            <X size={19} />
          </button>

        </div>

        {/* =====================================
            BODY
        ====================================== */}

        <div className="form-pengguna-body">

          <form
            className="form-pengguna-form"
            onSubmit={handleSubmit}
          >

            {/* =================================
                DATA PENGGUNA
            ================================== */}

            <div className="form-pengguna-grid">

              <div className="form-group">

                <label>
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) =>
                    handleChange(
                      "nama",
                      e.target.value
                    )
                  }
                  required
                  disabled={loading}
                  autoComplete="name"
                  placeholder="Masukkan nama lengkap"
                />

              </div>

              <div className="form-group">

                <label>
                  Jabatan
                </label>

                <input
                  type="text"
                  value={form.jabatan}
                  onChange={(e) =>
                    handleChange(
                      "jabatan",
                      e.target.value
                    )
                  }
                  required
                  disabled={loading}
                  placeholder="Masukkan jabatan"
                />

              </div>

              <div className="form-group">

                <label>
                  Username
                </label>

                <input
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    handleChange(
                      "username",
                      e.target.value
                    )
                  }
                  required
                  disabled={loading}
                  autoComplete="username"
                  placeholder="Masukkan username"
                />

              </div>

              <div className="form-group">

                <label>
                  Status Akun
                </label>

                <select
                  value={String(
                    form.aktif
                  )}
                  onChange={(e) =>
                    handleChange(
                      "aktif",
                      e.target.value ===
                        "true"
                    )
                  }
                  disabled={loading}
                >
                  <option value="true">
                    Aktif
                  </option>

                  <option value="false">
                    Non Aktif
                  </option>
                </select>

              </div>

              <div className="form-group full-width">

                <label>
                  Role
                </label>

                <select
                  value={form.role}
                  onChange={(e) =>
                    handleChange(
                      "role",
                      e.target.value
                    )
                  }
                  disabled={loading}
                >
                  {ROLE_OPTIONS.map(
                    (role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {role}
                      </option>
                    )
                  )}
                </select>

              </div>

            </div>

            {/* =================================
                KEAMANAN AKUN
            ================================== */}

            <div className="form-pengguna-section">

              <h3 className="form-pengguna-section-title">
                Keamanan Akun
              </h3>

              {isEdit && (
                <p
                  style={{
                    margin:
                      "-8px 0 16px",
                    color:
                      "#6b7280",
                    fontSize:
                      "12px",
                    lineHeight:
                      "1.5",
                  }}
                >
                  Kosongkan password jika
                  tidak ingin mengubah password
                  pengguna.
                </p>
              )}

              <div className="form-pengguna-grid">

                {/* PASSWORD */}

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
                      value={
                        form.password
                      }
                      onChange={(e) =>
                        handleChange(
                          "password",
                          e.target.value
                        )
                      }
                      required={!isEdit}
                      disabled={loading}
                      autoComplete="new-password"
                      placeholder={
                        isEdit
                          ? "Kosongkan jika tetap"
                          : "Masukkan password"
                      }
                    />

                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() =>
                        setShowPassword(
                          (prev) =>
                            !prev
                        )
                      }
                      disabled={loading}
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>

                  </div>

                </div>

                {/* KONFIRMASI PASSWORD */}

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
                      required={
                        !isEdit
                      }
                      disabled={loading}
                      autoComplete="new-password"
                      placeholder={
                        isEdit
                          ? "Kosongkan jika tetap"
                          : "Ulangi password"
                      }
                    />

                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() =>
                        setShowConfirm(
                          (prev) =>
                            !prev
                        )
                      }
                      disabled={loading}
                      aria-label={
                        showConfirm
                          ? "Sembunyikan konfirmasi password"
                          : "Tampilkan konfirmasi password"
                      }
                    >
                      {showConfirm ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
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

            </div>

            {/* =================================
                ACTION
            ================================== */}

            <div className="form-pengguna-actions">

              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Batal
              </button>

              <button
                type="submit"
                className="btn-primary"
                disabled={
                  loading ||
                  Boolean(
                    passwordMismatch
                  )
                }
              >
                {loading
                  ? "Menyimpan..."
                  : isEdit
                    ? "Simpan Perubahan"
                    : "Simpan"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}