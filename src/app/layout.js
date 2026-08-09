import "../styles/globals.css";
import "../styles/layout.css";

import { DataTokoProvider } from "./contexts/DataTokoContext";
import { UserProvider } from "../lib/context/UserContext";
import RouteGuard from "../lib/context/RouteGuard";

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <UserProvider>
          <RouteGuard>
            <DataTokoProvider>
              {children}
            </DataTokoProvider>
          </RouteGuard>
        </UserProvider>
      </body>
    </html>
  );
}