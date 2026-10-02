import "./globals.css";

export const metadata = {
  title: "Ular Tangga Belajar",
  description: "Main ular tangga sambil belajar bersama sekelas.",
};

export default function RootLayout({ children }) {
  return <html lang="id"><body>{children}</body></html>;
}
