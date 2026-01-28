import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { printIframe } from "./KuitansiHelper";

/* ================= STATE TRACK ================= */

export function createKuitansiActionState() {
  return {
    isSaved: false,
  };
}

/* ================= CLOSE VALIDATION ================= */

export function handleCloseWithConfirm(state, onClose) {
  if (state.isSaved) {
    onClose();
    return;
  }

  const confirmLeave = window.confirm(
    "Data belum disimpan.\nSimpan terlebih dahulu sebelum menutup?"
  );

  if (confirmLeave) return false; // user mau simpan

  onClose();
}

/* ================= AFTER SAVE ================= */

export function markAsSaved(state) {
  state.isSaved = true;
}

/* ================= PRINT ================= */

export function handlePrint(printRef, onFinish) {
  printIframe(printRef, onFinish);
}

/* ================= EXPORT PDF ================= */

export async function handleExportPDF(printRef, noKuitansi, namaPedagang) {
  if (!printRef?.current) return;

  const canvas = await html2canvas(printRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  });

  // ukuran kuitansi (mm) — SAMA dengan preview
  const paperWidth = 215.9;
  const paperHeight = 156;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [paperWidth, paperHeight],
  });

  pdf.addImage(
    canvas.toDataURL("image/png"),
    "PNG",
    0,
    0,
    paperWidth,
    paperHeight
  );

  // sanitize nama file (hindari karakter aneh)
  const safeNama = namaPedagang.replace(/[\/\\?%*:|"<>]/g, "-");

  pdf.save(`${noKuitansi} - ${safeNama}.pdf`);
}
