'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menu = [
  {
    label: 'MENU UTAMA',
    items: [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Data Kios & Pedagang', path: '/kios' },
      { name: 'Retribusi', path: '/retribusi' },
      { name: 'Pembayaran & Setoran', path: '/pembayaran' },
      { name: 'Dokumen & Legalitas', path: '/dokumen' }
    ]
  },
  {
    label: 'MONITORING',
    items: [
      { name: 'Tunggakan', path: '/tunggakan' },
      { name: 'Laporan', path: '/laporan' }
    ]
  },
  {
    label: 'SISTEM',
    items: [
      { name: 'Manajemen User', path: '/users' },
      { name: 'Pengaturan', path: '/pengaturan' }
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <strong>Retribusi Pasar</strong>
        <span>Sistem Informasi</span>
      </div>

      <nav className="sidebar-nav">
        {menu.map((section) => (
          <div key={section.label} className="sidebar-section">
            <p className="sidebar-label">{section.label}</p>

            {section.items.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`sidebar-link ${
                  pathname === item.path ? 'active' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="role">Administrator</p>
        <span className="version">v1.0 Demo</span>
      </div>
    </aside>
  );
}
