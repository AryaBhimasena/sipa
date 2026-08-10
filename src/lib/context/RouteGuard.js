"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useUser } from "./UserContext";

export default function RouteGuard({ children }) {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const role = String(user.role || "").trim();

    let allowed = true;

    /*
     * ==========================================
     * DASHBOARD
     * Admin + System Administrator
     * ==========================================
     */

    if (pathname.startsWith("/dashboard")) {
      allowed =
        role === "Admin" ||
        role === "System Administrator";
    }

    /*
     * ==========================================
     * LOKET
     * Semua role
     * ==========================================
     */

    else if (pathname.startsWith("/loket")) {
      allowed =
        role === "Kasir" ||
        role === "Admin" ||
        role === "System Administrator";
    }

    else if (pathname.startsWith("/laporan")) {
      allowed =
	    role === "Kasir" ||
        role === "Admin" ||
        role === "System Administrator";
    }

    /*
     * ==========================================
     * MASTER DATA
     * System Administrator
     * ==========================================
     */

    else if (pathname.startsWith("/master")) {
      allowed =
        role === "System Administrator";
    }

    /*
     * ==========================================
     * PENGATURAN
     * System Administrator
     * ==========================================
     */

    else if (pathname.startsWith("/pengaturan")) {
      allowed =
        role === "System Administrator";
    }

    /*
     * ==========================================
     * TOLAK AKSES
     * ==========================================
     */

    if (!allowed) {
      router.replace("/loket");
    }

  }, [user, pathname, router]);

  return children;
}