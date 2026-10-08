export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { AdminClientLayout } from "@/components/admin/admin-client-layout";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminClientLayout>{children}</AdminClientLayout>
}
