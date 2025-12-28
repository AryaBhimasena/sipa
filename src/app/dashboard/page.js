"use client";

import Header from "../../components/Header";
import NavBar from "../../components/NavBar";
import "../../styles/layout.css";
import "../../styles/dashboard.css";

export default function DashboardPage() {
  return (
    <>
      {/* APP CHROME */}
      <Header />
      <NavBar />

      {/* CONTENT */}
      <main className="dashboard-page">
	  <div className="dashboard-container">

        {/* PAGE HEADER */}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard Retribusi</h1>
            <p>Monitoring penerimaan dan kepatuhan retribusi Pasar Antasari</p>
          </div>
          <div className="dashboard-date">
            <span>Tanggal Aktif</span>
            <strong>12 September 2025</strong>
          </div>
        </div>

        {/* RETRIBUSI KPI */}
        <div className="kpi-grid">
          <div className="kpi-card highlight">
            <span className="kpi-label">Retribusi Hari Ini</span>
            <strong className="kpi-value">Rp 18.450.000</strong>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Retribusi Bulan Ini</span>
            <strong className="kpi-value">Rp 328.450.000</strong>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Target Bulanan</span>
            <strong className="kpi-value">Rp 420.000.000</strong>
          </div>

          <div className="kpi-card warning-box">
            <span className="kpi-label">Total Tunggakan</span>
            <strong className="kpi-value warning">Rp 91.550.000</strong>
          </div>
        </div>

        {/* GRID */}
        <div className="dashboard-grid">

          {/* STATUS BAYAR */}
          <div className="panel">
            <h3>Status Pembayaran Pedagang</h3>
            <ul className="status-list">
              <li>
                <span>Sudah Bayar</span>
                <strong className="success">1.102</strong>
              </li>
              <li>
                <span>Belum Bayar</span>
                <strong className="warning">146</strong>
              </li>
              <li>
                <span>Menunggak & Bermasalah</span>
                <strong className="danger">80</strong>
              </li>
            </ul>
          </div>

          {/* KEPATUHAN */}
          <div className="panel">
            <h3>Tingkat Kepatuhan</h3>
            <div className="compliance-box">
              <strong>88%</strong>
              <span>Pedagang patuh membayar retribusi</span>
            </div>
          </div>

          {/* AKTIVITAS */}
          <div className="panel full">
            <h3>Aktivitas Penarikan Retribusi</h3>
			<p className="panel-subtitle">
  Menampilkan transaksi retribusi terakhir berdasarkan aktivitas petugas
</p>

            <table className="activity-table">
              <thead>
                <tr>
                  <th>Nama Pedagang</th>
                  <th>Kios</th>
                  <th>Nominal</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Siti Aminah</td>
                  <td>B-12</td>
                  <td>Rp 15.000</td>
                  <td><span className="badge success">Lunas</span></td>
                  <td>12/09/2025</td>
                </tr>
                <tr>
                  <td>Ahmad Fauzi</td>
                  <td>A-07</td>
                  <td>Rp 15.000</td>
                  <td><span className="badge warning">Belum Bayar</span></td>
                  <td>12/09/2025</td>
                </tr>
                <tr>
                  <td>Rudi Hartono</td>
                  <td>C-19</td>
                  <td>Rp 45.000</td>
                  <td><span className="badge danger">Menunggak</span></td>
                  <td>10/09/2025</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
        </div>
      </main>
    </>
  );
}
