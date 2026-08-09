"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "../../../components/Header";
import NavBar from "../../../components/NavBar";
import ContainerCard from "../../../components/ContainerCard";
import ModalKuitansi from "../../../components/ModalKuitansi";
import { API_URL } from "../../../lib/api";
import { useLaporanPembayaran } from "../../../lib/laporan/useLaporanPembayaran";
import { buildKuitansi, applyDateFilter, handleExportPDF } from "../../../lib/laporan/utilLaporanPembayaran";
import LaporanPembayaranTable from "../../../lib/laporan/laporanPembayaranTable";
import {
  PERIODE,
  applyPeriode,
  syncPeriode,
} from "../../../lib/laporan/utilPeriodeFilter";

import "../../../styles/layout.css";
import "../../../styles/pages/laporan.css";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Loader2 } from "lucide-react"

export default function LaporanPembayaranPage() {
  const { data, loading, refetch } = useLaporanPembayaran();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [tglAwal, setTglAwal] = useState("");
  const [tglAkhir, setTglAkhir] = useState("");
  const [periode, setPeriode] = useState(PERIODE.HARIAN);
  const [filteredByDate, setFilteredByDate] = useState(null);

  const [kuitansiOpen, setKuitansiOpen] = useState(false);
  const [kuitansiData, setKuitansiData] = useState(null);
  const [kuitansiPedagang, setKuitansiPedagang] = useState(null);
  
	useEffect(() => {
	  applyPeriode(PERIODE.HARIAN, setTglAwal, setTglAkhir);
	}, []);

const handlePeriodeChange = (e) => {
  const value = e.target.value;

  setPeriode(value);

  if (value !== PERIODE.CUSTOM) {
    applyPeriode(value, setTglAwal, setTglAkhir);
  }
};

	const sourceData = filteredByDate ?? data;

	const filteredData = useMemo(
	  () =>
		sourceData.filter((r) =>
		  String(r.no_kuitansi || "")
			.toLowerCase()
			.includes(search.toLowerCase())
		),
	  [sourceData, search]
	);

  const openKuitansi = row => {
    const { rincian, subtotal } = buildKuitansi(row);

    setKuitansiPedagang({
      id_reg: row.id_reg,
      blok: row.blok,
      no: row.no_toko,
      nama: row.nama_pedagang,
      objek: row.objek,
    });

    setKuitansiData({
      no_kuitansi: row.no_kuitansi,
      periode: row.periode_tahun,
      jumlahBulan: row.jumlah_bulan,
      total: row.total_bayar,
      rincian,
      subtotal,
    });

    setKuitansiOpen(true);
  };

const handleProsesFilter = () => {
  try {
    const hasil = applyDateFilter(data, tglAwal, tglAkhir);
    setFilteredByDate(hasil);
  } catch (err) {
    alert(err.message);
  }
};

const handlePreviewPDF = async () => {
  if (!tglAwal || !tglAkhir) {
    alert("Silakan pilih tanggal terlebih dahulu");
    return;
  }

  setIsDownloading(true); // ⬅ START LOADING

  const url = `/laporan/preview-pdf?start=${tglAwal}&end=${tglAkhir}`;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = url;

  document.body.appendChild(iframe);

  iframe.onload = async () => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      const waitForPages = () =>
        new Promise((resolve) => {
          const check = () => {
            const pages = iframeDoc.querySelectorAll(".preview-paper");
            if (pages.length > 0) resolve(pages);
            else setTimeout(check, 300);
          };
          check();
        });

      const pages = await waitForPages();

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.75);

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);
      }

      pdf.save(`Laporan_Pembayaran_${tglAwal}_${tglAkhir}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Gagal generate PDF");
    } finally {
      document.body.removeChild(iframe);
      setIsDownloading(false); // ⬅ STOP LOADING
    }
  };
};

const handleDeleteHeader = async (idTransaksi) => {
  const ok = confirm("Hapus transaksi ini?");
  if (!ok) return;

  try {
    const res = await fetch(
      `${API_URL}?path=deleteTransaksiHeader&id_transaksi=${encodeURIComponent(idTransaksi)}`,
      {
        method: "POST",
        cache: "no-store",
      }
    );

    const json = await res.json();
    console.log("[deleteTransaksiHeader] response:", json);

    if (!json.success) {
      throw new Error(json.message);
    }

    alert(json.message);
    refetch();
  } catch (err) {
    alert(err.message || "Gagal menghapus transaksi");
  }
};

const handleDeleteDetail = async (idTransaksi, bulan) => {
  const ok = confirm(`Hapus detail bulan ${bulan}?`);
  if (!ok) return;

  try {
    const res = await fetch(
      `${API_URL}?path=deleteTransaksiDetail&id_transaksi=${encodeURIComponent(
        idTransaksi
      )}&bulan=${encodeURIComponent(bulan)}`,
      {
        method: "POST",
        cache: "no-store",
      }
    );

    const json = await res.json();
    console.log("[deleteTransaksiDetail] response:", json);

    if (!json.success) {
      throw new Error(json.message);
    }

    alert(json.message);
    refetch();
  } catch (err) {
    alert(err.message || "Gagal menghapus detail");
  }
};

  return (
    <>
      <Header />
      <NavBar />

      <main className="laporan-page">
        <ContainerCard
          title="Laporan Pembayaran"
          subtitle="Pencarian berdasarkan nomor kuitansi"
        >
          {/* FILTER */}
			<div className="laporan-filter">
			  {/* KIRI – SEARCH */}
			  <div className="laporan-filter-left">
				<input
				  type="text"
				  placeholder="Cari nomor kuitansi..."
				  value={search}
				  onChange={(e) => setSearch(e.target.value)}
				/>
			  </div>

			  {/* KANAN – CONTROLLER */}
			  <div className="laporan-filter-controls">
				<select
				  value={periode}
				  onChange={handlePeriodeChange}
				>
				  <option value={PERIODE.HARIAN}>Harian</option>
				  <option value={PERIODE.MINGGUAN}>Mingguan</option>
				  <option value={PERIODE.BULANAN}>Bulanan</option>
				  <option value={PERIODE.TAHUNAN}>Tahunan</option>
				  <option value={PERIODE.CUSTOM}>Custom</option>
				</select>
				
				<input
				  type="date"
				  value={tglAwal}
				  onChange={(e) => {
					  const value = e.target.value;

					  setTglAwal(value);

					  syncPeriode(value, tglAkhir, setPeriode);
					}}
				/>

				<input
				  type="date"
				  value={tglAkhir}
				  onChange={(e) => {
					  const value = e.target.value;

					  setTglAkhir(value);

					  syncPeriode(tglAwal, value, setPeriode);
					}}
				/>

				<button
				  className="laporan-btn laporan-btn-proses"
				  onClick={handleProsesFilter}
				>
				  Proses
				</button>

				<button
				  className="laporan-btn laporan-btn-export"
				  onClick={handlePreviewPDF}
				  disabled={isDownloading}
				>
				  {isDownloading ? "Memproses..." : "Export PDF"}
				</button>

			  </div>
			</div>

		<div className="laporan-table-wrapper">
		  <table className="laporan-table">
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
              <LaporanPembayaranTable
                data={filteredData}
                loading={loading}
                expandedRow={expandedRow}
                onExpand={id =>
                  setExpandedRow(expandedRow === id ? null : id)
                }
                onPrint={openKuitansi}
                onDeleteHeader={handleDeleteHeader}
                onDeleteDetail={handleDeleteDetail}
              />
            </tbody>
		  </table>
		</div>

        </ContainerCard>
      </main>

      {kuitansiOpen && (
        <ModalKuitansi
          dataPedagang={kuitansiPedagang}
          ringkasan={kuitansiData}
          onClose={() => setKuitansiOpen(false)}
          showSimpan={false}
        />
      )}
	  
{isDownloading && (
  <div className="pdf-loading-overlay">
    <div className="pdf-loading-popup">
      <Loader2 className="pdf-loading-icon" size={40} />
      <p>Sedang membuat PDF...</p>
      <span>Mohon tunggu sampai proses selesai</span>
    </div>
  </div>
)}

    </>
  );
}
