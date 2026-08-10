"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Header from "../../../../components/Header";
import NavBar from "../../../../components/NavBar";
import ContainerCard from "../../../../components/ContainerCard";
import ModalKuitansi from "../../../../components/ModalKuitansi";

import Layanan from "./Layanan";
import Tunggakan from "./Tunggakan";

import { API_URL } from "../../../../lib/api";

import "../../../../styles/layout.css";
import "../../../../styles/pages/loket.css";
import "../../../../styles/pages/pembayaran.css";

export default function PembayaranPage() {
  const { idReg } = useParams();

  const [activeTab, setActiveTab] = useState("layanan");
  const [dataPedagang, setDataPedagang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalDibayar, setTotalDibayar] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [ringkasanBayar, setRingkasanBayar] = useState(null);
  const [loadingBayar, setLoadingBayar] = useState(false);
  const [bulanTerbayar, setBulanTerbayar] = useState([]);

  // ================================
  // TOGGLE DENDA
  // ================================
  const [gunakanDenda, setGunakanDenda] = useState(true);

  // ================================
  // TOGGLE PPN
  // ================================
  const [gunakanPPN, setGunakanPPN] = useState(true);

  const handlePaymentData = (payload) => {
    if (!payload || typeof payload.total !== "number") {
      setTotalDibayar(0);
      setRingkasanBayar(null);
      return;
    }

    // ======================================
    // PAKSA DENDA = 0 SAAT TOGGLE OFF
    // ======================================
    const rincianFinal = (payload.rincian || []).map((item) => ({
      ...item,

      denda: gunakanDenda
        ? Number(item.denda || 0)
        : 0,

      ppn: gunakanPPN
        ? Number(item.ppn || 0)
        : 0,
    }));

    const subtotalDenda = gunakanDenda
      ? Number(payload.subtotal?.denda || 0)
      : 0;

    const subtotalPPN = gunakanPPN
      ? Number(payload.subtotal?.ppn || 0)
      : 0;

    const totalFinal = rincianFinal.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    );

    const finalPayload = {
      ...payload,

      rincian: rincianFinal,

      subtotal: {
        ...payload.subtotal,
        denda: subtotalDenda,
        ppn: subtotalPPN,
      },

      gunakan_denda: gunakanDenda,
      gunakan_ppn: gunakanPPN,

      total: totalFinal,
    };

    setRingkasanBayar(finalPayload);
    setTotalDibayar(totalFinal);
  };

  useEffect(() => {
    if (!idReg) return;

    async function fetchDetailPedagang() {
      try {
        // ======================
        // 1. Fetch data pedagang
        // ======================
        const res = await fetch(
          `${API_URL}?path=dataToko&id=${idReg}`,
          { cache: "no-store" }
        );

        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const found = json.data.find(
            (item) => String(item.id_reg) === String(idReg)
          );

          setDataPedagang(found ?? null);
        } else {
          setDataPedagang(null);
        }

        // ======================
        // 2. Fetch bulan terbayar
        // ======================
        const resBayar = await fetch(
          `${API_URL}?path=transaksiPembayaranByIdReg&id_reg=${idReg}`,
          { cache: "no-store" }
        );

        const jsonBayar = await resBayar.json();

        if (jsonBayar.success && Array.isArray(jsonBayar.data)) {
          const paidMap = jsonBayar.data.map((r) => ({
            key: `${r.bulan}-${r.tahun}`,
            bulan: r.bulan,
            tahun: r.tahun,
            denda: Number(r.denda) || 0,
            diskon: Number(r.diskon) || 0,
            ppn: Number(r.ppn) || 0,
          }));

          setBulanTerbayar(paidMap);
        } else {
          setBulanTerbayar([]);
        }

      } catch (err) {
        console.error(err);

        setDataPedagang(null);
        setBulanTerbayar([]);

      } finally {
        setLoading(false);
      }
    }

    fetchDetailPedagang();
  }, [idReg]);

  const handleBayar = async () => {
    if (!ringkasanBayar || loadingBayar) return;

    setLoadingBayar(true);

    try {
      // 1. Generate no kuitansi terlebih dahulu
      const res = await fetch(
        `${API_URL}?path=generateNoKuitansi`,
        { cache: "no-store" }
      );

      const json = await res.json();

      if (!json.success || !json.no_kuitansi) {
        throw new Error("Gagal generate nomor kuitansi");
      }

      // ======================================
      // FINAL RINCIAN
      // ======================================
      const rincianFinal = (ringkasanBayar.rincian || []).map((item) => ({
        ...item,

        denda: gunakanDenda
          ? Number(item.denda || 0)
          : 0,

        ppn: gunakanPPN
          ? Number(item.ppn || 0)
          : 0,
      }));

      const subtotalFinal = {
        ...ringkasanBayar.subtotal,

        denda: gunakanDenda
          ? Number(ringkasanBayar.subtotal?.denda || 0)
          : 0,

        ppn: gunakanPPN
          ? Number(ringkasanBayar.subtotal?.ppn || 0)
          : 0,
      };

      const totalFinal = rincianFinal.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0
      );

      // 2. Inject data tambahan ke payload
      const payload = {
        ...ringkasanBayar,

        rincian: rincianFinal,

        subtotal: subtotalFinal,

        gunakan_denda: gunakanDenda,
        gunakan_ppn: gunakanPPN,

        total: totalFinal,

        no_kuitansi: json.no_kuitansi,
        id_reg: idReg,
        tanggal: new Date().toISOString(),
        pedagang: dataPedagang,
      };

      // 3. Set data lengkap dulu
      setRingkasanBayar(payload);

      // 4. Baru buka modal
      setShowModal(true);

    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat generate nomor kuitansi");
    } finally {
      setLoadingBayar(false);
    }
  };

  return (
    <>
      <Header />
      <NavBar />

      <main className="loket-page">
        <ContainerCard
          title="Pembayaran"
          subtitle="Pemrosesan pembayaran jasa layanan dan tunggakan"
        >
          {/* TAB */}
          <div className="pembayaran-tab-header">
            <div className="pembayaran-tabs">
              <button
                className={`tab-btn ${
                  activeTab === "layanan" ? "active" : ""
                }`}
                onClick={() => setActiveTab("layanan")}
              >
                Pembayaran Layanan
              </button>

              <button
                className={`tab-btn ${
                  activeTab === "tunggakan" ? "active" : ""
                }`}
                onClick={() => setActiveTab("tunggakan")}
              >
                Pembayaran Tunggakan
              </button>
            </div>

            <div className="total-action-bar">

              {/* TOGGLE DENDA */}
              <label className="toggle-denda">
                <input
                  type="checkbox"
                  checked={gunakanDenda}
                  onChange={(e) =>
                    setGunakanDenda(e.target.checked)
                  }
                />

                <span>
                  Terapkan Denda
                </span>
              </label>

              {/* TOGGLE PPN */}
              <label className="toggle-denda">
                <input
                  type="checkbox"
                  checked={gunakanPPN}
                  onChange={(e) =>
                    setGunakanPPN(e.target.checked)
                  }
                />

                <span>
                  Terapkan PPN
                </span>
              </label>

              <div className="total-amount">
                Total Dibayar:
                <strong>
                  {" "}
                  Rp {totalDibayar.toLocaleString()}
                </strong>
              </div>

              <button
                className="btn-bayar"
                disabled={totalDibayar === 0}
                onClick={handleBayar}
              >
                {loadingBayar
                  ? "Memproses..."
                  : "Bayar"}
              </button>
            </div>
          </div>

          {/* CONTENT */}
          {loading && <p>Memuat data...</p>}

          {!loading && !dataPedagang && (
            <p>Data pedagang tidak ditemukan</p>
          )}

          {!loading &&
            dataPedagang &&
            activeTab === "layanan" && (
              <Layanan
                data={dataPedagang}
                bulanTerbayar={bulanTerbayar}
                onTotalChange={handlePaymentData}
                gunakanDenda={gunakanDenda}
                gunakanPPN={gunakanPPN}
              />
            )}

          {!loading &&
            dataPedagang &&
            activeTab === "tunggakan" && (
              <Tunggakan data={dataPedagang} />
            )}
        </ContainerCard>

        {showModal && ringkasanBayar && (
          <ModalKuitansi
            dataPedagang={dataPedagang}
            ringkasan={ringkasanBayar}
            onClose={() => {
              setShowModal(false);
              setLoadingBayar(false);
            }}
            onConfirm={() => {
              setShowModal(false);
              setLoadingBayar(false);
            }}
          />
        )}

      </main>
    </>
  );
}