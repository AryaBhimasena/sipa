//app/loket/pembayaran/[idReg]/page.js

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


const handlePaymentData = (payload) => {
  if (!payload || typeof payload.total !== "number") {
    setTotalDibayar(0);
    setRingkasanBayar(null);
    return;
  }

  setRingkasanBayar(payload);
  setTotalDibayar(payload.total);
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
        // contoh hasil: [{bulan:1,tahun:2025}, ...]
        const paidKeys = jsonBayar.data.map(
          (r) => `${r.bulan}-${r.tahun}`
        );
        setBulanTerbayar(paidKeys);
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
  if (!ringkasanBayar) return;

  try {
    const res = await fetch(
      `${API_URL}?path=generateNoKuitansi`,
      { cache: "no-store" }
    );

    const json = await res.json();

    if (!json.success) {
      alert("Gagal generate nomor kuitansi");
      return;
    }

    const payload = {
      ...ringkasanBayar,
      no_kuitansi: json.no_kuitansi,
      id_reg: idReg,
      tanggal: new Date().toISOString(),
      pedagang: dataPedagang,
    };

    setRingkasanBayar(payload);
    setShowModal(true);

  } catch (err) {
    console.error("Error generate kuitansi:", err);
    alert("Terjadi kesalahan saat generate nomor kuitansi");
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
				  className={`tab-btn ${activeTab === "layanan" ? "active" : ""}`}
				  onClick={() => setActiveTab("layanan")}
				>
				  Pembayaran Layanan
				</button>

				<button
				  className={`tab-btn ${activeTab === "tunggakan" ? "active" : ""}`}
				  onClick={() => setActiveTab("tunggakan")}
				>
				  Pembayaran Tunggakan
				</button>
			  </div>

			  <div className="total-action-bar">
			    <div className="total-amount">
				  Total Dibayar:
				  <strong> Rp {totalDibayar.toLocaleString()}</strong>
			    </div>

			    <button
				  className="btn-bayar"
				  disabled={totalDibayar === 0}
				  onClick={handleBayar}
			    >
				  {loadingBayar ? "Memproses..." : "Bayar"}
			    </button>
			  </div>
			</div>

          {/* CONTENT */}
          {loading && <p>Memuat data...</p>}

          {!loading && !dataPedagang && (
            <p>Data pedagang tidak ditemukan</p>
          )}

          {!loading && dataPedagang && activeTab === "layanan" && (
			<Layanan
			  data={dataPedagang}
			  bulanTerbayar={bulanTerbayar}
			  onTotalChange={handlePaymentData}
			/>
          )}

          {!loading && dataPedagang && activeTab === "tunggakan" && (
            <Tunggakan data={dataPedagang} />
          )}
        </ContainerCard>
		
		{showModal && ringkasanBayar && (
		  <ModalKuitansi
			dataPedagang={dataPedagang}
			ringkasan={ringkasanBayar}
			onClose={() => setShowModal(false)}
			onConfirm={() => {
			  setShowModal(false);
			}}
		  />
		)}

      </main>
    </>
  );
}
