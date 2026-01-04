"use client";

import { ArrowLeft, Search, Store, Tent, CreditCard, Banknote } from "lucide-react";
import { useState } from "react";
import "../../styles/tarikan.css";
import { useRouter } from "next/navigation";

export default function TarikanRetribusiPage() {
  const [tab, setTab] = useState("toko");
  const [payment, setPayment] = useState("cash");
  const [selected, setSelected] = useState(true); // dummy selected
  const router = useRouter();

  return (
    <div className="mobile-wrapper">
      <div className="mobile-frame">

        {/* HEADER */}
		<header className="tarikan-header">
		  <button
			className="back-btn"
			onClick={() => router.push("/m/app/dashboard")}
		  >
			<ArrowLeft size={20} />
		  </button>
		  <h1>Tarikan Kebersihan</h1>
		</header>

        {/* TAB */}
        <div className="tab-switch">
          <button
            className={tab === "toko" ? "active" : ""}
            onClick={() => setTab("toko")}
          >
            <Store size={16} /> Toko / Kios
          </button>
          <button
            className={tab === "lapak" ? "active" : ""}
            onClick={() => setTab("lapak")}
          >
            <Tent size={16} /> Lapak
          </button>
        </div>

        {/* SEARCH */}
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder={`Cari ${tab === "toko" ? "Toko / Kios" : "Lapak"}...`}
          />
        </div>

        {/* DETAIL */}
        {selected && (
          <section className="detail-section">
            <h3>Detail Informasi</h3>

            {tab === "toko" ? (
              <ul>
                <li><span>Nama Toko</span><strong>Toko Sumber Rejeki</strong></li>
                <li><span>Blok</span><strong>A</strong></li>
                <li><span>Lantai</span><strong>1</strong></li>
                <li><span>No</span><strong>12</strong></li>
                <li><span>Nama Pemilik</span><strong>Budi Santoso</strong></li>
                <li><span>Kontak</span><strong>0812xxxxxxx</strong></li>
              </ul>
            ) : (
              <ul>
                <li><span>Nama Pedagang</span><strong>Siti Aminah</strong></li>
                <li><span>Kontak</span><strong>0821xxxxxxx</strong></li>
              </ul>
            )}
          </section>
        )}

        {/* PERIODE */}
        <section className="option-section">
          <h3>Periode Retribusi</h3>
          <div className="radio-group">
            <label>
              <input type="radio" name="periode" defaultChecked />
              Harian
            </label>
            <label>
              <input type="radio" name="periode" />
              Bulanan
            </label>
          </div>
        </section>

        {/* PEMBAYARAN */}
        <section className="option-section">
          <h3>Metode Pembayaran</h3>

          <div className="payment-method">
            <button
              className={payment === "cash" ? "active" : ""}
              onClick={() => setPayment("cash")}
            >
              <Banknote size={18} /> Cash
            </button>

            <button
              className={payment === "transfer" ? "active" : ""}
              onClick={() => setPayment("transfer")}
            >
              <CreditCard size={18} /> Transfer
            </button>
          </div>

          {payment === "transfer" && (
            <div className="transfer-box">
              <div className="qris-dummy">QRIS</div>
              <p>Bank BRI<br />No Rek: 1234 5678 90<br />a.n. UPTD Pasar</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
