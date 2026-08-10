"use client";

import Header from "../../components/Header";
import NavBar from "../../components/NavBar";
import ContainerCard from "../../components/ContainerCard";

import Pengguna from "./components/Pengguna";
import Tarif from "./components/Tarif";
import JenisObjek from "./components/JenisObjek";
import ModalTambahData from "./components/ModalTambahData";

import "../../styles/pages/pengaturan.css";

import { useState } from "react";

export default function PengaturanPage() {

  const menus = [
    {
      id: "objek",
      title: "Jenis Objek Penyewa",
      description: "Kelola jenis objek yang tersedia",
    },
    {
      id: "tarif",
      title: "Tarif",
      description: "Kelola tarif sewa dan layanan",
    },
    {
      id: "pengguna",
      title: "Pengguna",
      description: "Kelola akun pengguna aplikasi",
    },
  ];

  const [jenisObjek] = useState([
    {
      id: 1,
      nama: "Kios",
      tipe: "Tipe A",
      panjang: 4,
      lebar: 3,
      tinggi: 2.5,
      dimensi: 30,
      tarif: "Tarif Kios A",
    },
    {
      id: 2,
      nama: "Toko",
      tipe: "-",
      panjang: 5,
      lebar: 4,
      tinggi: 3,
      dimensi: 60,
      tarif: "Tarif Toko",
    },
    {
      id: 3,
      nama: "Los",
      tipe: "-",
      panjang: 3,
      lebar: 2,
      tinggi: 2.5,
      dimensi: 15,
      tarif: "Tarif Los",
    },
  ]);

  const [tarif] = useState([
    {
      id: 1,
      nama: "Tarif Kios A",
      jenis: "Sewa",
      perhitungan: "Per Meter",
      nominal: 250000,
    },
    {
      id: 2,
      nama: "Tarif Kebersihan",
      jenis: "Kebersihan",
      perhitungan: "Per Bulan",
      nominal: 50000,
    },
    {
      id: 3,
      nama: "Tarif Keamanan",
      jenis: "Keamanan",
      perhitungan: "Per Bulan",
      nominal: 30000,
    },
  ]);

  const [pengguna] = useState([
    {
      id: 1,
      nama: "Administrator",
      jabatan: "Admin",
      username: "admin",
      status: true,
      role: "Administrator",
    },
    {
      id: 2,
      nama: "Nurita",
      jabatan: "Staff",
      username: "nurita",
      status: true,
      role: "Operator",
    },
  ]);

  const [activeMenu, setActiveMenu] = useState("objek");
  const [keyword, setKeyword] = useState("");
  const [showModal, setShowModal] = useState(false);

  let filteredData = [];

  if (activeMenu === "objek") filteredData = jenisObjek;
  if (activeMenu === "tarif") filteredData = tarif;
  if (activeMenu === "pengguna") filteredData = pengguna;

  filteredData = filteredData.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(keyword.toLowerCase())
  );

  return (
    <>
      <Header />
      <NavBar />

      <main className="setting-page">
        <ContainerCard
          title="Pengaturan Sistem"
          subtitle="Kelola seluruh konfigurasi aplikasi - Objek sewa, tarif dan pengguna."
        >

          <div className="setting-layout">

            {/* SIDEBAR */}
            <aside className="setting-sidebar">

              <h3>Pengaturan</h3>

              <div className="setting-menu">
                {menus.map((menu) => (
                  <button
                    key={menu.id}
                    className={
                      activeMenu === menu.id
                        ? "menu-item active"
                        : "menu-item"
                    }
                    onClick={() => setActiveMenu(menu.id)}
                  >
                    <span>{menu.title}</span>
                    <small>{menu.description}</small>
                  </button>
                ))}
              </div>

            </aside>

            {/* CONTENT */}
            <section className="setting-content">

              <div className="setting-card">


                {/* TABLE */}

                <div className="table-wrapper">
				
				{/* JENIS OBJEK */}
				{activeMenu === "objek" && (
				  <JenisObjek
					data={filteredData}
				  />
				)}

				{/* TARIF */}
				{activeMenu === "tarif" && (
				  <Tarif
					data={filteredData}
				  />
				)}
				  
				{/* PENGGUNA */}
				{activeMenu === "pengguna" && (
				  <Pengguna
					data={filteredData}
				  />
				)}
					
                </div>

              </div>

            </section>

          </div>

        </ContainerCard>

		{showModal && (
		  <ModalTambahData
			activeMenu={activeMenu}
			onClose={() =>
			  setShowModal(false)
			}
		  />
		)}
		
      </main>

    </>
  );
}