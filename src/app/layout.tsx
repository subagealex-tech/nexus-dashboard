import type { Metadata } from "next";
import { Outfit, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { DataProvider } from "@/components/providers/DataContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { NotesProvider } from "@/components/providers/NotesContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Nexus Dashboard",
  description: "A cutting-edge data management platform with immersive 3D visualizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full font-sans">
        <ThemeProvider>
          <AuthProvider>
            <DataProvider>
              <NotesProvider>{children}</NotesProvider>
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}