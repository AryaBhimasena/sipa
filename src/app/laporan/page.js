"use client";

import { useEffect, useState, Fragment } from "react";
import Header from "../../components/Header";
import NavBar from "../../components/NavBar";
import ContainerCard from "../../components/ContainerCard";
import { API_URL } from "../../lib/api";

import "../../styles/layout.css";
import "../../styles/pages/loket.css";
import "../../styles/pages/laporan.css";

import { Trash2, X, AlertTriangle } from "lucide-react";

export default function LaporanPembayaranPage() {
  const [search, setSearch] = useState("");
  const [dataAll, setDataAll] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(""); // "header" | "detail"
  const [selectedHeaderId, setSelectedHeaderId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  async function fetchAllData() {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}?path=laporanPembayaran`,
        { cache: "no-store" }
      );
      const json = await res.json();
      setDataAll(json.data || []);
    } catch (err) {
      console.error("Fetch laporan error:", err);
      setDataAll([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, []);

const filteredData = dataAll.filter(row => {
  const kuitansi = row.no_kuitansi ? String(row.no_kuitansi) : "";
  return kuitansi.toLowerCase().includes(search.toLowerCase());
});

async function handleDeleteHeader(id_transaksi) {
  const res = await fetch(`${API_URL}?path=deleteTransaksiHeader`, {
    method: "POST",
    body: JSON.stringify({ id_transaksi }),
  });

  const json = await res.json();
  fetchAllData();
}

async function handleDeleteDetail(id_transaksi, bulan) {
  const res = await fetch(`${API_URL}?path=deleteTransaksiDetail`, {
    method: "POST",
    body: JSON.stringify({ id_transaksi, bulan }),
  });

  const json = await res.json();
  fetchAllData();
}

async function confirmDelete() {
  if (confirmType === "header") {
    await handleDeleteHeader(selectedHeaderId);
  }

  if (confirmType === "detail") {
    await handleDeleteDetail(
      selectedDetail.id_transaksi,
      selectedDetail.bulan
    );
  }

  setConfirmOpen(false);
  setSelectedHeaderId(null);
  setSelectedDetail(null);
}

  return (
    <>
      <Header />
      <NavBar />

      <main className="loket-page">
        <ContainerCard
          title="Laporan Pembayaran"
          subtitle="Pencarian data pembayaran berdasarkan nomor kuitansi"
        >
          {/* FILTER */}
          <div className="loket-filter">
            <input
              type="text"
              placeholder="Cari nomor kuitansi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* TABLE */}
          <div className="loket-table-wrapper">
            <table className="loket-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nomor Kuitansi</th>
                  <th>Tanggal Bayar</th>
                  <th>Nama</th>
                  <th>Jenis Objek</th>
                  <th>Periode</th>
                  <th>Jumlah Bulan</th>
                  <th>Total Bayar</th>
                  <th>Petugas Loket</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="10">Memuat data...</td>
                  </tr>
                )}

                {!loading && filteredData.length === 0 && (
                  <tr>
                    <td colSpan="10">Data tidak ditemukan</td>
                  </tr>
                )}

                {!loading &&
                  filteredData.map((row, i) => (
                    <Fragment key={row.id_transaksi}>
                      <tr
                        className="laporan-row"
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === row.id_transaksi
                              ? null
                              : row.id_transaksi
                          )
                        }
                      >
                        <td>{i + 1}</td>
                        <td>{row.no_kuitansi}</td>
                        <td>{new Date(row.tanggal_bayar).toLocaleDateString("id-ID")}</td>
                        <td>{row.nama_pedagang}</td>
                        <td>{row.jenis_objek}</td>
                        <td>{row.periode_tahun}</td>
                        <td>{row.jumlah_bulan}</td>
                        <td>Rp {row.total_bayar.toLocaleString("id-ID")}</td>
						<td>{row.nama_petugas || "-"}</td>
						<td>
							<button
							  className="btn-delete-base"
							  onClick={(e) => {
								e.stopPropagation();
								setConfirmType("header");
								setSelectedHeaderId(row.id_transaksi);
								setConfirmOpen(true);
							  }}
							>
							  <Trash2 size={16} />
							</button>
						</td>
                      </tr>

                      {expandedRow === row.id_transaksi && (
                        <tr className="detail-strip">
                          <td colSpan="10">
                            <table className="strip-table">
                              <thead>
                                <tr>
                                  <th>Bulan</th>
                                  <th>Jasa Sewa</th>
                                  <th>Kebersihan</th>
                                  <th>Keamanan</th>
                                  <th>Denda</th>
                                  <th>Diskon</th>
                                  <th>Aksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.detail?.map((d, idx) => (
                                  <tr key={idx}>
                                    <td>{d.bulan}</td>
                                    <td>{d.sewa.toLocaleString("id-ID")}</td>
                                    <td>{d.kebersihan.toLocaleString("id-ID")}</td>
                                    <td>{d.keamanan.toLocaleString("id-ID")}</td>
                                    <td>{d.denda.toLocaleString("id-ID")}</td>
                                    <td>{d.diskon.toLocaleString("id-ID")}</td>
									<td>
										<button
										  className="btn-delete-strip"
										  onClick={(e) => {
											e.stopPropagation();
											setConfirmType("detail");
											setSelectedDetail({ id_transaksi: row.id_transaksi, bulan: d.bulan });
											setConfirmOpen(true);
										  }}
										>
										  <X size={14} />
										</button>
									</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </ContainerCard>
      </main>
	  
	  {confirmOpen && (
		  <div className="confirm-overlay">
			<div className="confirm-modal">
			  <AlertTriangle size={36} className="confirm-icon" />

			  <h3>Konfirmasi Hapus</h3>

			  <p>
				{confirmType === "header"
				  ? "Yakin ingin menghapus seluruh transaksi beserta detailnya?"
				  : `Yakin ingin menghapus detail bulan ${selectedDetail?.bulan}?`}
			  </p>

			  <div className="confirm-actions">
				<button
				  className="btn-cancel"
				  onClick={() => setConfirmOpen(false)}
				>
				  Batal
				</button>

				<button
				  className="btn-confirm"
				  onClick={confirmDelete}
				>
				  Hapus
				</button>
			  </div>
			</div>
		  </div>
		)}

    </>
  );
}
