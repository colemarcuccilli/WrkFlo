import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/components/AuthProvider";
import { ErrorReportingProvider } from "@/components/ErrorReportingProvider";

export const metadata: Metadata = {
  title: "WrkFlo — Creative Review & Approval",
  description: "The review and approval platform for creative teams.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <AuthProvider initialUser={user}>
          <ErrorReportingProvider>
            {children}
          </ErrorReportingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
