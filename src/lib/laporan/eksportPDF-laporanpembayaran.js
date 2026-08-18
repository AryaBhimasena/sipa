/* =========================================================
   lib/laporan/eksportPDF-laporanpembayaran.js

   EXPORT PDF - LAPORAN PEMBAYARAN

   Dependency:
   - jspdf
   - jspdf-autotable

   Install jika belum:
   npm install jspdf jspdf-autotable
========================================================= */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================================================
   KONSTANTA
========================================================= */

const LOGO_PATH =
  "/logo-perumda-banjarmasin.PNG";

/*
 * Ukuran A4 landscape:
 * 297 x 210 mm
 */
const PAGE_MARGIN = 8;

/*
 * Ruang bawah sengaja dibuat cukup besar
 * untuk tanda tangan + footer nomor halaman.
 *
 * Dengan cara ini kita tidak perlu lagi
 * menghitung page-break menggunakan CSS.
 */
const TABLE_BOTTOM_RESERVED = 58;

/* =========================================================
   HELPER UMUM
========================================================= */

/**
 * Format tanggal menjadi DD/MM/YYYY.
 */
function formatTanggalDMY(value) {
  if (!value) {
    return "-";
  }

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return "-";
  }

  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

/**
 * Format angka menjadi Rupiah.
 */
function formatRupiah(value) {
  const number = Number(value) || 0;

  return `Rp ${number.toLocaleString("id-ID")}`;
}

/**
 * Normalisasi teks.
 */
function text(value, fallback = "-") {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return fallback;
  }

  return String(value);
}

/**
 * Membuat nama file aman.
 */
function sanitizeFileName(value) {
  return String(value || "")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

/**
 * Timestamp untuk nama file.
 */
function getTimestamp() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const hour = String(
    now.getHours()
  ).padStart(2, "0");

  const minute = String(
    now.getMinutes()
  ).padStart(2, "0");

  const second = String(
    now.getSeconds()
  ).padStart(2, "0");

  return `${year}${month}${day}-${hour}${minute}${second}`;
}

/* =========================================================
   LOGO
========================================================= */

/**
 * Memuat logo dan mengompresnya menjadi JPEG.
 *
 * Tujuannya agar ukuran PDF tidak terlalu besar.
 */
async function loadCompressedLogo() {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const maxWidth = 600;
      const maxHeight = 600;

      let width = img.naturalWidth;
      let height = img.naturalHeight;

      const scale = Math.min(
        maxWidth / width,
        maxHeight / height,
        1
      );

      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas =
        document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const ctx =
        canvas.getContext("2d");

      ctx.drawImage(
        img,
        0,
        0,
        width,
        height
      );

      resolve(
        canvas.toDataURL(
          "image/jpeg",
          1
        )
      );
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = LOGO_PATH;
  });
}

/* =========================================================
   HEADER PDF
========================================================= */

/**
 * Header laporan.
 *
 * Header akan digambar ulang pada setiap halaman.
 */
function addPdfHeader(
  doc,
  {
    tglAwal,
    tglAkhir,
    logoData,
  }
) {
  const pageWidth =
    doc.internal.pageSize.getWidth();

  const centerX =
    pageWidth / 2;

  /*
   * =======================================================
   * LOGO
   * =======================================================
   */

  if (logoData) {
    doc.addImage(
      logoData,
      "JPEG",
      PAGE_MARGIN,
      7,
      24,
      24,
      undefined,
      "FAST"
    );
  }

  /*
   * =======================================================
   * HEADER TEXT
   * =======================================================
   */

  doc.setTextColor(
    31,
    41,
    55
  );

  /*
   * Nama perusahaan
   */
  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(10);

  doc.text(
    "PERUSAHAAN UMUM DAERAH PASAR BANJARMASIN",
    centerX,
    11,
    {
      align: "center",
    }
  );

  /*
   * Judul
   */
  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.text(
    "Laporan Pembayaran Tarif Jasa Layanan",
    centerX,
    16,
    {
      align: "center",
    }
  );

  /*
   * Lokasi pasar
   */
  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(8);

  doc.text(
    "Pasar Sentra Antasari Banjarmasin",
    centerX,
    21,
    {
      align: "center",
    }
  );

  /*
   * Periode
   */
  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(7);

  doc.text(
    `Periode ${formatTanggalDMY(
      tglAwal
    )} s/d ${formatTanggalDMY(
      tglAkhir
    )}`,
    centerX,
    26,
    {
      align: "center",
    }
  );

  /*
   * Garis pemisah.
   */
  doc.setDrawColor(
    180,
    180,
    180
  );

  doc.setLineWidth(0.25);

  doc.line(
    PAGE_MARGIN,
    31,
    pageWidth - PAGE_MARGIN,
    31
  );
}

