// lib/KuitansiHelper.js

export function terbilang(n) {
  const angka = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima",
    "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
  ];

  if (n < 12) return angka[n];
  if (n < 20) return terbilang(n - 10) + " Belas";
  if (n < 100) return terbilang(Math.floor(n / 10)) + " Puluh " + terbilang(n % 10);
  if (n < 200) return "Seratus " + terbilang(n - 100);
  if (n < 1000) return terbilang(Math.floor(n / 100)) + " Ratus " + terbilang(n % 100);
  if (n < 2000) return "Seribu " + terbilang(n - 1000);
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
  if (n < 1000000000)
    return terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);

  return "";
}


export function printIframe(printRef, onFinish) {
  const content = printRef.current.outerHTML;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  doc.open();
  doc.write(`
    <html>
      <head>
        <title>Print Kuitansi</title>
        <style>
@page {
  size: 21.45cm 27.94cm;
  margin-top: 2cm;
}

body {
  margin: 0;
  background: #fff;
  font-family: "Courier New", Courier, monospace;
}

/* ================= CANVAS KERTAS ================= */

.kuitansi-paper {
  width: 100%;

  padding: 14px 10px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  background: #ffffff;
  color: #000000;

  font-size: 11px;
  line-height: 1.4;

  overflow: hidden; /* PENTING */
}

/* ================= HEADER ================= */

.kuitansi-header {
  position: relative;
  text-align: center;
}

.kop-center {
	margin : 0;
}

.kop-left {
  position: absolute;
  left: 0;
  top: 0;
  height: 60px;

  display: flex;
  align-items: center;
}

.kop-logo {
  width: 105px;
}

/* ================= BODY ================= */

.kuitansi-body {
  flex: 1; /* ISI OTOMATIS NGISI TENGAH */
  margin-top: 6px;
  position: relative;
}

.tanggal-bayar {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 10px;
  margin-right: 18px;
}

.content-left {
  margin-top: 14px;
}

.row {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 6px;
  margin-bottom: 3px;
}

/* ================= FOOTER ================= */

.kuitansi-footer {
  display: flex;
  gap: 12px;
  font-size: 10.5px;
  margin-top: 6px;
}

.catatan {
  flex: 7;
}

.content-right {
  flex: 3;
  text-align: center;
}

.ttd-space {
  height: 38px;
}

.nama-petugas {
  font-weight: bold;
}

hr {
  border: 1px solid #000;
  margin: 4px 0;
}

/* HIDE NON PRINT UI */

.modal-overlay,
.modal-container,
.modal-header,
.action-group,
button {
  display: none !important;
}

        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);
  doc.close();

  iframe.onload = function () {
    const win = iframe.contentWindow;

    win.onafterprint = function () {
      document.body.removeChild(iframe);

      if (typeof onFinish === "function") {
        onFinish();
      }
    };

    win.focus();
    win.print();
  };
}
