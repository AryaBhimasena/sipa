"use client";

import "../styles/components/kuitansi.css";
import { useState, useRef, useEffect } from "react";
import { API_URL } from "../lib/api";
import { terbilang } from "../lib/KuitansiHelper";
import {
createKuitansiActionState,
handlePrint,
handleExportPDF,
markAsSaved,
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
const [namaPetugas, setNamaPetugas] = useState("");
const [confirmOpen, setConfirmOpen] = useState(false);

const printRef = useRef(null);
const actionState = useRef(createKuitansiActionState());

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

  const res = await fetch(
    `${API_URL}?path=simpanPembayaran`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        payload: JSON.stringify(payload),
      }),
    }
  );

  const result = await res.json();

  if (!result.success) {
    alert(
      result.message ||
        "Gagal menyimpan pembayaran"
    );

    setLoading(false);
    return false;
  }

  if (typeof onConfirm === "function") {
    onConfirm(result);
  }

  markAsSaved(actionState.current);

  setLoading(false);

  return true;

} catch (err) {
  console.error(
    "Error simpan pembayaran:",
    err
  );

  alert(
    "Terjadi kesalahan saat menyimpan data"
  );

  setLoading(false);

  return false;
}


}

function handleClose() {
if (loading) return;


if (actionState.current.saved) {
  onClose();
} else {
  setConfirmOpen(true);
}


}

