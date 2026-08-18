"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "../../../components/Header";
import NavBar from "../../../components/NavBar";
import ContainerCard from "../../../components/ContainerCard";
import ModalKuitansi from "../../../components/ModalKuitansi";
import { API_URL } from "../../../lib/api";
import { useLaporanPembayaran } from "../../../lib/laporan/useLaporanPembayaran";
import {
  buildKuitansi,
  applyDateFilter,
  buildExcelData,
} from "../../../lib/laporan/utilLaporanPembayaran";
import LaporanPembayaranTable from "../../../lib/laporan/laporanPembayaranTable";

import {
  PERIODE,
  applyPeriode,
  syncPeriode,
} from "../../../lib/laporan/utilPeriodeFilter";

import "../../../styles/layout.css";
import "../../../styles/pages/laporan.css";

import * as XLSX from "xlsx";
import { Loader2 } from "lucide-react";
import { exportLaporanPembayaranPDF } from "../../../lib/laporan/eksportPDF-laporanpembayaran";

import { useUser } from "../../../lib/context/UserContext";

export default function LaporanPembayaranPage() {
  const {
    data,
    loading,
    refetch,
  } = useLaporanPembayaran();
  
  const user = useUser();

  const [isDownloading, setIsDownloading] =
    useState(false);

  const [isExporting, setIsExporting] =
    useState(false);

  /* =====================================================
     FILTER & TABLE STATE
  ===================================================== */

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [expandedRow, setExpandedRow] =
    useState(null);

  const [tglAwal, setTglAwal] =
    useState("");

  const [tglAkhir, setTglAkhir] =
    useState("");

  const [periode, setPeriode] =
    useState(PERIODE.HARIAN);

  const [filteredByDate, setFilteredByDate] =
    useState(null);

  /* =====================================================
     VERIFIKASI QRIS
  ===================================================== */

  const [verifyingId, setVerifyingId] =
    useState(null);

  /* =====================================================
     KUITANSI
  ===================================================== */

  const [kuitansiOpen, setKuitansiOpen] =
    useState(false);

  const [kuitansiData, setKuitansiData] =
    useState(null);

  const [kuitansiPedagang, setKuitansiPedagang] =
    useState(null);

  /* =====================================================
     DEFAULT PERIODE
  ===================================================== */

  useEffect(() => {
    applyPeriode(
      PERIODE.HARIAN,
      setTglAwal,
      setTglAkhir
    );
  }, []);

  /* =====================================================
     PERUBAHAN PERIODE
  ===================================================== */

  const handlePeriodeChange = (e) => {
    const value = e.target.value;

    setPeriode(value);

    if (value !== PERIODE.CUSTOM) {
      applyPeriode(
        value,
        setTglAwal,
        setTglAkhir
      );
    }
  };

  /* =====================================================
     SOURCE DATA
  ===================================================== */

  const sourceData =
    filteredByDate ?? data;

  /* =====================================================
     FILTER DATA TABEL
     
     Urutan:
     1. Search nomor kuitansi
     2. Filter status bayar
     
     Hasil filteredData adalah data final
     yang ditampilkan tabel dan digunakan
     untuk Export Excel.
  ===================================================== */

  const filteredData = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return sourceData.filter((row) => {
      /* -----------------------------------------------
         SEARCH NOMOR KUITANSI
      ------------------------------------------------ */

      const matchSearch =
        String(
          row.no_kuitansi || ""
        )
          .toLowerCase()
          .includes(keyword);

      if (!matchSearch) {
        return false;
      }

      /* -----------------------------------------------
         FILTER STATUS BAYAR
      ------------------------------------------------ */

      if (statusFilter === "ALL") {
        return true;
      }

      const status =
        String(
          row.status_bayar || ""
        )
          .trim()
          .toUpperCase();

      return status === statusFilter;
    });
  }, [
    sourceData,
    search,
    statusFilter,
  ]);

  /* =====================================================
     OPEN KUITANSI
  ===================================================== */

  const openKuitansi = (row) => {
    const {
      rincian,
      subtotal,
    } = buildKuitansi(row);

    setKuitansiPedagang({
      id_reg: row.id_reg,
      blok: row.blok,
      no: row.no_toko,
      nama: row.nama_pedagang,
      objek: row.objek,
    });

    setKuitansiData({
      no_kuitansi:
        row.no_kuitansi,

      periode:
        row.periode_tahun,

      jumlahBulan:
        row.jumlah_bulan,

      total:
        row.total_bayar,

      rincian,
      subtotal,
    });

    setKuitansiOpen(true);
  };

  /* =====================================================
     FILTER TANGGAL
  ===================================================== */

  const handleProsesFilter = () => {
    try {
      const hasil =
        applyDateFilter(
          data,
          tglAwal,
          tglAkhir
        );

      setFilteredByDate(hasil);
    } catch (err) {
      alert(err.message);
    }
  };

