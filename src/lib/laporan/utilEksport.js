/* =========================================================
   lib/laporan/utilEksport.js

   HELPER EXPORT STATUS PEMBAYARAN

   Dependency:
   - jspdf
   - jspdf-autotable
   - xlsx

   Install:
   npm install jspdf jspdf-autotable xlsx
========================================================= */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/* =========================================================
   KONSTANTA
========================================================= */

const MONTHS = [
  {
    number: 1,
    name: "Januari",
  },
  {
    number: 2,
    name: "Februari",
  },
  {
    number: 3,
    name: "Maret",
  },
  {
    number: 4,
    name: "April",
  },
  {
    number: 5,
    name: "Mei",
  },
  {
    number: 6,
    name: "Juni",
  },
  {
    number: 7,
    name: "Juli",
  },
  {
    number: 8,
    name: "Agustus",
  },
  {
    number: 9,
    name: "September",
  },
  {
    number: 10,
    name: "Oktober",
  },
  {
    number: 11,
    name: "November",
  },
  {
    number: 12,
    name: "Desember",
  },
];

const LOGO_PATH =
  "/logo-perumda-banjarmasin.PNG";

/* =========================================================
   HELPER UMUM
========================================================= */

/**
 * Format angka menjadi Rupiah.
 */
function formatRupiah(value) {
  const number =
    Number(value) || 0;

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  ).format(number);
}

/**
 * Format tanggal menjadi tanggal Indonesia.
 */
function formatTanggal(value) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
}

/**
 * Ambil nama bulan berdasarkan nomor.
 */
function getMonthName(
  monthNumber
) {
  return (
    MONTHS.find(
      (month) =>
        month.number ===
        Number(monthNumber)
    )?.name || "-"
  );
}

/**
 * Normalisasi nilai teks.
 */
function text(
  value,
  fallback = "-"
) {
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
 * Mendapatkan periode laporan.
 */
function getPeriodLabel(
  selectedYear,
  selectedMonth
) {
  const monthName =
    getMonthName(
      selectedMonth
    );

  return `Januari - ${monthName} ${selectedYear}`;
}

/**
 * Membuat nama file yang aman.
 */
function sanitizeFileName(
  value
) {
  return String(value || "")
    .replace(
      /[<>:"/\\|?*\x00-\x1F]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .trim();
}

/**
 * Membuat timestamp sederhana.
 */
function getTimestamp() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  const hour =
    String(
      now.getHours()
    ).padStart(2, "0");

  const minute =
    String(
      now.getMinutes()
    ).padStart(2, "0");

  const second =
    String(
      now.getSeconds()
    ).padStart(2, "0");

  return `${year}${month}${day}-${hour}${minute}${second}`;
}

/* =========================================================
   HELPER LOGO PDF
========================================================= */

/**
 * Mengambil logo dari folder public
 * dan mengubahnya menjadi Data URL.
 */
async function loadImageAsDataURL(
  src
) {
  const response =
    await fetch(src);

  if (!response.ok) {
    throw new Error(
      `Gagal memuat logo: ${src}`
    );
  }

  const blob =
    await response.blob();

  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onloadend =
        () => {
          resolve(
            reader.result
          );
        };

      reader.onerror =
        reject;

      reader.readAsDataURL(
        blob
      );
    }
  );
}

/* =========================================================
   PDF - LOGO
========================================================= */

async function loadCompressedLogo() {
  return new Promise(
    (resolve) => {
      const img =
        new Image();

      img.onload = () => {
        const maxWidth = 300;
        const maxHeight = 300;

        let width =
          img.naturalWidth;

        let height =
          img.naturalHeight;

        /*
         * Resize logo agar tidak membawa
         * resolusi asli yang terlalu besar.
         */
        const scale =
          Math.min(
            maxWidth / width,
            maxHeight / height,
            1
          );

        width =
          Math.round(
            width * scale
          );

        height =
          Math.round(
            height * scale
          );

        const canvas =
          document.createElement(
            "canvas"
          );

        canvas.width =
          width;

        canvas.height =
          height;

        const ctx =
          canvas.getContext(
            "2d"
          );

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        /*
         * JPEG jauh lebih kecil daripada PNG
         * untuk kebutuhan PDF laporan.
         */
        resolve(
          canvas.toDataURL(
            "image/jpeg",
            0.75
          )
        );
      };

      img.onerror = () => {
        resolve(null);
      };

      img.src =
        "/logo-perumda-banjarmasin.PNG";
    }
  );
}

