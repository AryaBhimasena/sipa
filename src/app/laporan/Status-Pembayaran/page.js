"use client";

import React, {
useEffect,
useMemo,
useState,
} from "react";

import Header from "../../../components/Header";
import NavBar from "../../../components/NavBar";
import ContainerCard from "../../../components/ContainerCard";
import { API_URL } from "../../../lib/api";
import { useUser } from "../../../lib/context/UserContext";
import "../../../styles/pages/status-pembayaran.css";

import {
ITEMS_PER_PAGE,
MONTHS,
formatRupiah,
createFilterOptions,
getStatusClass,
calculateSummaryStatus,
createKeterangan,
} from "../../../lib/laporan/utilStatusPembayaran";

import {
exportStatusPembayaranPDF,
exportStatusPembayaranExcel,
exportDetailStatusPembayaranPDF,
exportDetailStatusPembayaranExcel,
} from "../../../lib/laporan/utilEksport";

import {
ChevronLeft,
ChevronRight,
ChevronDown,
ChevronUp,
Search,
RefreshCw,
FileText,
FileSpreadsheet,
} from "lucide-react";

/* =====================================================
PAGE
===================================================== */
export default function StatusPembayaranPage() {
const currentYear =
new Date().getFullYear();

const currentMonth =
new Date().getMonth() + 1;

const [statusData, setStatusData] =
useState([]);

const [loading, setLoading] =
useState(true);

const [error, setError] =
useState("");

const user = useUser();

/* ===================================================
SEARCH
=================================================== */
const [searchTerm, setSearchTerm] =
useState("");

/* ===================================================
FILTER
=================================================== */
const [filterJenis, setFilterJenis] =
useState("");

const [filterTipe, setFilterTipe] =
useState("");

const [filterLantai, setFilterLantai] =
useState("");

const [filterBlok, setFilterBlok] =
useState("");

const [filterStatus, setFilterStatus] =
useState("");

/* ===================================================
PERIODE
=================================================== */
const [selectedYear, setSelectedYear] =
useState(currentYear);

const [selectedMonth, setSelectedMonth] =
useState(
currentMonth >= 1 &&
currentMonth <= 12
? currentMonth
: 12
);

/* ===================================================
PAGINATION
=================================================== */
const [currentPage, setCurrentPage] =
useState(1);

/* ===================================================
DETAIL ROW
=================================================== */
const [expandedRows, setExpandedRows] =
useState(
new Set()
);

/* ===================================================
FETCH STATUS PEMBAYARAN
=================================================== */
async function fetchStatusPembayaran() {
try {
setLoading(true);
setError("");


  const statusUrl =
    `${API_URL}?path=statusPembayaran` +
    `&tahun=${selectedYear}` +
    `&bulan=${selectedMonth}`;

  const joinUrl =
    `${API_URL}?path=dataJoin`;

  const [
    statusResponse,
    joinResponse,
  ] = await Promise.all([
    fetch(statusUrl, {
      method: "GET",
      cache: "no-store",
    }),

    fetch(joinUrl, {
      method: "GET",
      cache: "no-store",
    }),
  ]);

  if (!statusResponse.ok) {
    throw new Error(
      `Gagal mengambil status pembayaran (${statusResponse.status})`
    );
  }

  if (!joinResponse.ok) {
    throw new Error(
      `Gagal mengambil data penyewa (${joinResponse.status})`
    );
  }

  const statusResult =
    await statusResponse.json();

  const joinResult =
    await joinResponse.json();

  if (!statusResult.success) {
    throw new Error(
      statusResult.message ||
      "Gagal mengambil status pembayaran."
    );
  }

  if (!joinResult.success) {
    throw new Error(
      joinResult.message ||
      "Gagal mengambil data penyewa."
    );
  }

  const statusRows =
    Array.isArray(
      statusResult.data
    )
      ? statusResult.data
      : [];

  const joinRows =
    Array.isArray(
      joinResult.data
    )
      ? joinResult.data
      : [];

  /* ===============================================
     INDEX DATA JOIN BERDASARKAN ID REG
  =============================================== */

  const joinMap =
    new Map();

  for (
    const row of joinRows
  ) {
    const idReg =
      String(
        row.id_reg ?? ""
      ).trim();

    if (!idReg) {
      continue;
    }

    joinMap.set(
      idReg,
      row
    );
  }

  /* ===============================================
     BENTUK DATA STATUS

     Struktur output GAS:

     0  id_status
     1  id_reg
     2  tahun
     3  bulan
     4  nama_bulan
     5  status
     6  id_transaksi
     7  id_detail
     8  total
     9  sewa
     10 kebersihan
     11 keamanan
     12 denda
     13 diskon
     14 created_at
  =============================================== */

  const statusMap =
    new Map();

  for (
    const row of statusRows
  ) {
    if (
      !Array.isArray(row)
    ) {
      continue;
    }

    const [
      idStatus,
      idRegRaw,
      tahun,
      bulan,
      namaBulan,
      status,
      idTransaksi,
      idDetail,
      total,
      sewa,
      kebersihan,
      keamanan,
      denda,
      diskon,
      createdAt,
    ] = row;

    const idReg =
      String(
        idRegRaw ?? ""
      ).trim();

    if (!idReg) {
      continue;
    }

    if (
      !statusMap.has(
        idReg
      )
    ) {
      statusMap.set(
        idReg,
        {
          id_reg: idReg,
          detail: {},
        }
      );
    }

    const item =
      statusMap.get(
        idReg
      );

    /* =============================================
       DETAIL PER BULAN
    ============================================= */

    item.detail[
      Number(bulan)
    ] = {
      id_status:
        idStatus,

      tahun:
        Number(tahun),

      bulan:
        Number(bulan),

      nama_bulan:
        namaBulan,

      status:
        status || "",

      id_transaksi:
        idTransaksi || "",

      id_detail:
        idDetail || "",

      total:
        Number(total) || 0,

      tarif_sewa:
        Number(sewa) || 0,

      tarif_kebersihan:
        Number(kebersihan) || 0,

      tarif_keamanan:
        Number(keamanan) || 0,

      denda:
        Number(denda) || 0,

      diskon:
        Number(diskon) || 0,

      created_at:
        createdAt || null,
    };
  }

  /* ===============================================
     GABUNGKAN STATUS + DATA JOIN
  =============================================== */

  const mergedData =
    [];

  for (
    const [
      idReg,
      statusItem,
    ] of statusMap.entries()
  ) {
    const joinItem =
      joinMap.get(
        idReg
      ) || {};

    const monthlyDetails =
      statusItem.detail ||
      {};

    const summaryStatus =
      calculateSummaryStatus(
        monthlyDetails,
        selectedMonth
      );

    const keterangan =
      createKeterangan(
        monthlyDetails,
        selectedMonth
      );

    const currentMonthDetail =
      monthlyDetails[
        selectedMonth
      ] || {};

    mergedData.push({
      ...joinItem,

      id_reg:
        idReg,

      detail:
        monthlyDetails,

      status:
        summaryStatus,

      keterangan:
        keterangan,

      id_transaksi:
        currentMonthDetail.id_transaksi ||
        "",

      id_detail:
        currentMonthDetail.id_detail ||
        "",

      total:
        Number(
          currentMonthDetail.total
        ) || 0,

      denda:
        Number(
          currentMonthDetail.denda
        ) || 0,

      diskon:
        Number(
          currentMonthDetail.diskon
        ) || 0,

      tarif_sewa:
        Number(
          currentMonthDetail.tarif_sewa
        ) || 0,

      tarif_kebersihan:
        Number(
          currentMonthDetail.tarif_kebersihan
        ) || 0,

      tarif_keamanan:
        Number(
          currentMonthDetail.tarif_keamanan
        ) || 0,
    });
  }

  /* ===============================================
     MASUKKAN HASIL KE STATE
  =============================================== */

  setStatusData(
    mergedData
  );

  setCurrentPage(1);

  setExpandedRows(
    new Set()
  );

} catch (err) {
  console.error(
    "fetchStatusPembayaran:",
    err
  );

  setStatusData([]);

  setError(
    err?.message ||
    "Terjadi kesalahan saat mengambil data status pembayaran."
  );

} finally {
  setLoading(false);
}


}

/* ===================================================
LOAD DATA
=================================================== */
useEffect(() => {
fetchStatusPembayaran();
}, [
selectedYear,
selectedMonth,
]);

/* ===================================================
RELOAD
=================================================== */
function handleReload() {
fetchStatusPembayaran();
}

/* ===================================================
FILTER OPTIONS
=================================================== */
const jenisOptions =
useMemo(() => {
return createFilterOptions(
statusData.map(
(item) =>
item.objek?.jenis
)
);
}, [
statusData,
]);

const tipeOptions =
useMemo(() => {
return createFilterOptions(
statusData
.filter(
(item) =>
item.objek?.jenis ===
"Kios"
)
.map(
(item) =>
item.objek?.tipe
)
);
}, [
statusData,
]);

const lantaiOptions =
useMemo(() => {
return createFilterOptions(
statusData.map(
(item) =>
item.lantai
)
);
}, [
statusData,
]);

const blokOptions =
useMemo(() => {
return createFilterOptions(
statusData.map(
(item) =>
item.blok
)
);
}, [
statusData,
]);

const statusOptions =
useMemo(() => {
return createFilterOptions(
statusData.map(
(item) =>
item.status
)
);
}, [
statusData,
]);

/* ===================================================
FILTER DATA
=================================================== */
const filteredData =
useMemo(() => {
return statusData.filter(
(item) => {
const search =
searchTerm
.toLowerCase()
.trim();


      const matchSearch =
        !search ||
        String(
          item.id_reg ?? ""
        )
          .toLowerCase()
          .includes(
            search
          ) ||
        String(
          item.nama ?? ""
        )
          .toLowerCase()
          .includes(
            search
          ) ||
        String(
          item.no ?? ""
        )
          .toLowerCase()
          .includes(
            search
          );

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
        ) ===
          filterLantai;

      const matchBlok =
        !filterBlok ||
        String(
          item.blok ?? ""
        ) ===
          filterBlok;

      const matchStatus =
        !filterStatus ||
        item.status ===
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
  statusData,
  searchTerm,
  filterJenis,
  filterTipe,
  filterLantai,
  filterBlok,
  filterStatus,
]);


/* ===================================================
RESET PAGE
=================================================== */
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

/* ===================================================
PAGINATION
=================================================== */
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
    start +
      ITEMS_PER_PAGE
  );
}, [
  filteredData,
  currentPage,
]);


