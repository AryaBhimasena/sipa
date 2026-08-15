import { Fragment } from "react";
import {
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function LaporanPembayaranTable({
  data,
  loading,
  expandedRow,
  onExpand,
  onPrint,
  onDeleteHeader,
  onDeleteDetail,
  onVerifyPayment,
  verifyingId,
}) {
  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <tr>
        <td colSpan="12">
          Memuat data...
        </td>
      </tr>
    );
  }

  /* =====================================================
     EMPTY
  ===================================================== */

  if (!loading && (!data || data.length === 0)) {
    return (
      <tr>
        <td colSpan="12">
          Data tidak ditemukan
        </td>
      </tr>
    );
  }

  /* =====================================================
     TABLE
  ===================================================== */

  return (
    <>
      {data.map((row, i) => {
        /* =================================================
           NORMALISASI METODE PEMBAYARAN
        ================================================= */

        const metodeBayar = String(
          row.metode_bayar ?? ""
        )
          .trim()
          .toUpperCase();

        /* =================================================
           NORMALISASI STATUS PEMBAYARAN
        ================================================= */

        const statusBayar = String(
          row.status_bayar ?? ""
        )
          .trim()
          .toUpperCase();

        /* =================================================
           IDENTIFIKASI QRIS
        ================================================= */

        const isQRIS =
          metodeBayar === "QRIS";

        /* =================================================
           QRIS PENDING

           Hanya transaksi QRIS dengan status PENDING
           yang membutuhkan tindakan verifikasi petugas.
        ================================================= */

        const isQRISPending =
          isQRIS &&
          statusBayar === "PENDING";

        /* =================================================
           STATUS VERIFIKASI

           ID transaksi digunakan untuk menentukan
           baris mana yang sedang diproses.
        ================================================= */

        const isVerifying =
          verifyingId === row.id_transaksi;

        /* =================================================
           CLASS METODE PEMBAYARAN
        ================================================= */

        const paymentMethodClass =
          metodeBayar
            ? metodeBayar.toLowerCase()
            : "unknown";

        /* =================================================
           CLASS STATUS PEMBAYARAN
        ================================================= */

        const paymentStatusClass =
          statusBayar
            ? statusBayar.toLowerCase()
            : "unknown";

        return (
          <Fragment
            key={row.id_transaksi}
          >
            {/* =================================================
                HEADER ROW
            ================================================= */}

            <tr
              className="laporan-row"
              onClick={() =>
                onExpand(
                  row.id_transaksi
                )
              }
            >
              {/* =================================================
                  NO
              ================================================= */}

              <td>
                {i + 1}
              </td>

              {/* =================================================
                  NOMOR KUITANSI
              ================================================= */}

              <td>
                {row.no_kuitansi || "-"}
              </td>

              {/* =================================================
                  TANGGAL BAYAR
              ================================================= */}

              <td>
                {row.tanggal_bayar
                  ? new Date(
                      row.tanggal_bayar
                    ).toLocaleDateString(
                      "id-ID"
                    )
                  : "-"}
              </td>

              {/* =================================================
                  NAMA
              ================================================= */}

              <td>
                {row.nama_pedagang || "-"}
              </td>

              {/* =================================================
                  JENIS OBJEK
              ================================================= */}

              <td>
                {row.objek?.jenis_objek ||
                  "-"}
              </td>

              {/* =================================================
                  PERIODE
              ================================================= */}

              <td>
                {row.periode_tahun || "-"}
              </td>

              {/* =================================================
                  JUMLAH BULAN
              ================================================= */}

              <td>
                {row.jumlah_bulan ?? 0}
              </td>

              {/* =================================================
                  TOTAL BAYAR
              ================================================= */}

              <td>
                Rp{" "}
                {Number(
                  row.total_bayar || 0
                ).toLocaleString(
                  "id-ID"
                )}
              </td>

              {/* =================================================
                  METODE BAYAR
              ================================================= */}

              <td>
                <span
                  className={`laporan-payment-method laporan-payment-method-${paymentMethodClass}`}
                >
                  {metodeBayar || "-"}
                </span>
              </td>

              {/* =================================================
                  STATUS BAYAR
              ================================================= */}

              <td>
                <span
                  className={`laporan-payment-status laporan-payment-status-${paymentStatusClass}`}
                >
                  {statusBayar === "PAID" && (
                    "PAID"
                  )}

                  {statusBayar === "PENDING" && (
                    "PENDING"
                  )}

                  {![
                    "PAID",
                    "PENDING",
                  ].includes(
                    statusBayar
                  ) && (
                    "-"
                  )}
                </span>
              </td>

              {/* =================================================
                  PETUGAS LOKET
              ================================================= */}

              <td>
                {row.nama_petugas ||
                  "-"}
              </td>

              {/* =================================================
                  AKSI
              ================================================= */}

              <td>
                <div className="laporan-actions">

                  {/* =================================================
                      VERIFIKASI QRIS

                      HANYA muncul apabila:
                      metode = QRIS
                      DAN
                      status = PENDING
                  ================================================= */}

                  {isQRISPending && (
                    <button
                      type="button"
                      className="btn-verify-payment"
                      disabled={
                        isVerifying
                      }
                      onClick={(e) => {
                        /*
                         * Jangan sampai klik tombol
                         * menyebabkan row ikut expand.
                         */
                        e.stopPropagation();

                        if (
                          !isVerifying &&
                          onVerifyPayment
                        ) {
                          onVerifyPayment(
                            row.id_transaksi
                          );
                        }
                      }}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2
                            size={15}
                            className="btn-verify-loading"
                          />

                          <span>
                            Memverifikasi...
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2
                            size={15}
                          />

                          <span>
                            Verifikasi
                          </span>
                        </>
                      )}
                    </button>
                  )}

                  {/* =================================================
                      PRINT

                      Tetap tersedia untuk semua status.
                  ================================================= */}

                  <button
                    type="button"
                    className="btn-print"
                    onClick={(e) => {
                      e.stopPropagation();

                      if (
                        onPrint
                      ) {
                        onPrint(row);
                      }
                    }}
                  >
                    Print
                  </button>

                  {/* =================================================
                      DELETE HEADER
                  ================================================= */}

                  <button
                    type="button"
                    className="btn-delete-base"
                    onClick={(e) => {
                      e.stopPropagation();

                      if (
                        onDeleteHeader
                      ) {
                        onDeleteHeader(
                          row.id_transaksi
                        );
                      }
                    }}
                  >
                    <Trash2
                      size={16}
                    />
                  </button>
                </div>
              </td>
            </tr>

            {/* =================================================
                DETAIL TRANSAKSI
            ================================================= */}

            {expandedRow ===
              row.id_transaksi && (
              <tr className="detail-strip">
                <td colSpan="12">
                  <table className="strip-table">

                    {/* =================================================
                        DETAIL HEADER
                    ================================================= */}

                    <thead>
                      <tr>
                        <th>
                          Bulan
                        </th>

                        <th>
                          Jasa Sewa
                        </th>

                        <th>
                          Kebersihan
                        </th>

                        <th>
                          Keamanan
                        </th>

                        <th>
                          Denda
                        </th>

                        <th>
                          Diskon
                        </th>

                        <th>
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    {/* =================================================
                        DETAIL BODY
                    ================================================= */}

                    <tbody>
                      {row.detail &&
                      row.detail.length >
                        0 ? (
                        row.detail.map(
                          (d) => (
                            <tr
                              key={
                                d.bulan
                              }
                            >
                              <td>
                                {d.bulan ||
                                  "-"}
                              </td>

                              <td>
                                {Number(
                                  d.sewa ||
                                    0
                                ).toLocaleString(
                                  "id-ID"
                                )}
                              </td>

                              <td>
                                {Number(
                                  d.kebersihan ||
                                    0
                                ).toLocaleString(
                                  "id-ID"
                                )}
                              </td>

                              <td>
                                {Number(
                                  d.keamanan ||
                                    0
                                ).toLocaleString(
                                  "id-ID"
                                )}
                              </td>

                              <td>
                                {Number(
                                  d.denda ||
                                    0
                                ).toLocaleString(
                                  "id-ID"
                                )}
                              </td>

                              <td>
                                {Number(
                                  d.diskon ||
                                    0
                                )}{" "}
                                %
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="btn-delete-strip"
                                  onClick={(
                                    e
                                  ) => {
                                    e.stopPropagation();

                                    if (
                                      onDeleteDetail
                                    ) {
                                      onDeleteDetail(
                                        row.id_transaksi,
                                        d.bulan
                                      );
                                    }
                                  }}
                                >
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          )
                        )
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="strip-empty"
                          >
                            Tidak ada
                            detail
                            transaksi.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </td>
              </tr>
            )}
          </Fragment>
        );
      })}
    </>
  );
}