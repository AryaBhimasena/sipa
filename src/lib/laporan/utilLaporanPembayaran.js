export function buildKuitansi(row) {
  const rincian = row.detail.map(d => {
    const bruto = d.sewa + d.kebersihan + d.keamanan;
    const diskonNominal = Math.round(bruto * (d.diskon / 100));

    return {
      bulan: d.bulan,
      sewa: d.sewa,
      kebersihan: d.kebersihan,
      keamanan: d.keamanan,
      diskonPersen: d.diskon,
      diskonNominal,
      denda: d.denda,
      total: bruto - diskonNominal + d.denda,
      readonly: true,
    };
  });

  const subtotal = rincian.reduce(
    (a, r) => ({
      sewa: a.sewa + r.sewa,
      kebersihan: a.kebersihan + r.kebersihan,
      keamanan: a.keamanan + r.keamanan,
      diskon: a.diskon + r.diskonNominal,
      denda: a.denda + r.denda,
    }),
    { sewa: 0, kebersihan: 0, keamanan: 0, diskon: 0, denda: 0 }
  );

  return { rincian, subtotal };
}

export function applyDateFilter(data, tglAwal, tglAkhir) {
  if (!tglAwal || !tglAkhir) return data;

  const start = new Date(tglAwal);
  start.setHours(0, 0, 0, 0);

  const end = new Date(tglAkhir);
  end.setHours(23, 59, 59, 999);

  // validasi range max 90 hari
  const diffHari = (end - start) / (1000 * 60 * 60 * 24);
  if (diffHari < 0 || diffHari > 90) {
    throw new Error("Rentang tanggal maksimal 90 hari");
  }

  return data.filter((r) => {
    if (!r.tanggal_bayar) return false;

    const tglBayar = new Date(r.tanggal_bayar);
    return tglBayar >= start && tglBayar <= end;
  });
}

export function handleExportPDF() {
  if (!filteredData.length) {
    alert("Tidak ada data untuk diexport");
    return;
  }

  console.log("EXPORT PDF DATA:", filteredData);
  // TODO: implement jsPDF
}
