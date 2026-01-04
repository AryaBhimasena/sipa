"use client";

import {
  ChevronLeft,
  Plus,
  Search,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import "../../styles/data-toko.css";
import { useRouter } from "next/navigation";

export default function DataTokoPage() {
  const [openId, setOpenId] = useState(null);
  const router = useRouter();

  return (
    <div className="mobile-wrapper">
      <div className="mobile-frame">

        {/* HEADER */}
		<header className="page-header">
		  <button
			className="back-btn"
			onClick={() => router.push("/m/app/dashboard")}
		  >
			<ChevronLeft size={20} />
		  </button>
		  <h1>Jasa Kebersihan</h1>
		</header>

        {/* QUICK ACTION */}
        <div className="action-bar">
          <button className="add-btn">
            <Plus size={16} />
            Tambah Toko / Kios
          </button>
        </div>

        {/* SEARCH */}
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Cari nama toko / kios..." />
        </div>

        {/* FILTER */}
        <div className="filter-row">
          <button className="filter-box">
            Blok / Area <ChevronDown size={14} />
          </button>
          <button className="filter-box">
            Lantai <ChevronDown size={14} />
          </button>
        </div>

        {/* TITLE */}
        <section className="section">
          <h3>Data Toko / Kios</h3>

          <div className="list">
            <TokoItem
              id={1}
              openId={openId}
              setOpenId={setOpenId}
              nama="Toko Sumber Rejeki"
              pemilik="Budi Santoso"
              kontak="0812xxxxxxx"
            />
            <TokoItem
              id={2}
              openId={openId}
              setOpenId={setOpenId}
              nama="Toko Makmur Jaya"
              pemilik="Siti Aminah"
              kontak="0821xxxxxxx"
            />
          </div>
        </section>

      </div>
    </div>
  );
}

/* ================= ITEM ================= */

function TokoItem({ id, openId, setOpenId, nama, pemilik, kontak }) {
  const open = openId === id;

  return (
    <div className="list-item">
      <div
        className="list-main"
        onClick={() => setOpenId(open ? null : id)}
      >
        <div className="nama">{nama}</div>
        <div className="meta">
          {pemilik} | {kontak}
        </div>
      </div>

      {open && (
        <div className="list-detail">
          <div className="detail-row">
            <span>Blok</span>
            <strong>A</strong>
          </div>
          <div className="detail-row">
            <span>Lantai</span>
            <strong>1</strong>
          </div>
          <div className="detail-row">
            <span>No</span>
            <strong>12</strong>
          </div>

          <button className="detail-btn">
            Lihat Detail
          </button>
        </div>
      )}
    </div>
  );
}