/* =========================================================
   DATA MAPPING
========================================================= */

/**
 * Mengubah satu item status pembayaran
 * menjadi row laporan utama.
 */
function mapStatusRow(
  item
) {
  return [
    text(item?.id_reg),
    text(item?.nama),
    text(
      item?.objek?.jenis
    ),
    text(
      item?.objek?.tipe
    ),
    text(item?.lantai),
    text(item?.blok),
    text(item?.no),
    text(item?.status),
    text(
      item?.keterangan
    ),
  ];
}

/**
 * Membuat data detail bulanan.
 */
function createDetailRows(
  item,
  selectedMonth
) {
  const rows = [];

  for (
    let monthNumber = 1;
    monthNumber <=
    Number(
      selectedMonth || 12
    );
    monthNumber++
  ) {
    const monthName =
      getMonthName(
        monthNumber
      );

    const detail =
      item?.detail?.[
        monthNumber
      ];

    rows.push({
      bulan:
        monthName,

      status:
        detail?.status ||
        "-",

      tarif_sewa:
        Number(
          detail?.tarif_sewa
        ) || 0,

      tarif_keamanan:
        Number(
          detail?.tarif_keamanan
        ) || 0,

      tarif_kebersihan:
        Number(
          detail?.tarif_kebersihan
        ) || 0,

      total:
        Number(
          detail?.total
        ) || 0,

      denda:
        Number(
          detail?.denda
        ) || 0,

      diskon:
        Number(
          detail?.diskon
        ) || 0,

      id_transaksi:
        detail?.id_transaksi ||
        "",

      id_detail:
        detail?.id_detail ||
        "",

      created_at:
        detail?.created_at ||
        null,
    });
  }

  return rows;
}

/* =========================================================
   PDF - COMMON HEADER
========================================================= */

/**
 * Membuat header laporan PDF.
 *
 * Logo:
 * - tetap di sebelah kiri
 *
 * Teks:
 * - center terhadap halaman
 */
