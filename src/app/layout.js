import "../styles/globals.css";
import "../styles/layout.css";

import { DataTokoProvider } from "./contexts/DataTokoContext";
import { UserProvider } from "../lib/context/UserContext";

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <UserProvider>
          <DataTokoProvider>
            {children}
          </DataTokoProvider>
        </UserProvider>
      </body>
    </html>
  );
}
