import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Chat from "./components/Chat";
import Providers from "./components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlgoGPT",
  description: "Your chatbot assistant for algorithms and data structures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* <Chat /> */}
        {children}
      </body>
      </Providers>
    </html>
  );
}