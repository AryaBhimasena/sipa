"use client";

import "../styles/components/kuitansi.css";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../lib/api";
import { terbilang, printIframe } from "../lib/KuitansiHelper";
import {
  createKuitansiActionState,
  handleCloseWithConfirm,
  handlePrint,
  handleExportPDF,
  markAsSaved
} from "../lib/KuitansiActionHelper";
import { AlertTriangle } from "lucide-react";

export default function ModalKuitansi({
  dataPedagang,
  ringkasan,
  onClose,
  onConfirm,
  showSimpan = true,
}) {
  const today = new Date().toLocaleDateString("id-ID");
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);
  const router = useRouter();
  const [namaPetugas, setNamaPetugas] = useState("");
  const actionState = useRef(createKuitansiActionState());
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const totalDiskon =
  ringkasan.subtotal?.diskon ??
  ringkasan.rincian.reduce((s, r) => s + (r.diskonNominal || 0), 0);

useEffect(() => {
  const session = localStorage.getItem("session");

  if (!session) return;

  try {
    const parsed = JSON.parse(session);
    setNamaPetugas(parsed.user?.nama || "");
  } catch {
    setNamaPetugas("");
  }
}, []);

  async function handleSubmit() {
    try {
      setLoading(true);

      const payload = {
        header: {
          no_kuitansi: ringkasan.no_kuitansi,
          id_reg: dataPedagang.id_reg,
          nama_pedagang: dataPedagang.nama,
          jenis_objek: dataPedagang.objek?.jenis_objek,
          blok: dataPedagang.blok,
          no_toko: dataPedagang.no,
          periode_tahun: ringkasan.periode,
          jumlah_bulan: ringkasan.jumlahBulan,
          subtotal: ringkasan.subtotal,
          total_bayar: ringkasan.total,
          metode_bayar: "TUNAI",
		  nama_petugas: namaPetugas,
        },
        detail: ringkasan.rincian,
      };

      const res = await fetch(`${API_URL}?path=simpanPembayaran`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          payload: JSON.stringify(payload),
        }),
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message || "Gagal menyimpan pembayaran");
        setLoading(false);
        return;
      }

      if (typeof onConfirm === "function") {
        onConfirm(result);
      }

      setLoading(false);

	markAsSaved(actionState.current);

    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan data");
      setLoading(false);
    }
  }

  return (
    <>
      {loading && (
        <div className="saving-overlay">
          <div className="saving-box">Menyimpan data...</div>
        </div>
      )}

      <div className="modal-overlay" onClick={onClose} />

      <div className="modal-container">
		<div className="modal-header custom-header">

		  <button
			className="btn-tutup"
			onClick={() => {
			  if (loading) return;

			  if (actionState.current.saved) {
				onClose();
			  } else {
				setConfirmOpen(true);
			  }
			}}
		  >
			Tutup
		  </button>

		  <div className="action-group">

			<button
			  className="btn-pdf"
			  onClick={() =>
				  handleExportPDF(
					printRef,
					ringkasan.no_kuitansi,
					dataPedagang.nama
				  )
				}
			>
			  Export PDF
			</button>

			{showSimpan && (
			  <button
				className="btn-simpan"
				disabled={loading}
				onClick={handleSubmit}
			  >
				{loading ? "Menyimpan..." : "Simpan"}
			  </button>
			)}

			<button
			  className="btn-print"
			  onClick={() => handlePrint(printRef)}
			>
			  Print
			</button>

		  </div>

		</div>

        <div className="modal-body">
          <div className="kuitansi-paper" ref={printRef}>
            {/* ================= HEADER ================= */}
            <div className="kuitansi-header">
              <div className="kop-left">
                <img
                  src="/logo-perumda-baiman.PNG"
                  alt="Logo Perumda Pasar Baiman"
                  className="kop-logo"
                />
              </div>

              <div className="kop-center">
                <h3>PERUSAHAAN UMUM DAERAH PASAR BAIMAN BANJARMASIN</h3>
                <p>Pasar Sentra Antasari Banjarmasin</p>
                <br />
                <h4>KUITANSI TARIF JASA PELAYANAN</h4>
                <p className="subtitle">( TANDA BUKTI PEMBAYARAN )</p>
              </div>
            </div>

            <hr />

            {/* ================= BODY ================= */}
            <div className="kuitansi-body">
              <div className="tanggal-bayar">
                Banjarmasin, {today}
              </div>

              <div className="content-left">
                <div className="row">
                  <span>Nomor</span>
                  <span>: {ringkasan.no_kuitansi}</span>
                </div>

                <div className="row">
                  <span>No Reg / Kd Pasar / No Toko</span>
                  <span>
                    : {dataPedagang.id_reg} / {dataPedagang.blok} / {dataPedagang.no}
                  </span>
                </div>

                <div className="row">
                  <span>Sudah Terima Dari</span>
                  <span>
                    : {dataPedagang.nama}
                    {" / "}
                    {dataPedagang.objek?.jenis_objek}
                    {" / "}
                    {dataPedagang.objek?.tipe}
                    {" / "}
                    {dataPedagang.objek?.panjang}x
                    {dataPedagang.objek?.lebar}x
                    {dataPedagang.objek?.tinggi}
                    {" ("}{dataPedagang.objek?.luas} m²{")"}
                  </span>
                </div>

                <div className="row">
                  <span>Pembayaran</span>
                  <span>
                    : Tarif jasa pelayanan toko/kios/los serta kebersihan dan keamanan
                  </span>
                </div>

                <div className="row">
                  <span>Periode Tahun</span>
                  <span>: {ringkasan.periode}</span>
                </div>

                <div className="row">
                  <span>Total</span>
                  <span>: Rp {ringkasan.total.toLocaleString()}</span>
                </div>

                <div className="row">
                  <span>Terbilang</span>
                  <span>
                    : {terbilang(ringkasan.total).toUpperCase()} RUPIAH
                  </span>
                </div>

                <br />

                <div className="row">
                  <span>
                    Rincian Bulan Dibayar ({ringkasan.jumlahBulan} bulan)
                  </span>
                  <span>
                    : {ringkasan.rincian.map((r) => r.bulan).join(", ")}
                  </span>
                </div>

                <div className="row">
                  <span>Layanan Sewa</span>
                  <span>: Rp {ringkasan.subtotal.sewa.toLocaleString()}</span>
                </div>

                <div className="row">
                  <span>Layanan Kebersihan</span>
                  <span>: Rp {ringkasan.subtotal.kebersihan.toLocaleString()}</span>
                </div>

				<div className="row">
				  <span>Layanan Keamanan</span>
				  <span>: Rp {ringkasan.subtotal.keamanan.toLocaleString()}</span>
				</div>

				{/* DISKON */}
				<div className="row">
				  <span>Diskon</span>
				  <span>
					: {ringkasan.subtotal.diskon > 0
					  ? `Rp ${ringkasan.subtotal.diskon.toLocaleString()}`
					  : "-"}
				  </span>
				</div>

				{/* DENDA */}
				<div className="row">
				  <span>Denda</span>
				  <span>
					: {ringkasan.subtotal.denda > 0
					  ? `Rp ${ringkasan.subtotal.denda.toLocaleString()}`
					  : "-"}
				  </span>
				</div>

              </div>
            </div>

            {/* ================= FOOTER ================= */}
            <div className="kuitansi-footer">
              <div className="catatan">
                <p><strong>Keterangan</strong></p>
                <ol>
                  <li>Pembayaran tarif jasa layanan paling lambat akhir bulan berjalan.</li>
                  <li>Keterlambatan dikenakan denda sesuai ketentuan.</li>
                </ol>
              </div>

              <div className="content-right">
                <div className="ttd">
                  <p>Banjarmasin, {today}</p>
                  <p>Yang menerima,</p>
                  <div className="ttd-space" />
					<p className="nama-petugas">
					  {namaPetugas || "(Nama Petugas)"}
					  <br />
					  <span className="jabatan">Petugas Loket</span>
					</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
	  
		{confirmOpen && (
		  <div className="confirm-overlay">
			<div className="confirm-modal">
			  <AlertTriangle size={36} className="confirm-icon" />

			  <h3>Transaksi belum disimpan</h3>
			  <p>Apakah ingin menyimpan sebelum menutup?</p>

			  <div className="confirm-actions">
				<button
				  className="btn-confirm"
				  onClick={async () => {
					setConfirmOpen(false);
					await handleSubmit();
					onClose();
				  }}
				>
				  Simpan & Tutup
				</button>

				<button
				  className="btn-cancel"
				  onClick={() => {
					setConfirmOpen(false);
					onClose();
				  }}
				>
				  Tutup
				</button>
			  </div>
			</div>
		  </div>
		)}

    </>
  );
}
