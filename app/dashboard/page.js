'use client';

import ContentCard from '../components/ContentCard';

export default function DashboardPage() {
  return (
    <ContentCard>

      {/* ===== ROW 1 : KPI UTAMA ===== */}
      <div className="row kpi-layout">
        <SummaryCard />
        <TargetCard />
      </div>

      {/* ===== ROW 2 : STATUS ===== */}
      <div className="row three-col compact">
        <ComplianceStatus />
        <OperationalStatus />
        <ActivityCard />
      </div>

      {/* ===== ROW 3 : INSIGHT ===== */}
      <div className="row single">
        <InsightCard />
      </div>

    </ContentCard>
  );
}

/* ================= COMPONENTS ================= */

function SummaryCard() {
  return (
    <div className="panel kpi small">
      <h3>Retribusi Hari Ini</h3>
      <div className="big-number">Rp 18.750.000</div>
      <p className="muted">Update terakhir: 14.20 WIB</p>
    </div>
  );
}

function TargetCard() {
  return (
    <div className="panel kpi large soft">
      <div className="kpi-header">
        <h3>Capaian Target Bulanan</h3>
        <strong className="kpi-percent">82%</strong>
      </div>

      <p className="muted">Rp 412 jt dari Rp 500 jt</p>

      {/* === BREAKDOWN RETRIBUSI === */}
      <div className="breakdown">
        <div className="item">
          <span className="dot kios" />
          <div>
            <small>Kios / Los</small>
            <strong>Rp 285 jt</strong>
          </div>
        </div>

        <div className="item">
          <span className="dot kebersihan" />
          <div>
            <small>Kebersihan</small>
            <strong>Rp 84,5 jt</strong>
          </div>
        </div>

        <div className="item">
          <span className="dot keamanan" />
          <div>
            <small>Keamanan</small>
            <strong>Rp 42,8 jt</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== STATUS KEPATUHAN ===== */
function ComplianceStatus() {
  return (
    <div className="panel">
      <h3>Status Kepatuhan</h3>

      <div className="status good">
        Kepatuhan relatif baik
      </div>

      <ul className="mini-list">
        <li>
          <strong className="warning">86</strong>
          <span>kios menunggak</span>
        </li>
        <li>
          <strong className="amber">42</strong>
          <span>belum setor hari ini</span>
        </li>
      </ul>
    </div>
  );
}

/* ===== STATUS OPERASIONAL ===== */
function OperationalStatus() {
  return (
    <div className="panel">
      <h3>Status Operasional</h3>

      <div className="status warning">
        Operasional normal dengan catatan
      </div>

      <ul className="mini-list">
        <li>
          <strong>1.124</strong>
          <span>kios aktif</span>
        </li>
        <li>
          <strong className="danger">3</strong>
          <span>blok bermasalah</span>
        </li>
      </ul>
    </div>
  );
}

/* ===== ACTIVITY ===== */
function ActivityCard() {
  return (
    <div className="panel">
      <h3>Aktivitas Hari Ini</h3>

      <ul className="activity-list">
        <li>
          <span className="dot green" />
          Setoran kios Blok A-12
          <small>10 menit lalu</small>
        </li>
        <li>
          <span className="dot amber" />
          Kios B-07 belum setor
          <small>Hari ini</small>
        </li>
        <li>
          <span className="dot red" />
          Dokumen C-03 bermasalah
          <small>Verifikasi</small>
        </li>
      </ul>
    </div>
  );
}

/* ===== INSIGHT ===== */
function InsightCard() {
  return (
    <div className="panel soft compact">
      <h3>Perhatian Khusus</h3>

      <ul className="insight">
        <li>17 kios kepemilikan bermasalah</li>
        <li>8 kios usaha tidak sesuai peruntukan</li>
        <li>5 kios belum update data &gt; 6 bulan</li>
      </ul>

      <button className="link-btn">Lihat detail</button>
    </div>
  );
}
