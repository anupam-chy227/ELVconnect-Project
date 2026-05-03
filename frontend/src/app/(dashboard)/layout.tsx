import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLandingGuard from "@/components/Dashboard/DashboardLandingGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <DashboardLandingGuard />
        {children}
      </ErrorBoundary>
    </ProtectedRoute>
  );
}
