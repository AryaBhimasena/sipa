"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLaporanPembayaran } from "../../../lib/laporan/useLaporanPembayaran";
import { applyDateFilter } from "../../../lib/laporan/utilLaporanPembayaran";
import { useUser } from "../../../lib/context/UserContext";

import "../../../styles/components/laporan-preview.css";

const ROWS_PER_PAGE = 15;

function formatTanggalDMY(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d)) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

/* ================== ISI UTAMA ================== */
function LaporanPembayaranPreviewContent() {
  const params = useSearchParams();
  const tglAwal = params.get("start");
  const tglAkhir = params.get("end");
  const user = useUser();

  const { data, loading } = useLaporanPembayaran();

  const filteredData = useMemo(() => {
    if (!tglAwal || !tglAkhir || !data) return [];
    try {
      return applyDateFilter(data, tglAwal, tglAkhir);
    } catch {
      return [];
    }
  }, [data, tglAwal, tglAkhir]);

  const pages = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < filteredData.length; i += ROWS_PER_PAGE) {
      chunks.push(filteredData.slice(i, i + ROWS_PER_PAGE));
    }
    return chunks;
  }, [filteredData]);

  if (!tglAwal || !tglAkhir)
    return <div className="preview-warning">Silakan pilih filter tanggal.</div>;

  if (loading)
    return <div className="preview-loading">Memuat data...</div>;

  if (filteredData.length === 0)
    return <div className="preview-warning">Tidak ada data.</div>;

  return (
    <div className="preview-wrapper">
      {pages.map((page, pageIndex) => {
		const startNumber = pageIndex * ROWS_PER_PAGE;
        const isLastPage = pageIndex === pages.length - 1;

        return (
          <div key={pageIndex} className="preview-paper page-break">
			<div className="preview-header">
			  <img
				src="/logo-perumda-baiman.PNG"
				alt="Logo Perumda Baiman"
				className="preview-logo"
			  />

			  <div className="preview-header-text">
				<h2 className="preview-title">
				  PERUSAHAAN UMUM DAERAH PASAR BAIMAN BANJARMASIN
				</h2>
				<p className="preview-subtitle">
				  Laporan Pembayaran Tarif Jasa Layanan
				</p>
				<p className="preview-title">
				  Pasar Sentra Antasari Banjarmasin
				</p>
				<p className="preview-subtitle-periode">
				  Periode {formatTanggalDMY(tglAwal)} s/d{" "}
				  {formatTanggalDMY(tglAkhir)}
				</p>
			  </div>
			</div>

            <table className="preview-table">
            <thead>
              <tr>
                <th rowSpan={2} className="col-no">No</th>
                <th rowSpan={2} className="col-date">Tanggal</th>
                <th rowSpan={2} className="col-year">Tahun</th>
                <th rowSpan={2} className="col-kasir">Nama Kasir</th>
                <th rowSpan={2} className="col-reg">No Reg</th>
                <th rowSpan={2} className="col-pedagang">Nama Pedagang</th>
                <th rowSpan={2} className="col-kuitansi">No Kuitansi</th>

                <th colSpan={6}>Pembayaran Jasa Layanan Berjalan</th>
                <th colSpan={6}>Tunggakan Pembayaran Jasa Layanan</th>

                <th rowSpan={2} className="col-ket">Ket</th>
              </tr>

              <tr>
                <th className="col-bulan">Bulan Bayar</th>
                <th className="col-uang num">Jasa Sewa</th>
                <th className="col-uang num">Jasa Kebersihan</th>
                <th className="col-uang num">Jasa Keamanan</th>
                <th className="col-uang num">Denda</th>
                <th className="col-uang num">Jumlah</th>

                <th className="col-bulan">Bulan Bayar</th>
                <th className="col-uang num">Jasa Sewa</th>
                <th className="col-uang num">Jasa Kebersihan</th>
                <th className="col-uang num">Jasa Keamanan</th>
                <th className="col-uang num">Denda</th>
                <th className="col-uang num">Jumlah</th>
              </tr>
            </thead>

              <tbody>
                {page.map((r, i) => {
                  const details = r.detail || [];
                  const sum = (k) =>
                    details.reduce((s, d) => s + (d[k] || 0), 0);

                const bulanBerjalan = details.map(d => d.bulan).join("\n");
                const sewa = details.reduce((s, d) => s + (d.sewa || 0), 0);
                const kebersihan = details.reduce((s, d) => s + (d.kebersihan || 0), 0);
                const keamanan = details.reduce((s, d) => s + (d.keamanan || 0), 0);
                const denda = details.reduce((s, d) => s + (d.denda || 0), 0);
                const jumlah = details.reduce((s, d) => s + (d.total || 0), 0);

                  return (
                  <tr key={i}>
                    <td className="col-no">{startNumber + i + 1}</td>

                    <td className="col-date">{formatTanggalDMY(r.tanggal_bayar)}</td>
                    <td className="col-year">{r.periode_tahun}</td>
                    <td className="col-kasir">{r.nama_petugas}</td>
                    <td className="col-reg">{r.id_reg}</td>
                    <td className="col-pedagang">{r.nama_pedagang}</td>
                    <td className="col-kuitansi">{r.no_kuitansi}</td>

                    <td className="col-bulan">{bulanBerjalan || "-"}</td>
                    <td className="col-uang num">Rp {sewa.toLocaleString("id-ID")}</td>
                    <td className="col-uang num">Rp {kebersihan.toLocaleString("id-ID")}</td>
                    <td className="col-uang num">Rp {keamanan.toLocaleString("id-ID")}</td>
                    <td className="col-uang num">Rp {denda.toLocaleString("id-ID")}</td>
                    <td className="col-uang num"><strong>Rp {jumlah.toLocaleString("id-ID")}</strong></td>

                    <td className="col-bulan">-</td>
                    <td className="col-uang num">Rp 0</td>
                    <td className="col-uang num">Rp 0</td>
                    <td className="col-uang num">Rp 0</td>
                    <td className="col-uang num">Rp 0</td>
                    <td className="col-uang num">Rp 0</td>

                    <td className="col-ket">-</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ===== FOOTER TANDA TANGAN (HALAMAN TERAKHIR) ===== */}
            {isLastPage && (
              <div className="signature-footer">
                <div>
                  <p><b>Petugas Loket</b></p>
                  <div className="sign-space" />
                  <p><b>{user?.nama || ". . ."}</b></p>
                  <p>{user?.jabatan || "Petugas Loket"}</p>
                </div>

                <div>
                  <p><b>Verifikasi</b></p>
                  <div className="sign-space" />
                  <p><b>Juli Saputra</b></p>
                  <p>Kepala Pasar Zona 2 Antasari</p>
                </div>

                <div>
                  <p><b>Verifikasi</b></p>
                  <div className="sign-space" />
                  <p><b>Rizali Hakim</b></p>
                  <p>Manager Operasional</p>
                </div>

                <div>
                  <p><b>Mengetahui</b></p>
                  <div className="sign-space" />
                  <p><b>Azhar Budi, S.E</b></p>
                  <p>Direktur Operasional & Bisnis</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ================== WRAPPER ================== */
export default function LaporanPembayaranPreviewPDF() {
  return (
    <Suspense fallback={<div className="preview-loading">Memuat…</div>}>
      <LaporanPembayaranPreviewContent />
    </Suspense>
  );
}
