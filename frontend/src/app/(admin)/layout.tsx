import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/Admin/AdminLayout";

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

