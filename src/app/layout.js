import "../styles/globals.css";
import "../styles/layout.css";

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