/* =====================================================
   EXPORT EXCEL
   =====================================================

   Data yang diekspor adalah filteredData,
   yaitu data final yang sedang tampil
   pada tabel setelah:

   1. Filter tanggal
   2. Search nomor kuitansi
   3. Filter status pembayaran

===================================================== */

const handleExportExcel = () => {
  if (!filteredData.length) {
    alert(
      "Tidak ada data yang dapat diekspor."
    );

    return;
  }

  setIsExporting(true);

  try {
    /* =================================================
       BUILD DATA EXCEL
    ================================================= */

    const exportData =
      buildExcelData(
        filteredData
      );

    /* =================================================
       CREATE WORKSHEET
    ================================================= */

    const worksheet =
      XLSX.utils.json_to_sheet(
        exportData
      );

    /* =================================================
       COLUMN WIDTH
    ================================================= */

    worksheet["!cols"] = [
      { wch: 6 },   // No
      { wch: 18 },  // Nomor Kuitansi
      { wch: 16 },  // Tanggal Bayar
      { wch: 18 },  // ID Registrasi
      { wch: 25 },  // Nama
      { wch: 18 },  // Jenis Objek
      { wch: 15 },  // Tipe
      { wch: 10 },  // Lantai
      { wch: 10 },  // Blok
      { wch: 12 },  // No Toko
      { wch: 12 },  // Periode
      { wch: 30 },  // Bulan Dibayar
      { wch: 14 },  // Jumlah Bulan
      { wch: 16 },  // Jasa Sewa
      { wch: 16 },  // Kebersihan
      { wch: 16 },  // Keamanan
      { wch: 14 },  // Denda
      { wch: 14 },  // Diskon
      { wch: 18 },  // Total Bayar
      { wch: 16 },  // Metode Bayar
      { wch: 16 },  // Status Bayar
      { wch: 20 },  // Petugas Loket
    ];

    /* =================================================
       CREATE WORKBOOK
    ================================================= */

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Laporan Pembayaran"
    );

    /* =================================================
       NAMA FILE
    ================================================= */

    const statusName =
      statusFilter === "ALL"
        ? "Semua_Status"
        : statusFilter;

    const fileName =
      `Laporan_Pembayaran_${statusName}_${tglAwal || "semua"}_${tglAkhir || "semua"}.xlsx`;

    /* =================================================
       DOWNLOAD
    ================================================= */

    XLSX.writeFile(
      workbook,
      fileName
    );

  } catch (err) {
    console.error(
      "[handleExportExcel]",
      err
    );

    alert(
      "Gagal membuat file Excel."
    );

  } finally {
    setIsExporting(false);
  }
};

  /* =====================================================
     VERIFIKASI PEMBAYARAN QRIS
  ===================================================== */

  const handleVerifikasiPembayaran = async (
    idTransaksi
  ) => {
    if (!idTransaksi) {
      alert(
        "ID transaksi tidak ditemukan"
      );
      return;
    }

    const ok = confirm(
      "Verifikasi pembayaran QRIS ini sebagai PAID?"
    );

    if (!ok) return;

    setVerifyingId(
      idTransaksi
    );

    try {
      const res =
        await fetch(
          `${API_URL}?path=apiVerifikasiPembayaran&id_transaksi=${encodeURIComponent(
            idTransaksi
          )}`,
          {
            method: "POST",
            cache: "no-store",
          }
        );

      const json =
        await res.json();

      console.log(
        "[apiVerifikasiPembayaran] response:",
        json
      );

      if (!json.success) {
        throw new Error(
          json.message ||
            "Gagal memverifikasi pembayaran"
        );
      }

      alert(
        json.message ||
          "Pembayaran QRIS berhasil diverifikasi"
      );

      await refetch();

    } catch (err) {
      console.error(
        "[apiVerifikasiPembayaran]",
        err
      );

      alert(
        err.message ||
          "Gagal melakukan verifikasi pembayaran"
      );

    } finally {
      setVerifyingId(
        null
      );
    }
  };

