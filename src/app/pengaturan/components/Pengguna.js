"use client";

import { useEffect, useState } from "react";

import {
  Pencil,
  Trash2,
  Save,
} from "lucide-react";

import { API_URL } from "../../../lib/api";

const ROLE_OPTIONS = [
  "Kasir",
  "Admin",
  "System Administrator",
];

export default function Pengguna() {
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

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
        const normalizedUsers = (json.data || []).map(
          (user) => ({
            ...user,

            /*
             * Pastikan aktif selalu boolean
             */
            aktif:
              user.aktif === true ||
              user.aktif === "true" ||
              user.aktif === "TRUE" ||
              user.aktif === 1 ||
              user.aktif === "1",

            /*
             * Pertahankan role dari API
             */
            role: user.role || "",
          })
        );

        setUsers(normalizedUsers);
      } else {
        console.error(json.message);
        setUsers([]);
      }
    } catch (error) {
      console.error(error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (
    id,
    field,
    value
  ) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              [field]:
                field === "aktif"
                  ? value === "true"
                  : value,
            }
          : user
      )
    );
  };

  const handleEdit = (id) => {
    setEditId(id);
  };

  async function handleSave(id) {
    try {
      const user = users.find(
        (item) => item.id === id
      );

      if (!user) return;

      setLoading(true);

      const formData =
        new URLSearchParams();

      formData.append("id", user.id);
      formData.append("nama", user.nama);
      formData.append(
        "jabatan",
        user.jabatan
      );
      formData.append(
        "username",
        user.username
      );
      formData.append(
        "aktif",
        String(user.aktif)
      );
      formData.append(
        "role",
        user.role
      );

      const res = await fetch(
        `${API_URL}?path=updateUser`,
        {
          method: "POST",
          body: formData,
        }
      );

      const json = await res.json();

      if (!json.success) {
        alert(
          json.message ||
            "Gagal memperbarui data"
        );

        setLoading(false);
        return;
      }

      alert(
        "Data berhasil diperbarui"
      );

      setEditId(null);

      await fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");

      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmDelete =
      window.confirm(
        "Apakah Anda yakin ingin menghapus user ini?"
      );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      const formData =
        new URLSearchParams();

      formData.append("id", id);

      const res = await fetch(
        `${API_URL}?path=deleteUser`,
        {
          method: "POST",
          body: formData,
        }
      );

      const json = await res.json();

      if (!json.success) {
        alert(
          json.message ||
            "Gagal menghapus data"
        );

        setLoading(false);
        return;
      }

      alert("User berhasil dihapus");

      await fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");

      setLoading(false);
    }
  }

  return (
    <table>
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
              className="empty-data"
            >
              Memuat data pengguna...
            </td>
          </tr>
        ) : users.length === 0 ? (
          <tr>
            <td
              colSpan={7}
              className="empty-data"
            >
              Tidak ada data.
            </td>
          </tr>
        ) : (
          users.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>

              <td>
                <strong>
                  {item.nama}
                </strong>
              </td>

              <td>
                {item.jabatan}
              </td>

              <td>
                {item.username}
              </td>

              <td>
                <select
                  className="table-select"
                  value={String(
                    item.aktif
                  )}
                  disabled={
                    editId !== item.id
                  }
                  onChange={(e) =>
                    handleChange(
                      item.id,
                      "aktif",
                      e.target.value
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
              </td>

              <td>
                <select
                  className="table-select"
                  value={item.role || ""}
                  disabled={
                    editId !== item.id
                  }
                  onChange={(e) =>
                    handleChange(
                      item.id,
                      "role",
                      e.target.value
                    )
                  }
                >
                  {/*
                   * Role dari API akan
                   * ditampilkan sesuai
                   * nilainya.
                   */}
                  {item.role &&
                    !ROLE_OPTIONS.includes(
                      item.role
                    ) && (
                      <option
                        value={item.role}
                      >
                        {item.role}
                      </option>
                    )}

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
              </td>

              <td>
                <div className="table-action">
                  <button
                    className="btn-action"
                    disabled={loading}
                    onClick={() =>
                      editId === item.id
                        ? handleSave(
                            item.id
                          )
                        : handleEdit(
                            item.id
                          )
                    }
                    title={
                      editId === item.id
                        ? "Simpan"
                        : "Edit"
                    }
                  >
                    {editId === item.id ? (
                      <Save size={18} />
                    ) : (
                      <Pencil size={18} />
                    )}
                  </button>

                  <button
                    className="btn-action danger"
                    disabled={loading}
                    onClick={() =>
                      handleDelete(
                        item.id
                      )
                    }
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}