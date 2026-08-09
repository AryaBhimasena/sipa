"use client";

import FormPengguna from "./FormPengguna";

export default function ModalTambahData({
  activeMenu,
  onClose,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-window">

        <div className="modal-header">
          <h3>Tambah Data</h3>

          <button
            className="btn-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">

          {/* PENGGUNA */}
          {activeMenu === "pengguna" && (
            <FormPengguna
              onClose={onClose}
            />
          )}

          {/* TARIF (next) */}
          {activeMenu === "tarif" && (
            <div>
              Form Tarif
            </div>
          )}

          {/* JENIS OBJEK (next) */}
          {activeMenu === "objek" && (
            <div>
              Form Jenis Objek
            </div>
          )}

        </div>
      </div>
    </div>
  );
}