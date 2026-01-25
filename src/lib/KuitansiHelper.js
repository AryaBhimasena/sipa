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
            size: 11in 9.5in;
            margin: 0;
          }

          body {
            margin: 0;
            background: #fff;
            font-family: "Courier New", Courier, monospace;
          }

          .kuitansi-paper {
            width: 11in;
            padding: 20px;
            box-sizing: border-box;
            background: #ffffff;
            color: #000000;
            font-size: 12px;
            line-height: 1.4;
          }

          hr { border: 1px solid #000; }

          .kuitansi-header {
            position: relative;
            text-align: center;
            padding-bottom: 6px;
          }

          .kop-left {
            position: absolute;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .kop-logo { width: 120px; height: auto; }

          .kop-center h3 {
            margin: 0;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
          }

          .kop-center h4 {
            margin: 4px 0 0;
            font-size: 13px;
            font-weight: bold;
          }

          .kop-center p {
            margin: 2px 0;
            font-size: 11px;
          }

          .subtitle { font-style: italic; }

          .kuitansi-body { margin-top: 8px; position: relative; }

          .tanggal-bayar {
            position: absolute;
            top: 0;
            right: 0;
            font-size: 11px;
          }

          .content-left { margin-top: 18px; width: 100%; }

          .row { display: flex; gap: 10px; margin-bottom: 4px; }

          .row span:first-child { width: 230px; }

          .kuitansi-footer { display: flex; gap: 16px; margin-top: 10px; }

          .catatan { flex: 7; font-size: 11px; }

          .catatan ol { margin: 4px 0 0 16px; padding: 0; }

          .content-right { flex: 3; font-size: 11px; text-align: center; }

          .ttd-space { height: 48px; }

          .nama-petugas { font-weight: bold; }

          .modal-overlay,
          .modal-container,
          .modal-header,
          .btn-batal,
          .btn-simpan-print {
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
