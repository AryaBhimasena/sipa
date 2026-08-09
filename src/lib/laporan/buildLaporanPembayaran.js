// ==========================================================
// BUILD LAPORAN PEMBAYARAN
// Dipakai oleh:
// - Preview PDF
// - Export PDF
// - Export Excel
// ==========================================================

export const DEFAULT_ROWS_PER_PAGE = 15;

// ==========================================================
// FORMAT SATU BARIS TRANSAKSI
// ==========================================================

function buildRow(row, index) {
  const details = row.detail || [];

  const bulanBerjalan = details.map((d) => d.bulan).join("\n");

  const sewa = details.reduce((s, d) => s + (d.sewa || 0), 0);

  const kebersihan = details.reduce(
    (s, d) => s + (d.kebersihan || 0),
    0
  );

  const keamanan = details.reduce(
    (s, d) => s + (d.keamanan || 0),
    0
  );

  const denda = details.reduce(
    (s, d) => s + (d.denda || 0),
    0
  );

  const jumlah = details.reduce(
    (s, d) => s + (d.total || 0),
    0
  );

  return {
    no: index + 1,

    tanggal: row.tanggal_bayar,
    tahun: row.periode_tahun,

    kasir: row.nama_petugas,

    idReg: row.id_reg,

    pedagang: row.nama_pedagang,

    kuitansi: row.no_kuitansi,

    berjalan: {
      bulan: bulanBerjalan,

      sewa,

      kebersihan,

      keamanan,

      denda,

      jumlah,
    },

    tunggakan: {
      bulan: "",

      sewa: 0,

      kebersihan: 0,

      keamanan: 0,

      denda: 0,

      jumlah: 0,
    },

    keterangan: "-",
  };
}

// ==========================================================
// GRAND TOTAL
// ==========================================================

function buildGrandTotal(rows) {
  return rows.reduce(
    (acc, row) => {
      acc.berjalan.sewa += row.berjalan.sewa;
      acc.berjalan.kebersihan += row.berjalan.kebersihan;
      acc.berjalan.keamanan += row.berjalan.keamanan;
      acc.berjalan.denda += row.berjalan.denda;
      acc.berjalan.jumlah += row.berjalan.jumlah;

      acc.tunggakan.sewa += row.tunggakan.sewa;
      acc.tunggakan.kebersihan += row.tunggakan.kebersihan;
      acc.tunggakan.keamanan += row.tunggakan.keamanan;
      acc.tunggakan.denda += row.tunggakan.denda;
      acc.tunggakan.jumlah += row.tunggakan.jumlah;

      return acc;
    },
    {
      berjalan: {
        sewa: 0,
        kebersihan: 0,
        keamanan: 0,
        denda: 0,
        jumlah: 0,
      },

      tunggakan: {
        sewa: 0,
        kebersihan: 0,
        keamanan: 0,
        denda: 0,
        jumlah: 0,
      },
    }
  );
}

// ==========================================================
// PAGINATION
// ==========================================================

function buildPages(rows, rowsPerPage) {
  const pages = [];

  for (let i = 0; i < rows.length; i += rowsPerPage) {
    pages.push(rows.slice(i, i + rowsPerPage));
  }

  return pages;
}

// ==========================================================
// MAIN BUILDER
// ==========================================================

export function buildLaporanData(
  data,
  rowsPerPage = DEFAULT_ROWS_PER_PAGE
) {
  const rows = data.map((row, index) =>
    buildRow(row, index)
  );

  const grandTotal = buildGrandTotal(rows);

  const pages = buildPages(rows, rowsPerPage);

  return {
    rows,

    pages,

    grandTotal,

    pageCount: pages.length,

    rowCount: rows.length,

    rowsPerPage,
  };
}