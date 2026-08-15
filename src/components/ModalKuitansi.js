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

  /* =================================================
     METODE PEMBAYARAN

     Pilihan:
     - TUNAI
     - QRIS

     Default tetap TUNAI agar perilaku sebelumnya
     tetap berjalan normal.

     Status pembayaran TIDAK dikelola di modal ini.
     Status ditentukan oleh proses/backend verifikasi.
  ================================================= */

  const [metodeBayar, setMetodeBayar] =
    useState("TUNAI");

  const printRef = useRef(null);

  const actionState = useRef(
    createKuitansiActionState()
  );

  /* =================================================
     DATA PPN
  ================================================= */

  const subtotalPPN = Number(
    ringkasan?.subtotal?.ppn || 0
  );

  const gunakanPPN =
    ringkasan?.gunakan_ppn === true;

  /* =================================================
     DATA DENDA
  ================================================= */

  const subtotalDenda = Number(
    ringkasan?.subtotal?.denda || 0
  );

  /* =================================================
     DATA DISKON
  ================================================= */

  const subtotalDiskon = Number(
    ringkasan?.subtotal?.diskon || 0
  );

  /* =================================================
     NAMA PETUGAS
  ================================================= */

  useEffect(() => {
    const session =
      localStorage.getItem("session");

    if (!session) return;

    try {
      const parsed =
        JSON.parse(session);

      setNamaPetugas(
        parsed.user?.nama || ""
      );
    } catch {
      setNamaPetugas("");
    }
  }, []);

  /* =================================================
     PERUBAHAN METODE PEMBAYARAN
  ================================================= */

  function handleMetodeBayarChange(event) {
    setMetodeBayar(event.target.value);
  }

  /* =================================================
     SIMPAN PEMBAYARAN
  ================================================= */

  async function handleSubmit() {
    try {
      setLoading(true);

      const payload = {
        header: {
          no_kuitansi:
            ringkasan.no_kuitansi,

          id_reg:
            dataPedagang.id_reg,

          nama_pedagang:
            dataPedagang.nama,

          jenis_objek:
            dataPedagang.objek?.jenis_objek,

          blok:
            dataPedagang.blok,

          no_toko:
            dataPedagang.no,

          periode_tahun:
            ringkasan.periode,

          jumlah_bulan:
            ringkasan.jumlahBulan,

          subtotal: {
            sewa:
              Number(
                ringkasan.subtotal?.sewa || 0
              ),

            kebersihan:
              Number(
                ringkasan.subtotal?.kebersihan || 0
              ),

            keamanan:
              Number(
                ringkasan.subtotal?.keamanan || 0
              ),

            diskon:
              Number(
                ringkasan.subtotal?.diskon || 0
              ),

            denda:
              Number(
                ringkasan.subtotal?.denda || 0
              ),
          },

          total_bayar:
            ringkasan.total,

          /* =========================================
             METODE PEMBAYARAN

             Hanya metode yang dikirim.

             Status pembayaran TIDAK dikirim dari
             frontend.

             Backend/verifikasi menentukan status
             pembayaran sesuai metode dan proses
             transaksi.
          ========================================= */

          metode_bayar:
            metodeBayar,

          nama_petugas:
            namaPetugas,
        },

        detail:
          (ringkasan.rincian || []).map(
            (d) => ({
              bulan:
                d.bulan,

              sewa:
                Number(d.sewa || 0),

              kebersihan:
                Number(
                  d.kebersihan || 0
                ),

              keamanan:
                Number(
                  d.keamanan || 0
                ),

              denda:
                Number(d.denda || 0),

              diskonPersen:
                Number(
                  d.diskonPersen || 0
                ),

              total:
                Number(d.total || 0),
            })
          ),
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
            payload:
              JSON.stringify(payload),
          }),
        }
      );

      const result =
        await res.json();

      if (!result.success) {
        alert(
          result.message ||
            "Gagal menyimpan pembayaran"
        );

        setLoading(false);

        return false;
      }

      if (
        typeof onConfirm ===
        "function"
      ) {
        onConfirm(result);
      }

      markAsSaved(
        actionState.current
      );

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

  /* =================================================
     TUTUP MODAL
  ================================================= */

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
            HEADER MODAL
        ================================================= */}

        <div className="modal-header custom-header">

          {/* =================================================
              TUTUP
          ================================================= */}

          <button
            type="button"
            className="btn-tutup"
            onClick={handleClose}
            disabled={loading}
          >
            Tutup
          </button>

          {/* =================================================
              METODE PEMBAYARAN

              Radio button hanya berada di header modal.

              Tidak mempengaruhi layout kuitansi yang
              akan dicetak.
          ================================================= */}

          <div className="payment-method-group">

            <span className="payment-method-label">
              Metode Pembayaran
            </span>

            {/* TUNAI */}

            <label
              className={`payment-radio ${
                metodeBayar === "TUNAI"
                  ? "active"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="metodePembayaran"
                value="TUNAI"
                checked={
                  metodeBayar === "TUNAI"
                }
                onChange={
                  handleMetodeBayarChange
                }
                disabled={loading}
              />

              <span className="radio-dot" />

              <span>
                Tunai
              </span>

            </label>

            {/* QRIS */}

            <label
              className={`payment-radio ${
                metodeBayar === "QRIS"
                  ? "active"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="metodePembayaran"
                value="QRIS"
                checked={
                  metodeBayar === "QRIS"
                }
                onChange={
                  handleMetodeBayarChange
                }
                disabled={loading}
              />

              <span className="radio-dot" />

              <span>
                QRIS
              </span>

            </label>

          </div>

          {/* =================================================
              ACTION GROUP
          ================================================= */}

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

                Struktur asli dipertahankan.
                TIDAK ada tambahan baris metode/status
                pembayaran di sini.
            ================================================= */}

            <div className="kuitansi-body">

              <div className="tanggal-bayar">
                Banjarmasin, {today}
              </div>

              <div className="content-left">

                {/* NOMOR */}

                <div className="row">

                  <span>
                    Nomor
                  </span>

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
                    {Number(
                      ringkasan.total || 0
                    ).toLocaleString()}
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
                      Number(
                        ringkasan.total || 0
                      )
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
                    {(ringkasan.rincian || [])
                      .map(
                        (r) =>
                          r.bulan
                      )
                      .join(", ")}
                  </span>

                </div>

                {/* =================================================
                    SEWA
                ================================================= */}

                <div className="row">

                  <span>
                    Layanan Sewa
                  </span>

                  <span>
                    : Rp{" "}
                    {Number(
                      ringkasan.subtotal?.sewa ||
                        0
                    ).toLocaleString()}
                  </span>

                </div>

                {/* =================================================
                    KEBERSIHAN
                ================================================= */}

                <div className="row">

                  <span>
                    Layanan Kebersihan
                  </span>

                  <span>
                    : Rp{" "}
                    {Number(
                      ringkasan.subtotal?.kebersihan ||
                        0
                    ).toLocaleString()}
                  </span>

                </div>

                {/* =================================================
                    KEAMANAN
                ================================================= */}

                <div className="row">

                  <span>
                    Layanan Keamanan
                  </span>

                  <span>
                    : Rp{" "}
                    {Number(
                      ringkasan.subtotal?.keamanan ||
                        0
                    ).toLocaleString()}
                  </span>

                </div>

                {/* =================================================
                    DISKON
                ================================================= */}

                <div className="row">

                  <span>
                    Diskon
                  </span>

                  <span>
                    :{" "}
                    {subtotalDiskon > 0
                      ? `Rp ${subtotalDiskon.toLocaleString()}`
                      : "-"}
                  </span>

                </div>

                {/* =================================================
                    PPN
                ================================================= */}

                <div className="row">

                  <span>
                    PPN (11%)
                  </span>

                  <span>
                    :{" "}
                    {gunakanPPN &&
                    subtotalPPN > 0
                      ? `Rp ${subtotalPPN.toLocaleString()}`
                      : "-"}
                  </span>

                </div>

                {/* =================================================
                    DENDA
                ================================================= */}

                <div className="row">

                  <span>
                    Denda
                  </span>

                  <span>
                    :{" "}
                    {subtotalDenda > 0
                      ? `Rp ${subtotalDenda.toLocaleString()}`
                      : "-"}
                  </span>

                </div>

              </div>
            </div>

            {/* =================================================
                FOOTER

                Struktur footer tetap 70% : 30%.
                Kotak metode pembayaran ditempatkan di
                sisi kiri bawah, sedangkan nama petugas
                tetap di sisi kanan.

                Tidak ada baris baru pada body kuitansi.
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

                {/* =================================================
                    METODE PEMBAYARAN

                    Ditampilkan sebagai blok tebal
                    di pojok kiri bawah kuitansi.

                    Contoh:
                    Pembayaran : Tunai
                    Pembayaran : QRIS
                ================================================= */}

                <div className="payment-method-print">

                  Pembayaran :{" "}
                  {metodeBayar === "QRIS"
                    ? "QRIS"
                    : "Tunai"}

                </div>

              </div>

              {/* =================================================
                  TANDA TANGAN / PETUGAS
              ================================================= */}

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