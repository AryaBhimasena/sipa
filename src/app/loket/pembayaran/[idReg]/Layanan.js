//app/loket/pembayaran/[idReg]/Layanan.js

"use client";

import { useEffect, useMemo, useState } from "react";

export default function Layanan({ data, onTotalChange, bulanTerbayar = [] }) {

  if (!data) return null;

  const luas = data.objek?.luas || 0;

  const tarifSewaDasar = data.tarif?.sewa?.tarif || 0;
  const tarifKebersihan = data.tarif?.kebersihan?.tarif || 0;
  const tarifKeamanan = data.tarif?.keamanan?.tarif || 0;
  
  const panjang = data.objek?.panjang || 0;
  const lebar = data.objek?.lebar || 0;
  const tinggi = data.objek?.tinggi || 0;

  const tarifSewa = tarifSewaDasar * luas;
  
  const tahunAktif = new Date().getFullYear();

  const bulanList = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];
  
  const totalPerBulan =
    tarifSewa + tarifKebersihan + tarifKeamanan;
  
  /* ================================
     STATE CHECKLIST
  ================================= */
  const [checkedRows, setCheckedRows] = useState({});

const handleCheck = (bulan) => {
  setCheckedRows(prev => {
    const next = { ...prev };

    if (next[bulan]) {
      delete next[bulan];
    } else {
      const denda = hitungDenda(bulan, tahunAktif, totalPerBulan);

      next[bulan] = {
        bulan,
        sewa: tarifSewa,
        kebersihan: tarifKebersihan,
        keamanan: tarifKeamanan,
        diskonPersen: 0,
        diskonNominal: 0,
        denda,
        total: totalPerBulan + denda,
      };
    }
    return next;
  });
};

// hanya hitung yang bukan readonly (belum dibayar)
const detailArray = Object.values(checkedRows).filter(
  (r) => !r.readonly
);

const totalDiskon = useMemo(
  () => detailArray.reduce(
    (sum, r) => sum + (r.diskonNominal || 0),
    0
  ),
  [detailArray]
);

const totalDenda = useMemo(
  () => detailArray.reduce(
    (sum, r) => sum + (r.denda || 0),
    0
  ),
  [detailArray]
);

const totalDibayar = useMemo(
  () => detailArray.reduce((sum, r) => sum + r.total, 0),
  [checkedRows]
);

const jumlahBulan = detailArray.length;
  
useEffect(() => {
  if (typeof onTotalChange === "function") {
    onTotalChange({
      jenis: "LAYANAN",
      periode: new Date().getFullYear(),
      jumlahBulan,
      total: totalDibayar,
      rincian: detailArray,
      subtotal: {
        sewa: tarifSewa * jumlahBulan,
        kebersihan: tarifKebersihan * jumlahBulan,
        keamanan: tarifKeamanan * jumlahBulan,
        diskon: totalDiskon,
		denda: totalDenda,
      },
    });
  }
}, [checkedRows, totalDibayar, totalDiskon, totalDenda]);

const isPaid = (bulan) => {
  const key = `${bulan}-${tahunAktif}`;
  return bulanTerbayar.some(b => b.key === key);
};

useEffect(() => {
  if (!bulanTerbayar.length) return;

  const preset = {};

  bulanTerbayar.forEach((hist) => {
    if (Number(hist.tahun) !== tahunAktif) return;

    const diskonNominal = Math.round(
      totalPerBulan * (hist.diskon / 100)
    );

    const totalHist =
      totalPerBulan - diskonNominal + hist.denda;

    preset[hist.bulan] = {
      bulan: hist.bulan,
      sewa: tarifSewa,
      kebersihan: tarifKebersihan,
      keamanan: tarifKeamanan,

      diskonPersen: hist.diskon,
      diskonNominal,

      denda: hist.denda,
      total: totalHist,

      readonly: true
    };
  });

  setCheckedRows(preset);
}, [bulanTerbayar, totalPerBulan]);

const bulanIndex = {
  Januari: 0, Februari: 1, Maret: 2, April: 3,
  Mei: 4, Juni: 5, Juli: 6, Agustus: 7,
  September: 8, Oktober: 9, November: 10, Desember: 11
};

