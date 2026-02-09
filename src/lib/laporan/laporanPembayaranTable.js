import { Fragment } from "react";
import { Trash2 } from "lucide-react";

export default function LaporanPembayaranTable({
  data,
  loading,
  expandedRow,
  onExpand,
  onPrint,
  onDeleteHeader,
  onDeleteDetail,
}) {
  if (loading) {
    return (
      <tr>
        <td colSpan="10">Memuat data...</td>
      </tr>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <tr>
        <td colSpan="10">Data tidak ditemukan</td>
      </tr>
    );
  }

  return (
    <>
      {data.map((row, i) => (
        <Fragment key={row.id_transaksi}>
          <tr
            className="laporan-row"
            onClick={() => onExpand(row.id_transaksi)}
          >
            <td>{i + 1}</td>
            <td>{row.no_kuitansi}</td>
            <td>
              {new Date(row.tanggal_bayar).toLocaleDateString("id-ID")}
            </td>
            <td>{row.nama_pedagang}</td>
            <td>{row.objek.jenis_objek}</td>
            <td>{row.periode_tahun}</td>
            <td>{row.jumlah_bulan}</td>
            <td>Rp {row.total_bayar.toLocaleString("id-ID")}</td>
            <td>{row.nama_petugas || "-"}</td>
            <td>
              <div className="laporan-actions">
                <button
                  className="btn-print"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrint(row);
                  }}
                >
                  Print
                </button>

                <button
                  className="btn-delete-base"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHeader(row.id_transaksi);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>

          {expandedRow === row.id_transaksi && (
            <tr className="detail-strip">
              <td colSpan="10">
                <table className="strip-table">
                  <thead>
                    <tr>
                      <th>Bulan</th>
                      <th>Jasa Sewa</th>
                      <th>Kebersihan</th>
                      <th>Keamanan</th>
                      <th>Denda</th>
                      <th>Diskon</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {row.detail?.map((d) => (
                      <tr key={d.bulan}>
                        <td>{d.bulan}</td>
                        <td>{d.sewa.toLocaleString("id-ID")}</td>
                        <td>{d.kebersihan.toLocaleString("id-ID")}</td>
                        <td>{d.keamanan.toLocaleString("id-ID")}</td>
                        <td>{d.denda.toLocaleString("id-ID")}</td>
                        <td>{d.diskon} %</td>
                        <td>
                          <button
                            className="btn-delete-strip"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDetail(
                                row.id_transaksi,
                                d.bulan
                              );
                            }}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
          )}
        </Fragment>
      ))}
    </>
  );
}