/* =====================================================
   EXPORT PDF
===================================================== */

const handleExportPDF = async () => {
  if (!tglAwal || !tglAkhir) {
    alert(
      "Silakan pilih tanggal terlebih dahulu"
    );

    return;
  }

  if (!filteredData.length) {
    alert(
      "Tidak ada data yang dapat diekspor."
    );

    return;
  }

  setIsDownloading(true);

  try {
    await exportLaporanPembayaranPDF(
      filteredData,
      {
        tglAwal,
        tglAkhir,
        user,
      }
    );
  } catch (err) {
    console.error(
      "[handleExportPDF]",
      err
    );

    alert(
      err?.message ||
        "Gagal membuat file PDF."
    );
  } finally {
    setIsDownloading(false);
  }
};

  /* =====================================================
     DELETE HEADER
  ===================================================== */

  const handleDeleteHeader =
    async (
      idTransaksi
    ) => {
      const ok =
        confirm(
          "Hapus transaksi ini?"
        );

      if (!ok) return;

      try {
        const res =
          await fetch(
            `${API_URL}?path=deleteTransaksiHeader&id_transaksi=${encodeURIComponent(
              idTransaksi
            )}`,
            {
              method:
                "POST",
              cache:
                "no-store",
            }
          );

        const json =
          await res.json();

        console.log(
          "[deleteTransaksiHeader] response:",
          json
        );

        if (!json.success) {
          throw new Error(
            json.message
          );
        }

        alert(
          json.message
        );

        await refetch();

      } catch (err) {
        alert(
          err.message ||
            "Gagal menghapus transaksi"
        );
      }
    };

  /* =====================================================
     DELETE DETAIL
  ===================================================== */

  const handleDeleteDetail =
    async (
      idTransaksi,
      bulan
    ) => {
      const ok =
        confirm(
          `Hapus detail bulan ${bulan}?`
        );

      if (!ok) return;

      try {
        const res =
          await fetch(
            `${API_URL}?path=deleteTransaksiDetail&id_transaksi=${encodeURIComponent(
              idTransaksi
            )}&bulan=${encodeURIComponent(
              bulan
            )}`,
            {
              method:
                "POST",
              cache:
                "no-store",
            }
          );

        const json =
          await res.json();

        console.log(
          "[deleteTransaksiDetail] response:",
          json
        );

        if (!json.success) {
          throw new Error(
            json.message
          );
        }

        alert(
          json.message
        );

        await refetch();

      } catch (err) {
        alert(
          err.message ||
            "Gagal menghapus detail"
        );
      }
    };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      <Header />

      <NavBar />

      <main className="laporan-page">
        <ContainerCard
          title="Laporan Pembayaran"
          subtitle="Pencarian berdasarkan nomor kuitansi"
        >

          {/* =================================================
              FILTER
          ================================================= */}

          <div className="laporan-filter">

            {/* KIRI – SEARCH */}

            <div className="laporan-filter-left">

              <input
                type="text"
                placeholder="Cari nomor kuitansi..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

            {/* KANAN – CONTROLLER */}

            <div className="laporan-filter-controls">

              {/* PERIODE */}

              <select
                value={
                  periode
                }
                onChange={
                  handlePeriodeChange
                }
              >
                <option
                  value={
                    PERIODE.HARIAN
                  }
                >
                  Harian
                </option>

                <option
                  value={
                    PERIODE.MINGGUAN
                  }
                >
                  Mingguan
                </option>

                <option
                  value={
                    PERIODE.BULANAN
                  }
                >
                  Bulanan
                </option>

                <option
                  value={
                    PERIODE.TAHUNAN
                  }
                >
                  Tahunan
                </option>

                <option
                  value={
                    PERIODE.CUSTOM
                  }
                >
                  Custom
                </option>
              </select>

              {/* STATUS BAYAR */}

              <select
                value={
                  statusFilter
                }
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >
                <option value="ALL">
                  Semua Status
                </option>

                <option value="PAID">
                  PAID
                </option>

                <option value="PENDING">
                  PENDING
                </option>
              </select>

              {/* TANGGAL AWAL */}

              <input
                type="date"
                value={
                  tglAwal
                }
                onChange={(
                  e
                ) => {
                  const value =
                    e.target.value;

                  setTglAwal(
                    value
                  );

                  syncPeriode(
                    value,
                    tglAkhir,
                    setPeriode
                  );
                }}
              />

              {/* TANGGAL AKHIR */}

              <input
                type="date"
                value={
                  tglAkhir
                }
                onChange={(
                  e
                ) => {
                  const value =
                    e.target.value;

                  setTglAkhir(
                    value
                  );

                  syncPeriode(
                    tglAwal,
                    value,
                    setPeriode
                  );
                }}
              />

              {/* PROSES */}

              <button
                className="laporan-btn laporan-btn-proses"
                onClick={
                  handleProsesFilter
                }
              >
                Proses
              </button>

              {/* EXPORT EXCEL */}

              <button
                className="laporan-btn laporan-btn-excel"
                onClick={
                  handleExportExcel
                }
                disabled={
                  isExporting ||
                  filteredData.length ===
                    0
                }
              >
                {isExporting
                  ? "Memproses..."
                  : "Export Excel"}
              </button>

              {/* EXPORT PDF */}

				<button
				  className="laporan-btn laporan-btn-export"
				  onClick={
					handleExportPDF
				  }
				  disabled={
					isDownloading ||
					filteredData.length === 0
				  }
				>
				  {isDownloading
					? "Memproses..."
					: "Export PDF"}
				</button>

            </div>
          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="laporan-table-wrapper">

            <table className="laporan-table">

              <thead>
                <tr>

                  <th>
                    No
                  </th>

                  <th>
                    Nomor Kuitansi
                  </th>

                  <th>
                    Tanggal Bayar
                  </th>

                  <th>
                    Nama
                  </th>

                  <th>
                    Jenis Objek
                  </th>

                  <th>
                    Periode
                  </th>

                  <th>
                    Jumlah Bulan
                  </th>

                  <th>
                    Total Bayar
                  </th>

                  <th>
                    Metode Bayar
                  </th>

                  <th>
                    Status Bayar
                  </th>

                  <th>
                    Petugas Loket
                  </th>

                  <th>
                    Aksi
                  </th>

                </tr>
              </thead>

              <tbody>

                <LaporanPembayaranTable
                  data={
                    filteredData
                  }

                  loading={
                    loading
                  }

                  expandedRow={
                    expandedRow
                  }

                  onExpand={(
                    id
                  ) =>
                    setExpandedRow(
                      expandedRow ===
                        id
                        ? null
                        : id
                    )
                  }

                  onPrint={
                    openKuitansi
                  }

                  onDeleteHeader={
                    handleDeleteHeader
                  }

                  onDeleteDetail={
                    handleDeleteDetail
                  }

                  onVerifyPayment={
                    handleVerifikasiPembayaran
                  }

                  verifyingId={
                    verifyingId
                  }
                />

              </tbody>

            </table>

          </div>

        </ContainerCard>
      </main>

      {/* =====================================================
          MODAL KUITANSI
      ===================================================== */}

      {kuitansiOpen && (
        <ModalKuitansi
          dataPedagang={
            kuitansiPedagang
          }

          ringkasan={
            kuitansiData
          }

          onClose={() =>
            setKuitansiOpen(
              false
            )
          }

          showSimpan={
            false
          }
        />
      )}

      {/* =====================================================
          PDF LOADING
      ===================================================== */}

      {isDownloading && (
        <div className="pdf-loading-overlay">

          <div className="pdf-loading-popup">

            <Loader2
              className="pdf-loading-icon"
              size={40}
            />

            <p>
              Sedang membuat PDF...
            </p>

            <span>
              Mohon tunggu sampai
              proses selesai
            </span>

          </div>

        </div>
      )}

    </>
  );
}