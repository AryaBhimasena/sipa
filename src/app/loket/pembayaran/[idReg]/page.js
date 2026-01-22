"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Header from "../../../../components/Header";
import NavBar from "../../../../components/NavBar";
import ContainerCard from "../../../../components/ContainerCard";
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

  useEffect(() => {
    if (!idReg) return;

    async function fetchDetailPedagang() {
      try {
        const res = await fetch(
          `${API_URL}?path=dataToko&id=${idReg}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error("Gagal mengambil detail pedagang");
        }

        const json = await res.json();

		if (json.success && Array.isArray(json.data)) {
		  const found = json.data.find(
			(item) => String(item.id_reg) === String(idReg)
		  );

		  setDataPedagang(found ?? null);
        } else {
          setDataPedagang(null);
        }
      } catch (err) {
        console.error(err);
        setDataPedagang(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDetailPedagang();
  }, [idReg]);

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

          {/* CONTENT */}
          {loading && <p>Memuat data...</p>}

          {!loading && !dataPedagang && (
            <p>Data pedagang tidak ditemukan</p>
          )}

          {!loading && dataPedagang && activeTab === "layanan" && (
            <Layanan data={dataPedagang} />
          )}

          {!loading && dataPedagang && activeTab === "tunggakan" && (
            <Tunggakan data={dataPedagang} />
          )}
        </ContainerCard>
      </main>
    </>
  );
}
