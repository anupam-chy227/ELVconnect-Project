"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DataTableProps } from "./DataTable";
import { SkeletonTable } from "./Skeleton";

const LazyDataTable = dynamic(
  () => import("./DataTable").then((module) => module.DataTable as ComponentType<DataTableProps<unknown>>),
  {
    loading: () => <SkeletonTable rows={5} />,
    ssr: false,
  },
);

export function DynamicDataTable<T>(props: DataTableProps<T>) {
  return <LazyDataTable {...(props as DataTableProps<unknown>)} />;
}
