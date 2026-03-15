import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Oswald } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-inter", // Variable name kept as per tailwind v4 @theme inline instructions from SKILL.md
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["200", "400", "700"],
});

export const metadata: Metadata = {
  title: "Nova AI | Premium Design Studio",
  description: "Create breathtaking designs instantly with Nova AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${playfairDisplay.variable} ${oswald.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
