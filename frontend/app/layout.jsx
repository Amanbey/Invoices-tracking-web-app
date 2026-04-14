import "../styles/globals.css";
import { Fraunces, Space_Grotesk } from "next/font/google";
import Navbar from "../components/nav/Navbar";
import { Toaster } from "react-hot-toast"; // ✅ added

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  title: "Invoice & Payment Tracking System",
  description: "Auth module for invoice tracking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${fraunces.variable} min-h-screen`}>
        <Navbar />
        <main className="min-h-screen px-6 py-10">{children}</main>

        {/* ✅ Toast container */}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}