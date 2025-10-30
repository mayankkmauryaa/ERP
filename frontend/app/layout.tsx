// import "../globals.css";
import ClientProviders from "../src/components/ClientProviders";

export const metadata = {
  title: "ERP System",
  description: "Employee Management & Payroll ERP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
