"use client";

import { Construction } from "lucide-react";

export default function JenisObjek({ data }) {
  return (
    <div className="development-state">
      <div className="development-icon">
        <Construction size={42} strokeWidth={1.7} />
      </div>

      <h2>Fitur Sedang Dalam Pengembangan</h2>

      <p>
        Pengelolaan Tarif saat ini sedang dalam tahap pengembangan.
        <br />
        Fitur ini akan segera tersedia dan dapat digunakan.
      </p>
    </div>
  );
}

/*
"use client";

import { useEffect, useState } from "react";

import {
  Pencil,
  Save,
  Trash2,
} from "lucide-react";

export default function Tarif({ data }) {

  const [tarifs, setTarifs] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    setTarifs(data);
  }, [data]);

  const handleChange = (id, field, value) => {

    setTarifs((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "nominal"
                  ? Number(value)
                  : value,
            }
          : item
      )
    );

  };

  const handleEdit = (id) => {
    setEditId(id);
  };

  const handleSave = (id) => {

    const tarif = tarifs.find(
      (item) => item.id === id
    );

    console.log("Save Tarif :", tarif);

    // TODO:
    // Simpan ke API

    setEditId(null);

  };

  const handleDelete = (id) => {

    console.log("Delete Tarif :", id);

    // TODO:
    // Hapus melalui API

  };

  return (
    <table className="setting-table">

      <thead>
        <tr>
          <th width="60">No</th>
          <th>Nama Tarif</th>
          <th>Jenis</th>
          <th>Perhitungan</th>
          <th>Nominal</th>
          <th width="110">Aksi</th>
        </tr>
      </thead>

      <tbody>

        {tarifs.length === 0 ? (

          <tr>

            <td
              colSpan={6}
              className="empty-data"
            >
              Tidak ada data.
            </td>

          </tr>

        ) : (

          tarifs.map((item, index) => (

            <tr key={item.id}>

              <td>{index + 1}</td>

              <td>

                <strong>
                  {item.nama}
                </strong>

              </td>

              <td>

                <select
                  className="table-select"
                  value={item.jenis}
                  disabled={editId !== item.id}
                  onChange={(e) =>
                    handleChange(
                      item.id,
                      "jenis",
                      e.target.value
                    )
                  }
                >
                  <option>Sewa</option>
                  <option>Kebersihan</option>
                  <option>Keamanan</option>
                </select>

              </td>

              <td>

                <select
                  className="table-select"
                  value={item.perhitungan}
                  disabled={editId !== item.id}
                  onChange={(e) =>
                    handleChange(
                      item.id,
                      "perhitungan",
                      e.target.value
                    )
                  }
                >
                  <option>Per Meter</option>
                  <option>Per Bulan</option>
                  <option>Per Hari</option>
                </select>

              </td>

              <td>

                <input
                  type="number"
                  className="table-input"
                  value={item.nominal}
                  disabled={editId !== item.id}
                  onChange={(e) =>
                    handleChange(
                      item.id,
                      "nominal",
                      e.target.value
                    )
                  }
                />

              </td>

              <td>

                <div className="table-action">

                  <button
                    className="btn-action"
                    onClick={() =>
                      editId === item.id
                        ? handleSave(item.id)
                        : handleEdit(item.id)
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
                    onClick={() =>
                      handleDelete(item.id)
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
*/