const displayStart =
filteredData.length === 0
? 0
: (currentPage - 1) *
ITEMS_PER_PAGE +
1;

const displayEnd =
Math.min(
currentPage *
ITEMS_PER_PAGE,
filteredData.length
);

/* ===================================================
PAGINATION HANDLER
=================================================== */
function handlePrevPage() {
if (
currentPage > 1
) {
setCurrentPage(
(page) =>
page - 1
);
}
}

function handleNextPage() {
if (
currentPage <
totalPages
) {
setCurrentPage(
(page) =>
page + 1
);
}
}

/* ===================================================
DETAIL
=================================================== */
function toggleDetail(
idReg
) {
setExpandedRows(
(previous) => {
const next =
new Set(
previous
);


    if (
      next.has(idReg)
    ) {
      next.delete(
        idReg
      );
    } else {
      next.add(
        idReg
      );
    }

    return next;
  }
);


}

/* ===================================================
EXPORT DATA
=================================================== */

/*

* EXPORT PDF UTAMA
*
* Menggunakan filteredData,
* bukan paginatedData.
*
* Artinya seluruh data yang
* memenuhi filter akan diekspor.
  */
  function handleExportPDF() {
  exportStatusPembayaranPDF(
  filteredData,
  {
  selectedYear,
  selectedMonth,
  user,
  }
  );
  }

