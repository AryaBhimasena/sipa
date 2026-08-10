"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useUser } from "../lib/context/UserContext";
import "../styles/navbar.css";

export default function NavBar() {
  const pathname = usePathname();
  const user = useUser();

  const [laporanOpen, setLaporanOpen] = useState(false);
  const laporanRef = useRef(null);

  /*
   * =====================================================
   * ROLE
   * =====================================================
   */

  const role = String(user?.role || "").trim();

  /*
   * =====================================================
   * HAK AKSES MENU
   * =====================================================
   */

  const canAccessDashboard =
    role === "Admin" ||
    role === "System Administrator";

  const canAccessLoket =
    role === "Kasir" ||
    role === "Admin" ||
    role === "System Administrator";

  const canAccessLaporan =
    role === "Kasir" ||
    role === "Admin" ||
    role === "System Administrator";

  const canAccessMaster =
    role === "System Administrator";

  const canAccessPengaturan =
    role === "System Administrator";

  /*
   * =====================================================
   * ACTIVE
   * =====================================================
   */

  const isActive = (path) => {
    return (
      pathname === path ||
      pathname.startsWith(path + "/")
    );
  };

  const isLaporanActive =
    pathname.startsWith("/laporan");

  /*
   * =====================================================
   * CLOSE DROPDOWN
   * =====================================================
   */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        laporanRef.current &&
        !laporanRef.current.contains(event.target)
      ) {
        setLaporanOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <nav className="nav-bar">

      {/* =================================================
          DASHBOARD
      ================================================= */}

      {canAccessDashboard && (
        <Link
          href="/dashboard"
          className={`nav-item ${
            isActive("/dashboard")
              ? "active"
              : ""
          }`}
        >
          Dashboard
        </Link>
      )}

      {/* =================================================
          LOKET
      ================================================= */}

      {canAccessLoket && (
        <Link
          href="/loket"
          className={`nav-item ${
            isActive("/loket")
              ? "active"
              : ""
          }`}
        >
          Loket
        </Link>
      )}

      {/* =================================================
          MENU LAPORAN
      ================================================= */}

      {canAccessLaporan && (
        <div
          className="nav-dropdown"
          ref={laporanRef}
        >
          <button
            type="button"
            className={`nav-item nav-dropdown-button ${
              isLaporanActive
                ? "active"
                : ""
            }`}
            onClick={() =>
              setLaporanOpen(
                (prev) => !prev
              )
            }
          >
            Laporan

            <span
              className={`nav-dropdown-arrow ${
                laporanOpen
                  ? "open"
                  : ""
              }`}
            >
              ▼
            </span>
          </button>

          {laporanOpen && (
            <div className="nav-dropdown-menu">

              <Link
                href="/laporan/Laporan-Pembayaran"
                className={`nav-dropdown-item ${
                  pathname ===
                  "/laporan/Laporan-Pembayaran"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setLaporanOpen(false)
                }
              >
                Laporan Pembayaran
              </Link>

              <Link
                href="/laporan/Status-Pembayaran"
                className={`nav-dropdown-item ${
                  pathname ===
                  "/laporan/Status-Pembayaran"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setLaporanOpen(false)
                }
              >
                Status Pembayaran
              </Link>

            </div>
          )}
        </div>
      )}

      {/* =================================================
          MASTER DATA
      ================================================= */}

      {canAccessMaster && (
        <Link
          href="/master"
          className={`nav-item ${
            isActive("/master")
              ? "active"
              : ""
          }`}
        >
          Master Data
        </Link>
      )}

      {/* =================================================
          PENGATURAN
      ================================================= */}

      {canAccessPengaturan && (
        <Link
          href="/pengaturan"
          className={`nav-item ${
            isActive("/pengaturan")
              ? "active"
              : ""
          }`}
        >
          Pengaturan
        </Link>
      )}

    </nav>
  );
}