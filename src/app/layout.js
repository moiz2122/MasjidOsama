import "./globals.css";
import { Providers } from "./Provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
