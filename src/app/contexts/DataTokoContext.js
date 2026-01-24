"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { API_URL } from "../../lib/api";

const DataTokoContext = createContext(null);

export function DataTokoProvider({ children }) {
  const [dataToko, setDataToko] = useState([]);
  const [loading, setLoading] = useState(true);

  // penanda agar fetch hanya 1x
  const hasFetched = useRef(false);

  async function fetchDataToko() {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}?path=dataToko`, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil data toko");
      }

      const json = await res.json();

      if (json.success) {
        setDataToko(json.data);
      } else {
        setDataToko([]);
      }
    } catch (err) {
      console.error("[DataTokoContext]", err);
      setDataToko([]);
    } finally {
      setLoading(false);
      hasFetched.current = true;
    }
  }

  useEffect(() => {
    // fetch hanya pertama kali provider hidup
    if (!hasFetched.current) {
      fetchDataToko();
    }
  }, []);

  return (
    <DataTokoContext.Provider
      value={{
        dataToko,
        loading,
        refetchDataToko: fetchDataToko, // dipakai jika ada update master
      }}
    >
      {children}
    </DataTokoContext.Provider>
  );
}

export function useDataToko() {
  const ctx = useContext(DataTokoContext);
  if (!ctx) {
    throw new Error("useDataToko harus digunakan di dalam DataTokoProvider");
  }
  return ctx;
}
