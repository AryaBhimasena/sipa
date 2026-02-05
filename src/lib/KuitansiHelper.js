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
  margin-top: 0;
}

html, body {
  margin: 0;
  background: #fff;
  font-family: Arial, Helvetica, sans-serif;

  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ================= CANVAS KERTAS ================= */

.kuitansi-paper {
  width: 100%;

  padding: 3.7mm 2.65mm;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  background: #ffffff;
  color: #000000;

  font-size: 8.25pt;
  line-height: 1;

  overflow: hidden;
}

/* ================= HEADER ================= */

.kuitansi-header {
  position: relative;
  text-align: center;
}

.kop-center {
  margin: 0;
}

.kop-left {
  position: absolute;
  left: 0;
  top: 0;
  height: 15.9mm;

  display: flex;
  align-items: center;
}

.kop-logo {
  width: 27.8mm;
}

/* ================= BODY ================= */

.kuitansi-body {
  flex: 1;
  margin-top: 1.6mm;
  position: relative;
}

.tanggal-bayar {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 7.5pt;
  margin-right: 4.75mm;
}

.content-left {
  margin-top: 3.7mm;
}

.row {
  display: grid;
  grid-template-columns: 58.2mm 1fr;
  gap: 1.6mm;
  margin-bottom: 0.8mm;
}

/* ================= FOOTER ================= */

.kuitansi-footer {
  display: flex;
  gap: 3.2mm;
  font-size: 7.9pt;
  margin-top: 1.6mm;
}

.catatan {
  flex: 7;
}

.content-right {
  flex: 3;
  text-align: center;
}

.ttd-space {
  height: 10mm;
}

.nama-petugas {
  font-weight: bold;
}

hr {
  border: 0.3mm solid #000;
  margin: 1.05mm 0;
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
      if (typeof onFinish === "function") onFinish();
    };

    win.focus();
    win.print();
  };
}
