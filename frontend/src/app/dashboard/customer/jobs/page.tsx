"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge, Button, Card, DataTable, ErrorCard, SkeletonTable } from "@/components/ui";
import { useMyJobs } from "@/hooks/useSWRData";
import type { ColumnDef } from "@/components/ui/DataTable";
import type { Job } from "@/types/api";

const columns: ColumnDef<Job>[] = [
  { id: "title", header: "Job", cell: (row) => <span className="font-black text-foreground">{row.title}</span>, searchValue: (row) => row.title },
  { id: "category", header: "Category", cell: (row) => <Badge tone="primary">{row.category.replace(/_/g, " ")}</Badge> },
  { id: "location", header: "Location", cell: (row) => `${row.city}, ${row.area}`, searchValue: (row) => `${row.city} ${row.area}` },
  { id: "status", header: "Status", status: true, cell: (row) => <Badge tone={row.status === "completed" ? "success" : row.status === "cancelled" ? "danger" : "warning"}>{row.status.replace(/_/g, " ")}</Badge> },
];

export default function CustomerJobsPage() {
  const router = useRouter();
  const { data, isLoading, error, mutate } = useMyJobs();

  return (
    <main className="premium-shell min-h-screen px-4 py-6 text-foreground">
      <div className="mx-auto grid max-w-7xl gap-6">
        <Card variant="glass" padding="lg">
          <Button type="button" variant="secondary" size="sm" onClick={() => router.push("/dashboard/customer")} leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>
            Customer dashboard
          </Button>
          <h1 className="mt-4 text-3xl font-black tracking-tight">All customer jobs</h1>
          <p className="mt-2 text-sm text-muted-foreground">Live jobs loaded from the ELV Connect REST API.</p>
        </Card>

        {isLoading ? <SkeletonTable columns={4} rows={6} /> : null}
        {error ? <ErrorCard message={error.message} onRetry={() => void mutate()} /> : null}
        {!isLoading && !error ? (
          <DataTable
            columns={columns}
            data={data ?? []}
            actions={(row) => [
              {
                label: "View Details",
                onClick: () => router.push(`/dashboard/customer/jobs/${row._id}`),
              },
            ]}
          />
        ) : null}
      </div>
    </main>
  );
}
