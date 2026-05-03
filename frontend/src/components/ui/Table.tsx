import type { ReactNode } from "react";
import { cn } from "./utils";

export type TableColumn<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (row: T, index: number) => string | number;
  emptyState?: ReactNode;
  className?: string;
};

export function Table<T>({ columns, data, getRowKey, emptyState, className }: TableProps<T>) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-border-subtle bg-surface shadow-sm",
        className,
      )}
    >
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-surface-muted text-[11px] uppercase text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={cn("whitespace-nowrap px-3 py-2.5 font-semibold", column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {data.length ? (
            data.map((row, index) => (
              <tr key={getRowKey(row, index)} className="transition-colors duration-150 hover:bg-primary-subtle/50">
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-3 py-3 align-middle text-foreground", column.className)}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-3 py-10 text-center text-sm text-muted-foreground">
                {emptyState ?? "No records found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
