"use client";

import Header from "../../components/Header";
import NavBar from "../../components/NavBar";
import ContainerCard from "../../components/ContainerCard";

import "../../styles/layout.css";
import "../../styles/dashboard.css";

import { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";

export default function DashboardPage() {
	
const [statusData, setStatusData] = useState({});
const [kontribusiData, setKontribusiData] = useState({});

const [kpi, setKpi] = useState({ hari_ini: 0, bulan_ini: 0 });
const [aktivitas, setAktivitas] = useState([]);

useEffect(() => {
  fetch(`${API_URL}?path=dashboardSummary`)
    .then(res => res.json())
	.then(data => {
		if (data.success) {
		  setStatusData(data.status_pembayaran);
		  setKontribusiData(data.kontribusi);
		  setKpi(data.kpi);
		  setAktivitas(data.aktivitas_terakhir || []);
			  }
	});

}, []);

  return (
    <>
      <Header />
      <NavBar />

      <main className="dashboard-page">
        <ContainerCard
          title="Dashboard"
          subtitle="Monitoring penerimaan dan kepatuhan sewa jasa layanan Pasar Antasari"
        >

          {/* KPI */}
          <div className="kpi-grid">
			<div className="kpi-card highlight">
			  <span className="kpi-label">Pembayaran Jasa Hari Ini</span>
			  <strong className="kpi-value">
				Rp {(kpi?.hari_ini || 0).toLocaleString("id-ID")}
			  </strong>
			</div>

			<div className="kpi-card">
			  <span className="kpi-label">Pembayaran Jasa Bulan Ini</span>
			  <strong className="kpi-value">
				Rp {(kpi?.bulan_ini || 0).toLocaleString("id-ID")}
			  </strong>
			</div>

            <div className="kpi-card">
              <span className="kpi-label">Target Bulanan</span>
              <strong className="kpi-value">Rp 0</strong>
            </div>

            <div className="kpi-card warning-box">
              <span className="kpi-label">Total Tunggakan</span>
              <strong className="kpi-value warning">Rp 0</strong>
            </div>
          </div>

          {/* GRID */}
          <div className="dashboard-grid">

            {/* STATUS PEMBAYARAN */}
            <div className="panel">
              <h3>Status Pembayaran Pedagang</h3>

              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Kategori</th>
                    <th>Total</th>
                    <th>Sudah Bayar</th>
                    <th>Belum Bayar</th>
                    <th>Menunggak</th>
                  </tr>
                </thead>
				<tbody>
				  {["Toko", "Kios", "Los"].map(kat => (
					<tr key={kat}>
					  <td>{kat}</td>
					  <td>{statusData[kat]?.total || 0}</td>
					  <td className="success">{statusData[kat]?.sudah_bayar || 0}</td>
					  <td className="warning">{statusData[kat]?.belum_bayar || 0}</td>
					  <td className="danger">{statusData[kat]?.menunggak || 0}</td>
					</tr>
				  ))}
				</tbody>
				<tfoot>
				  <tr className="total-row">
					<td>Total</td>
					<td>{["Toko","Kios","Los"].reduce((a,k)=>a+(statusData[k]?.total||0),0)}</td>
					<td className="success">
					  {["Toko","Kios","Los"].reduce((a,k)=>a+(Number(statusData[k]?.sudah_bayar)||0),0)}
					</td>
					<td className="warning">
					  {["Toko","Kios","Los"].reduce((a,k)=>a+(Number(statusData[k]?.belum_bayar)||0),0) || "-"}
					</td>
					<td className="danger">
					  {["Toko","Kios","Los"].reduce((a,k)=>a+(Number(statusData[k]?.menunggak)||0),0) || "-"}
					</td>
				  </tr>
				</tfoot>
              </table>
            </div>

            {/* NILAI KONTRIBUSI */}
            <div className="panel">
              <h3>Nilai Kontribusi Jasa Layanan</h3>

              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Kategori</th>
                    <th>Total Nominal Sewa</th>
                    <th>Total Nominal Kebersihan</th>
                    <th>Total Nominal Keamanan</th>
                  </tr>
                </thead>
				<tbody>
				  {["Toko", "Kios", "Los"].map(kat => (
					<tr key={kat}>
					  <td>{kat}</td>
					  <td>Rp {kontribusiData[kat]?.sewa?.toLocaleString("id-ID") || 0}</td>
					  <td>Rp {kontribusiData[kat]?.kebersihan?.toLocaleString("id-ID") || 0}</td>
					  <td>Rp {kontribusiData[kat]?.keamanan?.toLocaleString("id-ID") || 0}</td>
					</tr>
				  ))}
				</tbody>
				<tfoot>
				  <tr className="total-row">
					<td>Total</td>
					<td>
					  Rp {["Toko","Kios","Los"]
						.reduce((a,k)=>a+(kontribusiData[k]?.sewa||0),0)
						.toLocaleString("id-ID")}
					</td>
					<td>
					  Rp {["Toko","Kios","Los"]
						.reduce((a,k)=>a+(kontribusiData[k]?.kebersihan||0),0)
						.toLocaleString("id-ID")}
					</td>
					<td>
					  Rp {["Toko","Kios","Los"]
						.reduce((a,k)=>a+(kontribusiData[k]?.keamanan||0),0)
						.toLocaleString("id-ID")}
					</td>
				  </tr>
				</tfoot>
              </table>
            </div>

            {/* AKTIVITAS */}
            <div className="panel full">
              <h3>Aktivitas Penarikan Sewa Jasa Layanan</h3>
              <p className="panel-subtitle">
                Menampilkan transaksi pembayaran sewa jasa layanan terakhir berdasarkan aktivitas petugas
              </p>

              <table className="activity-table">
                <thead>
                  <tr>
				    <th>Tanggal</th>
                    <th>Nama Pedagang</th>
                    <th>Kios</th>
                    <th>Nominal</th>
                    <th>Status</th>
                  </tr>
                </thead>
				<tbody>
				  {aktivitas.map((row, i) => (
					<tr key={i}>
					  <td>
						{new Date(row.tanggal).toLocaleDateString("id-ID")}
					  </td>
					  <td>{row.nama}</td>
					  <td>{row.kios}</td>
					  <td>Rp {row.total.toLocaleString("id-ID")}</td>
<td>
  <span
    className={`badge ${
      row.status === "PAID"
        ? "success"
        : row.status === "PENDING"
          ? "warning"
          : "danger"
    }`}
  >
    {row.status === "PAID"
      ? "Lunas"
      : row.status === "PENDING"
        ? "Pending"
        : "Tidak Valid"}
  </span>
</td>
					</tr>
				  ))}
				</tbody>
              </table>
            </div>

          </div>
        </ContainerCard>
      </main>
    </>
  );
}
