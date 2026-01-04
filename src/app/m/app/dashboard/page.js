"use client";

import {
  Trash2,
  ShieldCheck,
  Zap,
  Droplet,
  ParkingSquare,
  Store,
  Tent,
  Home,
  FileText,
  User,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

import "../../styles/home.css";

export default function MobileDashboardPage() {
  const router = useRouter();

  return (
    <div className="mobile-wrapper">
      <div className="mobile-frame">

        {/* HEADER */}
        <header className="brand-surface">
          <div className="brand-title">Sistem Informasi Pasar Antasari</div>
        </header>

        {/* TOTAL */}
        <section className="total-card">
          <div className="total-meta">Total Hari Ini</div>
          <div className="total-amount">Rp 125.000</div>
          <div className="total-date">Senin, 04 Januari 2026</div>
        </section>

        {/* TARIKAN */}
        <section className="section">
          <div className="section-header">
            <span>Tarif Sewa Jasa Pelayanan </span>
          </div>

          <div className="grid-3">
            <RetribusiCard
              icon={Trash2}
              label="Kebersihan"
              sub="Lingkungan"
              onClick={() => router.push("./tarikan")}
            />
            <RetribusiCard
              icon={ShieldCheck}
              label="Keamanan"
              sub="Keamanan"
              onClick={() => router.push("./tarikan")}
            />
            <RetribusiCard
              icon={Zap}
              label="Listrik"
              sub="Energi"
              onClick={() => router.push("./tarikan")}
            />
            <RetribusiCard
              icon={Droplet}
              label="PDAM"
              sub="Air Bersih"
              onClick={() => router.push("./tarikan")}
            />
            <RetribusiCard
              icon={ParkingSquare}
              label="Parkir"
              sub="Kendaraan"
              onClick={() => router.push("./tarikan")}
            />
          </div>
        </section>

        {/* DATA */}
        <section className="section">
          <div className="section-header">
            <span>Data Objek</span>
          </div>

          <div className="grid-3">
            <RetribusiCard
              icon={Store}
              label="Toko / Kios"
              sub="Bangunan"
              onClick={() => router.push("./data-toko")}
            />
            <RetribusiCard
              icon={Tent}
              label="Lapak"
              sub="Non permanen"
              onClick={() => router.push("./data-toko")}
            />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer-nav">
          <NavItem icon={Home} label="Home" active />
          <NavItem icon={FileText} label="Laporan" />
          <NavItem icon={User} label="Akun" />
          <NavItem icon={Settings} label="Pengaturan" />
        </footer>

      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function RetribusiCard({ icon: Icon, label, sub, onClick }) {
  return (
    <div className="grid-card clickable" onClick={onClick}>
      <Icon size={22} />
      <span className="card-label">{label}</span>
      <span className="card-sub">{sub}</span>
    </div>
  );
}

function NavItem({ icon: Icon, label, active }) {
  return (
    <div className={`nav-item ${active ? "active" : ""}`}>
      <Icon size={20} />
      <span>{label}</span>
    </div>
  );
}
