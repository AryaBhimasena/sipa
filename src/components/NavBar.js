"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "../styles/navbar.css";

export default function NavBar() {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <nav className="nav-bar">
      <Link
        href="/dashboard"
        className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
      >
        Dashboard
      </Link>

      <Link
        href="/dataToko"
        className={`nav-item ${isActive("/dataToko") ? "active" : ""}`}
      >
        Data Toko
      </Link>

      <Link
        href="/retribusi"
        className={`nav-item ${isActive("/retribusi") ? "active" : ""}`}
      >
        Jasa Layanan
      </Link>

      <Link
        href="/dokumen"
        className={`nav-item ${isActive("/dokumen") ? "active" : ""}`}
      >
        Dokumen
      </Link>

      <Link
        href="/laporan"
        className={`nav-item ${isActive("/laporan") ? "active" : ""}`}
      >
        Laporan
      </Link>

      <Link
        href="/pengaturan"
        className={`nav-item ${isActive("/pengaturan") ? "active" : ""}`}
      >
        Pengaturan
      </Link>
    </nav>
  );
}
