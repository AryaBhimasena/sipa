"use client";

import { useEffect, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

import { API_URL } from "../../../lib/api";

import FormPengguna from "./FormPengguna";
import "../../../styles/components/tab-pengguna.css";

export default function Pengguna() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  /*
   * ==========================================
   * MODAL
   * ==========================================
   *
   * null  = modal tertutup
   * "add" = tambah pengguna
   * "edit" = edit pengguna
   */

  const [modalMode, setModalMode] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);

  /*
   * ==========================================
   * LOAD DATA
   * ==========================================
   */

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}?path=dataUsers`
      );

      const json = await res.json();

      if (json.success) {
        const normalizedUsers =
          (json.data || []).map(
            (user) => ({
              ...user,

              /*
               * Pastikan aktif
               * selalu boolean.
               */
              aktif:
                user.aktif === true ||
                user.aktif === "true" ||
                user.aktif === "TRUE" ||
                user.aktif === 1 ||
                user.aktif === "1",

              /*
               * Pertahankan role
               * dari API.
               */
              role:
                user.role || "",
            })
          );

        setUsers(
          normalizedUsers
        );
      } else {
        console.error(
          json.message
        );

        setUsers([]);
      }
    } catch (error) {
      console.error(error);

      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  /*
   * ==========================================
   * TAMBAH PENGGUNA
   * ==========================================
   */

  function handleAdd() {
    setSelectedUser(null);
    setModalMode("add");
  }

  /*
   * ==========================================
   * EDIT PENGGUNA
   * ==========================================
   */

  function handleEdit(user) {
    setSelectedUser(user);
    setModalMode("edit");
  }

  /*
   * ==========================================
   * TUTUP MODAL
   * ==========================================
   */

  function handleCloseModal() {
    setModalMode(null);
    setSelectedUser(null);
  }

  /*
   * ==========================================
   * SUCCESS FORM
   * ==========================================
   *
   * Digunakan oleh FormPengguna setelah
   * proses tambah / edit berhasil.
   *
   * Setelah berhasil:
   * 1. Refresh data tabel
   * 2. Tutup modal
   */

  async function handleFormSuccess() {
    await fetchUsers();

    handleCloseModal();
  }

  /*
   * ==========================================
   * DELETE
   * ==========================================
   */

  async function handleDelete(id) {
    const confirmDelete =
      window.confirm(
        "Apakah Anda yakin ingin menghapus user ini?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);

      const formData =
        new URLSearchParams();

      formData.append(
        "id",
        id
      );

      const res = await fetch(
        `${API_URL}?path=deleteUser`,
        {
          method: "POST",
          body: formData,
        }
      );

      const json =
        await res.json();

      if (!json.success) {
        alert(
          json.message ||
            "Gagal menghapus data"
        );

        return;
      }

      alert(
        "User berhasil dihapus"
      );

      await fetchUsers();
    } catch (error) {
      console.error(error);

      alert(
        "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ======================================
          TOOLBAR
      ======================================= */}

      <div className="pengguna-toolbar">

        <div className="pengguna-toolbar-info">

          <h2 className="pengguna-toolbar-title">
            Pengguna
          </h2>

          <p className="pengguna-toolbar-description">
            Kelola pengguna dan hak akses aplikasi.
          </p>

        </div>

        <div className="pengguna-toolbar-actions">

          <button
            type="button"
            className="pengguna-btn-add"
            onClick={handleAdd}
            disabled={loading}
          >
            <Plus size={18} />

            <span>
              Tambah Pengguna
            </span>
          </button>

        </div>

      </div>

      {/* ======================================
          TABLE
      ======================================= */}

      <div className="pengguna-table-wrapper">

        <table className="pengguna-table">

          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Jabatan</th>
              <th>Username</th>
              <th>Status</th>
              <th>Role</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="pengguna-empty"
                >
                  <span className="pengguna-loading">
                    Memuat data pengguna...
                  </span>
                </td>
              </tr>

            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="pengguna-empty"
                >
                  Tidak ada data.
                </td>
              </tr>

            ) : (
              users.map(
                (item, index) => (
                  <tr
                    key={item.id}
                  >

                    {/* NO */}
                    <td>
                      {index + 1}
                    </td>

                    {/* NAMA */}
                    <td>
                      <strong className="pengguna-name">
                        {item.nama}
                      </strong>
                    </td>

                    {/* JABATAN */}
                    <td>
                      {item.jabatan}
                    </td>

                    {/* USERNAME */}
                    <td>
                      <span className="pengguna-username">
                        {item.username}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={
                          item.aktif
                            ? "pengguna-status active"
                            : "pengguna-status inactive"
                        }
                      >
                        {item.aktif
                          ? "Aktif"
                          : "Non Aktif"}
                      </span>
                    </td>

                    {/* ROLE */}
                    <td>
                      <span className="pengguna-role">
                        {item.role || "-"}
                      </span>
                    </td>

                    {/* AKSI */}
                    <td>

                      <div className="pengguna-table-action">

                        <button
                          type="button"
                          className="pengguna-btn-action"
                          disabled={loading}
                          onClick={() =>
                            handleEdit(item)
                          }
                          title="Edit"
                          aria-label={`Edit ${item.nama}`}
                        >
                          <Pencil
                            size={18}
                          />
                        </button>

                        <button
                          type="button"
                          className="pengguna-btn-action danger"
                          disabled={loading}
                          onClick={() =>
                            handleDelete(
                              item.id
                            )
                          }
                          title="Hapus"
                          aria-label={`Hapus ${item.nama}`}
                        >
                          <Trash2
                            size={18}
                          />
                        </button>

                      </div>

                    </td>

                  </tr>
                )
              )
            )}

          </tbody>

        </table>

      </div>

      {/* ======================================
          MODAL FORM
      ======================================= */}

      {modalMode && (
        <FormPengguna
          initialData={
            modalMode === "edit"
              ? selectedUser
              : null
          }

          onClose={
            handleCloseModal
          }

          onSuccess={
            handleFormSuccess
          }
        />
      )}

    </>
  );
}