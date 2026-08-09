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
        Pengelolaan jenis objek saat ini sedang dalam tahap pengembangan.
        <br />
        Fitur ini akan segera tersedia dan dapat digunakan.
      </p>
    </div>
  );
}

/*
"use client";

import { useEffect, useState } from "react";
import { Pencil, Save, Trash2 } from "lucide-react";

export default function JenisObjek({ data }) {

  const [objek, setObjek] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    setObjek(data);
  }, [data]);

  const handleChange = (id, field, value) => {
    setObjek((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                ["panjang", "lebar", "tinggi", "dimensi"].includes(field)
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const handleEdit = (id) => setEditId(id);

  const handleSave = (id) => {
    const item = objek.find((x) => x.id === id);
    console.log("Save Objek :", item);

    // TODO:
    // Simpan ke API

    setEditId(null);
  };

  const handleDelete = (id) => {
    console.log("Delete Objek :", id);

    // TODO:
    // Hapus melalui API
  };

  return (
    <table className="setting-table">
      <thead>
        <tr>
          <th width="60">No</th>
          <th>Jenis Objek</th>
          <th>Tipe</th>
          <th>Ukuran</th>
          <th>Dimensi</th>
          <th>Tarif</th>
          <th width="110">Aksi</th>
        </tr>
      </thead>

      <tbody>
        {objek.length === 0 ? (
          <tr>
            <td colSpan={7} className="empty-data">
              Tidak ada data.
            </td>
          </tr>
        ) : (
          objek.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>

              <td>
                <input
                  type="text"
                  className="table-input"
                  value={item.nama}
                  disabled={editId !== item.id}
                  onChange={(e) =>
                    handleChange(item.id, "nama", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="text"
                  className="table-input"
                  value={item.tipe}
                  disabled={editId !== item.id}
                  onChange={(e) =>
                    handleChange(item.id, "tipe", e.target.value)
                  }
                />
              </td>

              <td>
                <div className="table-size">
                  <input
                    type="number"
                    className="table-input size"
                    value={item.panjang}
                    disabled={editId !== item.id}
                    onChange={(e) =>
                      handleChange(item.id, "panjang", e.target.value)
                    }
                  />
                  <span>×</span>
                  <input
                    type="number"
                    className="table-input size"
                    value={item.lebar}
                    disabled={editId !== item.id}
                    onChange={(e) =>
                      handleChange(item.id, "lebar", e.target.value)
                    }
                  />
                  <span>×</span>
                  <input
                    type="number"
                    className="table-input size"
                    value={item.tinggi}
                    disabled={editId !== item.id}
                    onChange={(e) =>
                      handleChange(item.id, "tinggi", e.target.value)
                    }
                  />
                  <span>m</span>
                </div>
              </td>

              <td>
                <input
                  type="number"
                  className="table-input"
                  value={item.dimensi}
                  disabled={editId !== item.id}
                  onChange={(e) =>
                    handleChange(item.id, "dimensi", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="text"
                  className="table-input"
                  value={item.tarif}
                  disabled={editId !== item.id}
                  onChange={(e) =>
                    handleChange(item.id, "tarif", e.target.value)
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
                    title={editId === item.id ? "Simpan" : "Edit"}
                  >
                    {editId === item.id ? <Save size={18} /> : <Pencil size={18} />}
                  </button>

                  <button
                    className="btn-action danger"
                    onClick={() => handleDelete(item.id)}
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