/* =========================================================
   FOOTER NOMOR HALAMAN
========================================================= */

function addPdfFooter(doc) {
  const pageCount =
    doc.internal.getNumberOfPages();

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {
    doc.setPage(page);

    /*
     * Garis footer.
     */
    doc.setDrawColor(
      210,
      210,
      210
    );

    doc.setLineWidth(0.2);

    doc.line(
      PAGE_MARGIN,
      pageHeight - 12,
      pageWidth - PAGE_MARGIN,
      pageHeight - 12
    );

    /*
     * Tanggal cetak.
     */
    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(6);

    doc.setTextColor(
      107,
      114,
      128
    );

    doc.text(
      `Dicetak ${formatTanggalDMY(
        new Date()
      )}`,
      PAGE_MARGIN,
      pageHeight - 6
    );

    /*
     * Nomor halaman.
     */
    doc.text(
      `Halaman ${page} dari ${pageCount}`,
      pageWidth - PAGE_MARGIN,
      pageHeight - 6,
      {
        align: "right",
      }
    );
  }
}

/* =========================================================
   FOOTER TANDA TANGAN
========================================================= */

function addSignatureFooter(
  doc,
  {
    user = null,
  } = {}
) {
  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const margin =
    PAGE_MARGIN;

  const availableWidth =
    pageWidth -
    margin * 2;

  const columnWidth =
    availableWidth / 4;

  /*
   * Posisi signature.
   *
   * Karena tabel sudah menggunakan
   * bottom margin 58 mm, area ini
   * selalu tersedia.
   */
  const startY =
    pageHeight - 45;

  const items = [
    {
      title:
        "Petugas Loket",

      name:
        user?.nama ||
        ". . .",

      position:
        user?.jabatan ||
        "Petugas Loket",
    },

    {
      title:
        "Verifikasi",

      name:
        "Helmawan",

      position:
        "Kepala Pasar Zona 2 Antasari",
    },

    {
      title:
        "Verifikasi",

      name:
        "Rizali Hakim",

      position:
        "Manager Operasional",
    },

    {
      title:
        "Mengetahui",

      name:
        "Azhar Budi",

      position:
        "Direktur Operasional & Bisnis",
    },
  ];

  /*
   * Garis pemisah.
   */
  doc.setDrawColor(
    180,
    180,
    180
  );

  doc.setLineWidth(0.25);

  doc.line(
    margin,
    startY - 7,
    pageWidth - margin,
    startY - 7
  );

  items.forEach(
    (item, index) => {
      const centerX =
        margin +
        columnWidth * index +
        columnWidth / 2;

      /*
       * Label.
       */
      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(6.5);

      doc.setTextColor(
        31,
        41,
        55
      );

      doc.text(
        item.title,
        centerX,
        startY,
        {
          align: "center",
        }
      );

      /*
       * Garis tanda tangan.
       */
      const signY =
        startY + 4;

      doc.setDrawColor(
        31,
        41,
        55
      );

      doc.setLineWidth(0.2);

      doc.line(
        centerX - 18,
        signY + 12,
        centerX + 18,
        signY + 12
      );

      /*
       * Nama.
       */
      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(6.5);

      doc.text(
        item.name,
        centerX,
        signY + 17,
        {
          align: "center",
        }
      );

      /*
       * Jabatan.
       */
      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(5.8);

      const positionLines =
        doc.splitTextToSize(
          item.position,
          columnWidth - 4
        );

      doc.text(
        positionLines,
        centerX,
        signY + 21,
        {
          align: "center",
        }
      );
    }
  );
}

