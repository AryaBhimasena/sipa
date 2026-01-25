"use client";

import Header from "../../components/Header";
import NavBar from "../../components/NavBar";
import ContainerCard from "../../components/ContainerCard";

import "../../styles/layout.css";
import "../../styles/dashboard.css";

export default function DashboardPage() {
  return (
    <>
      <Header />
      <NavBar />

      <main className="dashboard-page">
        <ContainerCard
          title="Master Data"
          subtitle="Halaman Pengaturan untuk Master Data"
        >
          <div
            style={{
              minHeight: "50vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "12px",
              textAlign: "center",
              color: "#666",
            }}
          >
            <h2 style={{ fontWeight: 600 }}>
              Halaman ini sedang dalam pengembangan
            </h2>

            <p style={{ fontSize: "14px", opacity: 0.8 }}>
              Silakan kembali dalam pembaruan berikutnya.
            </p>
          </div>
        </ContainerCard>
      </main>
    </>
  );
}
