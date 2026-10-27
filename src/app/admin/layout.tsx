import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Taller El Rayo",
  description: "Panel administrativo interno del taller mecánico.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
