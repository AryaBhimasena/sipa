"use client";

import { useEffect, useState, useMemo } from "react";

import Header from "../../components/Header";
import NavBar from "../../components/NavBar";
import ContainerCard from "../../components/ContainerCard";
import MasterDataModal from "../../components/MasterDataModal";

import { API_URL } from "../../lib/api";

import "../../styles/pages/master-data.css";

import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  RefreshCw,
} from "lucide-react";

function formatRupiah(value) {
  if (!value) return "0";

  return Number(value).toLocaleString(
    "id-ID"
  );
}

export default function MasterDataPage() {
  const [masterData, setMasterData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [modalMode, setModalMode] =
    useState("add");

  const [selectedData, setSelectedData] =
    useState(null);

  /* =====================================
     SEARCH + FILTERS
  ===================================== */

  const [searchTerm, setSearchTerm] =
    useState("");

  const [filterJenis, setFilterJenis] =
    useState("");

  const [filterTipe, setFilterTipe] =
    useState("");

  const [filterLantai, setFilterLantai] =
    useState("");

  const [filterBlok, setFilterBlok] =
    useState("");

  const [
    filterStatus,
    setFilterStatus,
  ] = useState("");

  /* =====================================
     PAGINATION
  ===================================== */

  const ITEMS_PER_PAGE = 20;

  const [currentPage, setCurrentPage] =
    useState(1);

  /* =====================================
     FETCH DATA
     
     Digunakan oleh:
     - initial load
     - tombol reload
     - setelah CREATE
     - setelah UPDATE
  ===================================== */

  async function fetchData() {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}?path=dataJoin`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(
          `HTTP ${res.status}`
        );
      }

      const json =
        await res.json();

      if (json.success) {
        setMasterData(
          Array.isArray(json.data)
            ? json.data
            : []
        );

        setCurrentPage(1);
      } else {
        console.error(
          "Gagal mengambil data:",
          json.message
        );

        setMasterData([]);
        setCurrentPage(1);

        throw new Error(
          json.message ||
            "Gagal mengambil data master."
        );
      }

    } catch (error) {

      console.error(
        "Gagal mengambil data:",
        error
      );

    } finally {

      setLoading(false);

    }
  }

  /* =====================================
     INITIAL LOAD
  ===================================== */

  useEffect(() => {
    fetchData();
  }, []);

  /* =====================================
     DYNAMIC FILTER OPTIONS
  ===================================== */

  function createFilterOptions(values) {

    return [
      ...new Set(
        values
          .map((value) =>
            String(
              value ?? ""
            ).trim()
          )
          .filter(
            (value) =>
              value !== "" &&
              value !== "-" &&
              value !== "null" &&
              value !== "undefined"
          )
      ),
    ].sort((a, b) =>
      a.localeCompare(
        b,
        "id",
        {
          sensitivity: "base",
          numeric: true,
        }
      )
    );
  }

  /* =====================================
     FILTER OPTION:
     JENIS OBJEK
  ===================================== */

  const jenisOptions =
    useMemo(() => {

      return createFilterOptions(
        masterData.map(
          (item) =>
            item.objek?.jenis
        )
      );

    }, [masterData]);

  /* =====================================
     FILTER OPTION:
     TIPE
  ===================================== */

  const tipeOptions =
    useMemo(() => {

      return createFilterOptions(
        masterData.map(
          (item) =>
            item.objek?.tipe
        )
      );

    }, [masterData]);

  /* =====================================
     FILTER OPTION:
     LANTAI
  ===================================== */

  const lantaiOptions =
    useMemo(() => {

      return createFilterOptions(
        masterData.map(
          (item) =>
            item.lantai
        )
      );

    }, [masterData]);

  /* =====================================
     FILTER OPTION:
     BLOK
  ===================================== */

  const blokOptions =
    useMemo(() => {

      return createFilterOptions(
        masterData.map(
          (item) =>
            item.blok
        )
      );

    }, [masterData]);

  /* =====================================
     FILTER OPTION:
     STATUS PEMBAYARAN
  ===================================== */

  const statusOptions =
    useMemo(() => {

      return createFilterOptions(
        masterData.map(
          (item) =>
            item.status_pembayaran
        )
      );

    }, [masterData]);

  /* =====================================
     FILTER DATA
  ===================================== */

  const filteredData =
    useMemo(() => {

      return masterData.filter(
        (item) => {

          const search =
            searchTerm
              .toLowerCase()
              .trim();

          const matchSearch =
            item.id_reg
              ?.toString()
              .toLowerCase()
              .includes(search) ||

            item.nama
              ?.toString()
              .toLowerCase()
              .includes(search) ||

            String(item.no ?? "")
              .toLowerCase()
              .includes(search);

          const matchJenis =
            !filterJenis ||
            item.objek?.jenis ===
              filterJenis;

          const matchTipe =
            !filterTipe ||
            item.objek?.tipe ===
              filterTipe;

          const matchLantai =
            !filterLantai ||
            String(
              item.lantai ?? ""
            ) === filterLantai;

          const matchBlok =
            !filterBlok ||
            String(
              item.blok ?? ""
            ) === filterBlok;

          const matchStatus =
            !filterStatus ||
            item.status_pembayaran ===
              filterStatus;

          return (
            matchSearch &&
            matchJenis &&
            matchTipe &&
            matchLantai &&
            matchBlok &&
            matchStatus
          );
        }
      );

    }, [
      masterData,
      searchTerm,
      filterJenis,
      filterTipe,
      filterLantai,
      filterBlok,
      filterStatus,
    ]);

  /* =====================================
     RESET PAGE IF FILTER CHANGED
  ===================================== */

  useEffect(() => {

    setCurrentPage(1);

  }, [
    searchTerm,
    filterJenis,
    filterTipe,
    filterLantai,
    filterBlok,
    filterStatus,
  ]);

  /* =====================================
     PAGINATION
  ===================================== */

  const totalPages =
    Math.ceil(
      filteredData.length /
        ITEMS_PER_PAGE
    );

  const paginatedData =
    useMemo(() => {

      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      return filteredData.slice(
        start,
        start + ITEMS_PER_PAGE
      );

    }, [
      filteredData,
      currentPage,
    ]);

  /* =====================================
     PAGINATION HANDLER
  ===================================== */

  function handlePrevPage() {

    if (currentPage > 1) {

      setCurrentPage(
        (p) => p - 1
      );

    }
  }

  function handleNextPage() {

    if (
      currentPage <
      totalPages
    ) {

      setCurrentPage(
        (p) => p + 1
      );

    }
  }

  /* =====================================
     EDIT
  ===================================== */

  function handleEdit(data) {

    setModalMode("edit");

    setSelectedData(data);

    setShowModal(true);

  }

  /* =====================================
     DELETE
  ===================================== */

  function handleDelete(data) {

    /*
      DELETE belum diaktifkan pada
      tahap ini karena fokus sekarang
      adalah CREATE dan UPDATE.
    */

    console.log(
      "Delete:",
      data
    );

  }

  /* =====================================
     ADD DATA
  ===================================== */

  function handleAddData() {

    setModalMode("add");

    setSelectedData(null);

    setShowModal(true);

  }

  /* =====================================
     SAVE MODAL
     
     Mode:
     - add  -> apiCreateMasterData
     - edit -> apiUpdateMasterData
  ===================================== */

  async function handleSaveModal(data) {

    try {

      /*
        Tentukan endpoint berdasarkan
        mode modal.
      */

      const path =
        modalMode === "edit"
          ? "updateMasterData"
          : "createMasterData";

      /*
        Payload tetap menggunakan
        struktur nested dari modal.

        Contoh:

        {
          id_reg: "...",
          nama: "...",
          objek: {
            id: "..."
          },
          tarif: {
            keamanan: {
              id: "..."
            },
            kebersihan: {
              id: "..."
            }
          }
        }

        Endpoint GAS sudah memiliki
        getMasterDataPayload()
        yang dapat membaca struktur ini.
      */

      const res = await fetch(
        `${API_URL}?path=${path}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            data,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          `HTTP ${res.status}`
        );
      }

      const json =
        await res.json();

      /*
        Validasi response dari GAS.
      */

      if (!json.success) {

        throw new Error(
          json.message ||
            (
              modalMode === "edit"
                ? "Gagal memperbarui data."
                : "Gagal menambahkan data."
            )
        );

      }

      /*
        Berhasil:
        - tutup modal
        - reset selected data
        - reload data terbaru
      */

      setShowModal(false);

      setSelectedData(null);

      await fetchData();

    } catch (error) {

      console.error(
        "Gagal menyimpan master data:",
        error
      );

      /*
        Error dilempar kembali ke modal.

        Dengan begitu:
        MasterDataModal akan menampilkan
        "Data gagal disimpan."
      */

      throw error;
    }
  }

  /* =====================================
     RENDER
  ===================================== */

  return (
    <>
      <Header />

      <NavBar />

      <main className="master-data-page">

        <ContainerCard
          title="Master Data"
          subtitle="Data Penyewa dan Informasi Tarif"
        >

          <section className="md-section">

            {/* ==========================
                TOOLBAR
            ========================== */}

            <div className="md-toolbar">

              {/* ========================
                  LEFT
              ======================== */}

              <div className="toolbar-left">

                <div className="search-box">

                  <Search size={16} />

                  <input
                    type="text"
                    placeholder="Cari ID, Nama, Nomor Toko..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }
                  />

                </div>

                <select
                  value={filterJenis}
                  onChange={(e) =>
                    setFilterJenis(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Semua Objek
                  </option>

                  {jenisOptions.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

                <select
                  value={filterTipe}
                  onChange={(e) =>
                    setFilterTipe(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Semua Tipe
                  </option>

                  {tipeOptions.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

                <select
                  value={filterLantai}
                  onChange={(e) =>
                    setFilterLantai(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Semua Lantai
                  </option>

                  {lantaiOptions.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

                <select
                  value={filterBlok}
                  onChange={(e) =>
                    setFilterBlok(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Semua Blok
                  </option>

                  {blokOptions.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Semua Status
                  </option>

                  {statusOptions.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* ========================
                  RIGHT
              ======================== */}

              <div className="toolbar-right">

                <button
                  type="button"
                  className="btn-reload-data"
                  onClick={fetchData}
                  disabled={loading}
                  title="Muat ulang data"
                >
                  <RefreshCw
                    size={17}
                    className={
                      loading
                        ? "icon-spin"
                        : ""
                    }
                  />

                  <span>
                    Reload
                  </span>
                </button>

                <button
                  type="button"
                  className="btn-add-data"
                  onClick={
                    handleAddData
                  }
                >
                  <Plus size={18} />

                  <span>
                    Tambah Data
                  </span>
                </button>

                <div className="md-pagination">

                  <button
                    type="button"
                    onClick={
                      handlePrevPage
                    }
                    disabled={
                      currentPage === 1
                    }
                    className="pg-btn"
                    title="Halaman sebelumnya"
                  >
                    <ChevronLeft
                      size={18}
                    />
                  </button>

                  <span className="pg-info">
                    Page{" "}
                    {currentPage}
                    {" / "}
                    {totalPages || 1}
                  </span>

                  <button
                    type="button"
                    onClick={
                      handleNextPage
                    }
                    disabled={
                      currentPage ===
                        totalPages ||
                      totalPages === 0
                    }
                    className="pg-btn"
                    title="Halaman berikutnya"
                  >
                    <ChevronRight
                      size={18}
                    />
                  </button>

                </div>

              </div>

            </div>

            {/* ==========================
                TABLE
            ========================== */}

            <div className="md-table-wrapper">

              {loading ? (

                <div className="md-table-loading">

                  <div className="md-loading-spinner">
                    <RefreshCw
                      size={22}
                    />
                  </div>

                  <span>
                    Memuat data...
                  </span>

                </div>

              ) : filteredData.length === 0 ? (

                <div className="md-empty">
                  Tidak ada data yang sesuai
                  dengan filter.
                </div>

              ) : (

                <table className="md-table">

                  <thead>
                    <tr>

                      <th>ID Reg</th>
                      <th>Nama</th>
                      <th>Objek</th>
                      <th>Tipe</th>
                      <th>Lantai</th>
                      <th>Blok</th>
                      <th>No</th>
                      <th>Dimensi</th>
                      <th>Tarif Sewa</th>
                      <th>Keamanan</th>
                      <th>Kebersihan</th>
                      <th>Status</th>

                      <th className="col-center">
                        Aksi
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {paginatedData.map(
                      (item) => (

                        <tr
                          key={
                            item.id_reg
                          }
                        >

                          <td>
                            {
                              item.id_reg
                            }
                          </td>

                          <td>
                            {
                              item.nama
                            }
                          </td>

                          <td>
                            {
                              item.objek
                                ?.jenis
                            }
                          </td>

                          <td>
                            {
                              item.objek
                                ?.tipe
                            }
                          </td>

                          <td>
                            {
                              item.lantai ||
                              "-"
                            }
                          </td>

                          <td>
                            {
                              item.blok ||
                              "-"
                            }
                          </td>

                          <td>
                            {
                              item.no ||
                              "-"
                            }
                          </td>

                          <td>
                            {
                              item.objek
                                ?.dimensi ||
                              "-"
                            }
                          </td>

                          <td>
                            Rp{" "}
                            {formatRupiah(
                              item.tarif
                                ?.sewa
                                ?.nominal
                            )}
                          </td>

                          <td>
                            Rp{" "}
                            {formatRupiah(
                              item.tarif
                                ?.keamanan
                                ?.nominal
                            )}
                          </td>

                          <td>
                            Rp{" "}
                            {formatRupiah(
                              item.tarif
                                ?.kebersihan
                                ?.nominal
                            )}
                          </td>

                          <td>
                            <span
                              className={`status-badge status-${String(
                                item.status_pembayaran ||
                                  "unknown"
                              )
                                .toLowerCase()
                                .replace(
                                  /\s+/g,
                                  "-"
                                )}`}
                            >
                              {
                                item.status_pembayaran ||
                                "-"
                              }
                            </span>
                          </td>

                          <td className="col-center">

                            <div className="action-group">

                              <button
                                type="button"
                                className="btn-icon-edit"
                                onClick={() =>
                                  handleEdit(
                                    item
                                  )
                                }
                                title="Edit data"
                              >
                                <Pencil
                                  size={17}
                                />
                              </button>

                              <button
                                type="button"
                                className="btn-icon-delete"
                                onClick={() =>
                                  handleDelete(
                                    item
                                  )
                                }
                                title="Hapus data"
                              >
                                <Trash2
                                  size={17}
                                />
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              )}

            </div>

          </section>

        </ContainerCard>

      </main>

      <MasterDataModal
        isOpen={showModal}
        mode={modalMode}
        initialData={selectedData}
        onClose={() =>
          setShowModal(false)
        }
        onSave={
          handleSaveModal
        }
      />

    </>
  );
}