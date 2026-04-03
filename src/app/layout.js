import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import MobileOverlay from "./components/MobileOverlay";

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start-2p",
  subsets: ["latin"],
});

export const metadata = {
  title: "Snehojit | Portfolio",
  description: "Retro Pixel Arcade Portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${pressStart2P.variable} antialiased bg-black text-white overflow-x-hidden`}>
        {children}
        <MobileOverlay />
      </body>
    </html>
  );
}
