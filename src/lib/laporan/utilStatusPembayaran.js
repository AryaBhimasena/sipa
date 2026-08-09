/* =====================================================
   UTIL STATUS PEMBAYARAN
===================================================== */

/* =====================================================
   KONFIGURASI
===================================================== */

export const ITEMS_PER_PAGE = 20;


/* =====================================================
   DATA BULAN
===================================================== */

export const MONTHS = [
  {
    number: 1,
    name: "Januari",
    short: "Jan",
  },
  {
    number: 2,
    name: "Februari",
    short: "Feb",
  },
  {
    number: 3,
    name: "Maret",
    short: "Mar",
  },
  {
    number: 4,
    name: "April",
    short: "Apr",
  },
  {
    number: 5,
    name: "Mei",
    short: "Mei",
  },
  {
    number: 6,
    name: "Juni",
    short: "Jun",
  },
  {
    number: 7,
    name: "Juli",
    short: "Jul",
  },
  {
    number: 8,
    name: "Agustus",
    short: "Agu",
  },
  {
    number: 9,
    name: "September",
    short: "Sep",
  },
  {
    number: 10,
    name: "Oktober",
    short: "Okt",
  },
  {
    number: 11,
    name: "November",
    short: "Nov",
  },
  {
    number: 12,
    name: "Desember",
    short: "Des",
  },
];


/* =====================================================
   FORMAT RUPIAH
===================================================== */

export function formatRupiah(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Rp 0";
  }

  return `Rp ${Number(value).toLocaleString(
    "id-ID"
  )}`;
}


/* =====================================================
   FILTER OPTIONS
===================================================== */

export function createFilterOptions(values) {
  return [
    ...new Set(
      values
        .map((value) =>
          String(value ?? "").trim()
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
    a.localeCompare(b, "id", {
      sensitivity: "base",
      numeric: true,
    })
  );
}


/* =====================================================
   NORMALIZE STATUS
===================================================== */

export function normalizeStatus(status) {
  return String(status ?? "")
    .trim()
    .toLowerCase();
}


/* =====================================================
   STATUS CLASS
===================================================== */

export function getStatusClass(status) {
  const normalized =
    normalizeStatus(status);

  if (
    normalized === "sudah bayar"
  ) {
    return "status-badge status-paid";
  }

  if (
    normalized === "ada tunggakan" ||
    normalized === "menunggak"
  ) {
    return "status-badge status-overdue";
  }

  if (
    normalized === "belum bayar"
  ) {
    return "status-badge status-unpaid";
  }

  if (
    normalized === "tidak ada data"
  ) {
    return "status-badge status-none";
  }

  return "status-badge";
}


/* =====================================================
   FORMAT LIST BULAN
===================================================== */

export function formatMonthList(months) {
  if (months.length === 0) {
    return "-";
  }

  if (months.length === 1) {
    return months[0];
  }

  if (months.length === 2) {
    return `${months[0]} dan ${months[1]}`;
  }

  return `${months
    .slice(0, -1)
    .join(", ")} dan ${
    months[months.length - 1]
  }`;
}


/* =====================================================
   HITUNG STATUS UTAMA
===================================================== */

export function calculateSummaryStatus(
  monthlyDetails,
  selectedMonth
) {
  const statuses = [];

  for (
    let bulan = 1;
    bulan <= selectedMonth;
    bulan++
  ) {
    const detail =
      monthlyDetails?.[bulan];

    if (!detail) {
      continue;
    }

    statuses.push(
      normalizeStatus(detail.status)
    );
  }

  const hasOverdue =
    statuses.some(
      (status) =>
        status === "menunggak" ||
        status === "ada tunggakan"
    );

  const hasUnpaid =
    statuses.includes("belum bayar");

  if (hasOverdue) {
    return "Ada Tunggakan";
  }

  if (hasUnpaid) {
    return "Belum Bayar";
  }

  if (statuses.length === 0) {
    return "Tidak ada data";
  }

  return "Sudah Bayar";
}


/* =====================================================
   BUAT KETERANGAN
===================================================== */

export function createKeterangan(
  monthlyDetails,
  selectedMonth
) {
  const tunggakan = [];
  const belumBayar = [];

  for (
    let bulan = 1;
    bulan <= selectedMonth;
    bulan++
  ) {
    const detail =
      monthlyDetails?.[bulan];

    if (!detail) {
      continue;
    }

    const status =
      normalizeStatus(detail.status);

    const namaBulan =
      detail.nama_bulan ||
      MONTHS.find(
        (month) =>
          month.number === bulan
      )?.name ||
      "";

    if (
      status === "menunggak" ||
      status === "ada tunggakan"
    ) {
      tunggakan.push(namaBulan);
    }

    if (
      status === "belum bayar"
    ) {
      belumBayar.push(namaBulan);
    }
  }

  const parts = [];

  if (tunggakan.length > 0) {
    parts.push(
      `Tunggakan : ${formatMonthList(
        tunggakan
      )}`
    );
  }

  if (belumBayar.length > 0) {
    parts.push(
      `Belum Bayar : ${formatMonthList(
        belumBayar
      )}`
    );
  }

  if (parts.length === 0) {
    return "Tidak ada tunggakan";
  }

  return parts.join(" | ");
}


/* =====================================================
   BUAT MAP DATA JOIN
===================================================== */

export function createJoinMap(
  joinRows
) {
  const joinMap = new Map();

  for (const row of joinRows) {
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

  return joinMap;
}


/* =====================================================
   BUAT MAP STATUS PEMBAYARAN
===================================================== */

export function createStatusMap(
  statusRows
) {
  const statusMap = new Map();

  for (const row of statusRows) {
    if (!Array.isArray(row)) {
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

    if (!statusMap.has(idReg)) {
      statusMap.set(
        idReg,
        {
          id_reg: idReg,
          detail: {},
        }
      );
    }

    const item =
      statusMap.get(idReg);

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

  return statusMap;
}


/* =====================================================
   GABUNGKAN STATUS + DATA JOIN
===================================================== */

export function mergeStatusData({
  statusRows,
  joinRows,
  selectedMonth,
}) {
  const joinMap =
    createJoinMap(joinRows);

  const statusMap =
    createStatusMap(statusRows);

  const mergedData = [];

  for (
    const [
      idReg,
      statusItem,
    ] of statusMap.entries()
  ) {
    const joinItem =
      joinMap.get(idReg) || {};

    const monthlyDetails =
      statusItem.detail || {};

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

      id_reg: idReg,

      detail:
        monthlyDetails,

      status:
        summaryStatus,

      keterangan,

      id_transaksi:
        currentMonthDetail
          .id_transaksi || "",

      id_detail:
        currentMonthDetail
          .id_detail || "",

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
          currentMonthDetail
            .tarif_sewa
        ) || 0,

      tarif_kebersihan:
        Number(
          currentMonthDetail
            .tarif_kebersihan
        ) || 0,

      tarif_keamanan:
        Number(
          currentMonthDetail
            .tarif_keamanan
        ) || 0,
    });
  }

  return mergedData;
}