import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <div className="app-layout">
          <Sidebar />
          <div className="app-main">
            <Header
              title="Dashboard"
              subtitle="Ringkasan operasional & retribusi pasar"
            />
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
