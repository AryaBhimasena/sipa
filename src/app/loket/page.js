//app/loket/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import Header from "../../components/Header";
import NavBar from "../../components/NavBar";
import ContainerCard from "../../components/ContainerCard";
import { useDataToko } from "../contexts/DataTokoContext";
import Link from "next/link";

import "../../styles/layout.css";
import "../../styles/pages/loket.css";

export default function LoketPage() {
  const { dataToko, loading } = useDataToko();

  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterTipe, setFilterTipe] = useState("");
  const [filterLantai, setFilterLantai] = useState("");
  const [filterBlok, setFilterBlok] = useState("");

  /* ===============================
     PAGINATION STATE
  =============================== */
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  /* ===============================
     UNIQUE FILTER OPTIONS (DINAMIS)
  =============================== */
	const jenisOptions = useMemo(() => {
	  return [...new Set(dataToko.map(r => r.objek?.jenis_objek).filter(Boolean))]
		.sort((a, b) => a.localeCompare(b));
	}, [dataToko]);

	const tipeOptions = useMemo(() => {
	  return [...new Set(dataToko.map(r => r.objek?.tipe).filter(Boolean))]
		.sort((a, b) => a.localeCompare(b));
	}, [dataToko]);

	const lantaiOptions = useMemo(() => {
	  return [...new Set(
		dataToko
		  .map(r => r.lantai?.toString().trim())
		  .filter(Boolean)
	  )].sort((a, b) =>
		a.localeCompare(b, "id", { numeric: true, sensitivity: "base" })
	  );
	}, [dataToko]);

	const blokOptions = useMemo(() => {
	  return [...new Set(dataToko.map(r => r.blok).filter(Boolean))]
		.sort((a, b) => a.localeCompare(b));
	}, [dataToko]);

  /* ===============================
     FILTERED DATA
  =============================== */
  const filteredData = dataToko.filter((row) => {
    const keyword = search.toLowerCase();

    const jenis = row.objek?.jenis_objek ?? "";
    const tipe = row.objek?.tipe ?? "";
    const lantai = row.lantai?.toString() ?? "";
    const blok = row.blok ?? "";
	const nama = row.nama?.toLowerCase() ?? "";
	const idReg = row.id_reg?.toString() ?? "";
	const noToko = row.no?.toString() ?? "";

	return (
	  (
		idReg.includes(keyword) ||
		nama.includes(keyword) ||
		noToko.includes(keyword)
	  ) &&
	  (!filterJenis || jenis === filterJenis) &&
	  (!filterTipe || tipe === filterTipe) &&
	  (!filterLantai || lantai === filterLantai) &&
	  (!filterBlok || blok === filterBlok)
	);

  });

  /* ===============================
     PAGINATION LOGIC
  =============================== */
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterJenis, filterTipe, filterLantai, filterBlok]);

  return (
    <>
      <Header />
      <NavBar />

      <main className="loket-page">
        <ContainerCard
          title="Loket Pembayaran Jasa Layanan"
          subtitle="Input dan pemrosesan pembayaran tarif jasa layanan pedagang"
        >
          {/* FILTER BAR */}
          <div className="loket-filter">
            <input
              type="text"
              placeholder="Cari no reg, nama pedagang atau nomor toko"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={filterJenis}
              onChange={(e) => {
                const val = e.target.value;
                setFilterJenis(val);
                if (val !== "KIOS") {
                  setFilterTipe("");
                }
              }}
            >
              <option value="">Jenis Objek</option>
              {jenisOptions.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>

            <select
              value={filterTipe}
              disabled={filterJenis !== "KIOS"}
              onChange={(e) => setFilterTipe(e.target.value)}
            >
              <option value="">Tipe</option>
              {tipeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={filterLantai}
              onChange={(e) => setFilterLantai(e.target.value)}
            >
              <option value="">Lantai</option>
              {lantaiOptions.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <select
              value={filterBlok}
              onChange={(e) => setFilterBlok(e.target.value)}
            >
              <option value="">Blok</option>
              {blokOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* PAGINATION */}
			<div className="loket-pagination">
			  <span className="page-arrow" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>
				&lt;
			  </span>

			  <span className="pagination-info">
				{startIndex + 1}-{Math.min(endIndex, filteredData.length)} records dari {filteredData.length} records
			  </span>

			  <span className="page-arrow" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>
				&gt;
			  </span>
			</div>

          {/* TABLE */}
          <div className="loket-table-wrapper">
            <table className="loket-table">
              <thead>
                <tr>
                  <th>No Reg</th>
                  <th>Nama Pedagang</th>
                  <th>Jenis Objek</th>
                  <th>Tipe</th>
                  <th>Lantai</th>
                  <th>Blok</th>
                  <th>No</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="8">Memuat data...</td>
                  </tr>
                )}

                {!loading && paginatedData.length === 0 && (
                  <tr>
                    <td colSpan="8">Data tidak ditemukan</td>
                  </tr>
                )}

                {!loading &&
                  paginatedData.map((row) => (
                    <tr key={row.id_reg}>
                      <td>{row.id_reg}</td>
                      <td>{row.nama}</td>
                      <td>{row.objek.jenis_objek}</td>
                      <td>{row.objek.tipe}</td>
                      <td>{row.lantai}</td>
                      <td>{row.blok}</td>
                      <td>{row.no}</td>
                      <td>
                        <button
                          className="loket-btn"
                          onClick={() => {
                            window.location.href = `/loket/pembayaran/${row.id_reg}`;
                          }}
                        >
                          Pilih
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

        </ContainerCard>
      </main>
    </>
  );
}