async function addPdfHeader(
  doc,
  {
    period,
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
      14,
      12,
      22,
      22,
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

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(13);

  doc.text(
    "PERUSAHAAN UMUM DAERAH PASAR BANJARMASIN",
    centerX,
    15,
    {
      align: "center",
    }
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(10);

  doc.text(
    "Laporan Pembayaran Tarif Jasa Layanan",
    centerX,
    21,
    {
      align: "center",
    }
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(10);

  doc.text(
    "Pasar Sentra Antasari Banjarmasin",
    centerX,
    27,
    {
      align: "center",
    }
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);

  doc.text(
    `Periode ${period}`,
    centerX,
    33,
    {
      align: "center",
    }
  );

  /*
   * Garis pemisah
   */
  doc.setDrawColor(
    180,
    180,
    180
  );

  doc.setLineWidth(
    0.3
  );

  doc.line(
    14,
    38,
    pageWidth - 14,
    38
  );

  return 44;
}

/* =========================================================
   PDF - FOOTER NOMOR HALAMAN
========================================================= */

/**
 * Footer standar setiap halaman.
 */
function addPdfFooter(
  doc
) {
  const pageCount =
    doc.internal.getNumberOfPages();

  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {
    doc.setPage(page);

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    /* Garis footer */
    doc.setDrawColor(
      229,
      231,
      235
    );

    doc.setLineWidth(
      0.2
    );

    doc.line(
      14,
      pageHeight - 14,
      pageWidth - 14,
      pageHeight - 14
    );

    /* Tanggal cetak */
    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(
      7
    );

    doc.setTextColor(
      107,
      114,
      128
    );

    doc.text(
      `Dicetak ${formatTanggal(
        new Date()
      )}`,
      14,
      pageHeight - 8
    );

    /* Nomor halaman */
    doc.text(
      `Halaman ${page} dari ${pageCount}`,
      pageWidth - 14,
      pageHeight - 8,
      {
        align:
          "right",
      }
    );
  }
}

/* =========================================================
   PDF - FOOTER TANDA TANGAN
========================================================= */

/**
 * Membuat footer tanda tangan pada halaman terakhir.
 *
 * Struktur:
 *
 * Petugas Loket | Verifikasi | Verifikasi | Mengetahui
 */
/* =========================================================
   PDF - SIGNATURE FOOTER
========================================================= */

function addSignatureFooter(
  doc,
  {
    user,
  } = {}
) {
  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const margin =
    14;

  const availableWidth =
    pageWidth -
    margin * 2;

  const columnWidth =
    availableWidth / 4;

  const startY =
    pageHeight - 48;

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
   * Garis pemisah sebelum tanda tangan
   */
  doc.setDrawColor(
    180,
    180,
    180
  );

  doc.setLineWidth(
    0.3
  );

  doc.line(
    margin,
    startY - 8,
    pageWidth - margin,
    startY - 8
  );

  items.forEach(
    (
      item,
      index
    ) => {
      const centerX =
        margin +
        columnWidth *
          index +
        columnWidth / 2;

      /*
       * Label
       */
      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(8);

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
       * Ruang tanda tangan
       */
      const signY =
        startY + 5;

      doc.setDrawColor(
        31,
        41,
        55
      );

      doc.setLineWidth(
        0.2
      );

      doc.line(
        centerX - 18,
        signY + 15,
        centerX + 18,
        signY + 15
      );

      /*
       * Nama
       */
      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(8);

      doc.text(
        item.name,
        centerX,
        signY + 21,
        {
          align: "center",
        }
      );

      /*
       * Jabatan
       */
      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(7);

      const positionLines =
        doc.splitTextToSize(
          item.position,
          columnWidth - 6
        );

      doc.text(
        positionLines,
        centerX,
        signY + 26,
        {
          align: "center",
        }
      );
    }
  );
}

/* =========================================================
   PDF - STATUS PEMBAYARAN
========================================================= */

/**
 * Export seluruh hasil filter ke PDF.
 *
 * @param {Array} data
 * @param {Object} options
 * @param {Number} options.selectedYear
 * @param {Number} options.selectedMonth
 * @param {Object} options.user
 */
export async function exportStatusPembayaranPDF(
  data = [],
  {
    selectedYear,
    selectedMonth,
    user = null,
  } = {}
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const rows =
    Array.isArray(data)
      ? data
      : [];

  const doc =
    new jsPDF({
      orientation:
        "landscape",

      unit:
        "mm",

      format:
        "a4",
    });

  const period =
    getPeriodLabel(
      selectedYear,
      selectedMonth
    );

  /* =========================================
     HEADER
  ========================================= */

const logoData =
  await loadCompressedLogo();

const startY =
  await addPdfHeader(
    doc,
    {
      period,
      logoData,
    }
  );

  /* =========================================
     INFORMASI DATA
  ========================================= */

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(
    8
  );

  doc.setTextColor(
    75,
    85,
    99
  );

  doc.text(
    `Jumlah data: ${rows.length} penyewa`,
    14,
    startY
  );

  /* =========================================
     TABEL
  ========================================= */

  autoTable(
    doc,
    {
      startY:
        startY + 5,

      head: [
        [
          "ID Reg",
          "Nama",
          "Objek",
          "Type",
          "Lantai",
          "Blok",
          "No",
          "Status",
          "Keterangan",
        ],
      ],

      body:
        rows.map(
          mapStatusRow
        ),

      theme:
        "grid",

      styles: {
        font:
          "helvetica",

        fontSize:
          7.5,

        cellPadding:
          2.5,

        lineColor: [
          229,
          231,
          235,
        ],

        lineWidth:
          0.1,

        textColor: [
          31,
          41,
          55,
        ],

        valign:
          "middle",
      },

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

        halign:
          "center",

        valign:
          "middle",

        lineColor: [
          31,
          41,
          55,
        ],
      },

      alternateRowStyles: {
        fillColor: [
          248,
          250,
          252,
        ],
      },

      columnStyles: {
        0: {
          cellWidth:
            27,

          fontStyle:
            "bold",
        },

        1: {
          cellWidth:
            45,
        },

        2: {
          cellWidth:
            24,
        },

        3: {
          cellWidth:
            25,
        },

        4: {
          cellWidth:
            18,

          halign:
            "center",
        },

        5: {
          cellWidth:
            18,

          halign:
            "center",
        },

        6: {
          cellWidth:
            15,

          halign:
            "center",
        },

        7: {
          cellWidth:
            35,

          halign:
            "center",

          fontStyle:
            "bold",
        },

        8: {
          cellWidth:
            "auto",
        },
      },

      didParseCell:
        function (
          hookData
        ) {
          if (
            hookData.section !==
            "body"
          ) {
            return;
          }

          if (
            hookData.column.index ===
            7
          ) {
            const value =
              String(
                hookData.cell
                  .raw || ""
              ).toLowerCase();

            if (
              value.includes(
                "sudah"
              )
            ) {
              hookData.cell.styles.textColor =
                [
                  22,
                  101,
                  52,
                ];
            } else if (
              value.includes(
                "belum"
              )
            ) {
              hookData.cell.styles.textColor =
                [
                  180,
                  83,
                  9,
                ];
            } else if (
              value.includes(
                "tunggakan"
              )
            ) {
              hookData.cell.styles.textColor =
                [
                  185,
                  28,
                  28,
                ];
            }
          }
        },

      margin: {
        top:
          14,

        right:
          14,

        bottom:
          22,

        left:
          14,
      },

      showHead:
        "everyPage",
    }
  );

  /* =========================================
     TANDA TANGAN
  ========================================= */

const finalY =
  doc.lastAutoTable.finalY;

const pageHeight =
  doc.internal.pageSize.getHeight();

const requiredFooterHeight = 42;

if (
  finalY +
    requiredFooterHeight >
  pageHeight - 12
) {
  doc.addPage();

  /*
   * Header tetap ditampilkan
   * pada halaman tanda tangan.
   */
  await addPdfHeader(
    doc,
    {
      period,
      logoData,
    }
  );
}

addSignatureFooter(
  doc,
  {
    user,
  }
);

  /* =========================================
     FOOTER NOMOR HALAMAN
  ========================================= */

  addPdfFooter(
    doc
  );

  /* =========================================
     FILE
  ========================================= */

  const fileName =
    `Status-Pembayaran-${sanitizeFileName(
      period
    )}-${getTimestamp()}.pdf`;

  doc.save(
    fileName
  );
}

/* =========================================================
   EXCEL - STATUS PEMBAYARAN
========================================================= */

/**
 * Export seluruh hasil filter ke Excel.
 */
export function exportStatusPembayaranExcel(
  data = [],
  {
    selectedYear,
    selectedMonth,
    user = null,
  } = {}
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const rows =
    Array.isArray(data)
      ? data
      : [];

  const period =
    getPeriodLabel(
      selectedYear,
      selectedMonth
    );

  const worksheetData =
    [];

  worksheetData.push([
    "STATUS PEMBAYARAN",
  ]);

  worksheetData.push([
    "PERUSAHAAN UMUM DAERAH PASAR BANJARMASIN",
  ]);

  worksheetData.push([
    "Laporan Pembayaran Tarif Jasa Layanan",
  ]);

  worksheetData.push([
    "Pasar Sentra Antasari Banjarmasin",
  ]);

  worksheetData.push([
    "Periode",
    period,
  ]);

  worksheetData.push([
    "Jumlah Data",
    rows.length,
  ]);

  worksheetData.push([]);

  worksheetData.push([
    "ID Reg",
    "Nama",
    "Objek",
    "Type",
    "Lantai",
    "Blok",
    "No",
    "Status",
    "Keterangan",
  ]);

  rows.forEach(
    (item) => {
      worksheetData.push(
        mapStatusRow(
          item
        )
      );
    }
  );

  /* =========================================
     FOOTER TANDA TANGAN EXCEL
  ========================================= */

  worksheetData.push([]);

  worksheetData.push([]);

  worksheetData.push([
    "Petugas Loket",
    "",
    "",
    "Verifikasi",
    "",
    "Verifikasi",
    "",
    "Mengetahui",
  ]);

  worksheetData.push([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  worksheetData.push([
    user?.nama ||
      ". . .",
    "",
    "",
    "Helmawan",
    "",
    "Rizali Hakim",
    "",
    "Azhar Budi",
  ]);

  worksheetData.push([
    user?.jabatan ||
      "Petugas Loket",
    "",
    "",
    "Kepala Pasar Zona 2 Antasari",
    "",
    "Manager Operasional",
    "",
    "Direktur Operasional & Bisnis",
  ]);

  const worksheet =
    XLSX.utils.aoa_to_sheet(
      worksheetData
    );

  /* =========================================
     COLUMN WIDTH
  ========================================= */

  worksheet["!cols"] =
    [
      {
        wch: 18,
      },
      {
        wch: 30,
      },
      {
        wch: 15,
      },
      {
        wch: 18,
      },
      {
        wch: 12,
      },
      {
        wch: 10,
      },
      {
        wch: 10,
      },
      {
        wch: 22,
      },
      {
        wch: 45,
      },
    ];

  /* =========================================
     MERGE TITLE
  ========================================= */

  worksheet["!merges"] =
    [
      {
        s: {
          r: 0,
          c: 0,
        },
        e: {
          r: 0,
          c: 8,
        },
      },

      {
        s: {
          r: 1,
          c: 0,
        },
        e: {
          r: 1,
          c: 8,
        },
      },

      {
        s: {
          r: 2,
          c: 0,
        },
        e: {
          r: 2,
          c: 8,
        },
      },

      {
        s: {
          r: 3,
          c: 0,
        },
        e: {
          r: 3,
          c: 8,
        },
      },
    ];

  const signatureStartRow =
    worksheetData.length - 4;

  worksheet["!merges"].push(
    {
      s: {
        r:
          signatureStartRow,
        c: 0,
      },
      e: {
        r:
          signatureStartRow,
        c: 2,
      },
    },
    {
      s: {
        r:
          signatureStartRow,
        c: 3,
      },
      e: {
        r:
          signatureStartRow,
        c: 4,
      },
    },
    {
      s: {
        r:
          signatureStartRow,
        c: 5,
      },
      e: {
        r:
          signatureStartRow,
        c: 6,
      },
    },
    {
      s: {
        r:
          signatureStartRow,
        c: 7,
      },
      e: {
        r:
          signatureStartRow,
        c: 8,
      },
    }
  );

  /* =========================================
     WORKBOOK
  ========================================= */

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Status Pembayaran"
  );

  /* =========================================
     FILE
  ========================================= */

  const fileName =
    `Status-Pembayaran-${sanitizeFileName(
      period
    )}-${getTimestamp()}.xlsx`;

  XLSX.writeFile(
    workbook,
    fileName
  );
}

/* =========================================================
   PDF - DETAIL STATUS PEMBAYARAN
========================================================= */

/**
 * Export detail satu penyewa ke PDF.
 */
export async function exportDetailStatusPembayaranPDF(
  item,
  {
    selectedYear,
    selectedMonth,
    user = null,
  } = {}
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  if (!item) {
    return;
  }

  const doc =
    new jsPDF({
      orientation:
        "portrait",

      unit:
        "mm",

      format:
        "a4",
    });

  const period =
    getPeriodLabel(
      selectedYear,
      selectedMonth
    );

  /* =========================================
     HEADER
  ========================================= */

  const startY =
    await addPdfHeader(
      doc,
      {
        period,
      }
    );

  /* =========================================
     INFORMASI PENYEWA
  ========================================= */

  const infoStartY =
    startY + 5;

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    9
  );

  doc.setTextColor(
    31,
    41,
    55
  );

  doc.text(
    "Informasi Penyewa",
    14,
    infoStartY
  );

  const infoRows =
    [
      [
        "ID Reg",
        text(
          item.id_reg
        ),
        "Nama",
        text(
          item.nama
        ),
      ],

      [
        "Objek",
        text(
          item.objek?.jenis
        ),
        "Type",
        text(
          item.objek?.tipe
        ),
      ],

      [
        "Lantai",
        text(
          item.lantai
        ),
        "Blok",
        text(
          item.blok
        ),
      ],

      [
        "No",
        text(
          item.no
        ),
        "Status",
        text(
          item.status
        ),
      ],
    ];

  autoTable(
    doc,
    {
      startY:
        infoStartY + 4,

      body:
        infoRows,

      theme:
        "grid",

      styles: {
        font:
          "helvetica",

        fontSize:
          8,

        cellPadding:
          2.5,

        lineColor: [
          229,
          231,
          235,
        ],

        lineWidth:
          0.1,

        textColor: [
          31,
          41,
          55,
        ],
      },

      columnStyles: {
        0: {
          cellWidth:
            23,

          fontStyle:
            "bold",

          fillColor: [
            248,
            250,
            252,
          ],
        },

        1: {
          cellWidth:
            55,
        },

        2: {
          cellWidth:
            23,

          fontStyle:
            "bold",

          fillColor: [
            248,
            250,
            252,
          ],
        },

        3: {
          cellWidth:
            "auto",
        },
      },

      margin: {
        left:
          14,

        right:
          14,
      },
    }
  );

  /* =========================================
     KETERANGAN
  ========================================= */

  const afterInfoY =
    doc.lastAutoTable.finalY +
    8;

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    9
  );

  doc.text(
    "Keterangan",
    14,
    afterInfoY
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(
    8
  );

  doc.setTextColor(
    75,
    85,
    99
  );

  const keteranganLines =
    doc.splitTextToSize(
      text(
        item.keterangan
      ),
      180
    );

  doc.text(
    keteranganLines,
    14,
    afterInfoY + 5
  );

  /* =========================================
     TABEL DETAIL BULANAN
  ========================================= */

  const detailStartY =
    afterInfoY +
    5 +
    keteranganLines.length *
      4 +
    7;

  const detailRows =
    createDetailRows(
      item,
      selectedMonth
    );

  autoTable(
    doc,
    {
      startY:
        detailStartY,

      head: [
        [
          "Bulan",
          "Status Bayar",
          "Tarif Sewa",
          "Tarif Keamanan",
          "Tarif Kebersihan",
        ],
      ],

      body:
        detailRows.map(
          (row) => [
            row.bulan,

            row.status,

            formatRupiah(
              row.tarif_sewa
            ),

            formatRupiah(
              row.tarif_keamanan
            ),

            formatRupiah(
              row.tarif_kebersihan
            ),
          ]
        ),

      theme:
        "grid",

      styles: {
        font:
          "helvetica",

        fontSize:
          8,

        cellPadding:
          2.5,

        lineColor: [
          229,
          231,
          235,
        ],

        lineWidth:
          0.1,

        textColor: [
          31,
          41,
          55,
        ],

        valign:
          "middle",
      },

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

        halign:
          "center",
      },

      alternateRowStyles: {
        fillColor: [
          248,
          250,
          252,
        ],
      },

      columnStyles: {
        0: {
          cellWidth:
            28,
        },

        1: {
          cellWidth:
            38,

          halign:
            "center",
        },

        2: {
          cellWidth:
            38,

          halign:
            "right",
        },

        3: {
          cellWidth:
            38,

          halign:
            "right",
        },

        4: {
          cellWidth:
            "auto",

          halign:
            "right",
        },
      },

      didParseCell:
        function (
          hookData
        ) {
          if (
            hookData.section !==
            "body"
          ) {
            return;
          }

          if (
            hookData.column.index ===
            1
          ) {
            const value =
              String(
                hookData.cell
                  .raw || ""
              ).toLowerCase();

            if (
              value.includes(
                "sudah"
              )
            ) {
              hookData.cell.styles.textColor =
                [
                  22,
                  101,
                  52,
                ];
            } else if (
              value.includes(
                "belum"
              )
            ) {
              hookData.cell.styles.textColor =
                [
                  180,
                  83,
                  9,
                ];
            } else if (
              value.includes(
                "tunggakan"
              )
            ) {
              hookData.cell.styles.textColor =
                [
                  185,
                  28,
                  28,
                ];
            }
          }
        },

      margin: {
        top:
          14,

        right:
          14,

        bottom:
          18,

        left:
          14,
      },

      showHead:
        "everyPage",
    }
  );

  /* =========================================
     TANDA TANGAN DETAIL
  ========================================= */

  let lastY =
    doc.lastAutoTable.finalY;

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const signatureHeight =
    52;

  const footerReserved =
    18;

  if (
    lastY +
      signatureHeight +
      footerReserved >
    pageHeight
  ) {
    doc.addPage();

    await addPdfHeader(
      doc,
      {
        period,
      }
    );
  }

  addSignatureFooter(
    doc,
    {
      user,
    }
  );

  /* =========================================
     FOOTER
  ========================================= */

  addPdfFooter(
    doc
  );

  /* =========================================
     FILE
  ========================================= */

  const fileName =
    `Detail-Pembayaran-${sanitizeFileName(
      item.id_reg
    )}-${sanitizeFileName(
      item.nama
    )}-${getTimestamp()}.pdf`;

  doc.save(
    fileName
  );
}

/* =========================================================
   EXCEL - DETAIL STATUS PEMBAYARAN
========================================================= */

/**
 * Export detail satu penyewa ke Excel.
 */
export function exportDetailStatusPembayaranExcel(
  item,
  {
    selectedYear,
    selectedMonth,
    user = null,
  } = {}
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  if (!item) {
    return;
  }

  const period =
    getPeriodLabel(
      selectedYear,
      selectedMonth
    );

  const worksheetData =
    [];

  /* =========================================
     TITLE
  ========================================= */

  worksheetData.push([
    "DETAIL PEMBAYARAN",
  ]);

  worksheetData.push([
    "PERUSAHAAN UMUM DAERAH PASAR BANJARMASIN",
  ]);

  worksheetData.push([
    "Laporan Pembayaran Tarif Jasa Layanan",
  ]);

  worksheetData.push([
    "Pasar Sentra Antasari Banjarmasin",
  ]);

  worksheetData.push([
    "Periode",
    period,
  ]);

  worksheetData.push([
    `${text(
      item.id_reg
    )} — ${text(
      item.nama
    )}`,
  ]);

  worksheetData.push([]);

  /* =========================================
     INFORMASI PENYEWA
  ========================================= */

  worksheetData.push([
    "INFORMASI PENYEWA",
  ]);

  worksheetData.push([
    "ID Reg",
    text(
      item.id_reg
    ),
    "Nama",
    text(
      item.nama
    ),
  ]);

  worksheetData.push([
    "Objek",
    text(
      item.objek?.jenis
    ),
    "Type",
    text(
      item.objek?.tipe
    ),
  ]);

  worksheetData.push([
    "Lantai",
    text(
      item.lantai
    ),
    "Blok",
    text(
      item.blok
    ),
  ]);

  worksheetData.push([
    "No",
    text(
      item.no
    ),
    "Status",
    text(
      item.status
    ),
  ]);

  worksheetData.push([
    "Keterangan",
    text(
      item.keterangan
    ),
  ]);

  worksheetData.push([]);

  /* =========================================
     DETAIL BULANAN
  ========================================= */

  worksheetData.push([
    "DETAIL PEMBAYARAN BULANAN",
  ]);

  worksheetData.push([
    "Bulan",
    "Status Bayar",
    "Tarif Sewa",
    "Tarif Keamanan",
    "Tarif Kebersihan",
    "Denda",
    "Diskon",
    "Total",
    "ID Transaksi",
    "ID Detail",
    "Tanggal Dibuat",
  ]);

  const detailRows =
    createDetailRows(
      item,
      selectedMonth
    );

  detailRows.forEach(
    (row) => {
      worksheetData.push([
        row.bulan,

        row.status,

        row.tarif_sewa,

        row.tarif_keamanan,

        row.tarif_kebersihan,

        row.denda,

        row.diskon,

        row.total,

        row.id_transaksi,

        row.id_detail,

        row.created_at
          ? formatTanggal(
              row.created_at
            )
          : "-",
      ]);
    }
  );

  /* =========================================
     FOOTER TANDA TANGAN
  ========================================= */

  worksheetData.push([]);

  worksheetData.push([]);

  worksheetData.push([
    "Petugas Loket",
    "",
    "",
    "Verifikasi",
    "",
    "Verifikasi",
    "",
    "Mengetahui",
  ]);

  worksheetData.push([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  worksheetData.push([
    user?.nama ||
      ". . .",

    "",
    "",

    "Helmawan",

    "",

    "Rizali Hakim",

    "",

    "Azhar Budi",
  ]);

  worksheetData.push([
    user?.jabatan ||
      "Petugas Loket",

    "",
    "",

    "Kepala Pasar Zona 2 Antasari",

    "",

    "Manager Operasional",

    "",

    "Direktur Operasional & Bisnis",
  ]);

  /* =========================================
     WORKSHEET
  ========================================= */

  const worksheet =
    XLSX.utils.aoa_to_sheet(
      worksheetData
    );

  /* =========================================
     COLUMN WIDTH
  ========================================= */

  worksheet["!cols"] =
    [
      {
        wch: 16,
      },
      {
        wch: 24,
      },
      {
        wch: 18,
      },
      {
        wch: 18,
      },
      {
        wch: 20,
      },
      {
        wch: 16,
      },
      {
        wch: 16,
      },
      {
        wch: 18,
      },
      {
        wch: 24,
      },
      {
        wch: 22,
      },
      {
        wch: 18,
      },
    ];

  /* =========================================
     MERGE
  ========================================= */

  worksheet["!merges"] =
    [
      {
        s: {
          r: 0,
          c: 0,
        },
        e: {
          r: 0,
          c: 10,
        },
      },

      {
        s: {
          r: 1,
          c: 0,
        },
        e: {
          r: 1,
          c: 10,
        },
      },

      {
        s: {
          r: 2,
          c: 0,
        },
        e: {
          r: 2,
          c: 10,
        },
      },

      {
        s: {
          r: 3,
          c: 0,
        },
        e: {
          r: 3,
          c: 10,
        },
      },
    ];

  /* =========================================
     FREEZE HEADER
  ========================================= */

  worksheet["!freeze"] =
    {
      xSplit: 0,
      ySplit: 16,
    };

  /* =========================================
     WORKBOOK
  ========================================= */

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Detail Pembayaran"
  );

  /* =========================================
     FILE
  ========================================= */

  const fileName =
    `Detail-Pembayaran-${sanitizeFileName(
      item.id_reg
    )}-${sanitizeFileName(
      item.nama
    )}-${getTimestamp()}.xlsx`;

  XLSX.writeFile(
    workbook,
    fileName
  );
}

/* =========================================================
   EXPORT DEFAULT
========================================================= */

export default {
  exportStatusPembayaranPDF,
  exportStatusPembayaranExcel,
  exportDetailStatusPembayaranPDF,
  exportDetailStatusPembayaranExcel,
};