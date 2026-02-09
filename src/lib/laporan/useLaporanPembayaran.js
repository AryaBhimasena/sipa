import { useEffect, useState } from "react";
import { API_URL } from "../api";

export function useLaporanPembayaran() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?path=laporanPembayaran`, {
        cache: "no-store",
      });
      const json = await res.json();
	  console.log("[laporanPembayaran] response:", json);
      setData(json.data || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, refetch: fetchData };
}
