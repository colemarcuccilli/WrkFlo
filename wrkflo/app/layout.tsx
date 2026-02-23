import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WrkFlo — Creative Review & Approval",
  description: "The review and approval platform for creative teams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
