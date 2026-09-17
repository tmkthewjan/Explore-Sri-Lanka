import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Explore Sri Lanka 🇱🇰 – Geolocation & Tourism Platform",
  description:
    "Discover pristine beaches, sacred temples, misty waterfalls, and wildlife safaris across Sri Lanka with real-time GPS nearby detection powered by PostGIS.",
  keywords: [
    "Sri Lanka Tourism",
    "Explore Sri Lanka",
    "PostGIS Geolocation",
    "Nearby Places",
    "Sigiriya",
    "Ella",
    "Mirissa",
    "Galle Fort",
    "Travel Guide",
  ],
  authors: [{ name: "Explore Sri Lanka Team" }],
  openGraph: {
    title: "Explore Sri Lanka 🇱🇰 – Geolocation & Tourism Platform",
    description:
      "Find nearby tourist places across Sri Lanka with real-time GPS location and PostGIS spatial distance calculations.",
    url: "https://exploresrilanka.local",
    siteName: "Explore Sri Lanka",
    images: [
      {
        url: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Sigiriya Rock Fortress Sri Lanka",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
