"use client";

import { useEffect, useState } from "react";
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

  const filteredData = dataToko.filter((row) => {
    const keyword = search.toLowerCase();

    const jenis = row.objek?.jenis_objek ?? "";
    const tipe = row.objek?.tipe ?? "";
    const lantai = row.lantai?.toString() ?? "";
    const blok = row.blok ?? "";
    const nama = row.nama?.toLowerCase() ?? "";
    const idReg = row.id_reg?.toString() ?? "";

    return (
      (idReg.includes(keyword) || nama.includes(keyword)) &&
      (!filterJenis || jenis === filterJenis) &&
      (!filterTipe || tipe === filterTipe) &&
      (!filterLantai || lantai === filterLantai) &&
      (!filterBlok || blok === filterBlok)
    );
  });

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
			  placeholder="Cari no reg atau nama pedagang"
			  value={search}
			  onChange={(e) => setSearch(e.target.value)}
			/>

			<select
			  value={filterJenis}
			  onChange={(e) => {
				const val = e.target.value;
				setFilterJenis(val);

				// jika bukan KIOS, reset & disable tipe
				if (val !== "KIOS") {
				  setFilterTipe("");
				}
			  }}
			>
			  <option value="">Jenis Objek</option>
			  <option value="TOKO">TOKO</option>
			  <option value="KIOS">KIOS</option>
			  <option value="LOS">LOS</option>
			</select>

			<select
			  value={filterTipe}
			  disabled={filterJenis !== "KIOS"}
			  onChange={(e) => setFilterTipe(e.target.value)}
			>
			  <option value="">Tipe</option>
			  <option value="TIPE A">TIPE A</option>
			  <option value="TIPE B">TIPE B</option>
			</select>

			<select
			  value={filterLantai}
			  onChange={(e) => setFilterLantai(e.target.value)}
			>
			  <option value="">Lantai</option>
			  <option value="1">1</option>
			  <option value="2">2</option>
			</select>

			<select
			  value={filterBlok}
			  onChange={(e) => setFilterBlok(e.target.value)}
			>
			  <option value="">Blok</option>
			  <option value="A">A</option>
			  <option value="B">B</option>
			</select>
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

				{!loading && filteredData.length === 0 && (
				  <tr>
					<td colSpan="8">Data tidak ditemukan</td>
				  </tr>
				)}

                {!loading &&
                  filteredData.map((row) => (
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
