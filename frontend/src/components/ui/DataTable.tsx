"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit3,
  Eye,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { EmptyState } from "./EmptyState";
import { cn } from "./utils";

export type SortDirection = "asc" | "desc";

export interface ColumnDef<T> {
  id: string;
  header: ReactNode;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => unknown;
  cell?: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | boolean | Date | null | undefined;
  searchValue?: (row: T) => string | number | boolean | null | undefined;
  enableSorting?: boolean;
  pinned?: boolean;
  status?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface ActionItem {
  label: "View" | "Edit" | "Approve" | "Reject" | "Delete" | string;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  searchable?: boolean;
  selectable?: boolean;
  actions?: (row: T) => ActionItem[];
  getRowId?: (row: T, index: number) => string;
  emptyMessage?: string;
  searchPlaceholder?: string;
}

type IndexedRow<T> = {
  row: T;
  index: number;
  id: string;
};

const pageSizes = [10, 25, 50] as const;

const defaultActionIcons: Record<string, ReactNode> = {
  View: <Eye className="h-4 w-4" />,
  Edit: <Edit3 className="h-4 w-4" />,
  Approve: <CheckCircle2 className="h-4 w-4" />,
  Reject: <XCircle className="h-4 w-4" />,
  Delete: <Trash2 className="h-4 w-4" />,
};

function getDefaultRowId<T>(row: T, index: number) {
  if (row && typeof row === "object") {
    const record = row as Record<string, unknown>;
    const candidate = record.id ?? record._id ?? record.key;
    if (typeof candidate === "string" || typeof candidate === "number") return String(candidate);
  }

  return String(index);
}

function readColumnValue<T>(row: T, column: ColumnDef<T>): unknown {
  if (column.accessorFn) return column.accessorFn(row);
  if (column.accessorKey) return row[column.accessorKey];
  return undefined;
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(stringifyValue).join(" ");
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).map(stringifyValue).join(" ");
  return "";
}