/* =========================================================
   DATA
========================================================= */

/**
 * Mengubah satu data pembayaran
 * menjadi row tabel.
 */
function mapPembayaranRow(
  r,
  index
) {
  const details =
    Array.isArray(r?.detail)
      ? r.detail
      : [];

  const bulanBerjalan =
    details
      .map((d) => text(d?.bulan, ""))
      .filter(Boolean)
      .join("\n") || "-";

  const sewa =
    details.reduce(
      (sum, d) =>
        sum + (Number(d?.sewa) || 0),
      0
    );

  const kebersihan =
    details.reduce(
      (sum, d) =>
        sum +
        (Number(d?.kebersihan) || 0),
      0
    );

  const keamanan =
    details.reduce(
      (sum, d) =>
        sum +
        (Number(d?.keamanan) || 0),
      0
    );

  const denda =
    details.reduce(
      (sum, d) =>
        sum +
        (Number(d?.denda) || 0),
      0
    );

  const jumlah =
    details.reduce(
      (sum, d) =>
        sum +
        (Number(d?.total) || 0),
      0
    );

  return [
    /*
     * 0
     */
    String(index + 1),

    /*
     * 1
     */
    formatTanggalDMY(
      r?.tanggal_bayar
    ),

    /*
     * 2
     */
    text(r?.periode_tahun),

    /*
     * 3
     */
    text(r?.nama_petugas),

    /*
     * 4
     */
    text(r?.id_reg),

    /*
     * 5
     */
    text(r?.nama_pedagang),

    /*
     * 6
     */
    text(r?.no_kuitansi),

    /*
     * 7
     */
    bulanBerjalan,

    /*
     * 8
     */
    formatRupiah(sewa),

    /*
     * 9
     */
    formatRupiah(kebersihan),

    /*
     * 10
     */
    formatRupiah(keamanan),

    /*
     * 11
     */
    formatRupiah(denda),

    /*
     * 12
     */
    formatRupiah(jumlah),

    /*
     * 13
     *
     * Tunggakan bulan
     */
    "-",

    /*
     * 14
     */
    formatRupiah(0),

    /*
     * 15
     */
    formatRupiah(0),

    /*
     * 16
     */
    formatRupiah(0),

    /*
     * 17
     */
    formatRupiah(0),

    /*
     * 18
     */
    formatRupiah(0),

    /*
     * 19
     */
    "-",
  ];
}

/* =========================================================
   GRAND TOTAL
========================================================= */

function calculateGrandTotal(
  data
) {
  return data.reduce(
    (acc, r) => {
      const details =
        Array.isArray(r?.detail)
          ? r.detail
          : [];

      acc.sewa +=
        details.reduce(
          (sum, d) =>
            sum +
            (Number(d?.sewa) || 0),
          0
        );

      acc.kebersihan +=
        details.reduce(
          (sum, d) =>
            sum +
            (Number(d?.kebersihan) || 0),
          0
        );

      acc.keamanan +=
        details.reduce(
          (sum, d) =>
            sum +
            (Number(d?.keamanan) || 0),
          0
        );

      acc.denda +=
        details.reduce(
          (sum, d) =>
            sum +
            (Number(d?.denda) || 0),
          0
        );

      acc.jumlah +=
        details.reduce(
          (sum, d) =>
            sum +
            (Number(d?.total) || 0),
          0
        );

      /*
       * Untuk sementara mengikuti
       * desain preview-pdf lama:
       * tunggakan = 0.
       */
      acc.tunggakanSewa += 0;
      acc.tunggakanKebersihan += 0;
      acc.tunggakanKeamanan += 0;
      acc.tunggakanDenda += 0;
      acc.tunggakanJumlah += 0;

      return acc;
    },
    {
      sewa: 0,
      kebersihan: 0,
      keamanan: 0,
      denda: 0,
      jumlah: 0,

      tunggakanSewa: 0,
      tunggakanKebersihan: 0,
      tunggakanKeamanan: 0,
      tunggakanDenda: 0,
      tunggakanJumlah: 0,
    }
  );
}

