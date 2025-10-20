import "./globals.css";
import "./test-styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/providers/Providers";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KhataBook - Track Money Lent to Friends",
  description: "A simple app to track money lent to friends and monitor orders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="test-box">
          <h1>Test CSS Box</h1>
          <p>
            If you can see this box with a red border and yellow background, CSS
            is working!
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/test-page"
              style={{
                display: "inline-block",
                padding: "10px 15px",
                backgroundColor: "blue",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                margin: "10px 0",
              }}
            >
              Go to Test Page
            </Link>
            <Link
              href="/tailwind-test"
              style={{
                display: "inline-block",
                padding: "10px 15px",
                backgroundColor: "green",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                margin: "10px 0",
              }}
            >
              Go to Tailwind Test
            </Link>
            <Link
              href="/firebase-debug"
              style={{
                display: "inline-block",
                padding: "10px 15px",
                backgroundColor: "red",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                margin: "10px 0",
              }}
            >
              Firebase Debug
            </Link>
          </div>
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// Made with Bob