return (
<>
{/* =================================================
SAVING OVERLAY
================================================= */}


  {loading && (
    <div className="saving-overlay">
      <div className="saving-box">
        Menyimpan data...
      </div>
    </div>
  )}

  {/* =================================================
      MODAL OVERLAY
  ================================================= */}

  <div
    className="modal-overlay"
    onClick={handleClose}
  />

  {/* =================================================
      MODAL CONTAINER
  ================================================= */}

  <div className="modal-container">

    {/* =================================================
        HEADER
    ================================================= */}

    <div className="modal-header custom-header">

      <button
        type="button"
        className="btn-tutup"
        onClick={handleClose}
        disabled={loading}
      >
        Tutup
      </button>

      <div className="action-group">

        {/* EXPORT PDF */}

        <button
          type="button"
          className="btn-pdf"
          onClick={() =>
            handleExportPDF(
              printRef,
              ringkasan.no_kuitansi,
              dataPedagang.nama
            )
          }
          disabled={loading}
        >
          Export PDF
        </button>

        {/* SIMPAN */}

        {showSimpan && (
          <button
            type="button"
            className="btn-simpan"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading
              ? "Menyimpan..."
              : "Simpan"}
          </button>
        )}

        {/* PRINT */}

        <button
          type="button"
          className="btn-print"
          onClick={() =>
            handlePrint(printRef)
          }
          disabled={loading}
        >
          Print
        </button>

      </div>
    </div>

    {/* =================================================
        BODY
    ================================================= */}

    <div className="modal-body">

      <div
        className="kuitansi-paper"
        ref={printRef}
      >

        {/* =================================================
            HEADER KUITANSI
        ================================================= */}

        <div className="kuitansi-header">

          <div className="kop-left">
            <img
              src="/logo-perumda-banjarmasin.png"
              alt="Logo Perumda Pasar Banjarmasin"
              className="kop-logo"
            />
          </div>

          <div className="kop-center">

            <h3>
              PERUSAHAAN UMUM DAERAH PASAR
              BANJARMASIN
            </h3>

            <p>
              Pasar Sentra Antasari Banjarmasin
            </p>

            <h4>
              KUITANSI TARIF JASA PELAYANAN
            </h4>

            <p className="subtitle">
              ( TANDA BUKTI PEMBAYARAN )
            </p>

          </div>
        </div>

        <hr />

        {/* =================================================
            BODY KUITANSI
        ================================================= */}

        <div className="kuitansi-body">

          <div className="tanggal-bayar">
            Banjarmasin, {today}
          </div>

          <div className="content-left">

            {/* NOMOR */}

            <div className="row">
              <span>Nomor</span>

              <span>
                : {ringkasan.no_kuitansi}
              </span>
            </div>

            {/* REGISTRASI */}

            <div className="row">

              <span>
                No Reg / Kd Pasar / No Toko
              </span>

              <span>
                : {dataPedagang.id_reg} /{" "}
                {dataPedagang.blok} /{" "}
                {dataPedagang.no}
              </span>

            </div>

            {/* PEDAGANG */}

            <div className="row">

              <span>
                Sudah Terima Dari
              </span>

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
                {" ("}
                {dataPedagang.objek?.luas}
                {" m²)"}
              </span>

            </div>

            {/* PEMBAYARAN */}

            <div className="row">

              <span>
                Pembayaran
              </span>

              <span>
                : Tarif jasa pelayanan
                Keamanan dan Kebersihan
              </span>

            </div>

            {/* PERIODE */}

            <div className="row">

              <span>
                Periode Tahun
              </span>

              <span>
                : {ringkasan.periode}
              </span>

            </div>

            {/* TOTAL */}

            <div className="row">

              <span>
                Total
              </span>

              <span>
                : Rp{" "}
                {ringkasan.total.toLocaleString()}
              </span>

            </div>

            {/* TERBILANG */}

            <div className="row">

              <span>
                Terbilang
              </span>

              <span>
                :{" "}
                {terbilang(
                  ringkasan.total
                ).toUpperCase()}{" "}
                RUPIAH
              </span>

            </div>

            <br />

            {/* RINCIAN BULAN */}

            <div className="row">

              <span>
                Rincian Bulan Dibayar (
                {ringkasan.jumlahBulan} bulan)
              </span>

              <span>
                :{" "}
                {ringkasan.rincian
                  .map((r) => r.bulan)
                  .join(", ")}
              </span>

            </div>

            {/* SEWA */}

            <div className="row">

              <span>
                Layanan Sewa
              </span>

              <span>
                : Rp{" "}
                {ringkasan.subtotal.sewa.toLocaleString()}
              </span>

            </div>

            {/* KEBERSIHAN */}

            <div className="row">

              <span>
                Layanan Kebersihan
              </span>

              <span>
                : Rp{" "}
                {ringkasan.subtotal.kebersihan.toLocaleString()}
              </span>

            </div>

            {/* KEAMANAN */}

            <div className="row">

              <span>
                Layanan Keamanan
              </span>

              <span>
                : Rp{" "}
                {ringkasan.subtotal.keamanan.toLocaleString()}
              </span>

            </div>

            {/* DISKON */}

            <div className="row">

              <span>
                Diskon
              </span>

              <span>
                :{" "}
                {ringkasan.subtotal.diskon > 0
                  ? `Rp ${ringkasan.subtotal.diskon.toLocaleString()}`
                  : "-"}
              </span>

            </div>

            {/* DENDA */}

            <div className="row">

              <span>
                Denda
              </span>

              <span>
                :{" "}
                {ringkasan.subtotal.denda > 0
                  ? `Rp ${ringkasan.subtotal.denda.toLocaleString()}`
                  : "-"}
              </span>

            </div>

          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="kuitansi-footer">

          <div className="catatan">

            <p>
              <strong>
                Keterangan
              </strong>
            </p>

            <ol>

              <li>
                Tarif Jasa Pelayanan Pasar
                Sentra Antasari diatur oleh
                Peraturan Wali Kota Banjarmasin
                No. 91 Tahun 2025
              </li>

              <li>
                Kuitansi ini dinyatakan sebagai
                bukti pembayaran yang sah.
              </li>

              <li>
                Keterlambatan pembayaran akan
                dikenakan denda sesuai dengan
                peraturan yang berlaku.
              </li>

            </ol>

          </div>

          <div className="content-right">

            <div className="ttd">

              <p>
                Banjarmasin, {today}
              </p>

              <p>
                Yang menerima,
              </p>

              <div className="ttd-space" />

              <p className="nama-petugas">

                {namaPetugas ||
                  "(Nama Petugas)"}

                <br />

                <span className="jabatan">
                  Petugas Loket
                </span>

              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  </div>

  {/* =================================================
      CONFIRM MODAL
  ================================================= */}

  {confirmOpen && (
    <div className="confirm-overlay">

      <div className="confirm-modal">

        <AlertTriangle
          size={36}
          className="confirm-icon"
        />

        <h3>
          Transaksi belum disimpan
        </h3>

        <p>
          Apakah ingin menyimpan sebelum
          menutup?
        </p>

        <div className="confirm-actions">

          {/* SIMPAN & TUTUP */}

          <button
            type="button"
            className="btn-confirm"
            disabled={loading}
            onClick={async () => {
              setConfirmOpen(false);

              const saved =
                await handleSubmit();

              if (saved) {
                onClose();
              }
            }}
          >
            Simpan & Tutup
          </button>

          {/* TUTUP TANPA SIMPAN */}

          <button
            type="button"
            className="btn-cancel"
            disabled={loading}
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
