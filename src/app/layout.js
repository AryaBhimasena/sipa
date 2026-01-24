import "../styles/globals.css";
import "../styles/layout.css";
import { DataTokoProvider } from "./contexts/DataTokoContext";

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <DataTokoProvider>
          {children}
        </DataTokoProvider>
      </body>
    </html>
  );
}