/* =========================================================
   ROW JUMLAH
========================================================= */

function createGrandTotalRow(
  grandTotal
) {
  return [
    {
      content: "JUMLAH",
      colSpan: 8,
      styles: {
        halign: "left",
        fontStyle: "bold",
      },
    },

    {
      content:
        formatRupiah(
          grandTotal.sewa
        ),
      styles: {
        halign: "right",
        fontStyle: "bold",
      },
    },

    {
      content:
        formatRupiah(
          grandTotal.kebersihan
        ),
      styles: {
        halign: "right",
        fontStyle: "bold",
      },
    },

    {
      content:
        formatRupiah(
          grandTotal.keamanan
        ),
      styles: {
        halign: "right",
        fontStyle: "bold",
      },
    },

    {
      content:
        formatRupiah(
          grandTotal.denda
        ),
      styles: {
        halign: "right",
        fontStyle: "bold",
      },
    },

    {
      content:
        formatRupiah(
          grandTotal.jumlah
        ),
      styles: {
        halign: "right",
        fontStyle: "bold",
      },
    },

    {
      content: "",
      colSpan: 1,
    },

    {
      content:
        formatRupiah(
          grandTotal.tunggakanSewa
        ),
      styles: {
        halign: "right",
        fontStyle: "bold",
      },
    },

    {
      content:
        formatRupiah(
          grandTotal.tunggakanKebersihan
        ),
      styles: {
        halign: "right",
        fontStyle: "bold",
      },
    },

    {
      content:
        formatRupiah(
          grandTotal.tunggakanKeamanan
        ),
      styles: {
        halign: "right",
        fontStyle: "bold",
      },
    },

    {
      content:
        formatRupiah(
          grandTotal.tunggakanDenda
        ),
      styles: {
        halign: "right",
        fontStyle: "bold",
      },
    },

    {
      content:
        formatRupiah(
          grandTotal.tunggakanJumlah
        ),
      styles: {
        halign: "right",
        fontStyle: "bold",
      },
    },

    {
      content: "",
    },
  ];
}

/* =========================================================
   EXPORT PDF
========================================================= */

/**
 * Export Laporan Pembayaran ke PDF.
 *
 * @param {Array} data
 * @param {Object} options
 *
 * options:
 * - tglAwal
 * - tglAkhir
 * - user
 */
