/* =========================================================
   KUITANSI
========================================================= */

export function buildKuitansi(row) {
  const rincian = row.detail.map((d) => {
    const bruto =
      d.sewa +
      d.kebersihan +
      d.keamanan;

    const diskonNominal =
      Math.round(
        bruto *
          (d.diskon / 100)
      );

    return {
      bulan: d.bulan,
      sewa: d.sewa,
      kebersihan: d.kebersihan,
      keamanan: d.keamanan,
      diskonPersen: d.diskon,
      diskonNominal,
      denda: d.denda,
      total:
        bruto -
        diskonNominal +
        d.denda,
      readonly: true,
    };
  });

  const subtotal =
    rincian.reduce(
      (a, r) => ({
        sewa:
          a.sewa + r.sewa,

        kebersihan:
          a.kebersihan +
          r.kebersihan,

        keamanan:
          a.keamanan +
          r.keamanan,

        diskon:
          a.diskon +
          r.diskonNominal,

        denda:
          a.denda + r.denda,
      }),
      {
        sewa: 0,
        kebersihan: 0,
        keamanan: 0,
        diskon: 0,
        denda: 0,
      }
    );

  return {
    rincian,
    subtotal,
  };
}


/* =========================================================
   FILTER TANGGAL
========================================================= */

export function applyDateFilter(
  data,
  tglAwal,
  tglAkhir
) {
  if (!tglAwal || !tglAkhir) {
    return data;
  }

  const start =
    new Date(tglAwal);

  start.setHours(
    0,
    0,
    0,
    0
  );

  const end =
    new Date(tglAkhir);

  end.setHours(
    23,
    59,
    59,
    999
  );

  /* ---------------------------------------------
     VALIDASI RANGE MAKSIMAL 90 HARI
  --------------------------------------------- */

  const diffHari =
    (end - start) /
    (1000 * 60 * 60 * 24);

  if (
    diffHari < 0 ||
    diffHari > 90
  ) {
    throw new Error(
      "Rentang tanggal maksimal 90 hari"
    );
  }

  return data.filter((r) => {
    if (!r.tanggal_bayar) {
      return false;
    }

    const tglBayar =
      new Date(
        r.tanggal_bayar
      );

    return (
      tglBayar >= start &&
      tglBayar <= end
    );
  });
}


/* =========================================================
   BUILD DATA EXCEL
========================================================= */

export function buildExcelData(
  data
) {
  return data.map(
    (row, index) => {
      const detail =
        Array.isArray(
          row.detail
        )
          ? row.detail
          : [];

      /* ---------------------------------------------
         HITUNG TOTAL KOMPONEN
      --------------------------------------------- */

      const sewa =
        detail.reduce(
          (total, d) =>
            total +
            Number(
              d.sewa || 0
            ),
          0
        );

      const kebersihan =
        detail.reduce(
          (total, d) =>
            total +
            Number(
              d.kebersihan || 0
            ),
          0
        );

      const keamanan =
        detail.reduce(
          (total, d) =>
            total +
            Number(
              d.keamanan || 0
            ),
          0
        );

      const denda =
        detail.reduce(
          (total, d) =>
            total +
            Number(
              d.denda || 0
            ),
          0
        );

      const diskon =
        detail.reduce(
          (total, d) => {
            const bruto =
              Number(
                d.sewa || 0
              ) +
              Number(
                d.kebersihan ||
                  0
              ) +
              Number(
                d.keamanan || 0
              );

            const diskonPersen =
              Number(
                d.diskon || 0
              );

            return (
              total +
              Math.round(
                bruto *
                  (diskonPersen /
                    100)
              )
            );
          },
          0
        );

      /* ---------------------------------------------
         BULAN YANG DIBAYAR
      --------------------------------------------- */

      const bulan =
        detail
          .map(
            (d) =>
              d.bulan
          )
          .filter(Boolean)
          .join(", ");

      /* ---------------------------------------------
         TOTAL DARI DATA TRANSAKSI
         
         Prioritas menggunakan total_bayar
         karena itu merupakan nilai transaksi
         yang sebenarnya dibayarkan.
      --------------------------------------------- */

      const totalBayar =
        Number(
          row.total_bayar || 0
        );

      /* ---------------------------------------------
         RETURN BARIS EXCEL
      --------------------------------------------- */

      return {
        No: index + 1,

        "Nomor Kuitansi":
          row.no_kuitansi ||
          "",

        "Tanggal Bayar":
          row.tanggal_bayar
            ? new Date(
                row.tanggal_bayar
              ).toLocaleDateString(
                "id-ID"
              )
            : "",

        "ID Registrasi":
          row.id_reg || "",

        Nama:
          row.nama_pedagang ||
          "",

        "Jenis Objek":
          row.objek
            ?.jenis_objek ||
          "",

        Tipe:
          row.objek?.tipe ||
          "",

        Lantai:
          row.lantai || "",

        Blok:
          row.blok || "",

        "No. Toko":
          row.no_toko || "",

        Periode:
          row.periode_tahun ||
          "",

        "Bulan Dibayar":
          bulan,

        "Jumlah Bulan":
          row.jumlah_bulan ||
          detail.length ||
          0,

        "Jasa Sewa":
          sewa,

        Kebersihan:
          kebersihan,

        Keamanan:
          keamanan,

        Denda:
          denda,

        Diskon:
          diskon,

        "Total Bayar":
          totalBayar,

        "Metode Bayar":
          row.metode_bayar ||
          "",

        "Status Bayar":
          row.status_bayar ||
          "",

        "Petugas Loket":
          row.nama_petugas ||
          "",
      };
    }
  );
}


/* =========================================================
   EXPORT PDF
========================================================= */

export function handleExportPDF() {
  if (!filteredData.length) {
    alert(
      "Tidak ada data untuk diexport"
    );
    return;
  }

  console.log(
    "EXPORT PDF DATA:",
    filteredData
  );

  // TODO: implement jsPDF
}