function compareValues(left: unknown, right: unknown) {
  const normalizedLeft = left instanceof Date ? left.getTime() : left;
  const normalizedRight = right instanceof Date ? right.getTime() : right;

  if (typeof normalizedLeft === "number" && typeof normalizedRight === "number") {
    return normalizedLeft - normalizedRight;
  }

  return stringifyValue(normalizedLeft).localeCompare(stringifyValue(normalizedRight), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function getRowStatusClass<T>(row: T, columns: ColumnDef<T>[]) {
  const statusColumn = columns.find((column) => column.status);
  const statusText = statusColumn ? stringifyValue(readColumnValue(row, statusColumn)).toLowerCase() : "";

  if (["cancelled", "rejected", "failed", "high", "danger", "emergency"].some((item) => statusText.includes(item))) {
    return "border-l-4 border-l-elv-danger bg-red-50/35 dark:bg-red-950/10";
  }

  if (["pending", "held", "medium", "urgent", "review"].some((item) => statusText.includes(item))) {
    return "border-l-4 border-l-elv-warning bg-amber-50/35 dark:bg-amber-950/10";
  }

  if (["active", "completed", "released", "verified", "approved", "low", "pass"].some((item) => statusText.includes(item))) {
    return "border-l-4 border-l-elv-success bg-emerald-50/25 dark:bg-emerald-950/10";
  }

  return "";
}

function SkeletonRows({ columns, selectable, hasActions }: { columns: number; selectable: boolean; hasActions: boolean }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse border-b border-elv-border/60 dark:border-elv-dark-border">
          {selectable ? (
            <td className="w-11 px-3 py-4">
              <div className="h-4 w-4 rounded bg-elv-border/80 dark:bg-elv-dark-border" />
            </td>
          ) : null}
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <td key={columnIndex} className="px-4 py-4">
              <div className={cn("h-4 rounded bg-elv-border/80 dark:bg-elv-dark-border", columnIndex === 0 ? "w-40" : "w-24")} />
            </td>
          ))}
          {hasActions ? (
            <td className="w-14 px-3 py-4">
              <div className="ml-auto h-8 w-8 rounded-md bg-elv-border/80 dark:bg-elv-dark-border" />
            </td>
          ) : null}
        </tr>
      ))}
    </>
  );
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  searchable = true,
  selectable = false,
  actions,
  getRowId = getDefaultRowId,
  emptyMessage = "No records match the current filters.",
  searchPlaceholder = "Search table...",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ id: string; direction: SortDirection } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(() => new Set());
  const [pageSize, setPageSize] = useState<(typeof pageSizes)[number]>(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [openActionsRow, setOpenActionsRow] = useState<string | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const hasActions = Boolean(actions);

  const indexedRows = useMemo<IndexedRow<T>[]>(
    () => data.map((row, index) => ({ row, index, id: getRowId(row, index) })),
    [data, getRowId],
  );

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return indexedRows;

    return indexedRows.filter(({ row }) =>
      columns.some((column) => {
        const value = column.searchValue ? column.searchValue(row) : readColumnValue(row, column);
        return stringifyValue(value).toLowerCase().includes(normalizedQuery);
      }),
    );
  }, [columns, indexedRows, query]);

  const sortedRows = useMemo(() => {
    if (!sort) return filteredRows;
    const column = columns.find((item) => item.id === sort.id);
    if (!column) return filteredRows;

    return [...filteredRows].sort((left, right) => {
      const leftValue = column.sortValue ? column.sortValue(left.row) : readColumnValue(left.row, column);
      const rightValue = column.sortValue ? column.sortValue(right.row) : readColumnValue(right.row, column);
      const result = compareValues(leftValue, rightValue);
      return sort.direction === "asc" ? result : -result;
    });
  }, [columns, filteredRows, sort]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = sortedRows.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize);
  const selectedPageCount = pageRows.filter((row) => selectedRows.has(row.id)).length;
  const allPageSelected = pageRows.length > 0 && selectedPageCount === pageRows.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedPageCount > 0 && selectedPageCount < pageRows.length;
    }
  }, [pageRows.length, selectedPageCount]);

  const toggleSort = (column: ColumnDef<T>) => {
    if (column.enableSorting === false) return;
    setSort((current) => {
      if (current?.id !== column.id) return { id: column.id, direction: "asc" };
      if (current.direction === "asc") return { id: column.id, direction: "desc" };
      return null;
    });
  };

  const toggleRow = (rowId: string) => {
    setSelectedRows((current) => {
      const next = new Set(current);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const togglePage = () => {
    setSelectedRows((current) => {
      const next = new Set(current);
      if (allPageSelected) pageRows.forEach((row) => next.delete(row.id));
      else pageRows.forEach((row) => next.add(row.id));
      return next;
    });
  };

  return (
    <section className="overflow-hidden rounded-lg border border-elv-border bg-elv-surface shadow-md dark:border-elv-dark-border dark:bg-elv-dark-1">
      {searchable ? (
        <div className="flex flex-col gap-3 border-b border-elv-border bg-elv-base/70 p-4 dark:border-elv-dark-border dark:bg-elv-dark-2/60 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative w-full max-w-md">
            <span className="sr-only">Search table</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-elv-text-3" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-md border border-elv-border bg-white pl-10 pr-3 text-sm font-semibold text-elv-text outline-none transition focus:border-elv-iris focus:ring-4 focus:ring-primary-ring dark:border-elv-dark-border dark:bg-elv-dark-base dark:text-white"
            />
          </label>

          <div className="flex items-center gap-2 text-xs font-semibold text-elv-text-2 dark:text-slate-300">
            <span>{sortedRows.length} results</span>
            {selectable ? <span>{selectedRows.size} selected</span> : null}
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-elv-surface-2 text-xs uppercase text-elv-text-2 dark:bg-elv-dark-2 dark:text-slate-300">
            <tr>
              {selectable ? (
                <th className="sticky left-0 z-20 w-11 border-b border-elv-border bg-elv-surface-2 px-3 py-3 dark:border-elv-dark-border dark:bg-elv-dark-2">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={togglePage}
                    aria-label="Select all rows on this page"
                    className="h-4 w-4 rounded border-elv-border text-elv-iris"
                  />
                </th>
              ) : null}
              {columns.map((column, index) => {
                const activeSort = sort?.id === column.id ? sort.direction : null;
                const pinned = column.pinned || index === 0;

                return (
                  <th
                    key={column.id}
                    className={cn(
                      "border-b border-elv-border px-4 py-3 font-bold dark:border-elv-dark-border",
                      pinned && "sticky z-10 bg-elv-surface-2 dark:bg-elv-dark-2",
                      pinned && (selectable ? "left-11" : "left-0"),
                      column.headerClassName,
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(column)}
                      disabled={column.enableSorting === false}
                      className="inline-flex items-center gap-1.5 rounded-sm text-left transition hover:text-elv-iris disabled:cursor-default disabled:hover:text-inherit"
                      aria-label={`Sort by ${stringifyValue(column.header) || column.id}`}
                    >
                      {column.header}
                      {column.enableSorting !== false ? (
                        <span className="inline-flex h-4 w-4 items-center justify-center">
                          {activeSort === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : null}
                          {activeSort === "desc" ? <ArrowDown className="h-3.5 w-3.5" /> : null}
                        </span>
                      ) : null}
                    </button>
                  </th>
                );
              })}
              {hasActions ? (
                <th className="w-14 border-b border-elv-border px-3 py-3 dark:border-elv-dark-border">
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <SkeletonRows columns={columns.length} selectable={selectable} hasActions={hasActions} />
            ) : pageRows.length ? (
              pageRows.map(({ row, id }) => {
                const rowActions = actions?.(row) ?? [];
                const rowClickable = Boolean(onRowClick);

                return (
                  <tr
                    key={id}
                    className={cn(
                      "border-b border-elv-border transition hover:bg-elv-surface-2/70 dark:border-elv-dark-border dark:hover:bg-elv-dark-2/80",
                      rowClickable && "cursor-pointer",
                      getRowStatusClass(row, columns),
                    )}
                    onClick={() => onRowClick?.(row)}
                    tabIndex={rowClickable ? 0 : undefined}
                    onKeyDown={(event) => {
                      if (!rowClickable) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick?.(row);
                      }
                    }}
                  >
                    {selectable ? (
                      <td
                        className="sticky left-0 z-10 w-11 border-b border-elv-border bg-inherit px-3 py-3 dark:border-elv-dark-border"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRows.has(id)}
                          onChange={() => toggleRow(id)}
                          aria-label="Select row"
                          className="h-4 w-4 rounded border-elv-border text-elv-iris"
                        />
                      </td>
                    ) : null}

                    {columns.map((column, index) => {
                      const pinned = column.pinned || index === 0;
                      const content = column.cell ? column.cell(row) : stringifyValue(readColumnValue(row, column));

                      return (
                        <td
                          key={column.id}
                          className={cn(
                            "border-b border-elv-border px-4 py-3 align-middle text-elv-text dark:border-elv-dark-border dark:text-white",
                            pinned && "sticky z-10 bg-inherit",
                            pinned && (selectable ? "left-11" : "left-0"),
                            column.className,
                          )}
                        >
                          {content}
                        </td>
                      );
                    })}

                    {hasActions ? (
                      <td
                        className="relative w-14 border-b border-elv-border px-3 py-3 text-right dark:border-elv-dark-border"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenActionsRow((current) => (current === id ? null : id))}
                          aria-haspopup="menu"
                          aria-expanded={openActionsRow === id}
                          aria-label="Open row actions"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-elv-border bg-white text-elv-text-2 transition hover:border-elv-iris hover:text-elv-iris dark:border-elv-dark-border dark:bg-elv-dark-2 dark:text-slate-200"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {openActionsRow === id ? (
                          <div
                            role="menu"
                            className="absolute right-3 top-12 z-30 min-w-40 overflow-hidden rounded-md border border-elv-border bg-white py-1 text-left shadow-lg dark:border-elv-dark-border dark:bg-elv-dark-2"
                          >
                            {rowActions.map((action) => (
                              <button
                                key={action.label}
                                type="button"
                                role="menuitem"
                                disabled={action.disabled}
                                onClick={() => {
                                  action.onClick();
                                  setOpenActionsRow(null);
                                }}
                                className={cn(
                                  "flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold text-elv-text-2 transition hover:bg-elv-surface-2 disabled:pointer-events-none disabled:opacity-40 dark:text-slate-200 dark:hover:bg-elv-dark-3",
                                  action.destructive && "text-elv-danger dark:text-red-300",
                                )}
                              >
                                {action.icon ?? defaultActionIcons[action.label]}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </td>
                    ) : null}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)} className="px-4 py-10">
                  <EmptyState title="No table data" description={emptyMessage} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-elv-border bg-elv-base/70 p-4 dark:border-elv-dark-border dark:bg-elv-dark-2/60 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-elv-text-2 dark:text-slate-300">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value) as (typeof pageSizes)[number])}
            className="h-9 rounded-md border border-elv-border bg-white px-2 text-sm font-bold text-elv-text dark:border-elv-dark-border dark:bg-elv-dark-base dark:text-white"
            aria-label="Rows per page"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-sm font-semibold text-elv-text-2 dark:text-slate-300">
            Page {safePageIndex + 1} of {pageCount}
          </span>
          <div className="flex items-center gap-1">
            <PaginationButton label="First page" disabled={safePageIndex === 0} onClick={() => setPageIndex(0)}>
              <ChevronsLeft className="h-4 w-4" />
            </PaginationButton>
            <PaginationButton label="Previous page" disabled={safePageIndex === 0} onClick={() => setPageIndex((page) => Math.max(0, page - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </PaginationButton>
            <PaginationButton label="Next page" disabled={safePageIndex >= pageCount - 1} onClick={() => setPageIndex((page) => Math.min(pageCount - 1, page + 1))}>
              <ChevronRight className="h-4 w-4" />
            </PaginationButton>
            <PaginationButton label="Last page" disabled={safePageIndex >= pageCount - 1} onClick={() => setPageIndex(pageCount - 1)}>
              <ChevronsRight className="h-4 w-4" />
            </PaginationButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function PaginationButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-elv-border bg-white text-elv-text-2 transition hover:border-elv-iris hover:text-elv-iris disabled:pointer-events-none disabled:opacity-40 dark:border-elv-dark-border dark:bg-elv-dark-base dark:text-slate-200"
    >
      {children}
    </button>
  );
}