export async function exportLaporanPembayaranPDF(
  data = [],
  {
    tglAwal,
    tglAkhir,
    user = null,
  } = {}
) {
  /*
   * Browser only.
   */
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  /*
   * Validasi tanggal.
   */
  if (
    !tglAwal ||
    !tglAkhir
  ) {
    throw new Error(
      "Tanggal awal dan tanggal akhir wajib diisi."
    );
  }

  /*
   * Normalisasi data.
   */
  const rows =
    Array.isArray(data)
      ? data
      : [];

  /*
   * Tidak ada data.
   */
  if (rows.length === 0) {
    throw new Error(
      "Tidak ada data untuk diekspor."
    );
  }

  /* =======================================================
     PDF
  ======================================================= */

  const doc =
    new jsPDF({
      orientation:
        "landscape",

      unit:
        "mm",

      format:
        "a4",

      compress:
        true,
    });

  /*
   * Logo.
   */
  const logoData =
    await loadCompressedLogo();

  /*
   * Grand total seluruh data.
   */
  const grandTotal =
    calculateGrandTotal(
      rows
    );

  /*
   * Body utama.
   */
  const bodyRows =
    rows.map(
      (row, index) =>
        mapPembayaranRow(
          row,
          index
        )
    );

  /*
   * Tambahkan baris JUMLAH
   * sebagai baris terakhir.
   *
   * Dengan cara ini autoTable sendiri
   * yang menentukan halaman terakhir.
   */
  bodyRows.push(
    createGrandTotalRow(
      grandTotal
    )
  );

  /* =======================================================
     TABLE
  ======================================================= */

  autoTable(
    doc,
    {
      /*
       * Header mulai di bawah header laporan.
       */
      startY: 36,

      /*
       * =====================================================
       * HEADER 2 BARIS
       * =====================================================
       */

      head: [
        [
          {
            content: "No",
            rowSpan: 2,
          },

          {
            content: "Tanggal",
            rowSpan: 2,
          },

          {
            content: "Tahun",
            rowSpan: 2,
          },

          {
            content: "Nama Kasir",
            rowSpan: 2,
          },

          {
            content: "No Reg",
            rowSpan: 2,
          },

          {
            content: "Nama Pedagang",
            rowSpan: 2,
          },

          {
            content: "No Kuitansi",
            rowSpan: 2,
          },

          {
            content:
              "Pembayaran Jasa Layanan Berjalan",
            colSpan: 6,
          },

          {
            content:
              "Tunggakan Pembayaran Jasa Layanan",
            colSpan: 6,
          },

          {
            content: "Ket",
            rowSpan: 2,
          },
        ],

        [
          "Bulan Bayar",
          "Jasa Sewa",
          "Jasa Kebersihan",
          "Jasa Keamanan",
          "Denda",
          "Jumlah",

          "Bulan Bayar",
          "Jasa Sewa",
          "Jasa Kebersihan",
          "Jasa Keamanan",
          "Denda",
          "Jumlah",
        ],
      ],

      /*
       * =====================================================
       * BODY
       * =====================================================
       */

      body: bodyRows,

      /*
       * =====================================================
       * TEMA
       * =====================================================
       */

      theme: "grid",

      /*
       * =====================================================
       * STYLE DASAR
       * =====================================================
       */

      styles: {
        font:
          "helvetica",

        fontSize:
          5.3,

        cellPadding:
          1.4,

        lineColor: [
          180,
          180,
          180,
        ],

        lineWidth:
          0.15,

        textColor: [
          31,
          41,
          55,
        ],

        valign:
          "middle",

        overflow:
          "linebreak",

        cellWidth:
          "wrap",
      },

      /*
       * =====================================================
       * HEADER STYLE
       * =====================================================
       */

      headStyles: {
        fillColor: [
          31,
          41,
          55,
        ],

        textColor: [
          255,
          255,
          255,
        ],

        fontStyle:
          "bold",

        fontSize:
          5.5,

        halign:
          "center",

        valign:
          "middle",

        cellPadding:
          1.5,

        lineColor: [
          255,
          255,
          255,
        ],

        lineWidth:
          0.15,
      },

      /*
       * =====================================================
       * KOLOM
       *
       * Total lebar:
       *
       * 7 + 14 + 9 + 18 + 15 + 22 + 17
       * + 15 + (14 x 5)
       * + 15 + (14 x 5)
       * + 9
       *
       * = 281 mm
       *
       * A4 landscape 297 mm
       * margin kiri/kanan 8 mm
       * area tabel = 281 mm
       * =====================================================
       */

      columnStyles: {
        /*
         * No
         */
        0: {
          cellWidth: 7,
          halign: "center",
        },

        /*
         * Tanggal
         */
        1: {
          cellWidth: 14,
          halign: "center",
        },

        /*
         * Tahun
         */
        2: {
          cellWidth: 9,
          halign: "center",
        },

        /*
         * Nama Kasir
         */
        3: {
          cellWidth: 18,
          halign: "left",
        },

        /*
         * No Reg
         */
        4: {
          cellWidth: 15,
          halign: "center",
        },

        /*
         * Nama Pedagang
         */
        5: {
          cellWidth: 22,
          halign: "left",
        },

        /*
         * No Kuitansi
         */
        6: {
          cellWidth: 17,
          halign: "center",
        },

        /*
         * Bulan Berjalan
         */
        7: {
          cellWidth: 15,
          halign: "left",
        },

        /*
         * Uang berjalan
         */
        8: {
          cellWidth: 14,
          halign: "right",
        },

        9: {
          cellWidth: 14,
          halign: "right",
        },

        10: {
          cellWidth: 14,
          halign: "right",
        },

        11: {
          cellWidth: 14,
          halign: "right",
        },

        12: {
          cellWidth: 14,
          halign: "right",
        },

        /*
         * Bulan tunggakan
         */
        13: {
          cellWidth: 15,
          halign: "left",
        },

        /*
         * Uang tunggakan
         */
        14: {
          cellWidth: 14,
          halign: "right",
        },

        15: {
          cellWidth: 14,
          halign: "right",
        },

        16: {
          cellWidth: 14,
          halign: "right",
        },

        17: {
          cellWidth: 14,
          halign: "right",
        },

        18: {
          cellWidth: 14,
          halign: "right",
        },

        /*
         * Keterangan
         */
        19: {
          cellWidth: 9,
          halign: "center",
        },
      },

      /*
       * =====================================================
       * MARGIN
       * =====================================================
       *
       * Bottom 58 mm sengaja disediakan.
       *
       * Jadi tanda tangan tidak perlu lagi
       * melakukan page-break manual.
       */

      margin: {
        top:
          36,

        right:
          PAGE_MARGIN,

        bottom:
          TABLE_BOTTOM_RESERVED,

        left:
          PAGE_MARGIN,
      },

      /*
       * Header tabel otomatis berulang.
       */
      showHead:
        "everyPage",

      /*
       * =====================================================
       * HEADER SETIAP HALAMAN
       * =====================================================
       */

      didDrawPage:
        function () {
          addPdfHeader(
            doc,
            {
              tglAwal,
              tglAkhir,
              logoData,
            }
          );
        },

      /*
       * =====================================================
       * STYLE PER CELL
       * =====================================================
       */

      didParseCell:
        function (
          hookData
        ) {
          /*
           * Hanya body.
           */
          if (
            hookData.section !==
            "body"
          ) {
            return;
          }

          /*
           * Baris terakhir =
           * JUMLAH.
           */
          const isGrandTotal =
            hookData.row.index ===
            bodyRows.length - 1;

          if (isGrandTotal) {
            hookData.cell.styles.fillColor =
              [
                241,
                245,
                249,
              ];

            hookData.cell.styles.fontStyle =
              "bold";

            hookData.cell.styles.lineWidth =
              0.25;

            return;
          }

          /*
           * Kolom nominal.
           */
          if (
            hookData.column.index >= 8 &&
            hookData.column.index <= 18
          ) {
            hookData.cell.styles.halign =
              "right";
          }

          /*
           * Nomor.
           */
          if (
            hookData.column.index ===
            0
          ) {
            hookData.cell.styles.halign =
              "center";
          }
        },
    }
  );

  /* =======================================================
     TANDA TANGAN
  ======================================================= */

  /*
   * Karena margin.bottom tabel sudah menyediakan
   * ruang sekitar 58 mm, baris JUMLAH dan tabel
   * tidak akan masuk ke area tanda tangan.
   *
   * autoTable otomatis sudah berada pada halaman
   * terakhir saat proses ini selesai.
   */

  const lastPage =
    doc.internal.getNumberOfPages();

  doc.setPage(
    lastPage
  );

  addSignatureFooter(
    doc,
    {
      user,
    }
  );

  /* =======================================================
     FOOTER
  ======================================================= */

  addPdfFooter(
    doc
  );

  /* =======================================================
     FILE
  ======================================================= */

  const fileName =
    `Laporan-Pembayaran-${sanitizeFileName(
      formatTanggalDMY(
        tglAwal
      )
    )}-sampai-${sanitizeFileName(
      formatTanggalDMY(
        tglAkhir
      )
    )}-${getTimestamp()}.pdf`;

  doc.save(
    fileName
  );
}

/* =========================================================
   EXPORT DEFAULT
========================================================= */

export default {
  exportLaporanPembayaranPDF,
};