/*

* EXPORT EXCEL UTAMA
*
* Menggunakan filteredData,
* bukan paginatedData.
  */
  function handleExportExcel() {
  exportStatusPembayaranExcel(
  filteredData,
  {
  selectedYear,
  selectedMonth,
  }
  );
  }

/*

* EXPORT PDF DETAIL
*
* Hanya satu item / penyewa
* yang dipilih pada baris.
  */
  function handleExportDetailPDF(
  item
  ) {
  exportDetailStatusPembayaranPDF(
  item,
  {
  selectedYear,
  selectedMonth,
  user,
  }
  );
  }

/*

* EXPORT EXCEL DETAIL
*
* Hanya satu item / penyewa
* yang dipilih pada baris.
  */
  function handleExportDetailExcel(
  item
  ) {
  exportDetailStatusPembayaranExcel(
  item,
  {
  selectedYear,
  selectedMonth,
  }
  );
  }

/* ===================================================
RENDER
=================================================== */
return (
<> <Header />


  <NavBar />

  <main
    className="status-pembayaran-page"
  >
    <ContainerCard
      title="Status Pembayaran"
      subtitle="Monitoring Status Pembayaran Penyewa"
    >
      <section
        className="sp-section"
      >
        {/* =====================================
            TOOLBAR ATAS
        ===================================== */}
        <div
          className="sp-toolbar"
        >
          {/* ---------------------------------
              FILTER KIRI
          --------------------------------- */}
          <div
            className="toolbar-left"
          >
            {/* SEARCH */}
            <div
              className="search-box"
            >
              <Search
                size={16}
              />

              <input
                type="text"
                placeholder="Cari ID, Nama, Nomor..."
                value={
                  searchTerm
                }
                onChange={(
                  e
                ) =>
                  setSearchTerm(
                    e.target
                      .value
                  )
                }
              />
            </div>

            {/* OBJEK */}
            <select
              value={
                filterJenis
              }
              onChange={(
                e
              ) =>
                setFilterJenis(
                  e.target
                    .value
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

            {/* TIPE */}
            <select
              value={
                filterTipe
              }
              onChange={(
                e
              ) =>
                setFilterTipe(
                  e.target
                    .value
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

            {/* LANTAI */}
            <select
              value={
                filterLantai
              }
              onChange={(
                e
              ) =>
                setFilterLantai(
                  e.target
                    .value
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

            {/* BLOK */}
            <select
              value={
                filterBlok
              }
              onChange={(
                e
              ) =>
                setFilterBlok(
                  e.target
                    .value
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

            {/* STATUS */}
            <select
              value={
                filterStatus
              }
              onChange={(
                e
              ) =>
                setFilterStatus(
                  e.target
                    .value
                )
              }
            >
              <option value="">
                Semua Status
              </option>

              {statusOptions.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}
            </select>
          </div>

          {/* ---------------------------------
              PERIODE KANAN
          --------------------------------- */}
          <div
            className="toolbar-right"
          >
            {/* TAHUN */}
            <select
              value={
                selectedYear
              }
              onChange={(
                e
              ) =>
                setSelectedYear(
                  Number(
                    e.target
                      .value
                  )
                )
              }
            >
              <option
                value={
                  currentYear
                }
              >
                {currentYear}
              </option>

              <option
                value={
                  currentYear -
                  1
                }
              >
                {currentYear -
                  1}
              </option>

              <option
                value={
                  currentYear -
                  2
                }
              >
                {currentYear -
                  2}
              </option>
            </select>

            {/* SAMPAI BULAN */}
            <select
              value={
                selectedMonth
              }
              onChange={(
                e
              ) =>
                setSelectedMonth(
                  Number(
                    e.target
                      .value
                  )
                )
              }
            >
              {MONTHS.map(
                (month) => (
                  <option
                    key={
                      month.number
                    }
                    value={
                      month.number
                    }
                  >
                    Sampai{" "}
                    {
                      month.name
                    }
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* =====================================
            INFO + ACTION BAR
        ===================================== */}
        <div
          className="sp-period-info"
        >
          {/* ---------------------------------
              PERIODE KIRI
          --------------------------------- */}
          <div
            className="sp-period-label"
          >
            <span>
              Periode:
            </span>

            <strong>
              Januari -{" "}
              {
                MONTHS.find(
                  (
                    month
                  ) =>
                    month.number ===
                    selectedMonth
                )?.name
              }{" "}
              {selectedYear}
            </strong>
          </div>

          {/* ---------------------------------
              ACTION KANAN
          --------------------------------- */}
          <div
            className="sp-data-actions"
          >
            {/* RELOAD */}
            <button
              type="button"
              className="sp-action-button"
              onClick={
                handleReload
              }
              disabled={
                loading
              }
              title="Muat ulang data"
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "sp-spin"
                    : ""
                }
              />

              <span>
                {loading
                  ? "Memuat..."
                  : "Reload"}
              </span>
            </button>

            {/* EXPORT PDF */}
            <button
              type="button"
              className="sp-action-button"
              onClick={
                handleExportPDF
              }
              disabled={
                loading ||
                filteredData.length ===
                  0
              }
              title="Export seluruh data hasil filter ke PDF"
            >
              <FileText
                size={15}
              />

              <span>
                PDF
              </span>
            </button>

            {/* EXPORT EXCEL */}
            <button
              type="button"
              className="sp-action-button"
              onClick={
                handleExportExcel
              }
              disabled={
                loading ||
                filteredData.length ===
                  0
              }
              title="Export seluruh data hasil filter ke Excel"
            >
              <FileSpreadsheet
                size={15}
              />

              <span>
                Excel
              </span>
            </button>

            {/* PAGINATION */}
            <div
              className="sp-pagination"
            >
              <button
                type="button"
                onClick={
                  handlePrevPage
                }
                disabled={
                  currentPage ===
                  1
                }
                className="pg-btn"
                title="Halaman sebelumnya"
              >
                <ChevronLeft
                  size={17}
                />
              </button>

              <span
                className="pg-info"
              >
                {currentPage}{" "}
                /{" "}
                {
                  totalPages ||
                  1
                }
              </span>

              <button
                type="button"
                onClick={
                  handleNextPage
                }
                disabled={
                  currentPage ===
                    totalPages ||
                  totalPages ===
                    0
                }
                className="pg-btn"
                title="Halaman berikutnya"
              >
                <ChevronRight
                  size={17}
                />
              </button>
            </div>

            {/* JUMLAH DATA */}
            <span
              className="sp-display-info"
            >
              Menampilkan{" "}
              <strong>
                {
                  displayStart
                }
              </strong>
              –
              <strong>
                {
                  displayEnd
                }
              </strong>{" "}
              dari{" "}
              <strong>
                {
                  filteredData.length
                }
              </strong>{" "}
              penyewa
            </span>
          </div>
        </div>

        {/* =====================================
            TABLE
        ===================================== */}
        <div
          className="sp-table-wrapper"
        >
          <table
            className="sp-table"
          >
            <thead>
              <tr>
                <th>
                  ID Reg
                </th>

                <th>
                  Nama
                </th>

                <th>
                  Objek
                </th>

                <th>
                  Type
                </th>

                <th>
                  Lantai
                </th>

                <th>
                  Blok
                </th>

                <th>
                  No
                </th>

                <th>
                  Status
                </th>

                <th>
                  Keterangan
                </th>

                <th className="col-action">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="sp-loading-row"
                  >
                    <div className="sp-loading-content">
                      <RefreshCw
                        size={17}
                        className="sp-spin"
                      />

                      <span>
                        Memuat data pembayaran...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={10}
                    className="sp-error-row"
                  >
                    <div className="sp-loading-content">
                      <span>
                        {
                          error
                        }
                      </span>

                      <button
                        type="button"
                        className="sp-reload-button"
                        onClick={
                          handleReload
                        }
                      >
                        <RefreshCw
                          size={
                            15
                          }
                        />

                        Coba Lagi
                      </button>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="sp-empty"
                  >
                    Tidak ada data
                    yang sesuai
                    dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map(
                  (item) => {
                    const isExpanded =
                      expandedRows.has(
                        item.id_reg
                      );

                    return (
                      <React.Fragment
                        key={
                          item.id_reg
                        }
                      >
                        {/* ===========================
                            MAIN ROW
                        =========================== */}
                        <tr
                          className={
                            isExpanded
                              ? "main-row expanded"
                              : "main-row"
                          }
                        >
                          {/* ID REG */}
                          <td
                            className="id-reg-cell"
                          >
                            {
                              item.id_reg
                            }
                          </td>

                          {/* NAMA */}
                          <td
                            className="name-cell"
                          >
                            {
                              item.nama ||
                              "-"
                            }
                          </td>

                          {/* OBJEK */}
                          <td>
                            {
                              item.objek
                                ?.jenis ||
                              "-"
                            }
                          </td>

                          {/* TYPE */}
                          <td>
                            {
                              item.objek
                                ?.tipe ||
                              "-"
                            }
                          </td>

                          {/* LANTAI */}
                          <td>
                            {
                              item.lantai ||
                              "-"
                            }
                          </td>

                          {/* BLOK */}
                          <td>
                            {
                              item.blok ||
                              "-"
                            }
                          </td>

                          {/* NO */}
                          <td>
                            {
                              item.no ||
                              "-"
                            }
                          </td>

                          {/* STATUS */}
                          <td>
                            <span
                              className={
                                getStatusClass(
                                  item.status
                                )
                              }
                            >
                              {
                                item.status
                              }
                            </span>
                          </td>

                          {/* KETERANGAN */}
                          <td
                            className="keterangan-cell"
                          >
                            {
                              item.keterangan
                            }
                          </td>

                          {/* AKSI */}
                          <td
                            className="col-action"
                          >
                            <div
                              className="action-group"
                            >
                              {/* DETAIL */}
                              <button
                                type="button"
                                className="btn-detail"
                                onClick={() =>
                                  toggleDetail(
                                    item.id_reg
                                  )
                                }
                                title={
                                  isExpanded
                                    ? "Tutup Detail"
                                    : "Lihat Detail"
                                }
                              >
                                {isExpanded ? (
                                  <ChevronUp
                                    size={
                                      14
                                    }
                                  />
                                ) : (
                                  <ChevronDown
                                    size={
                                      14
                                    }
                                  />
                                )}

                                <span>
                                  Detail
                                </span>
                              </button>

                              {/* PDF DETAIL */}
                              <button
                                type="button"
                                className="btn-pdf"
                                onClick={() =>
                                  handleExportDetailPDF(
                                    item
                                  )
                                }
                                title="Export detail ke PDF"
                              >
                                <FileText
                                  size={
                                    14
                                  }
                                />

                                <span>
                                  PDF
                                </span>
                              </button>

                              {/* EXCEL DETAIL */}
                              <button
                                type="button"
                                className="btn-excel"
                                onClick={() =>
                                  handleExportDetailExcel(
                                    item
                                  )
                                }
                                title="Export detail ke Excel"
                              >
                                <FileSpreadsheet
                                  size={
                                    14
                                  }
                                />

                                <span>
                                  Excel
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* ===========================
                            DETAIL SUB ROW
                        =========================== */}
                        {isExpanded && (
                          <tr
                            className="detail-row"
                          >
                            <td
                              colSpan={10}
                            >
                              <div
                                className="detail-container"
                              >
                                {/* DETAIL HEADER */}
                                <div
                                  className="detail-title"
                                >
                                  <div>
                                    <strong>
                                      Detail Pembayaran
                                    </strong>

                                    <span>
                                      {
                                        item.id_reg
                                      }{" "}
                                      —{" "}
                                      {
                                        item.nama
                                      }
                                    </span>
                                  </div>

                                  <span
                                    className="detail-period"
                                  >
                                    Januari -{" "}
                                    {
                                      MONTHS.find(
                                        (
                                          month
                                        ) =>
                                          month.number ===
                                          selectedMonth
                                      )?.name
                                    }{" "}
                                    {
                                      selectedYear
                                    }
                                  </span>
                                </div>

                                {/* DETAIL TABLE */}
                                <div
                                  className="detail-table-wrapper"
                                >
                                  <table
                                    className="detail-table"
                                  >
                                    <thead>
                                      <tr>
                                        <th>
                                          Bulan
                                        </th>

                                        <th>
                                          Status Bayar
                                        </th>

                                        <th className="amount-column">
                                          Tarif Sewa
                                        </th>

                                        <th className="amount-column">
                                          Tarif Keamanan
                                        </th>

                                        <th className="amount-column">
                                          Tarif Kebersihan
                                        </th>
                                      </tr>
                                    </thead>

                                    <tbody>
                                      {MONTHS
                                        .filter(
                                          (
                                            month
                                          ) =>
                                            month.number <=
                                            selectedMonth
                                        )
                                        .map(
                                          (
                                            month
                                          ) => {
                                            const detail =
                                              item.detail?.[
                                                month
                                                  .number
                                              ];

                                            return (
                                              <tr
                                                key={
                                                  month.number
                                                }
                                              >
                                                <td>
                                                  {
                                                    month.name
                                                  }
                                                </td>

                                                <td>
                                                  <span
                                                    className={
                                                      getStatusClass(
                                                        detail
                                                          ?.status
                                                      )
                                                    }
                                                  >
                                                    {
                                                      detail
                                                        ?.status ||
                                                      "-"
                                                    }
                                                  </span>
                                                </td>

                                                <td
                                                  className="amount-column"
                                                >
                                                  {
                                                    formatRupiah(
                                                      detail
                                                        ?.tarif_sewa
                                                    )
                                                  }
                                                </td>

                                                <td
                                                  className="amount-column"
                                                >
                                                  {
                                                    formatRupiah(
                                                      detail
                                                        ?.tarif_keamanan
                                                    )
                                                  }
                                                </td>

                                                <td
                                                  className="amount-column"
                                                >
                                                  {
                                                    formatRupiah(
                                                      detail
                                                        ?.tarif_kebersihan
                                                    )
                                                  }
                                                </td>
                                              </tr>
                                            );
                                          }
                                        )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </ContainerCard>
  </main>
</>


);
}