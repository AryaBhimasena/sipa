"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import NavBar from "../../components/NavBar";
import "../../styles/tarifJasaLayanan.css";

const TARIF_DUMMY = {
  Kebersihan: { harian: 3000, bulanan: 75000 },
  Keamanan: { harian: 2000, bulanan: 50000 },
  Listrik: { harian: 5000, bulanan: 120000 },
  PDAM: { harian: 3000, bulanan: 80000 },
  Parkir: { harian: 2000, bulanan: 60000 },
};

export default function TarifJasaLayananPage() {
  const [dataToko, setDataToko] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}?path=dataToko`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setDataToko(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <NavBar />

		<main className="tarif-container">
		  <div className="tarif-page-card">
			<div className="tarif-header">
			  <h2>Tarif Jasa Layanan</h2>
			  <p>Input pembayaran retribusi jasa layanan pasar</p>
			</div>

			{loading ? (
			  <div className="loading">Memuat data...</div>
			) : (
			  <div className="tarif-grid">
				{Object.keys(TARIF_DUMMY).map((jenis) => (
				  <TarifCard
					key={jenis}
					jenis={jenis}
					tarif={TARIF_DUMMY[jenis]}
					dataToko={dataToko}
				  />
				))}
			  </div>
			)}
		  </div>
		</main>
    </>
  );
}

/* ======================================================
   COMPONENT CARD
====================================================== */
function TarifCard({ jenis, tarif, dataToko }) {
  const [search, setSearch] = useState("");
  const [selectedToko, setSelectedToko] = useState(null);
  const [tipeBayar, setTipeBayar] = useState("harian");

  const filtered =
    search.length > 0
      ? dataToko.filter((d) =>
          d.Nama.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  return (
    <div className="tarif-card">
      <div className="tarif-card-header">{jenis}</div>

      {/* SEARCH TOKO */}
      <div className="tarif-search">
        <input
          type="text"
          placeholder="Cari nama pemilik..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedToko(null);
          }}
        />

        {filtered.length > 0 && !selectedToko && (
          <ul className="tarif-dropdown">
            {filtered.map((t) => (
              <li
                key={t.ID_Toko}
                onClick={() => {
                  setSelectedToko(t);
                  setSearch(`${t.Nama} - ${t.KodeToko}`);
                }}
              >
                <strong>{t.Nama}</strong>
                <span>{t.KodeToko}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* INSIGHT */}
		{selectedToko && (
		  <div className="tarif-insight">
			<div className="toko-nama">{selectedToko.Nama}</div>
			<div className="toko-meta">
			  {selectedToko.KodeToko} • Blok {selectedToko.Blok || "-"} •{" "}
			  {selectedToko.Lantai || "-"}
			</div>
			<div className="toko-status">
			  <span className="badge success">Lunas</span>
			</div>
		  </div>
		)}

      {/* PILIHAN TARIF */}
		<div className="tarif-option">
		  <label>
			<input
			  type="radio"
			  checked={tipeBayar === "harian"}
			  onChange={() => setTipeBayar("harian")}
			/>
			<span>Harian</span>
		  </label>

		  <label>
			<input
			  type="radio"
			  checked={tipeBayar === "bulanan"}
			  onChange={() => setTipeBayar("bulanan")}
			/>
			<span>Bulanan</span>
		  </label>
		</div>

      {/* NOMINAL */}
      <div className="tarif-nominal">
        Rp {tarif[tipeBayar].toLocaleString("id-ID")}
      </div>

      {/* RIWAYAT */}
		<div className="tarif-table-wrapper">
		  <div className="tarif-table-title">5 Transaksi Terakhir</div>

		  <table className="tarif-table">
			<thead>
			  <tr>
				<th>Tanggal</th>
				<th>Periode</th>
				<th>Nominal</th>
			  </tr>
			</thead>
			<tbody>
			  {[1, 2, 3, 4, 5].map((i) => (
				<tr key={i}>
				  <td>0{i}/01/2026</td>
				  <td>{tipeBayar}</td>
				  <td>Rp {tarif[tipeBayar].toLocaleString("id-ID")}</td>
				</tr>
			  ))}
			</tbody>
		  </table>
		</div>
    </div>
  );
}
