// ==========================================================
// PERIODE FILTER HELPER
// ==========================================================

const DAY_MS = 24 * 60 * 60 * 1000;

export const PERIODE = {
  HARIAN: "harian",
  MINGGUAN: "mingguan",
  BULANAN: "bulanan",
  TAHUNAN: "tahunan",
  CUSTOM: "custom",
};

// ==========================================================
// FORMAT YYYY-MM-DD
// ==========================================================

export function formatDate(date) {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ==========================================================
// NORMALIZE DATE
// ==========================================================

function normalize(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ==========================================================
// RANGE BERDASARKAN PERIODE
// ==========================================================

export function getPeriodeRange(periode) {
  const today = normalize(new Date());

  switch (periode) {
    case PERIODE.HARIAN: {
      return {
        start: formatDate(today),
        end: formatDate(today),
      };
    }

    case PERIODE.MINGGUAN: {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);

      return {
        start: formatDate(start),
        end: formatDate(today),
      };
    }

    case PERIODE.BULANAN: {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);

      const end = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );

      return {
        start: formatDate(start),
        end: formatDate(end),
      };
    }

    case PERIODE.TAHUNAN: {
      const start = new Date(today.getFullYear(), 0, 1);

      const end = new Date(today.getFullYear(), 11, 31);

      return {
        start: formatDate(start),
        end: formatDate(end),
      };
    }

    default:
      return {
        start: "",
        end: "",
      };
  }
}

// ==========================================================
// DETEKSI PERIODE DARI DATE PICKER
// ==========================================================

export function detectPeriode(startDate, endDate) {
  if (!startDate || !endDate) {
    return PERIODE.CUSTOM;
  }

  const start = normalize(startDate);
  const end = normalize(endDate);

  // Harian
  if (start.getTime() === end.getTime()) {
    return PERIODE.HARIAN;
  }

  // Bulanan
  const firstMonth = new Date(
    start.getFullYear(),
    start.getMonth(),
    1
  );

  const lastMonth = new Date(
    start.getFullYear(),
    start.getMonth() + 1,
    0
  );

  if (
    start.getTime() === firstMonth.getTime() &&
    end.getTime() === lastMonth.getTime()
  ) {
    return PERIODE.BULANAN;
  }

  // Tahunan
  const firstYear = new Date(start.getFullYear(), 0, 1);

  const lastYear = new Date(start.getFullYear(), 11, 31);

  if (
    start.getTime() === firstYear.getTime() &&
    end.getTime() === lastYear.getTime()
  ) {
    return PERIODE.TAHUNAN;
  }

  // Mingguan
  const diff = Math.round((end - start) / DAY_MS);

  if (diff === 7) {
    return PERIODE.MINGGUAN;
  }

  return PERIODE.CUSTOM;
}

// ==========================================================
// APPLY PERIODE KE STATE
// ==========================================================

export function applyPeriode(periode, setStart, setEnd) {
  const { start, end } = getPeriodeRange(periode);

  setStart(start);
  setEnd(end);
}

// ==========================================================
// UPDATE PERIODE SAAT DATE PICKER BERUBAH
// ==========================================================

export function syncPeriode(start, end, setPeriode) {
  setPeriode(detectPeriode(start, end));
}