const hitungDenda = (bulanNama, tahun, totalBulanan) => {
  const idx = bulanIndex[bulanNama];
  const batas = new Date(tahun, idx + 1, 10); // +10 hari setelah akhir bulan
  const now = new Date();

  if (now > batas) {
    return Math.round(totalBulanan * 0.02);
  }
  return 0;
};

const handleDiskonChange = (bulan, persen) => {
  setCheckedRows(prev => {
    const row = prev[bulan];
    if (!row) return prev;

    const diskonNominal = Math.round(
      totalPerBulan * (persen / 100)
    );

    const total =
      totalPerBulan -
      diskonNominal +
      row.denda;

    return {
      ...prev,
      [bulan]: {
        ...row,
        diskonPersen: persen,
        diskonNominal,
        total
      }
    };
  });
};

  return (
    <div className="pembayaran-layout">
      {/* LEFT */}
      <div className="pembayaran-left">
        <div className="foto-placeholder">Foto Toko</div>

		<div className="objek-info">
		  <div className="info-row">
			<span className="info-label">Nama Pedagang</span>
			<span className="info-value">{data.nama}</span>
		  </div>

		  <div className="info-row">
			<span className="info-label">Jenis Objek</span>
			<span className="info-value">{data.objek.jenis_objek}</span>
		  </div>

		  <div className="info-row">
			<span className="info-label">Tipe</span>
			<span className="info-value">{data.objek.tipe}</span>
		  </div>

		  <div className="info-row">
			<span className="info-label">Alamat</span>
			<span className="info-value">
			  Lt.{data.lantai} Blok {data.blok} No.{data.no}
			</span>
		  </div>

		  <div className="info-row luas-row">
			<span className="info-label">Luas</span>
			<span className="info-value luas-box">
			  {panjang} × {lebar} × {tinggi} = <strong>{luas} m²</strong>
			</span>
		  </div>

		  <hr />

		  <div className="info-row">
			<span className="info-label">Tarif Sewa</span>
			<span className="info-value">
			  Rp {tarifSewaDasar.toLocaleString()}
			</span>
		  </div>

		  <div className="info-row">
			<span className="info-label">Tarif Kebersihan</span>
			<span className="info-value">
			  Rp {tarifKebersihan.toLocaleString()}
			</span>
		  </div>

		  <div className="info-row">
			<span className="info-label">Tarif Keamanan</span>
			<span className="info-value">
			  Rp {tarifKeamanan.toLocaleString()}
			</span>
		  </div>
		</div>

      </div>

      {/* RIGHT */}
      <div className="pembayaran-right">
        <div className="loket-table-wrapper">
          <table className="loket-table">
            <thead>
              <tr>
                <th></th>
                <th>Bulan</th>
                <th>Status</th>
                <th>Jasa Sewa</th>
                <th>Diskon (%)</th>
                <th>Kebersihan</th>
                <th>Keamanan</th>
                <th>Denda</th>
                <th>Total</th>
              </tr>
            </thead>
			<tbody>
			  {bulanList.map((bulan) => {
				const paid = isPaid(bulan);

				return (
				  <tr key={bulan} className={paid ? "row-paid" : "row-unpaid"}>
					<td>
					  <input
						type="checkbox"
						checked={!!checkedRows[bulan]}
						disabled={paid}
						onChange={() => handleCheck(bulan)}
					  />
					</td>

					<td>{bulan}</td>

					<td>
					  {paid ? (
						<span className="status paid">Sudah Bayar</span>
					  ) : (
						<span className="status unpaid">Belum Bayar</span>
					  )}
					</td>

					<td>{tarifSewa.toLocaleString()}</td>

					<td>
					  <input
						type="number"
						min="0"
						max="100"
						className="diskon-input"
						disabled={!checkedRows[bulan]}
						value={checkedRows[bulan]?.diskonPersen || ""}
						onChange={(e) =>
						  handleDiskonChange(bulan, Number(e.target.value))
						}
					  />
					</td>

					<td>{tarifKebersihan.toLocaleString()}</td>
					<td>{tarifKeamanan.toLocaleString()}</td>
					<td>
					  {checkedRows[bulan]?.denda
						? checkedRows[bulan].denda.toLocaleString()
						: "0"}
					</td>
					<td>
					  {(checkedRows[bulan]?.total || totalPerBulan).toLocaleString()}
					</td>
				  </tr>
				);
			  })}
			</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
