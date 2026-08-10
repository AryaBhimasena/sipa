//app/loket/pembayaran/[idReg]/Layanan.js
"use client";

import { useEffect, useMemo, useState } from "react";

const TARIF_PPN = 0.11;

export default function Layanan({
  data,
  onTotalChange,
  bulanTerbayar = [],
  gunakanDenda = true,
  gunakanPPN = true,
}) {

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
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
  ];

  const totalPerBulan =
    tarifSewa +
    tarifKebersihan +
    tarifKeamanan;

  /* ================================
     STATE CHECKLIST
  ================================= */
  const [checkedRows, setCheckedRows] = useState({});

  const bulanIndex = {
    Januari: 0,
    Februari: 1,
    Maret: 2,
    April: 3,
    Mei: 4,
    Juni: 5,
    Juli: 6,
    Agustus: 7,
    September: 8,
    Oktober: 9,
    November: 10,
    Desember: 11
  };

  /* ================================
     HITUNG DENDA
  ================================= */
  const hitungDenda = (
    bulanNama,
    tahun,
    totalBulanan
  ) => {
    const idx = bulanIndex[bulanNama];

    const batas = new Date(
      tahun,
      idx + 1,
      10
    );

    const now = new Date();

    if (now > batas) {
      return Math.round(
        totalBulanan * 0.02
      );
    }

    return 0;
  };

  /* ================================
     HITUNG PPN
     
     Dasar PPN:
     Total tagihan setelah diskon
     tetapi sebelum denda.
  ================================= */
  const hitungPPN = (totalSebelumDenda) => {
    if (!gunakanPPN) {
      return 0;
    }

    return Math.round(
      totalSebelumDenda * TARIF_PPN
    );
  };

  /* ================================
     CHECK / UNCHECK BULAN
  ================================= */
  const handleCheck = (bulan) => {
    setCheckedRows(prev => {
      const next = { ...prev };

      if (next[bulan]) {
        delete next[bulan];
      } else {

        const dendaAsli = hitungDenda(
          bulan,
          tahunAktif,
          totalPerBulan
        );

        const dendaDipakai = gunakanDenda
          ? dendaAsli
          : 0;

        const diskonPersen = 0;

        const diskonNominal = 0;

        // Dasar PPN = tagihan sebelum denda
        const totalSebelumDenda =
          totalPerBulan -
          diskonNominal;

        const ppnAsli = hitungPPN(
          totalSebelumDenda
        );

        const ppnDipakai = gunakanPPN
          ? ppnAsli
          : 0;

        const total =
          totalSebelumDenda +
          ppnDipakai +
          dendaDipakai;

        next[bulan] = {
          bulan,

          sewa: tarifSewa,
          kebersihan: tarifKebersihan,
          keamanan: tarifKeamanan,

          diskonPersen,
          diskonNominal,

          // ==========================
          // PPN
          // ==========================
          ppnPersen: TARIF_PPN * 100,
          ppnAsli,
          gunakanPPN,
          ppn: ppnDipakai,

          // ==========================
          // DENDA
          // ==========================
          dendaAsli,
          gunakanDenda,
          denda: dendaDipakai,

          total
        };
      }

      return next;
    });
  };

  // hanya hitung yang bukan readonly
  const detailArray = Object.values(
    checkedRows
  ).filter(
    (r) => !r.readonly
  );

  /* ================================
     TOTAL DISKON
  ================================= */
  const totalDiskon = useMemo(
    () =>
      detailArray.reduce(
        (sum, r) =>
          sum +
          Number(r.diskonNominal || 0),
        0
      ),
    [detailArray]
  );

  /* ================================
     TOTAL PPN
  ================================= */
  const totalPPN = useMemo(
    () =>
      detailArray.reduce(
        (sum, r) =>
          sum +
          Number(r.ppn || 0),
        0
      ),
    [detailArray]
  );

  /* ================================
     TOTAL DENDA
  ================================= */
  const totalDenda = useMemo(
    () =>
      detailArray.reduce(
        (sum, r) =>
          sum +
          Number(r.denda || 0),
        0
      ),
    [detailArray]
  );

  /* ================================
     TOTAL DIBAYAR
  ================================= */
  const totalDibayar = useMemo(
    () =>
      detailArray.reduce(
        (sum, r) =>
          sum +
          Number(r.total || 0),
        0
      ),
    [detailArray]
  );

  const jumlahBulan = detailArray.length;

  /* ================================
     KIRIM DATA KE PARENT
  ================================= */
  useEffect(() => {
    if (typeof onTotalChange === "function") {

      onTotalChange({
        jenis: "LAYANAN",

        periode:
          new Date().getFullYear(),

        jumlahBulan,

        total: totalDibayar,

        rincian: detailArray,

        gunakan_denda:
          gunakanDenda,

        gunakan_ppn:
          gunakanPPN,

        subtotal: {
          sewa:
            tarifSewa *
            jumlahBulan,

          kebersihan:
            tarifKebersihan *
            jumlahBulan,

          keamanan:
            tarifKeamanan *
            jumlahBulan,

          diskon:
            totalDiskon,

          ppn:
            totalPPN,

          denda:
            totalDenda,
        },
      });
    }
  }, [
    checkedRows,
    totalDibayar,
    totalDiskon,
    totalPPN,
    totalDenda,
    gunakanDenda,
    gunakanPPN,
    jumlahBulan
  ]);

  /* ================================
     CEK SUDAH BAYAR
  ================================= */
  const isPaid = (bulan) => {
    const key =
      `${bulan}-${tahunAktif}`;

    return bulanTerbayar.some(
      (b) => b.key === key
    );
  };

  /* ================================
     PRESET RIWAYAT PEMBAYARAN
  ================================= */
  useEffect(() => {
    if (!bulanTerbayar.length) return;

    const preset = {};

    bulanTerbayar.forEach((hist) => {

      if (
        Number(hist.tahun) !==
        tahunAktif
      ) {
        return;
      }

      const diskonNominal =
        Math.round(
          totalPerBulan *
          (hist.diskon / 100)
        );

      /*
       * Data historis tidak kita
       * ubah. PPN historis diambil
       * dari transaksi apabila tersedia.
       */
      const ppnHistoris =
        Number(hist.ppn) || 0;

      const totalHist =
        totalPerBulan -
        diskonNominal +
        ppnHistoris +
        hist.denda;

      preset[hist.bulan] = {

        bulan:
          hist.bulan,

        sewa:
          tarifSewa,

        kebersihan:
          tarifKebersihan,

        keamanan:
          tarifKeamanan,

        diskonPersen:
          hist.diskon,

        diskonNominal,

        // ==========================
        // PPN HISTORIS
        // ==========================
        ppnPersen:
          ppnHistoris > 0
            ? TARIF_PPN * 100
            : 0,

        ppnAsli:
          ppnHistoris,

        gunakanPPN:
          ppnHistoris > 0,

        ppn:
          ppnHistoris,

        // ==========================
        // DENDA HISTORIS
        // ==========================
        dendaAsli:
          hist.denda,

        gunakanDenda:
          hist.denda > 0,

        denda:
          hist.denda,

        total:
          totalHist,

        readonly:
          true
      };
    });

    setCheckedRows(preset);

  }, [
    bulanTerbayar,
    totalPerBulan
  ]);

  /* =========================================
     RECALCULATE SAAT TOGGLE DENDA BERUBAH
  ========================================= */
  useEffect(() => {

    setCheckedRows(prev => {

      const updated = {};

      Object.keys(prev).forEach(
        (bulan) => {

          const row =
            prev[bulan];

          // Jangan ubah histori
          if (row.readonly) {
            updated[bulan] = row;
            return;
          }

          const dendaAsli =
            row.dendaAsli ??
            hitungDenda(
              bulan,
              tahunAktif,
              totalPerBulan
            );

          const dendaDipakai =
            gunakanDenda
              ? dendaAsli
              : 0;

          const totalSebelumDenda =
            totalPerBulan -
            Number(
              row.diskonNominal || 0
            );

          const ppnAsli =
            row.ppnAsli ??
            Math.round(
              totalSebelumDenda *
              TARIF_PPN
            );

          const ppnDipakai =
            gunakanPPN
              ? ppnAsli
              : 0;

          const total =
            totalSebelumDenda +
            ppnDipakai +
            dendaDipakai;

          updated[bulan] = {
            ...row,

            gunakanDenda,

            dendaAsli,

            denda:
              dendaDipakai,

            gunakanPPN,

            ppnPersen:
              TARIF_PPN * 100,

            ppnAsli,

            ppn:
              ppnDipakai,

            total
          };
        }
      );

      return updated;
    });

  }, [
    gunakanDenda,
    gunakanPPN
  ]);

  /* =========================================
     PERUBAHAN DISKON
  ========================================= */
  const handleDiskonChange = (
    bulan,
    persen
  ) => {

    setCheckedRows(prev => {

      const row =
        prev[bulan];

      if (!row) {
        return prev;
      }

      const diskonNominal =
        Math.round(
          totalPerBulan *
          (persen / 100)
        );

      /*
       * Dasar PPN setelah diskon,
       * sebelum denda.
       */
      const totalSebelumDenda =
        totalPerBulan -
        diskonNominal;

      const ppnAsli =
        Math.round(
          totalSebelumDenda *
          TARIF_PPN
        );

      const ppnDipakai =
        gunakanPPN
          ? ppnAsli
          : 0;

      const total =
        totalSebelumDenda +
        ppnDipakai +
        Number(row.denda || 0);

      return {
        ...prev,

        [bulan]: {
          ...row,

          diskonPersen:
            persen,

          diskonNominal,

          ppnPersen:
            TARIF_PPN * 100,

          ppnAsli,

          ppn:
            ppnDipakai,

          total
        }
      };
    });
  };

  return (
    <div className="pembayaran-layout">

      {/* LEFT */}
      <div className="pembayaran-left">

        <div className="foto-placeholder">
          Foto Toko
        </div>

        <div className="objek-info">

          <div className="info-row">
            <span className="info-label">
              Nama Pedagang
            </span>

            <span className="info-value">
              {data.nama}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">
              Jenis Objek
            </span>

            <span className="info-value">
              {data.objek.jenis_objek}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">
              Tipe
            </span>

            <span className="info-value">
              {data.objek.tipe}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">
              Alamat
            </span>

            <span className="info-value">
              Lt.{data.lantai} Blok {data.blok} No.{data.no}
            </span>
          </div>

          <div className="info-row luas-row">
            <span className="info-label">
              Luas
            </span>

            <span className="info-value luas-box">
              {panjang} × {lebar} × {tinggi}
              {" = "}
              <strong>
                {luas} m²
              </strong>
            </span>
          </div>

          <hr />

          <div className="info-row">
            <span className="info-label">
              Tarif Sewa
            </span>

            <span className="info-value">
              Rp {tarifSewaDasar.toLocaleString()}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">
              Tarif Kebersihan
            </span>

            <span className="info-value">
              Rp {tarifKebersihan.toLocaleString()}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">
              Tarif Keamanan
            </span>

            <span className="info-value">
              Rp {tarifKeamanan.toLocaleString()}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">
              PPN
            </span>

            <span className="info-value">
              11%
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
                <th>PPN 11%</th>
                <th>Denda</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>

              {bulanList.map((bulan) => {

                const paid =
                  isPaid(bulan);

                return (
                  <tr
                    key={bulan}
                    className={
                      paid
                        ? "row-paid"
                        : "row-unpaid"
                    }
                  >

                    <td>
                      <input
                        type="checkbox"
                        checked={
                          !!checkedRows[bulan]
                        }
                        disabled={paid}
                        onChange={() =>
                          handleCheck(bulan)
                        }
                      />
                    </td>

                    <td>
                      {bulan}
                    </td>

                    <td>
                      {paid ? (
                        <span className="status paid">
                          Sudah Bayar
                        </span>
                      ) : (
                        <span className="status unpaid">
                          Belum Bayar
                        </span>
                      )}
                    </td>

                    <td>
                      {tarifSewa.toLocaleString()}
                    </td>

                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="diskon-input"
                        disabled={
                          !checkedRows[bulan]
                        }
                        value={
                          checkedRows[bulan]
                            ?.diskonPersen || ""
                        }
                        onChange={(e) =>
                          handleDiskonChange(
                            bulan,
                            Number(
                              e.target.value
                            )
                          )
                        }
                      />
                    </td>

                    <td>
                      {tarifKebersihan.toLocaleString()}
                    </td>

                    <td>
                      {tarifKeamanan.toLocaleString()}
                    </td>

                    <td>
                      {checkedRows[bulan]
                        ?.ppn
                        ? checkedRows[
                            bulan
                          ].ppn.toLocaleString()
                        : "0"}
                    </td>

                    <td>
                      {checkedRows[bulan]
                        ?.denda
                        ? checkedRows[
                            bulan
                          ].denda.toLocaleString()
                        : "0"}
                    </td>

                    <td>
                      {(
                        checkedRows[bulan]
                          ?.total ||
                        totalPerBulan
                      ).toLocaleString()}
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