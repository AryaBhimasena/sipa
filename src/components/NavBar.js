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
        href="/loket"
        className={`nav-item ${isActive("/loket") ? "active" : ""}`}
      >
        Loket
      </Link>

      <Link
        href="/laporan"
        className={`nav-item ${isActive("/laporan") ? "active" : ""}`}
      >
        Laporan
      </Link>

      <Link
        href="/master"
        className={`nav-item ${isActive("/master") ? "active" : ""}`}
      >
        Master Data
      </Link>
    </nav>
  );
}
