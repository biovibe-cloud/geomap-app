import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoMap",
  description: "Sube fotos, ubícalas por su GPS y compártelas en un mapa interactivo.",
};

/**
 * RootLayout — sets up fonts + theme + global styles for the whole app.
 *
 * `GeistSans.variable` → --font-geist-sans, `GeistMono.variable` →
 * --font-geist-mono (both referenced from tailwind.config.ts).
 *
 * Add `className="dark"` to <html> (or toggle it at runtime) to switch
 * the whole tree to dark mode. `suppressHydrationWarning` keeps a
 * client-side theme toggle from tripping hydration.
 *
 * Wrap {children} in AuthProvider here once it lands (see the brief —
 * JWT held in memory via React Context).
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="bg-bg text-ink antialiased">
        {/* <AuthProvider> */}
        {children}
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}
