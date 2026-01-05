"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import NavBar from "../../components/NavBar";
import "../../styles/dataToko.css";

export default function DataTokoPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchNama, setSearchNama] = useState("");
  const [filterBlok, setFilterBlok] = useState("");
  const [filterZona, setFilterZona] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}?path=dataToko`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
          setFilteredData(json.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let temp = [...data];

    if (searchNama) {
      temp = temp.filter((row) =>
        row.Nama.toLowerCase().includes(searchNama.toLowerCase())
      );
    }

    // filter Blok & Zona DISIAPKAN (belum aktif)
    if (filterBlok) {
      temp = temp;
    }

    if (filterZona) {
      temp = temp;
    }

    setFilteredData(temp);
  }, [searchNama, filterBlok, filterZona, data]);

  return (
    <>
      <Header />
      <NavBar />

      <main className="data-toko-container">
        <div className="data-toko-card">
          <div className="data-toko-header">
            <h2>Data Toko</h2>
            <p>Master data objek Pengguna Jasa Layanan Pasar Antasari</p>
          </div>

          {/* SEARCH & FILTER */}
          <div className="data-toko-filter">
            <input
              type="text"
              placeholder="Cari nama pedagang..."
              value={searchNama}
              onChange={(e) => setSearchNama(e.target.value)}
            />

            <select value={filterBlok} onChange={(e) => setFilterBlok(e.target.value)}>
              <option value="">Semua Blok</option>
              <option value="A">Blok A</option>
              <option value="B">Blok B</option>
              <option value="C">Blok C</option>
            </select>

            <select value={filterZona} onChange={(e) => setFilterZona(e.target.value)}>
              <option value="">Semua Zona</option>
              <option value="Basement">Basement</option>
              <option value="Lantai 1">Lantai 1</option>
              <option value="Lantai 2">Lantai 2</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">Memuat data...</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-toko-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Pedagang</th>
                    <th>Kontak</th>
                    <th>Status Kepemilikan</th>
                    <th>Blok</th>
                    <th>Lantai</th>
                    <th>Kode Peta</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr key={row.ID_Toko}>
                      <td>{index + 1}</td>
                      <td>{row.Nama}</td>
                      <td>{row["Kontak"] || "-"}</td>
                      <td>{row["Status Kepemilikan"] || "-"}</td>
                      <td>{row.Blok || "-"}</td>
                      <td>{row.Lantai || "-"}</td>
                      <td>{row.KodeToko}</td>
                      <td>
                        <div className="aksi-btn">
                          <button className="btn-view" title="Lihat"></button>
                          <button className="btn-edit" title="Edit"></button>
                          <button className="btn-delete" title="Hapus"></button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan="8" className="empty">
                        Data tidak ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
