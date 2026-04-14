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
      <body className={`${spaceGrotesk.variable} ${fraunces.variable} min-h-screen overflow-x-hidden`}>
        <Navbar />
        <main className="min-h-[calc(100vh-73px)] overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>

        {/* ✅ Toast container */}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}