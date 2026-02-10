"use client";

import { useEffect, useState, useMemo } from "react";

import Header from "../../components/Header";
import NavBar from "../../components/NavBar";
import ContainerCard from "../../components/ContainerCard";

import { API_URL } from "../../lib/api";

import "../../styles/pages/master-data.css";
import { Construction } from "lucide-react";


/* ================= HELPER ================= */
function formatRupiah(value) {
  if (value === null || value === undefined) return "";
  return Number(value).toLocaleString("id-ID");
}

function parseRupiah(value) {
  return Number(value.replace(/\./g, ""));
}

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState("jenisObjek");
  const [jenisObjek, setJenisObjek] = useState([]);
  const [tarif, setTarif] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingTarifId, setEditingTarifId] = useState(null);
  const [editedTarif, setEditedTarif] = useState("");
  
const mergedData = useMemo(() => {
  const tarifKebersihan = tarif.find((t) => t.id_tarif === "KBS-01");
  const tarifKeamanan = tarif.find((t) => t.id_tarif === "KAM-01");

  const data = jenisObjek.map((jo) => {
    const tarifSewa = tarif.find((t) => t.id_tarif === jo.id_tarif);

    return {
      ...jo,
      tarifSewa: tarifSewa?.tarif ?? 0,
      perhitungan: tarifSewa?.perhitungan ?? "",
      keterangan: tarifSewa?.keterangan ?? "",
      tarifKebersihan: tarifKebersihan?.tarif ?? 0,
      tarifKeamanan: tarifKeamanan?.tarif ?? 0,
    };
  });

  // ✅ SORT: jenis_objek dulu, lalu TIPE
  return data.sort((a, b) => {
    const jenisCompare = (a.jenis_objek || "").localeCompare(
      b.jenis_objek || "",
      "id",
      { sensitivity: "base" }
    );

    if (jenisCompare !== 0) return jenisCompare;

    return (a.TIPE || "").localeCompare(
      b.TIPE || "",
      "id",
      { sensitivity: "base" }
    );
  });
}, [jenisObjek, tarif]);

  useEffect(() => {
    async function fetchMasterData() {
      try {
        const [resJenisObjek, resTarif] = await Promise.all([
          fetch(`${API_URL}?path=jenisObjek`),
          fetch(`${API_URL}?path=tarif`),
        ]);

        const jsonJenisObjek = await resJenisObjek.json();
        const jsonTarif = await resTarif.json();

        if (jsonJenisObjek.success) {
          setJenisObjek(jsonJenisObjek.data);
        }

        if (jsonTarif.success) {
          setTarif(jsonTarif.data);
        }
      } catch (error) {
        console.error("Gagal memuat master data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMasterData();
  }, []);

	async function handleSaveTarif(id_tarif) {
	  try {
		const formData = new FormData();
		formData.append("id_tarif", id_tarif);
		formData.append("tarif", parseRupiah(editedTarif)); // boleh 0

		const res = await fetch(`${API_URL}?path=updateTarif`, {
		  method: "POST",
		  body: formData, // ✅ tanpa headers JSON
		});

		const json = await res.json();

		if (!json.success) {
		  throw new Error(json.message || "Gagal update tarif");
		}

		setTarif((prev) =>
		  prev.map((item) =>
			item.id_tarif === id_tarif
			  ? { ...item, tarif: parseRupiah(editedTarif) }
			  : item
		  )
		);

		setEditingTarifId(null);
		setEditedTarif("");
	  } catch (err) {
		console.error("Gagal menyimpan tarif:", err.message);
	  }
	}

  return (
    <>
      <Header />
      <NavBar />

      <main className="master-data-page">
        <ContainerCard
          title="Master Data"
          subtitle="Halaman Pengaturan untuk Master Data"
        >
          {loading ? (
            <p className="md-loading">Memuat data...</p>
          ) : (
            <>
			<div className="md-tabs">
			  <button className="md-tab active">
				Jenis Objek & Tarif
			  </button>
			</div>

			<section className="md-section">
			<div className="md-table-wrapper">
			  <table className="md-table">
				<thead>
				  <tr>
					<th className="col-center">ID</th>
					<th className="col-center">Jenis Objek</th>
					<th className="col-center">Tipe</th>
					<th className="col-center">Dimensi</th>
					<th className="col-right">Tarif Sewa</th>
					<th className="col-right">Tarif Kebersihan</th>
					<th className="col-right">Tarif Keamanan</th>
					<th className="col-center">Perhitungan</th>
					<th className="col-left">Keterangan</th>
					<th className="col-center col-aksi">Aksi</th>
				  </tr>
				</thead>

				<tbody>
				  {mergedData.map((item) => (
					<tr key={item.id_jenis_objek}>
					  <td className="col-center">{item.id_jenis_objek}</td>
					  <td className="col-center">{item.jenis_objek}</td>
					  <td className="col-center">{item.TIPE}</td>
					  <td className="col-center">{item.dimensi}</td>

						<td className="col-right">
						  {editingTarifId === item.id_tarif ? (
							<input
							  className="tarif-input"
							  value={editedTarif}
							  onChange={(e) =>
								setEditedTarif(
								  formatRupiah(parseRupiah(e.target.value || "0"))
								)
							  }
							/>
						  ) : (
							<span>Rp {formatRupiah(item.tarifSewa)}</span>
						  )}
						</td>

						<td className="col-right">
						  <span>Rp {formatRupiah(item.tarifKebersihan)}</span>
						</td>

						<td className="col-right">
						  <span>Rp {formatRupiah(item.tarifKeamanan)}</span>
						</td>

					  <td className="col-center">{item.perhitungan}</td>
					  <td className="col-left">{item.keterangan}</td>

					  <td className="col-center col-aksi">
						{editingTarifId === item.id_tarif ? (
						  <div className="action-group">
							<button
							  className="btn-save"
							  onClick={() => handleSaveTarif(item.id_tarif)}
							>
							  Simpan
							</button>
							<button
							  className="btn-cancel"
							  onClick={() => {
								setEditingTarifId(null);
								setEditedTarif("");
							  }}
							>
							  Batal
							</button>
						  </div>
						) : (
						  <button
							className="btn-edit"
							onClick={() => {
							  setEditingTarifId(item.id_tarif);
							  setEditedTarif(formatRupiah(item.tarif));
							}}
						  >
							Edit Tarif
						  </button>
						)}
					  </td>
					</tr>
				  ))}
				</tbody>
			  </table>
			</div>
			</section>
			
					   </>
          )}
        </ContainerCard>
      </main>
    </>
  );
}
